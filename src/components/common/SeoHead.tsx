import React, { useEffect } from 'react';
import type { FAQItem } from '../../types/tools';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  faqs?: FAQItem[];
  type?: 'website' | 'article';
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  keywords = [],
  faqs = [],
  type = 'website'
}) => {
  const fullTitle = `${title} — ToolBoxX`;
  const domain = 'https://toolboxx.dev';
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

    setMeta('description', 'name', description);
    if (keywords.length > 0) {
      setMeta('keywords', 'name', keywords.join(', '));
    }
    setMeta('og:title', 'property', fullTitle);
    setMeta('og:description', 'property', description);
    setMeta('og:url', 'property', fullUrl);
    setMeta('og:type', 'property', type);
    setMeta('twitter:title', 'property', fullTitle);
    setMeta('twitter:description', 'property', description);

    // 3. Update Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // 4. Inject JSON-LD Schema
    const schemaId = 'toolboxx-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: title,
          url: fullUrl,
          description: description,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        }
      ]
    };

    if (faqs && faqs.length > 0) {
      schemaData['@graph'].push({
        '@type': 'FAQPage',
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

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // Optional cleanup
    };
  }, [fullTitle, description, fullUrl, keywords, faqs, type]);

  return null;
};
