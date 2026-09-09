import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Run after npm run build. These checks exercise actual deployment artifacts.
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? htmlFiles(join(directory, entry.name))
    : entry.name.endsWith('.html') && !entry.name.startsWith('google') ? [join(directory, entry.name)] : []));
  return nested.flat();
}

test('generated pages have one title, heading and coherent metadata', async () => {
  const files = await htmlFiles('dist');
  assert(files.length > 3, 'Build must produce catalog pages, not only an SPA shell');
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.equal((html.match(/<title>/g) || []).length, 1, file);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, file);
    assert.match(html, /<meta name="description" content="[^"]+"/, file);
    assert.doesNotMatch(html, /hreflang=|og:locale:alternate|fonts\.googleapis\.com/, file);
    if (html.includes('noindex, follow')) {
      assert.doesNotMatch(html, /rel="canonical"/, file);
    } else {
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1, file);
      const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
      assert(html.includes(`property="og:url" content="${canonical}"`), file);
      const schema = html.match(/id="toolboxx-jsonld-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
      assert(schema, file);
      const graph = JSON.parse(schema[1]);
      assert.equal(graph['@context'], 'https://schema.org');
      assert(graph['@graph'].some(item => item['@type'] === 'WebPage' && item.url === canonical), file);
    }
  }
});

test('tool pages contain meaningful content without JavaScript', async () => {
  const html = await readFile('dist/image-compressor/index.html', 'utf8');
  assert.match(html, /<h1>Image Compressor Online<\/h1>/);
  assert.match(html, /How to Use Image Compressor Online/);
  assert.match(html, /Frequently asked questions/);
  assert.match(html, /href="\/jpg-to-png"/);
  assert.match(html, /type="module"/);
});

test('sitemap, robots and hosting routes use canonical public URLs', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert(urls.length > 3);
  assert.equal(new Set(urls.map(url => url.href)).size, urls.length);
  assert.equal(new Set(urls.map(url => url.origin)).size, 1);
  for (const url of urls) {
    assert.equal(url.protocol, 'https:');
    assert(!['/404', '/tools', '/privacy-policy', '/terms-of-service'].includes(url.pathname));
    assert.equal(url.search, '');
  }
  assert.doesNotMatch(sitemap, /<lastmod>/);
  const robots = await readFile('dist/robots.txt', 'utf8');
  assert(robots.includes(`Sitemap: ${urls[0].origin}/sitemap.xml`));
  const redirects = await readFile('dist/_redirects', 'utf8');
  assert.match(redirects, /\/tools \/all-tools 301/);
  assert.match(redirects, /\/\* \/404\.html 404/);
  assert.doesNotMatch(redirects, /\/\* \/index\.html 200/);
  assert.match(await readFile('dist/404.html', 'utf8'), /noindex, follow/);
});
