import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Link as LinkIcon,
  Copy,
  ExternalLink,
  QrCode as QrIcon,
  Sparkles,
  Download,
  CheckCircle2,
  Trash2,
  Sliders,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface CustomParam {
  id: string;
  key: string;
  value: string;
}

interface SavedLink {
  id: string;
  url: string;
  campaign: string;
  source: string;
  createdAt: string;
}

export const UtmBuilder: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string>('https://toolboxx.dev/pricing');
  const [source, setSource] = useState<string>('newsletter');
  const [medium, setMedium] = useState<string>('email');
  const [campaign, setCampaign] = useState<string>('summer_launch_2026');
  const [term, setTerm] = useState<string>('');
  const [content, setContent] = useState<string>('header_cta_button');
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);

  // Formatting toggles
  const [autoLowercase, setAutoLowercase] = useState<boolean>(true);
  const [spaceReplacement, setSpaceReplacement] = useState<'_' | '-' | '+'>('_');

  // Generated results
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Quick Presets
  const PRESETS = [
    {
      name: 'Google Ads (Search)',
      source: 'google',
      medium: 'cpc',
      campaign: 'search_intent_2026',
      content: 'headline_ad_v1',
    },
    {
      name: 'Facebook / Meta Ads',
      source: 'facebook',
      medium: 'paid_social',
      campaign: 'lead_gen_retargeting',
      content: 'carousel_ad_3',
    },
    {
      name: 'Email Newsletter',
      source: 'newsletter',
      medium: 'email',
      campaign: 'weekly_digest_august',
      content: 'main_banner_link',
    },
    {
      name: 'LinkedIn Sponsored',
      source: 'linkedin',
      medium: 'sponsored_post',
      campaign: 'b2b_enterprise_leads',
      content: 'case_study_cta',
    },
    {
      name: 'YouTube Description',
      source: 'youtube',
      medium: 'video_desc',
      campaign: 'product_walkthrough',
      content: 'pinned_comment_link',
    },
    {
      name: 'Twitter / X Post',
      source: 'twitter',
      medium: 'social',
      campaign: 'viral_announcement',
      content: 'thread_link_1',
    },
  ];

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setSource(p.source);
    setMedium(p.medium);
    setCampaign(p.campaign);
    setContent(p.content);
    showToast({ type: 'info', title: 'Preset Applied', message: `Loaded ${p.name} parameters.` });
  };

  const sanitizeParam = (val: string): string => {
    let result = val.trim();
    if (autoLowercase) result = result.toLowerCase();
    result = result.replace(/\s+/g, spaceReplacement);
    return result;
  };

  // Build Full UTM URL
  useEffect(() => {
    let rawUrl = baseUrl.trim();
    if (!rawUrl) {
      setGeneratedUrl('');
      return;
    }

    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    try {
      // Split base url and existing search parameters if any
      const [urlBase, existingQuery] = rawUrl.split('?');
      const params = new URLSearchParams(existingQuery || '');

      if (source.trim()) params.set('utm_source', sanitizeParam(source));
      else params.delete('utm_source');

      if (medium.trim()) params.set('utm_medium', sanitizeParam(medium));
      else params.delete('utm_medium');

      if (campaign.trim()) params.set('utm_campaign', sanitizeParam(campaign));
      else params.delete('utm_campaign');

      if (term.trim()) params.set('utm_term', sanitizeParam(term));
      else params.delete('utm_term');

      if (content.trim()) params.set('utm_content', sanitizeParam(content));
      else params.delete('utm_content');

      // Add custom params
      customParams.forEach((cp) => {
        if (cp.key.trim() && cp.value.trim()) {
          params.set(sanitizeParam(cp.key), sanitizeParam(cp.value));
        }
      });

      const queryString = params.toString();
      const finalUrl = queryString ? `${urlBase}?${queryString}` : urlBase;
      setGeneratedUrl(finalUrl);
    } catch {
      setGeneratedUrl(rawUrl);
    }
  }, [baseUrl, source, medium, campaign, term, content, customParams, autoLowercase, spaceReplacement]);

  // Generate QR Code for live UTM URL
  useEffect(() => {
    if (!generatedUrl) {
      setQrDataUrl('');
      return;
    }

    const canvas = qrCanvasRef.current;
    if (canvas) {
      QRCode.toCanvas(canvas, generatedUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(() => {
          setQrDataUrl(canvas.toDataURL('image/png'));
        })
        .catch((err) => console.error('UTM QR Error:', err));
    }
  }, [generatedUrl]);

  // Copy to Clipboard
  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'URL Copied', message: 'UTM link copied to clipboard!' });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard.' });
    }
  };

  // Save Link to Session History
  const handleSaveLink = () => {
    if (!generatedUrl) return;
    const newSaved: SavedLink = {
      id: Math.random().toString(36).slice(2, 9),
      url: generatedUrl,
      campaign: campaign || 'unnamed_campaign',
      source: source || 'direct',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSavedLinks((prev) => [newSaved, ...prev.slice(0, 19)]);
    showToast({ type: 'success', title: 'Saved', message: 'Link stored in your history table.' });
  };

  // Download QR
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const byteString = atob(qrDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    downloadBlob(blob, `utm_qr_${campaign || 'link'}.png`);
    showToast({ type: 'success', title: 'QR Downloaded', message: 'Saved QR Code image.' });
  };

  // Add/Remove custom parameter
  const addCustomParam = () => {
    setCustomParams((prev) => [...prev, { id: Math.random().toString(36).slice(2, 9), key: '', value: '' }]);
  };

  const removeCustomParam = (id: string) => {
    setCustomParams((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCustomParam = (id: string, key: string, value: string) => {
    setCustomParams((prev) => prev.map((p) => (p.id === id ? { ...p, key, value } : p)));
  };

  return (
    <div className="space-y-8">
      {/* Quick Preset Badges */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            Quick Campaign Presets
          </span>
          <span className="text-[11px] text-[var(--c-muted)]">Click any channel to prefill tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Builder Inputs & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Base URL */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[var(--c-gold)]" />
              Website Destination URL <span className="text-rose-500">*</span>
            </h4>
            <div className="space-y-1">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--c-subtle)]">
                The full destination URL where visitors will land after clicking your link.
              </p>
            </div>
          </div>

          {/* Standard UTM Parameters */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Standard UTM Campaign Tags
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* utm_source */}
              <div>
                <label className="text-xs font-semibold text-[var(--c-text)] block mb-1">
                  Campaign Source (utm_source) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. google, newsletter, linkedin"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
                <span className="text-[10px] text-[var(--c-subtle)] mt-0.5 block">The referrer (e.g. google, meta, twitter)</span>
              </div>

              {/* utm_medium */}
              <div>
                <label className="text-xs font-semibold text-[var(--c-text)] block mb-1">
                  Campaign Medium (utm_medium) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. cpc, email, paid_social"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
                <span className="text-[10px] text-[var(--c-subtle)] mt-0.5 block">Marketing medium (e.g. cpc, banner, email)</span>
              </div>

              {/* utm_campaign */}
              <div>
                <label className="text-xs font-semibold text-[var(--c-text)] block mb-1">
                  Campaign Name (utm_campaign) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. summer_sale, promo_launch"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
                <span className="text-[10px] text-[var(--c-subtle)] mt-0.5 block">Product, promo code, or slogan</span>
              </div>

              {/* utm_term */}
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Campaign Term (utm_term) <span className="text-[10px] text-[var(--c-subtle)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. running_shoes, accounting_software"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
                <span className="text-[10px] text-[var(--c-subtle)] mt-0.5 block">Paid search keywords</span>
              </div>

              {/* utm_content */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                  Campaign Content (utm_content) <span className="text-[10px] text-[var(--c-subtle)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g. logo_link, hero_cta_button, sidebar_banner_blue"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
                <span className="text-[10px] text-[var(--c-subtle)] mt-0.5 block">Differentiate ads or links that point to the same URL (A/B testing)</span>
              </div>
            </div>
          </div>

          {/* Custom Tracking Parameters & Rules */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)]">
                Formatting & Custom Parameters
              </h4>
              <button
                type="button"
                onClick={addCustomParam}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] border border-[var(--c-border)] cursor-pointer"
              >
                + Add Custom Param
              </button>
            </div>

            {/* Custom Rows */}
            {customParams.map((cp) => (
              <div key={cp.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Parameter (e.g. ref)"
                  value={cp.key}
                  onChange={(e) => updateCustomParam(cp.id, e.target.value, cp.value)}
                  className="w-1/3 px-3 py-2 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. affiliate123)"
                  value={cp.value}
                  onChange={(e) => updateCustomParam(cp.id, cp.key, e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
                <button
                  type="button"
                  onClick={() => removeCustomParam(cp.id)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--c-border)]">
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--c-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLowercase}
                  onChange={(e) => setAutoLowercase(e.target.checked)}
                  className="rounded border-[var(--c-border)]"
                />
                <span>Auto-lowercase parameters (recommended)</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--c-muted)]">Space replacement:</span>
                {(['_', '-', '+'] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSpaceReplacement(sym)}
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold cursor-pointer ${
                      spaceReplacement === sym
                        ? 'bg-[var(--c-text)] text-[var(--c-bg)]'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]'
                    }`}
                  >
                    {sym === '_' ? 'underscore (_)' : sym === '-' ? 'hyphen (-)' : 'plus (+)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview, QR Code & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[var(--c-gold)]" />
                Generated Campaign URL
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Ready to Share
              </span>
            </div>

            {/* Generated Link Display */}
            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="font-mono text-xs text-[var(--c-text)] break-all select-all max-h-36 overflow-y-auto leading-relaxed">
                {generatedUrl || 'Enter URL & campaign parameters to generate link...'}
              </div>

              {/* Tag Breakdown Pills */}
              {generatedUrl && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--c-border)]">
                  {source && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--c-surface)] text-[var(--c-gold)] border border-[var(--c-border)]">
                      src:{source}
                    </span>
                  )}
                  {medium && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--c-surface)] text-[var(--c-accent)] border border-[var(--c-border)]">
                      med:{medium}
                    </span>
                  )}
                  {campaign && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--c-surface)] text-emerald-500 border border-[var(--c-border)]">
                      cmp:{campaign}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyUrl}
                disabled={!generatedUrl}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 disabled:opacity-40 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>

              <a
                href={generatedUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  !generatedUrl ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ExternalLink className="w-4 h-4 text-[var(--c-gold)]" />
                Test Link
              </a>
            </div>

            <button
              type="button"
              onClick={handleSaveLink}
              disabled={!generatedUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] disabled:opacity-40 text-[var(--c-text)] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              Save to Link History
            </button>
          </div>

          {/* QR Code Card */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text)]">
              <QrIcon className="w-4 h-4 text-[var(--c-gold)]" />
              Instant Scannable QR Code
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-md border border-[var(--c-border)]">
              <canvas ref={qrCanvasRef} className="w-36 h-36" />
            </div>

            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="w-full py-2 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              Download QR Code (PNG)
            </button>
          </div>

          {/* Saved Links Table */}
          {savedLinks.length > 0 && (
            <div className="bg-[var(--c-surface)] p-5 rounded-3xl border border-[var(--c-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--c-text)]">Recent UTM Links</span>
                <button
                  type="button"
                  onClick={() => setSavedLinks([])}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedLinks.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between gap-2"
                  >
                    <div className="truncate flex-1">
                      <div className="text-xs font-semibold text-[var(--c-text)] truncate">{item.campaign}</div>
                      <div className="text-[10px] font-mono text-[var(--c-subtle)] truncate">{item.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        showToast({ type: 'success', title: 'Copied', message: 'Link copied.' });
                      }}
                      className="p-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)]"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="utm-builder" />
    </div>
  );
};

export default UtmBuilder;
