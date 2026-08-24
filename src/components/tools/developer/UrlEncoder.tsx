import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Check,
  Plus,
  ArrowRightLeft,
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const SAMPLE_URLS = {
  oauth: 'https://auth.toolboxx.dev/oauth/v2/authorize?client_id=client_98241&redirect_uri=https%3A%2F%2Fapp.toolboxx.dev%2Fcallback&response_type=code&scope=openid%20profile%20email&state=xyz_sec_819',
  api: 'https://api.toolboxx.dev/v1/analytics/query?filter=status%3Aactive%20AND%20tier%3Aenterprise&sort=-created_at&limit=50&fields=id%2Cname%2Cemail%2Ccreated_at',
  complex: 'https://search.toolboxx.dev/results?q=React+19+%26+TypeScript+%3D+Awesome%21&category=developer-tools&ref=nav_header#page=2&view=grid'
};

export const UrlEncoder: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'uri'>('component');
  const [spaceAsPlus, setSpaceAsPlus] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>(SAMPLE_URLS.oauth);
  const [copied, setCopied] = useState<boolean>(false);

  // Active query parameters extracted
  const [queryParams, setQueryParams] = useState<QueryParam[]>(() => {
    try {
      const url = new URL(SAMPLE_URLS.oauth);
      const params: QueryParam[] = [];
      url.searchParams.forEach((value, key) => {
        params.push({ id: Math.random().toString(36).slice(2), key, value, enabled: true });
      });
      return params;
    } catch {
      return [];
    }
  });

  // Transformation output
  const outputResult = useMemo(() => {
    if (!inputUrl) return { text: '', error: null };
    try {
      if (mode === 'encode') {
        let res = encodeType === 'component' ? encodeURIComponent(inputUrl) : encodeURI(inputUrl);
        if (spaceAsPlus) {
          res = res.replace(/%20/g, '+');
        }
        return { text: res, error: null };
      } else {
        let clean = inputUrl;
        if (spaceAsPlus || clean.includes('+')) {
          clean = clean.replace(/\+/g, ' ');
        }
        const res = decodeURIComponent(clean);
        return { text: res, error: null };
      }
    } catch (err) {
      return {
        text: '',
        error: err instanceof Error ? err.message : 'URI malformed'
      };
    }
  }, [inputUrl, mode, encodeType, spaceAsPlus]);

  // URL components decomposition
  const urlParts = useMemo(() => {
    try {
      const parsed = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
      return {
        protocol: parsed.protocol,
        host: parsed.host,
        pathname: parsed.pathname,
        hash: parsed.hash,
        paramsCount: Array.from(parsed.searchParams.keys()).length
      };
    } catch {
      return null;
    }
  }, [inputUrl]);

  const handleSwapMode = () => {
    if (outputResult.text && !outputResult.error) {
      setInputUrl(outputResult.text);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleAddParam = () => {
    setQueryParams((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), key: '', value: '', enabled: true }
    ]);
  };

  const handleUpdateParam = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    setQueryParams((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, [field]: val } : p));
      // Reconstruct URL with new params if valid URL base exists
      try {
        const url = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
        url.search = '';
        updated.forEach((p) => {
          if (p.enabled && p.key) {
            url.searchParams.append(p.key, p.value);
          }
        });
        setInputUrl(url.toString());
      } catch {
        // Fallback
      }
      return updated;
    });
  };

  const handleDeleteParam = (id: string) => {
    setQueryParams((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCopy = () => {
    if (!outputResult.text) return;
    navigator.clipboard.writeText(outputResult.text);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputResult.text) return;
    const blob = new Blob([outputResult.text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `toolboxx_${mode}d_url.txt`);
    showToast({ type: 'success', title: 'URL Saved to File' });
  };

  const handleExportParamsJson = () => {
    const obj: Record<string, string> = {};
    queryParams.forEach((p) => {
      if (p.enabled && p.key) obj[p.key] = p.value;
    });
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    showToast({ type: 'success', title: 'Parameters JSON Copied' });
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Mode"
          value={mode === 'encode' ? 'URL Encode' : 'URL Decode'}
          badge={encodeType === 'component' ? 'Component' : 'Full URI'}
          badgeType="neutral"
        />
        <StatCard label="Input Length" value={`${inputUrl.length} chars`} />
        <StatCard label="Output Length" value={`${outputResult.text.length} chars`} />
        <StatCard label="Query Parameters" value={urlParts ? `${urlParts.paramsCount} detected` : '-'} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'encode'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              Encode URL
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'decode'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              Decode URL
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--c-muted)]">
            {mode === 'encode' && (
              <div className="flex items-center gap-1">
                <span>Method:</span>
                <select
                  value={encodeType}
                  onChange={(e) => setEncodeType(e.target.value as 'component' | 'uri')}
                  className="px-2 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)]"
                >
                  <option value="component">encodeURIComponent (All)</option>
                  <option value="uri">encodeURI (Preserve / ? &)</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--c-text)]">
              <input
                type="checkbox"
                checked={spaceAsPlus}
                onChange={(e) => setSpaceAsPlus(e.target.checked)}
                className="rounded accent-[var(--c-gold)]"
              />
              Spaces as + (application/x-www-form-urlencoded)
            </label>
          </div>
        </div>

        {/* Input & Output Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <span>{mode === 'encode' ? 'Raw URL or String to Encode' : 'Encoded URL to Decode'}</span>
              <span>{inputUrl.length} chars</span>
            </div>
            <textarea
              rows={8}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste or type URL here..."
              className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <span className="text-[var(--c-gold)]">
                {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
              </span>
              <span>{outputResult.text.length} chars</span>
            </div>
            <textarea
              rows={8}
              readOnly
              value={outputResult.error ? `Error: ${outputResult.error}` : outputResult.text}
              placeholder="Converted result will appear here..."
              className={`w-full p-4 rounded-2xl border ${
                outputResult.error ? 'border-rose-700 bg-rose-950/20 text-rose-300' : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]'
              } font-mono text-xs leading-relaxed outline-none resize-y shadow-inner opacity-95`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Middle Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => setInputUrl(SAMPLE_URLS.oauth)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              OAuth Callback
            </button>
            <button
              type="button"
              onClick={() => setInputUrl(SAMPLE_URLS.api)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              REST Query API
            </button>
            <button
              type="button"
              onClick={() => setInputUrl(SAMPLE_URLS.complex)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Special Chars
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwapMode}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Swap Mode
            </button>
            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputResult.text}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputResult.text}
              className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>
          </div>
        </div>

        {/* Live Query Parameters Inspector & Table Builder */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--c-gold)]" />
              <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider">
                Interactive Query Parameters Table
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportParamsJson}
                className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 transition-colors"
              >
                <Code2 className="w-3 h-3" /> Copy as JSON
              </button>
              <button
                type="button"
                onClick={handleAddParam}
                className="px-3 py-1 rounded-lg text-xs bg-[var(--c-gold)] text-[var(--c-bg)] font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Param
              </button>
            </div>
          </div>

          {queryParams.length === 0 ? (
            <p className="text-xs text-[var(--c-subtle)] text-center py-4 italic">
              No query parameters found in input URL. Click "Add Param" to build URL parameters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-medium">
                    <th className="py-2 px-2 w-8">Active</th>
                    <th className="py-2 px-2">Key / Parameter</th>
                    <th className="py-2 px-2">Value</th>
                    <th className="py-2 px-2 w-12 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-border)]">
                  {queryParams.map((param) => (
                    <tr key={param.id} className="hover:bg-[var(--c-card)]/50 transition-colors">
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => handleUpdateParam(param.id, 'enabled', e.target.checked)}
                          className="rounded accent-[var(--c-gold)]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => handleUpdateParam(param.id, 'key', e.target.value)}
                          placeholder="e.g. client_id"
                          className="w-full px-2.5 py-1 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => handleUpdateParam(param.id, 'value', e.target.value)}
                          placeholder="e.g. 12345"
                          className="w-full px-2.5 py-1 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteParam(param.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-[var(--c-card)]"
                          title="Remove Parameter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="url-encoder" onReset={() => setInputUrl('')} />
    </div>
  );
};
