import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Sparkles, Plus, Trash2, Globe, FileCode } from 'lucide-react';
import { showToast } from '../../common/Toast';

interface SitemapEntry {
  id: string;
  url: string;
  priority: string;
  changefreq: string;
  lastmod: string;
}

export const SitemapGenerator: React.FC = () => {
  const [domain, setDomain] = useState('https://example.com');
  const [entries, setEntries] = useState<SitemapEntry[]>([
    { id: '1', url: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { id: '2', url: '/about', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString().split('T')[0] },
    { id: '3', url: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString().split('T')[0] },
    { id: '4', url: '/blog', priority: '0.9', changefreq: 'weekly', lastmod: new Date().toISOString().split('T')[0] },
  ]);
  const [batchUrls, setBatchUrls] = useState('');
  const [copied, setCopied] = useState(false);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        url: '',
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof SitemapEntry, value: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleBatchImport = () => {
    const urls = batchUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    const newEntries: SitemapEntry[] = urls.map((u, i) => ({
      id: `${Date.now()}-${i}`,
      url: u.startsWith('/') ? u : `/${u}`,
      priority: u === '/' || u === '' ? '1.0' : '0.8',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0],
    }));

    setEntries([...entries, ...newEntries]);
    setBatchUrls('');
    showToast(`Added ${newEntries.length} URLs to sitemap!`, 'success');
  };

  const xmlContent = useMemo(() => {
    const cleanDomain = domain.replace(/\/+$/, '');
    const itemsXml = entries
      .filter((e) => e.url.trim())
      .map((e) => {
        const fullUrl = e.url.startsWith('http') ? e.url : `${cleanDomain}${e.url.startsWith('/') ? '' : '/'}${e.url}`;
        return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itemsXml}
</urlset>`;
  }, [domain, entries]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    showToast('Sitemap XML copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('sitemap.xml downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Domain & Batch Import Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Website Base Domain</label>
          <div className="relative">
            <Globe className="w-5 h-5 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-semibold outline-none focus:border-[var(--c-gold)]"
            />
          </div>
        </div>

        {/* Batch URL Import */}
        <div className="space-y-2 pt-2 border-t border-[var(--c-border)]">
          <label className="text-xs font-semibold text-[var(--c-muted)]">Bulk Import Path Names (One per line)</label>
          <div className="flex gap-3">
            <textarea
              rows={2}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="/services&#10;/pricing&#10;/portfolio"
              className="w-full p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-xs font-mono outline-none focus:border-[var(--c-gold)] resize-none"
            />
            <button
              onClick={handleBatchImport}
              className="px-5 py-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-[var(--c-text)] text-xs font-bold shrink-0 transition-all cursor-pointer"
            >
              Add URLs
            </button>
          </div>
        </div>
      </div>

      {/* URL List Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--c-text)]">
            Configured URLs ({entries.length})
          </span>
          <button
            onClick={addEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single URL</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div key={entry.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={entry.url}
                  onChange={(e) => updateEntry(entry.id, 'url', e.target.value)}
                  placeholder="/page-path"
                  className="w-full p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono outline-none focus:border-[var(--c-gold)]"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={entry.priority}
                  onChange={(e) => updateEntry(entry.id, 'priority', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] outline-none"
                >
                  <option value="1.0">1.0 (Highest)</option>
                  <option value="0.9">0.9</option>
                  <option value="0.8">0.8 (Default)</option>
                  <option value="0.7">0.7</option>
                  <option value="0.5">0.5</option>
                  <option value="0.3">0.3</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={entry.changefreq}
                  onChange={(e) => updateEntry(entry.id, 'changefreq', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] outline-none"
                >
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="date"
                  value={entry.lastmod}
                  onChange={(e) => updateEntry(entry.id, 'lastmod', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="Remove URL"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output XML Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text)]">
            <FileCode className="w-4 h-4 text-[var(--c-gold)]" />
            <span>Generated XML Sitemap</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-bold hover:border-[var(--c-border-hover)] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[var(--c-gold)]" />}
              <span>{copied ? 'Copied' : 'Copy XML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>

        <pre className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs text-[var(--c-text)] font-mono overflow-x-auto leading-relaxed max-h-[300px]">
          {xmlContent}
        </pre>
      </div>
    </div>
  );
};
