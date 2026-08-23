import React, { useEffect } from 'react';
import type { FAQItem } from '../../types/tools';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  faqs?: FAQItem[];
  type?: 'website' | 'article';
  breadcrumbs?: { name: string; url: string }[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  faqs = [],
  type = 'website',
  breadcrumbs = []
}) => {
  // Ensure site name suffix only if not already present
  const fullTitle = title.includes('ToolBoxX') ? title : `${title} | ToolBoxX`;
  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://toolboxx.dev';
  const fullUrl = `${domain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

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

    // Meta Description (Unique, natural, search-intent focused)
    setMeta('description', 'name', description);

    // Explicitly remove any stale meta keywords tags (Google ignores them)
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    if (existingKeywords) {
      existingKeywords.remove();
    }

    // OpenGraph Meta
    setMeta('og:title', 'property', fullTitle);
    setMeta('og:description', 'property', description);
    setMeta('og:url', 'property', fullUrl);
    setMeta('og:type', 'property', type);
    setMeta('og:site_name', 'property', 'ToolBoxX');

    // Twitter Card Meta
    setMeta('twitter:card', 'name', 'summary_large_image');
    setMeta('twitter:title', 'name', fullTitle);
    setMeta('twitter:description', 'name', description);

    // 3. Update Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // 4. Inject JSON-LD Schema (WebApplication, FAQPage, BreadcrumbList)
    const schemaId = 'toolboxx-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaGraph: any[] = [
      {
        '@type': 'WebApplication',
        '@id': `${fullUrl}#webapp`,
        name: title.replace(/ \| ToolBoxX.*/, ''),
        url: fullUrl,
        description: description,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires modern web browser with HTML5 and WebAssembly support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }
    ];

    // FAQPage Schema
    if (faqs && faqs.length > 0) {
      schemaGraph.push({
        '@type': 'FAQPage',
        '@id': `${fullUrl}#faq`,
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }

    // BreadcrumbList Schema
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
  }, [fullTitle, description, fullUrl, faqs, type, breadcrumbs]);

  return null;
};
