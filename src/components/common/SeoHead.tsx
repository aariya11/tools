import React, { useEffect } from 'react';
import type { FAQItem, HowToStep } from '../../types/tools';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  faqs?: FAQItem[];
  howToSteps?: HowToStep[];
  type?: 'website' | 'article';
  breadcrumbs?: { name: string; url: string }[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  faqs = [],
  howToSteps = [],
  type = 'website',
  breadcrumbs = []
}) => {
  // Ensure site name suffix only if not already present
  const fullTitle = title.includes('ToolBoxX') ? title : `${title} | ToolBoxX`;
  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://pdfedittools.netlify.app';
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const fullUrl = `${domain}${cleanPath}`;

  // Supported global languages for international GEO SEO
  const GLOBAL_LANGS = [
    { code: 'en', lang: 'English' },
    { code: 'es', lang: 'Spanish' },
    { code: 'fr', lang: 'French' },
    { code: 'de', lang: 'German' },
    { code: 'hi', lang: 'Hindi' },
    { code: 'pt', lang: 'Portuguese' },
    { code: 'ja', lang: 'Japanese' },
    { code: 'zh-CN', lang: 'Chinese' },
    { code: 'ar', lang: 'Arabic' },
    { code: 'ru', lang: 'Russian' },
    { code: 'id', lang: 'Indonesian' }
  ];

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // 2. Helper to set or update meta tag
    const setMeta = (nameOrProp: string, key: 'name' | 'property', content: string) => {
      let element = document.querySelector(`meta[${key}="${nameOrProp}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(key, nameOrProp);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary SEO & Search Indexing Directives
    setMeta('description', 'name', description);
    setMeta('robots', 'name', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('googlebot', 'name', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('bingbot', 'name', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('revisit-after', 'name', '2 days');
    setMeta('author', 'name', 'ToolBoxX');

    // International GEO-Targeting & Multi-Region Directives
    setMeta('rating', 'name', 'General');
    setMeta('distribution', 'name', 'Global');
    setMeta('coverage', 'name', 'Worldwide');
    setMeta('target', 'name', 'all');
    setMeta('audience', 'name', 'all');
    setMeta('language', 'name', 'English');

    // Remove legacy/stale meta keywords if present (Google ignores them)
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    if (existingKeywords) {
      existingKeywords.remove();
    }

    // OpenGraph Social & Regional Meta
    setMeta('og:title', 'property', fullTitle);
    setMeta('og:description', 'property', description);
    setMeta('og:url', 'property', fullUrl);
    setMeta('og:type', 'property', type);
    setMeta('og:site_name', 'property', 'ToolBoxX');
    setMeta('og:locale', 'property', 'en_US');

    // Twitter Card Meta
    setMeta('twitter:card', 'name', 'summary_large_image');
    setMeta('twitter:title', 'name', fullTitle);
    setMeta('twitter:description', 'name', description);

    // 3. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // 4. Update / Inject International Hreflang Tags for Multi-Region Indexing
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach((el) => el.remove());

    // Add x-default
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', fullUrl);
    document.head.appendChild(xDefault);

    // Add specific regional hreflang links
    GLOBAL_LANGS.forEach((lang) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang.code);
      link.setAttribute('href', fullUrl);
      document.head.appendChild(link);
    });

    // 5. Inject Structured Data (Schema.org JSON-LD Graph)
    const schemaId = 'toolboxx-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaGraph: any[] = [
      // WebSite Schema with Sitelinks SearchBox
      {
        '@type': 'WebSite',
        '@id': `${domain}/#website`,
        url: domain,
        name: 'ToolBoxX',
        description: 'Free, fast, and private online tools for PDF editing, image compression, text tools, and QR code generation.',
        inLanguage: GLOBAL_LANGS.map((l) => l.code),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${domain}/all-tools?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      // Organization / Publisher Schema
      {
        '@type': 'Organization',
        '@id': `${domain}/#organization`,
        name: 'ToolBoxX',
        url: domain,
        logo: `${domain}/favicon.svg`,
        sameAs: [
          'https://github.com/aariya11/tools'
        ]
      },
      // WebApplication / SoftwareApplication Schema
      {
        '@type': 'WebApplication',
        '@id': `${fullUrl}#webapp`,
        name: title.replace(/ \| ToolBoxX.*/, ''),
        url: fullUrl,
        description: description,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Windows, macOS, Android, iOS, Linux, ChromeOS',
        browserRequirements: 'Requires modern web browser with HTML5 and WebAssembly support',
        countriesSupported: 'Global',
        softwareVersion: '2.0',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }
    ];

    // HowTo Schema (Generates Google How-To Rich Cards in Search Results)
    if (howToSteps && howToSteps.length > 0) {
      schemaGraph.push({
        '@type': 'HowTo',
        '@id': `${fullUrl}#howto`,
        name: `How to Use ${title.replace(/ \| ToolBoxX.*/, '')} Online`,
        description: `Step-by-step tutorial on using ${title.replace(/ \| ToolBoxX.*/, '')} securely in your web browser.`,
        step: howToSteps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.title,
          text: step.description,
          url: `${fullUrl}#step-${idx + 1}`
        }))
      });
    }

    // FAQPage Schema (Generates Google FAQ Rich Snippets in Search Results)
    if (faqs && faqs.length > 0) {
      schemaGraph.push({
        '@type': 'FAQPage',
        '@id': `${fullUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }

    // BreadcrumbList Schema (Generates Breadcrumb paths in Search Snippets)
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemaGraph.push({
        '@type': 'BreadcrumbList',
        '@id': `${fullUrl}#breadcrumbs`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${domain}${crumb.url}`
        }))
      });
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': schemaGraph
    };

    scriptTag.textContent = JSON.stringify(schemaData);
  }, [fullTitle, description, fullUrl, faqs, howToSteps, type, breadcrumbs, domain]);

  return null;
};
