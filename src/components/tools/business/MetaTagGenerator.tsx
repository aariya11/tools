import React, { useState } from 'react';
import {
  Code,
  Copy,
  Download,
  Globe,
  Share2,
  Search,
  Sparkles,
  Smartphone,
  Monitor,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type PreviewTab = 'google' | 'facebook' | 'twitter' | 'discord';

export const MetaTagGenerator: React.FC = () => {
  // Standard Meta Fields
  const [pageTitle, setPageTitle] = useState<string>('ToolBoxX – Fast, Free & Private Online Utilities');
  const [metaDescription, setMetaDescription] = useState<string>(
    'Free online tools to convert, compress, generate, and edit files directly in your browser with 100% on-device privacy.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState<string>('https://toolboxx.dev');
  const [author, setAuthor] = useState<string>('ToolBoxX Team');
  const [keywords, setKeywords] = useState<string>('online tools, pdf converter, image compressor, barcode generator, privacy');
  const [robotsIndex, setRobotsIndex] = useState<string>('index, follow');
  const [language, setLanguage] = useState<string>('en');

  // Open Graph (Facebook / LinkedIn)
  const [ogTitle, setOgTitle] = useState<string>('ToolBoxX – Fast, Free & Private Online Utilities');
  const [ogDescription, setOgDescription] = useState<string>(
    'Free online tools to convert, compress, generate, and edit files directly in your browser with 100% on-device privacy.'
  );
  const [ogImage, setOgImage] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80');
  const [ogType, setOgType] = useState<string>('website');
  const [siteName, setSiteName] = useState<string>('ToolBoxX');

  // Twitter Card
  const [twitterCard, setTwitterCard] = useState<'summary_large_image' | 'summary'>('summary_large_image');
  const [twitterHandle, setTwitterHandle] = useState<string>('@toolboxx_dev');
  const [twitterTitle, setTwitterTitle] = useState<string>('ToolBoxX – Fast, Free & Private Online Utilities');
  const [twitterDescription, setTwitterDescription] = useState<string>(
    'Free online tools to convert, compress, generate, and edit files directly in your browser.'
  );
  const [twitterImage, setTwitterImage] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80');

  // UI state
  const [previewTab, setPreviewTab] = useState<PreviewTab>('google');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Sync Open Graph & Twitter with Standard Meta
  const handleSyncAll = () => {
    setOgTitle(pageTitle);
    setOgDescription(metaDescription);
    setTwitterTitle(pageTitle);
    setTwitterDescription(metaDescription);
    setTwitterImage(ogImage);
    showToast({ type: 'info', title: 'Synced', message: 'Social meta tags synchronized with standard metadata.' });
  };

  // Generate full HTML snippet
  const generateMetaHtml = (): string => {
    return `<!-- Primary Meta Tags -->
<title>${pageTitle}</title>
<meta name="title" content="${pageTitle}">
<meta name="description" content="${metaDescription}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<meta name="robots" content="${robotsIndex}">
<meta name="language" content="${language}">
<link rel="canonical" href="${canonicalUrl}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${ogTitle || pageTitle}">
<meta property="og:description" content="${ogDescription || metaDescription}">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="${siteName}">

<!-- Twitter Card -->
<meta name="twitter:card" content="${twitterCard}">
<meta name="twitter:url" content="${canonicalUrl}">
<meta name="twitter:title" content="${twitterTitle || pageTitle}">
<meta name="twitter:description" content="${twitterDescription || metaDescription}">
<meta name="twitter:image" content="${twitterImage || ogImage}">
${twitterHandle ? `<meta name="twitter:site" content="${twitterHandle}">\n<meta name="twitter:creator" content="${twitterHandle}">` : ''}`;
  };

  const handleCopyHtml = async () => {
    const html = generateMetaHtml();
    try {
      await navigator.clipboard.writeText(html);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Meta Tags Copied', message: 'HTML tags copied to clipboard!' });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard.' });
    }
  };

  const handleDownloadHtml = () => {
    const html = generateMetaHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, 'meta-tags.html');
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved meta-tags.html file.' });
  };

  // Character count validations
  const titleLen = pageTitle.length;
  const descLen = metaDescription.length;

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Sync */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c-text)]">
          <Globe className="w-4 h-4 text-[var(--c-gold)]" />
          <span>SEO & Social Media Meta Tag Engine (Google, Open Graph, Twitter Cards)</span>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Sync Social Tags
        </button>
      </div>

      {/* Main Grid: Inputs on Left, Live Previews on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Tabs & Form */}
        <div className="lg:col-span-6 space-y-6">
          {/* Standard Meta Tags */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--c-gold)]" />
              Standard Search Engine Metadata
            </h4>

            {/* Title */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--c-text)]">Page Title <span className="text-rose-500">*</span></span>
                <span
                  className={`font-mono text-[11px] ${
                    titleLen > 60 ? 'text-amber-500' : 'text-[var(--c-subtle)]'
                  }`}
                >
                  {titleLen}/60 chars {titleLen > 60 && '(long)'}
                </span>
              </div>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Page Title (50-60 characters)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--c-text)]">Meta Description <span className="text-rose-500">*</span></span>
                <span
                  className={`font-mono text-[11px] ${
                    descLen > 160 ? 'text-amber-500' : 'text-[var(--c-subtle)]'
                  }`}
                >
                  {descLen}/160 chars {descLen > 160 && '(long)'}
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief summary of the page for search results (140-160 characters)..."
                className="w-full p-3 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
            </div>

            {/* Canonical URL & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Author / Organization
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="John Doe or Acme Inc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>

            {/* Keywords & Robots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="tools, free, utility"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Robots Directive
                </label>
                <select
                  value={robotsIndex}
                  onChange={(e) => setRobotsIndex(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                >
                  <option value="index, follow">Index, Follow (Recommended)</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="index, nofollow">Index, Nofollow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Media & Open Graph */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[var(--c-gold)]" />
              Open Graph (Facebook, LinkedIn, Pinterest)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  OG Image URL (Recommended: 1200 × 630 px)
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://example.com/social-preview.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  OG Title (optional override)
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder={pageTitle}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="ToolBoxX"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>

          {/* Twitter Card Details */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              Twitter / X Card Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Card Type
                </label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                >
                  <option value="summary_large_image">Summary with Large Image (Best)</option>
                  <option value="summary">Standard Small Summary Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Twitter @Username
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@company"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Previews & HTML Output */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Preview Switcher Card */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--c-border)] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--c-gold)]" />
                <span className="text-sm font-bold text-[var(--c-text)]">Live Visual Preview</span>
              </div>

              {/* Preview Tabs */}
              <div className="flex items-center gap-1 bg-[var(--c-card)] p-1 rounded-xl border border-[var(--c-border)]">
                {(
                  [
                    { id: 'google', label: 'Google Search' },
                    { id: 'facebook', label: 'Facebook / OG' },
                    { id: 'twitter', label: 'Twitter / X' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      previewTab === tab.id
                        ? 'bg-[var(--c-text)] text-[var(--c-bg)] shadow-xs'
                        : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PREVIEW 1: Google SERP Preview */}
            {previewTab === 'google' && (
              <div className="space-y-4">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setSerpDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      serpDevice === 'desktop'
                        ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold'
                        : 'text-[var(--c-muted)]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      serpDevice === 'mobile'
                        ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold'
                        : 'text-[var(--c-muted)]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <div
                  className={`p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm ${
                    serpDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}
                >
                  {/* Google Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">
                      G
                    </div>
                    <div className="truncate text-[11px]">
                      <span className="font-semibold text-slate-900">{siteName || 'toolboxx.dev'}</span>
                      <span className="text-slate-400"> › {canonicalUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  </div>

                  {/* Google Link Headline */}
                  <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                    {pageTitle || 'Your Page Title Goes Here'}
                  </h3>

                  {/* Google Description */}
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                    {metaDescription || 'Add a meta description to preview how this snippet appears in Google search engine result pages.'}
                  </p>
                </div>
              </div>
            )}

            {/* PREVIEW 2: Facebook / Open Graph Card */}
            {previewTab === 'facebook' && (
              <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-md">
                {ogImage ? (
                  <img
                    src={ogImage}
                    alt="Social preview"
                    className="w-full h-52 object-cover bg-zinc-100 dark:bg-zinc-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                    No preview image URL provided
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold truncate">
                    {canonicalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com'}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                    {ogTitle || pageTitle}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {ogDescription || metaDescription}
                  </p>
                </div>
              </div>
            )}

            {/* PREVIEW 3: Twitter / X Card */}
            {previewTab === 'twitter' && (
              <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-md">
                {twitterCard === 'summary_large_image' ? (
                  <>
                    <img
                      src={twitterImage || ogImage}
                      alt="Twitter preview"
                      className="w-full h-48 object-cover bg-zinc-100 dark:bg-zinc-800"
                    />
                    <div className="p-3.5 space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {twitterTitle || pageTitle}
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {twitterDescription || metaDescription}
                      </p>
                      <div className="text-[10px] text-zinc-400 pt-1">
                        {canonicalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'toolboxx.dev'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 flex items-center gap-3">
                    <img
                      src={twitterImage || ogImage}
                      alt="Twitter preview"
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] text-zinc-400 truncate">{canonicalUrl.replace(/^https?:\/\//, '')}</div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {twitterTitle || pageTitle}
                      </h4>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {twitterDescription || metaDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generated Code Output */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Code className="w-4 h-4 text-[var(--c-gold)]" />
                Generated HTML &lt;head&gt; Code
              </h4>
              <span className="text-[11px] text-[var(--c-muted)]">Copy & paste into your HTML &lt;head&gt;</span>
            </div>

            <pre className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-mono text-[11px] text-[var(--c-text)] max-h-56 overflow-y-auto leading-relaxed select-all">
              {generateMetaHtml()}
            </pre>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Meta HTML
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--c-gold)]" />
                Download .html
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="meta-tag-generator" />
    </div>
  );
};

export default MetaTagGenerator;
