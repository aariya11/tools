import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Trash2,
  Shield,
  Bot,
  Globe,
  Sliders,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface PathRule {
  id: string;
  type: 'allow' | 'disallow';
  path: string;
}

export const RobotsTxtGenerator: React.FC = () => {
  const [defaultRule, setDefaultRule] = useState<'allow_all' | 'disallow_all' | 'custom'>('custom');
  const [crawlDelay, setCrawlDelay] = useState<string>('');
  const [sitemaps, setSitemaps] = useState<string[]>(['https://example.com/sitemap.xml']);
  const [host, setHost] = useState<string>('https://example.com');

  const [paths, setPaths] = useState<PathRule[]>([
    { id: '1', type: 'disallow', path: '/admin/' },
    { id: '2', type: 'disallow', path: '/private/' },
    { id: '3', type: 'disallow', path: '/api/internal/' },
    { id: '4', type: 'allow', path: '/public/' },
  ]);

  const [blockAiBots, setBlockAiBots] = useState<boolean>(true);
  const [blockGoogleImage, setBlockGoogleImage] = useState<boolean>(false);
  const [blockBing, setBlockBing] = useState<boolean>(false);

  const [testPath, setTestPath] = useState<string>('/admin/dashboard');
  const [testResult, setTestResult] = useState<'allowed' | 'blocked' | null>(null);

  const addPathRule = (type: 'allow' | 'disallow', path: string = '') => {
    setPaths((prev) => [...prev, { id: Math.random().toString(36).slice(2, 9), type, path }]);
  };

  const updatePathRule = (id: string, path: string) => {
    setPaths((prev) => prev.map((p) => (p.id === id ? { ...p, path } : p)));
  };

  const removePathRule = (id: string) => {
    setPaths((prev) => prev.filter((p) => p.id !== id));
  };

  const addSitemap = () => {
    setSitemaps((prev) => [...prev, '']);
  };

  const updateSitemap = (index: number, val: string) => {
    setSitemaps((prev) => prev.map((s, i) => (i === index ? val : s)));
  };

  const removeSitemap = (index: number) => {
    setSitemaps((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: 'standard' | 'ecommerce' | 'block_ai' | 'disallow_all' | 'wordpress') => {
    if (preset === 'standard') {
      setDefaultRule('custom');
      setBlockAiBots(false);
      setPaths([
        { id: '1', type: 'disallow', path: '/admin/' },
        { id: '2', type: 'disallow', path: '/login/' },
        { id: '3', type: 'disallow', path: '/private/' },
        { id: '4', type: 'allow', path: '/' },
      ]);
      showToast({ type: 'info', title: 'Preset Applied', message: 'Standard SEO-friendly configuration loaded.' });
    } else if (preset === 'ecommerce') {
      setDefaultRule('custom');
      setBlockAiBots(false);
      setPaths([
        { id: '1', type: 'disallow', path: '/cart/' },
        { id: '2', type: 'disallow', path: '/checkout/' },
        { id: '3', type: 'disallow', path: '/account/' },
        { id: '4', type: 'disallow', path: '/search?*' },
        { id: '5', type: 'allow', path: '/products/' },
      ]);
      showToast({ type: 'info', title: 'Preset Applied', message: 'E-Commerce store rules loaded.' });
    } else if (preset === 'block_ai') {
      setBlockAiBots(true);
      showToast({ type: 'success', title: 'AI Bots Blocked', message: 'Added rules to disallow GPTBot, CCBot, Claude-Web, and AI crawlers.' });
    } else if (preset === 'disallow_all') {
      setDefaultRule('disallow_all');
      setPaths([]);
      showToast({ type: 'info', title: 'Staging Mode', message: 'All search engines are now blocked from crawling.' });
    } else if (preset === 'wordpress') {
      setDefaultRule('custom');
      setPaths([
        { id: '1', type: 'disallow', path: '/wp-admin/' },
        { id: '2', type: 'allow', path: '/wp-admin/admin-ajax.php' },
        { id: '3', type: 'disallow', path: '/wp-includes/' },
      ]);
      showToast({ type: 'info', title: 'Preset Applied', message: 'WordPress standard rules loaded.' });
    }
  };

  const generateRobotsTxt = (): string => {
    const lines: string[] = [];

    lines.push('# =========================================================================');
    lines.push('# robots.txt generated via ToolBoxX (https://toolboxx.dev)');
    lines.push('# =========================================================================\n');

    lines.push('User-agent: *');
    if (defaultRule === 'disallow_all') {
      lines.push('Disallow: /');
    } else if (defaultRule === 'allow_all') {
      lines.push('Allow: /');
    } else {
      paths.forEach((p) => {
        if (p.path.trim()) {
          const directive = p.type === 'allow' ? 'Allow' : 'Disallow';
          lines.push(`${directive}: ${p.path.trim()}`);
        }
      });
    }

    if (crawlDelay.trim()) {
      lines.push(`Crawl-delay: ${crawlDelay.trim()}`);
    }

    lines.push('');

    if (blockAiBots) {
      lines.push('# Block AI Crawlers & Scrapers');
      const aiBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Bytespider', 'Diffbot'];
      aiBots.forEach((bot) => {
        lines.push(`User-agent: ${bot}`);
        lines.push('Disallow: /');
      });
      lines.push('');
    }

    if (blockGoogleImage) {
      lines.push('# Block Google Image search');
      lines.push('User-agent: Googlebot-Image');
      lines.push('Disallow: /');
      lines.push('');
    }

    if (blockBing) {
      lines.push('# Block Bingbot');
      lines.push('User-agent: Bingbot');
      lines.push('Disallow: /');
      lines.push('');
    }

    const validSitemaps = sitemaps.filter((s) => s.trim().length > 0);
    if (validSitemaps.length > 0) {
      lines.push('# Sitemaps');
      validSitemaps.forEach((s) => {
        lines.push(`Sitemap: ${s.trim()}`);
      });
      lines.push('');
    }

    if (host.trim()) {
      lines.push(`Host: ${host.trim()}`);
    }

    return lines.join('\n');
  };

  const handleTestPath = () => {
    const p = testPath.trim();
    if (!p) return;

    if (defaultRule === 'disallow_all') {
      setTestResult('blocked');
      return;
    }

    let match: 'allowed' | 'blocked' = 'allowed';
    for (const rule of paths) {
      if (rule.path.trim() && p.startsWith(rule.path.trim().replace(/\*$/, ''))) {
        match = rule.type === 'allow' ? 'allowed' : 'blocked';
      }
    }
    setTestResult(match);
  };

  const handleCopy = async () => {
    const text = generateRobotsTxt();
    try {
      await navigator.clipboard.writeText(text);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Robots.txt Copied', message: 'Ready to place in your web root.' });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard.' });
    }
  };

  const handleDownload = () => {
    const text = generateRobotsTxt();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'robots.txt');
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved robots.txt to your device.' });
  };

  return (
    <div className="space-y-8">
      {/* Presets Header */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            Quick Configuration Presets
          </span>
          <span className="text-[11px] text-[var(--c-muted)]">Select a template to auto-populate</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] transition-all cursor-pointer"
          >
            Standard SEO
          </button>
          <button
            type="button"
            onClick={() => applyPreset('ecommerce')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] transition-all cursor-pointer"
          >
            E-Commerce Store
          </button>
          <button
            type="button"
            onClick={() => applyPreset('wordpress')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] transition-all cursor-pointer"
          >
            WordPress
          </button>
          <button
            type="button"
            onClick={() => applyPreset('block_ai')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-emerald-500 transition-all cursor-pointer"
          >
            🛡️ Block AI Scrapers
          </button>
          <button
            type="button"
            onClick={() => applyPreset('disallow_all')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-rose-500 transition-all cursor-pointer"
          >
            Staging (Disallow All)
          </button>
        </div>
      </div>

      {/* Main Grid: Rules on Left, Live File Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Directives Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Universal Agent Rules */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[var(--c-gold)]" />
                User-Agent: * (Default Crawlers)
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => addPathRule('disallow', '/')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold border border-rose-500/20 cursor-pointer"
                >
                  + Disallow
                </button>
                <button
                  type="button"
                  onClick={() => addPathRule('allow', '/')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold border border-emerald-500/20 cursor-pointer"
                >
                  + Allow
                </button>
              </div>
            </div>

            {/* Path Rules List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {paths.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded-md ${
                      p.type === 'allow'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {p.type === 'allow' ? 'Allow:' : 'Disallow:'}
                  </span>
                  <input
                    type="text"
                    value={p.path}
                    onChange={(e) => updatePathRule(p.id, e.target.value)}
                    placeholder="/path/to/folder/"
                    className="flex-1 px-3 py-1.5 font-mono text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removePathRule(p.id)}
                    className="p-1.5 text-[var(--c-muted)] hover:text-rose-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Crawl Delay */}
            <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-muted)]">
                Crawl-Delay (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(e.target.value)}
                placeholder="None"
                className="w-24 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-center"
              />
            </div>
          </div>

          {/* AI Bots & Bot Permissions */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--c-gold)]" />
              Bot Permissions & AI Protection
            </h4>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockAiBots}
                  onChange={(e) => setBlockAiBots(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--c-border)]"
                />
                <div>
                  <div className="text-xs font-bold text-[var(--c-text)]">
                    Block AI Training Bots & LLM Scrapers
                  </div>
                  <div className="text-[11px] text-[var(--c-muted)] mt-0.5">
                    Disallow GPTBot, ChatGPT-User, CCBot, Anthropic Claude, and Bytespider from scraping your website content for AI training.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockGoogleImage}
                  onChange={(e) => setBlockGoogleImage(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--c-border)]"
                />
                <div>
                  <div className="text-xs font-bold text-[var(--c-text)]">
                    Block Google Images Crawler (Googlebot-Image)
                  </div>
                  <div className="text-[11px] text-[var(--c-muted)] mt-0.5">
                    Prevents your site images from appearing in Google Images search results.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockBing}
                  onChange={(e) => setBlockBing(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--c-border)]"
                />
                <div>
                  <div className="text-xs font-bold text-[var(--c-text)]">
                    Block Bing Search Crawler (Bingbot)
                  </div>
                  <div className="text-[11px] text-[var(--c-muted)] mt-0.5">
                    Prevents Bing and Yahoo from indexing your website pages.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Sitemaps & Host Directives */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--c-gold)]" />
                XML Sitemaps & Host
              </h4>
              <button
                type="button"
                onClick={addSitemap}
                className="text-xs font-semibold text-[var(--c-gold)] hover:underline cursor-pointer"
              >
                + Add Sitemap
              </button>
            </div>

            <div className="space-y-2">
              {sitemaps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={s}
                    onChange={(e) => updateSitemap(idx, e.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                  {sitemaps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSitemap(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                Preferred Domain (Host directive)
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>
          </div>
        </div>

        {/* Right: Live robots.txt Output & Rule Tester */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Output */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--c-gold)]" />
                Live robots.txt Preview
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]">
                /robots.txt
              </span>
            </div>

            <pre className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-mono text-xs text-[var(--c-text)] max-h-80 overflow-y-auto leading-relaxed select-all">
              {generateRobotsTxt()}
            </pre>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy robots.txt
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--c-gold)]" />
                Download robots.txt
              </button>
            </div>
          </div>

          {/* Interactive URL Tester */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Test Path Access
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPath}
                onChange={(e) => {
                  setTestPath(e.target.value);
                  setTestResult(null);
                }}
                placeholder="/admin/settings or /blog/my-post"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] outline-none"
              />
              <button
                type="button"
                onClick={handleTestPath}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] cursor-pointer"
              >
                Test
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                  testResult === 'allowed'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {testResult === 'allowed' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Path <strong>{testPath}</strong> is <strong>ALLOWED</strong> for search engine crawlers.</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Path <strong>{testPath}</strong> is <strong>BLOCKED / DISALLOWED</strong> by your rules.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="robots-txt-generator" />
    </div>
  );
};

export default RobotsTxtGenerator;
