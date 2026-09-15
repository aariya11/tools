import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createServer, loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const configured = new URL(env.VITE_SITE_URL || 'https://toolboxx.arunwebdeveloper.workers.dev');
assert(configured.protocol === 'https:' && configured.pathname === '/' && !configured.search && !configured.hash && !configured.username && !configured.password, 'VITE_SITE_URL must be an HTTPS origin');
const origin = configured.origin;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const template = await readFile('dist/index.html', 'utf8');
assert(template.includes('<!-- seo:start -->') && template.includes('<div id="root"></div>'), 'Missing SEO template markers');
const app = await readFile('src/App.tsx', 'utf8');
const routes = new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(match => match[1]).filter(path => path.startsWith('/') && !path.includes(':')));
const aliases = new Map([...app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate to="([^"]+)"/g)].map(match => [match[1], match[2]]));
aliases.set('/tools', '/all-tools');
aliases.set('/privacy-policy', '/privacy');
aliases.set('/terms-of-service', '/terms');

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
let tools, categories, posts;
try {
  const catalog = await server.ssrLoadModule('/src/data/toolsData.ts');
  tools = catalog.TOOLS_DATA.filter(tool => routes.has(tool.path) && !aliases.has(tool.path));
  categories = catalog.CATEGORIES;
  posts = (await server.ssrLoadModule('/src/data/blogData.ts')).BLOG_POSTS;
} finally {
  await server.close();
}
assert(tools.length > 0, 'No routable tools found');
const pages = new Map();
const fullTitle = title => title.includes('ToolBoxX') ? title : `${title} | ToolBoxX`;
const links = items => `<ul>${items.map(item => `<li><h3><a href="${escape(item.path)}">${escape(item.name)}</a></h3><p>${escape(item.shortDescription || item.description)}</p></li>`).join('')}</ul>`;
const faqContent = faqs => faqs?.length ? `<section><h2>Frequently asked questions</h2>${faqs.map(faq => `<details><summary>${escape(faq.question)}</summary><p>${escape(faq.answer)}</p></details>`).join('')}</section>` : '';
const addPage = (path, title, description, body, extra = [], noIndex = false) => {
  assert(/^\/(?:[a-z0-9-]+\/?)*$/.test(path), `Invalid route: ${path}`);
  assert(!pages.has(path), `Duplicate generated route: ${path}`);
  const url = `${origin}${path}`;
  const graph = [
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'ToolBoxX', inLanguage: 'en' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, name: fullTitle(title), description, url, inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` } },
    ...extra,
  ];
  const head = `<title>${escape(fullTitle(title))}</title>
<meta name="description" content="${escape(description)}" />
<meta name="robots" content="${noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
${noIndex ? '' : `<link rel="canonical" href="${escape(url)}" />`}
<meta property="og:type" content="${path.startsWith('/blog/') ? 'article' : 'website'}" />
<meta property="og:site_name" content="ToolBoxX" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="${escape(fullTitle(title))}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${escape(url)}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escape(fullTitle(title))}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:url" content="${escape(url)}" />
${noIndex ? '' : `<script id="toolboxx-jsonld-schema" type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>`}`;
  // The same visible fallback is served to people and crawlers. React replaces
  // it with the interactive app; no user-agent detection or hidden SEO content.
  const html = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => head)
    .replace('<div id="root"></div>', () => `<div id="root"><main class="static-page"><nav aria-label="Main navigation"><a href="/">ToolBoxX</a><a href="/all-tools">All tools</a><a href="/blog">Guides</a></nav>${body}<noscript><p>Enable JavaScript to use the interactive tools. You can still browse descriptions and instructions.</p></noscript></main></div>`);
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  pages.set(path, html);
};
const homeTitle = 'ToolBoxX — Free Online Tools for PDF, Images, Text & More';
const homeDescription = 'Fast, free and easy-to-use online tools for converting, editing, compressing and managing your files. No software installation required.';
addPage('/', homeTitle, homeDescription, `<h1>Free Online Tools for PDF, Images, Text &amp; More</h1><p>${escape(homeDescription)}</p><h2>Popular tools</h2>${links(tools.filter(tool => tool.isPopular).slice(0, 12))}<h2>Browse by category</h2>${links(categories.map(category => ({ ...category, path: `/category/${category.id}` })))}<h2>Latest guides</h2>${links(posts.map(post => ({ path: `/blog/${post.slug}`, name: post.title, description: post.excerpt })))}`);
addPage('/all-tools', 'All Tools Directory | ToolBoxX', `Browse free online tools for PDFs, images, text, calculators and more. Find the right utility for your task.`, `<h1>All Online Utilities</h1><p>Browse tools by task. Interactive tools require JavaScript; third-party AI features may have provider-specific availability.</p>${links(tools)}`);
for (const category of categories) {
  addPage(`/category/${category.id}`, `${category.name} – Free Online Utilities | ToolBoxX`, category.description, `<h1>${escape(category.name)}</h1><p>${escape(category.description)}</p>${links(tools.filter(tool => tool.category === category.id))}`);
}
for (const tool of tools) {
  const title = tool.seoTitle || `${tool.name} Online Free – ${tool.category === 'pdf' ? 'PDF Tools' : tool.category === 'images' ? 'Image Utilities' : 'Free Online Tools'}`;
  const description = tool.metaDescription || tool.fullDescription;
  const steps = tool.howToSteps.length ? `<section><h2>How to Use ${escape(tool.name)} Online</h2><ol>${tool.howToSteps.map(step => `<li><h3>${escape(step.title)}</h3><p>${escape(step.description)}</p></li>`).join('')}</ol></section>` : '';
  const education = tool.educationalSection;
  const body = `<h1>${escape(tool.h1Heading || tool.name)}</h1><p>${escape(tool.fullDescription)}</p>${steps}${education ? `<h2>${escape(education.title)}</h2>${education.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}` : ''}${faqContent(tool.faqs)}<h2>Related tools</h2>${links(tools.filter(item => tool.relatedToolIds.includes(item.id)))}`;
  addPage(tool.path, title, description, body, [
    { '@type': 'WebApplication', name: tool.name, url: `${origin}${tool.path}`, description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', path: '/' }, { name: `${tool.category} tools`, path: `/category/${tool.category}` }, { name: tool.name, path: tool.path }].map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `${origin}${item.path}` })) },
  ]);
}
addPage('/blog', 'Guides & Articles | ToolBoxX', 'Practical guides to working with PDFs, images and browser-based tools.', `<h1>Guides &amp; Articles</h1>${links(posts.map(post => ({ path: `/blog/${post.slug}`, name: post.title, description: post.excerpt })))}`);
for (const post of posts) {
  const sectionContent = section => `<section id="${escape(section.id)}"><h2>${escape(section.title)}</h2><p>${escape(section.content)}</p>${(section.subsections || []).map(subsection => `<h3>${escape(subsection.title)}</h3><p>${escape(subsection.content)}</p>`).join('')}${(section.steps || []).map(step => `<h3>${escape(step.title)}</h3><p>${escape(step.description)}</p>`).join('')}${section.callout ? `<aside><h3>${escape(section.callout.title)}</h3><p>${escape(section.callout.message)}</p></aside>` : ''}</section>`;
  addPage(`/blog/${post.slug}`, post.title, post.excerpt, `<h1>${escape(post.title)}</h1><p>${escape(post.excerpt)}</p>${post.sections.map(sectionContent).join('')}${faqContent(post.faqs)}<h2>Related tools</h2>${links(tools.filter(tool => post.relatedToolIds.includes(tool.id)))}`);
}
addPage('/privacy', 'Privacy Policy | ToolBoxX', 'ToolBoxX processes files and text locally on your device. We do not store, view, or transmit your private files to remote servers.', '<h1>Privacy Policy</h1><p>ToolBoxX processes files locally within your web browser. Zero server uploads.</p>');
addPage('/terms', 'Terms of Service | ToolBoxX', 'Terms and conditions for utilizing ToolBoxX online utility platform.', '<h1>Terms of Service</h1><p>Terms of service for using ToolBoxX free client-side utilities.</p>');
addPage('/contact', 'Contact & Feedback | ToolBoxX', 'Contact the ToolBoxX team for tool suggestions, bug reports, and partnership inquiries.', '<h1>Contact &amp; Feedback</h1><p>Get in touch with our team for questions, suggestions, or feedback.</p>');
addPage('/cookie-policy', 'Cookie Policy | ToolBoxX', 'Learn how ToolBoxX uses cookies and local storage. Configure your cookie preferences anytime.', '<h1>Cookie Policy</h1><p>Information about cookies, localStorage, and privacy choices on ToolBoxX.</p>');
addPage('/disclaimer', 'Disclaimer | ToolBoxX', 'Important legal disclaimer regarding browser-based processing, data accuracy, and limitations of liability for ToolBoxX utilities.', '<h1>Legal Disclaimer</h1><p>Important disclaimers and operational limits for ToolBoxX utilities.</p>');
addPage('/dmca', 'DMCA Copyright Policy | ToolBoxX', 'Digital Millennium Copyright Act compliance, intellectual property guidelines, and copyright notice procedures for ToolBoxX.', '<h1>DMCA Policy</h1><p>Copyright compliance and DMCA designated agent contact procedures.</p>');
addPage('/accessibility', 'Accessibility Statement | ToolBoxX', 'ToolBoxX commitment to web accessibility and WCAG 2.2 AA standards.', '<h1>Accessibility Statement</h1><p>Our commitment to an accessible, inclusive user experience.</p>');
addPage('/faq', 'Frequently Asked Questions | ToolBoxX', 'Answers to common questions about ToolBoxX browser utilities, file privacy, and supported features.', '<h1>Frequently Asked Questions</h1><p>Find answers to common questions about our free online tools.</p>');
addPage('/about', 'About ToolBoxX | Fast, Private Browser Utilities', 'Learn about ToolBoxX mission to provide free, high-performance, privacy-first web utilities with zero server file storage.', '<h1>About ToolBoxX</h1><p>High-performance client-side utilities built for privacy, speed, and simplicity.</p>');
addPage('/free-pdf-tools', '30+ Free PDF Tools Online – Unlimited, Private, No Upload Limits | ToolBoxX', 'The ultimate 100% free client-side PDF suite: Merge, Split, Compress, Convert, OCR, Sign, Protect, and Edit PDFs directly in your browser with zero cloud storage.', '<h1>30+ Free Online PDF Tools</h1><p>Merge, compress, convert, and edit PDF documents privately in your browser.</p>');
addPage('/free-image-tools', 'Free In-Browser Image Studio – Compress, Resize, Convert, Background Remover | ToolBoxX', 'Comprehensive client-side image editor: Compress JPG/PNG/WebP, resize with social presets, remove backgrounds, strip EXIF privacy metadata, watermark, and convert formats.', '<h1>Free In-Browser Image Studio</h1><p>Compress, resize, convert, and optimize images locally.</p>');
addPage('/social-media-tools', 'Free Social Media Creator & Marketing Tools – Resizer, Caption Writer, UTM Builder | ToolBoxX', 'All-in-one in-browser creator suite: resize graphics to Instagram & TikTok aspect ratios, compress photos, generate viral captions, and build UTM links.', '<h1>Social Media &amp; Creator Tools</h1><p>Browser utilities tailored for digital creators and marketers.</p>');
addPage('/student-tools', 'Free Online Tools for Students & Researchers – PDF, OCR, Essay, Handwriting | ToolBoxX', 'Curated suite of 100% free student utilities: PDF compress for Canvas uploads, Text to Handwriting converter, OCR, AI summarizer, and essay word counter.', '<h1>Tools for Students &amp; Researchers</h1><p>Fast, free browser utilities for academic workflows.</p>');
addPage('/productivity-tools', 'High-Performance Browser Productivity Suite – Batch Tools & Document Automation | ToolBoxX', 'Streamline daily document pipelines: client-side PDF organization, bulk renamers, invoice generators, markdown formatting, and password tools.', '<h1>Productivity &amp; Automation Suite</h1><p>Fast in-browser utilities for document pipelines.</p>');
addPage('/404', '404 — Page Not Found', 'The requested page could not be found.', '<h1>Page not found</h1><p>Browse <a href="/all-tools">all tools</a> to find what you need.</p>', [], true);
for (const [path, html] of pages) {
  const file = resolve('dist', path === '/' ? 'index.html' : `${path.slice(1)}/index.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
await writeFile('dist/404.html', pages.get('/404'));

// Include valid static app pages as well as generated category and article URLs.
// Redirect aliases and errors are intentionally excluded; no invented lastmod dates.
const indexable = [...new Set([...routes, ...pages.keys()])]
  .filter(path => path !== '/404' && !aliases.has(path)).sort();
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(path => `  <url><loc>${escape(`${origin}${path}`)}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);

for (const tool of tools) aliases.set(`/tools/${tool.id}`, tool.path);
for (const category of categories) aliases.set(`/tools/${category.id}`, `/category/${category.id}`);
for (const [alias, category] of Object.entries({ image: 'images', calculator: 'calculators', generator: 'generators' })) {
  aliases.set(`/tools/${alias}`, `/category/${category}`);
  aliases.set(`/category/${alias}`, `/category/${category}`);
}
const redirects = [...aliases].filter(([from, to]) => from !== to).map(([from, to]) => `${from} ${to} 301`);
await writeFile('dist/_redirects', `${redirects.join('\n')}\n`);
console.log(`Generated ${pages.size} static SEO pages and ${indexable.length} sitemap URLs for ${origin}.`);
