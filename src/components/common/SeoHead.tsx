import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { FAQItem, HowToStep } from '../../types/tools';
import { SITE_URL } from '../../config/site';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  faqs?: FAQItem[];
  howToSteps?: HowToStep[];
  type?: 'website' | 'article';
  breadcrumbs?: { name: string; url: string }[];
  noIndex?: boolean;
  isTool?: boolean;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title, description, canonicalPath, faqs = [], howToSteps = [],
  type = 'website', breadcrumbs = [], noIndex = false, isTool = false,
}) => {
  const { pathname } = useLocation();
  const fullTitle = title.includes('ToolBoxX') ? title : `${title} | ToolBoxX`;
  const path = (canonicalPath ?? pathname).split(/[?#]/)[0];
  const cleanPath = `/${path.replace(/^\/+|\/+$/g, '')}`;
  const fullUrl = `${SITE_URL}${cleanPath}`;

  useEffect(() => {
    document.title = fullTitle;
    const setMeta = (key: 'name' | 'property', name: string, content: string) => {
      let element = document.head.querySelector(`meta[${key}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(key, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    const robots = noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots);
    // Avoid conflicting crawler-specific directives from legacy templates.
    document.head.querySelectorAll('meta[name="googlebot"], meta[name="bingbot"], meta[name="keywords"]').forEach(el => el.remove());
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'ToolBoxX');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:url', fullUrl);

    document.head.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
    if (!noIndex) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = fullUrl;
      document.head.appendChild(canonical);
    }
    // A UI language preference is not a separately crawlable translation.
    // Add hreflang only when real, translated URLs exist.
    document.head.querySelectorAll('link[rel="alternate"][hreflang], meta[property="og:locale:alternate"]').forEach(el => el.remove());

    const graph: Record<string, unknown>[] = [
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'ToolBoxX', inLanguage: 'en' },
      { '@type': 'WebPage', '@id': `${fullUrl}#webpage`, url: fullUrl, name: fullTitle, description, inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` } },
    ];
    if (isTool) {
      graph.push({
        '@type': 'WebApplication', '@id': `${fullUrl}#webapp`, name: title,
        url: fullUrl, description, applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any', browserRequirements: 'Requires a modern web browser with JavaScript enabled',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      });
    }
    if (howToSteps.length) {
      graph.push({ '@type': 'HowTo', name: `How to use ${title}`, step: howToSteps.map((step, i) => ({ '@type': 'HowToStep', position: i + 1, name: step.title, text: step.description })) });
    }
    if (faqs.length) {
      graph.push({ '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) });
    }
    if (breadcrumbs.length) {
      graph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: new URL(crumb.url, SITE_URL).href })) });
    }
    document.getElementById('toolboxx-jsonld-schema')?.remove();
    if (!noIndex) {
      const script = document.createElement('script');
      script.id = 'toolboxx-jsonld-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
      document.head.appendChild(script);
    }
  }, [fullTitle, title, description, fullUrl, type, faqs, howToSteps, breadcrumbs, noIndex, isTool]);

  return null;
};
