import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Copy,
  Download,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Check,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type UuidVersion = 'v4' | 'v1' | 'nanoid';
type FormatCase = 'lowercase' | 'uppercase';

export const UuidGenerator: React.FC = () => {
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [quantity, setQuantity] = useState<number>(10);
  const [casing, setCasing] = useState<FormatCase>('lowercase');
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(true);
  const [bracketType, setBracketType] = useState<'none' | 'braces' | 'quotes' | 'single_quotes'>('none');
  const [outputFormat, setOutputFormat] = useState<'plain' | 'json' | 'sql' | 'array'>('plain');

  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  // Validation inspector tool
  const [inspectInput, setInspectInput] = useState<string>('');
  const [inspectResult, setInspectResult] = useState<{
    valid: boolean;
    version?: number;
    variant?: string;
    cleanHex?: string;
  } | null>(null);

  // Cryptographically Secure UUID v4 (RFC 4122)
  const generateV4 = (): string => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);

    // Per RFC 4122 section 4.4
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // set to version 4 (0100)
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // set to variant 1 (10xx)

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  // Time-based UUID v1 simulation (RFC 4122)
  const generateV1 = (): string => {
    const now = Date.now();
    // 60-bit timestamp in 100-nanosecond intervals since Oct 15, 1582
    const gregorianOffset = 122192928000000000n;
    const timeIn100ns = BigInt(now) * 10000n + gregorianOffset;

    const timeHex = timeIn100ns.toString(16).padStart(16, '0');
    const timeLow = timeHex.slice(8, 16);
    const timeMid = timeHex.slice(4, 8);
    const timeHiAndVersion = '1' + timeHex.slice(1, 4);

    const randomBytes = new Uint8Array(8);
    window.crypto.getRandomValues(randomBytes);
    randomBytes[0] = (randomBytes[0] & 0x3f) | 0x80; // clock_seq_hi_and_reserved
    const clockSeqAndNode = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const clockSeq = clockSeqAndNode.slice(0, 4);
    const node = clockSeqAndNode.slice(4, 16);

    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`;
  };

  // NanoID / Short URL-Safe ID (21 chars)
  const generateNanoId = (): string => {
    const urlAlphabet = 'useandom-26T1983_40XYZabcdeghijklfopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVW';
    const bytes = new Uint8Array(21);
    window.crypto.getRandomValues(bytes);
    let id = '';
    for (let i = 0; i < 21; i++) {
      id += urlAlphabet[bytes[i] & 63];
    }
    return id;
  };

  // Format single UUID according to selected options
  const formatUuid = (rawUuid: string): string => {
    let result = rawUuid;

    if (version !== 'nanoid') {
      if (!includeHyphens) {
        result = result.replace(/-/g, '');
      }
      result = casing === 'uppercase' ? result.toUpperCase() : result.toLowerCase();
    }

    if (bracketType === 'braces') {
      result = `{${result}}`;
    } else if (bracketType === 'quotes') {
      result = `"${result}"`;
    } else if (bracketType === 'single_quotes') {
      result = `'${result}'`;
    }

    return result;
  };

  // Generate batch
  const generateBatch = useCallback(() => {
    const list: string[] = [];
    const count = Math.min(Math.max(1, quantity), 100);

    for (let i = 0; i < count; i++) {
      let raw = '';
      if (version === 'v4') raw = generateV4();
      else if (version === 'v1') raw = generateV1();
      else raw = generateNanoId();

      list.push(formatUuid(raw));
    }

    setGeneratedUuids(list);
  }, [version, quantity, casing, includeHyphens, bracketType]);

  useEffect(() => {
    generateBatch();
  }, [generateBatch]);

  // Format final combined output string
  const getFormattedOutput = (): string => {
    if (outputFormat === 'json') {
      return JSON.stringify(generatedUuids, null, 2);
    }
    if (outputFormat === 'sql') {
      return generatedUuids.map((u) => `('${u.replace(/'/g, '')}')`).join(',\n') + ';';
    }
    if (outputFormat === 'array') {
      return `[\n  ${generatedUuids.map((u) => `"${u.replace(/"/g, '')}"`).join(',\n  ')}\n]`;
    }
    return generatedUuids.join('\n');
  };

  // Copy All
  const handleCopyAll = async () => {
    const text = getFormattedOutput();
    try {
      await navigator.clipboard.writeText(text);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'UUIDs Copied', message: `Copied ${generatedUuids.length} identifiers.` });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard.' });
    }
  };

  // Copy Single
  const handleCopySingle = async (u: string) => {
    try {
      await navigator.clipboard.writeText(u);
      showToast({ type: 'success', title: 'Copied', message: `Copied: ${u}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not copy.' });
    }
  };

  // Download .txt or .json
  const handleDownload = () => {
    const content = getFormattedOutput();
    const isJson = outputFormat === 'json';
    const filename = `uuids_${version}_${generatedUuids.length}.${isJson ? 'json' : 'txt'}`;
    const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/plain' });
    downloadBlob(blob, filename);
    showToast({ type: 'success', title: 'Downloaded', message: `Saved ${filename}` });
  };

  // Validate / Inspect UUID
  const handleInspect = () => {
    const clean = inspectInput.trim().replace(/[{}"']/g, '');
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-([89ab][0-9a-f]{3})-[0-9a-f]{12}$/i;
    const match = clean.match(regex);

    if (match) {
      setInspectResult({
        valid: true,
        version: parseInt(match[1], 10),
        variant: 'RFC 4122 (Leach-Salz)',
        cleanHex: clean.replace(/-/g, ''),
      });
    } else {
      setInspectResult({ valid: false });
    }
  };

  return (
    <div className="space-y-8">
      {/* Version Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-[var(--c-surface)] p-2 rounded-2xl border border-[var(--c-border)]">
        {(
          [
            { id: 'v4', label: 'UUID v4 (Random)', desc: 'RFC 4122 Cryptographic Random' },
            { id: 'v1', label: 'UUID v1 (Timestamp)', desc: 'Time & Node Identifier' },
            { id: 'nanoid', label: 'NanoID (21 chars)', desc: 'Compact URL-safe ID' },
          ] as const
        ).map((tab) => {
          const isActive = version === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setVersion(tab.id)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--c-card)] border border-[var(--c-gold)] text-[var(--c-text)] shadow-md'
                  : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--c-text)]">{tab.label}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--c-gold)]" />}
              </div>
              <p className="text-[10px] text-[var(--c-muted)] mt-0.5">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Output List on Left, Controls & Validator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Generated UUID Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[var(--c-gold)]" />
                <h4 className="font-bold text-sm text-[var(--c-text)]">
                  Generated {version.toUpperCase()} Identifiers ({generatedUuids.length})
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={generateBatch}
                  className="p-1.5 rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] cursor-pointer"
                  title="Generate new batch"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List with line numbers */}
            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] max-h-96 overflow-y-auto space-y-1 font-mono text-xs text-[var(--c-text)] select-all leading-relaxed">
              {generatedUuids.map((uuid, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-[var(--c-surface)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--c-subtle)] text-[10px] w-6 text-right select-none">{idx + 1}.</span>
                    <span className="font-bold">{uuid}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySingle(uuid)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
                    title="Copy individual UUID"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy All ({generatedUuids.length})
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--c-gold)]" />
                Download File
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Formatting Controls & UUID Validator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Controls */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Formatting & Options
            </h4>

            {/* Quantity Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                <span>Quantity</span>
                <span className="text-[var(--c-text)] font-mono">{quantity} UUIDs</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Casing & Hyphens (for v1/v4) */}
            {version !== 'nanoid' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--c-border)]">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Case</label>
                  <select
                    value={casing}
                    onChange={(e) => setCasing(e.target.value as FormatCase)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  >
                    <option value="lowercase">lowercase (a-f)</option>
                    <option value="uppercase">UPPERCASE (A-F)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--c-text)] cursor-pointer py-1.5">
                    <input
                      type="checkbox"
                      checked={includeHyphens}
                      onChange={(e) => setIncludeHyphens(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Include Hyphens (-)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Enclosing Brackets */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--c-border)]">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Enclosing</label>
                <select
                  value={bracketType}
                  onChange={(e) => setBracketType(e.target.value as 'none' | 'braces' | 'quotes' | 'single_quotes')}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                >
                  <option value="none">None</option>
                  <option value="braces">{`{ ... }`}</option>
                  <option value="quotes">{`" ... "`}</option>
                  <option value="single_quotes">{`' ... '`}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Export Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'plain' | 'json' | 'sql' | 'array')}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                >
                  <option value="plain">Plain Line-by-Line</option>
                  <option value="json">JSON Array</option>
                  <option value="array">TypeScript / JS Array</option>
                  <option value="sql">SQL INSERT Rows</option>
                </select>
              </div>
            </div>
          </div>

          {/* UUID Validator & Inspector */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--c-gold)]" />
              UUID Inspector & Validator
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste any UUID to inspect..."
                value={inspectInput}
                onChange={(e) => setInspectInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
              <button
                type="button"
                onClick={handleInspect}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] cursor-pointer"
              >
                Inspect
              </button>
            </div>

            {inspectResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  inspectResult.valid
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {inspectResult.valid ? (
                  <>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4" /> Valid RFC 4122 UUID (Version {inspectResult.version})
                    </div>
                    <div className="text-[11px] text-[var(--c-muted)] font-mono">
                      Variant: {inspectResult.variant}
                    </div>
                  </>
                ) : (
                  <div className="font-semibold">Invalid UUID string format.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="uuid-generator" />
    </div>
  );
};

export default UuidGenerator;
