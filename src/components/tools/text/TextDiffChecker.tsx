import React, { useState, useMemo } from 'react';
import { Columns, AlignLeft, Copy, Check, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { showToast } from '../../common/Toast';

export const TextDiffChecker: React.FC = () => {
  const [originalText, setOriginalText] = useState(
    `ToolBoxX is an ultra-fast online utility suite.\nIt provides free tools to edit PDFs, compress images, and convert files.\nAll processing happens locally in your browser for 100% data privacy.`
  );
  const [modifiedText, setModifiedText] = useState(
    `ToolBoxX is a fast and modern online utility platform.\nIt provides free tools to edit PDFs, compress images, generate QR codes, and convert files.\nAll processing runs directly in your browser with 100% on-device data privacy.`
  );
  const [viewMode, setViewMode] = useState<'side' | 'inline'>('side');
  const [copied, setCopied] = useState(false);

  // Compute line-by-line diffs
  const diffLines = useMemo(() => {
    const origLines = originalText.split('\n');
    const modLines = modifiedText.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);

    const rows: {
      origLineNum?: number;
      origContent?: string;
      modLineNum?: number;
      modContent?: string;
      status: 'same' | 'added' | 'removed' | 'modified';
    }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i];
      const mod = modLines[i];

      if (orig === undefined) {
        rows.push({
          modLineNum: i + 1,
          modContent: mod,
          status: 'added',
        });
      } else if (mod === undefined) {
        rows.push({
          origLineNum: i + 1,
          origContent: orig,
          status: 'removed',
        });
      } else if (orig === mod) {
        rows.push({
          origLineNum: i + 1,
          origContent: orig,
          modLineNum: i + 1,
          modContent: mod,
          status: 'same',
        });
      } else {
        rows.push({
          origLineNum: i + 1,
          origContent: orig,
          modLineNum: i + 1,
          modContent: mod,
          status: 'modified',
        });
      }
    }

    return rows;
  }, [originalText, modifiedText]);

  // Diff Stats
  const stats = useMemo(() => {
    const same = diffLines.filter((r) => r.status === 'same').length;
    const added = diffLines.filter((r) => r.status === 'added').length;
    const removed = diffLines.filter((r) => r.status === 'removed').length;
    const modified = diffLines.filter((r) => r.status === 'modified').length;

    const charDiff = modifiedText.length - originalText.length;
    return { same, added, removed, modified, charDiff };
  }, [diffLines, originalText, modifiedText]);

  const handleCopyDiff = () => {
    const diffReport = diffLines
      .map((r) => {
        if (r.status === 'same') return `  ${r.origContent}`;
        if (r.status === 'added') return `+ ${r.modContent}`;
        if (r.status === 'removed') return `- ${r.origContent}`;
        return `- ${r.origContent}\n+ ${r.modContent}`;
      })
      .join('\n');

    navigator.clipboard.writeText(diffReport);
    setCopied(true);
    showToast('Diff report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('side')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'side'
                ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold border border-[var(--c-border)] shadow-xs'
                : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
          <button
            onClick={() => setViewMode('inline')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'inline'
                ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold border border-[var(--c-border)] shadow-xs'
                : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Unified Inline</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCopyDiff}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Diff'}</span>
          </button>
        </div>
      </div>

      {/* Input Edit Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--c-muted)]">
            <span className="font-semibold text-[var(--c-text)]">Original Text</span>
            <span>{originalText.length} chars • {originalText.split('\n').length} lines</span>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={7}
            placeholder="Paste or type original text here..."
            className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-xs font-mono outline-none focus:border-[var(--c-gold)] resize-y leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--c-muted)]">
            <span className="font-semibold text-[var(--c-text)]">Modified Text</span>
            <span>{modifiedText.length} chars • {modifiedText.split('\n').length} lines</span>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            rows={7}
            placeholder="Paste or type modified text here..."
            className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-xs font-mono outline-none focus:border-[var(--c-gold)] resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Diff Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
          <div className="text-lg font-bold text-emerald-400 font-mono">+{stats.added}</div>
          <div className="text-[11px] text-[var(--c-muted)] uppercase tracking-wider">Lines Added</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
          <div className="text-lg font-bold text-rose-400 font-mono">-{stats.removed}</div>
          <div className="text-[11px] text-[var(--c-muted)] uppercase tracking-wider">Lines Removed</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
          <div className="text-lg font-bold text-amber-400 font-mono">~{stats.modified}</div>
          <div className="text-[11px] text-[var(--c-muted)] uppercase tracking-wider">Lines Modified</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
          <div className="text-lg font-bold text-[var(--c-gold)] font-mono">
            {stats.charDiff > 0 ? `+${stats.charDiff}` : stats.charDiff}
          </div>
          <div className="text-[11px] text-[var(--c-muted)] uppercase tracking-wider">Net Chars Delta</div>
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] overflow-hidden shadow-xl">
        <div className="p-4 bg-[var(--c-card)] border-b border-[var(--c-border)] flex items-center justify-between text-xs">
          <div className="font-bold text-[var(--c-text)]">Comparison Result</div>
          <div className="flex items-center gap-3 text-[11px] text-[var(--c-muted)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Added</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Removed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Modified</span>
          </div>
        </div>

        <div className="p-4 font-mono text-xs overflow-x-auto">
          {viewMode === 'side' ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column (Original) */}
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--c-muted)] pb-1 border-b border-[var(--c-border)] font-semibold">ORIGINAL</div>
                {diffLines.map((row, idx) => (
                  <div
                    key={`orig-${idx}`}
                    className={`p-1.5 rounded flex items-start gap-2 ${
                      row.status === 'removed'
                        ? 'bg-rose-500/15 text-rose-300 border-l-2 border-rose-500'
                        : row.status === 'modified'
                        ? 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-500'
                        : 'text-[var(--c-muted)]'
                    }`}
                  >
                    <span className="text-[var(--c-subtle)] select-none w-5 text-right shrink-0">{row.origLineNum || ' '}</span>
                    <span className="whitespace-pre-wrap break-all">{row.origContent || ' '}</span>
                  </div>
                ))}
              </div>

              {/* Right Column (Modified) */}
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--c-muted)] pb-1 border-b border-[var(--c-border)] font-semibold">MODIFIED</div>
                {diffLines.map((row, idx) => (
                  <div
                    key={`mod-${idx}`}
                    className={`p-1.5 rounded flex items-start gap-2 ${
                      row.status === 'added'
                        ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500'
                        : row.status === 'modified'
                        ? 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-500'
                        : 'text-[var(--c-muted)]'
                    }`}
                  >
                    <span className="text-[var(--c-subtle)] select-none w-5 text-right shrink-0">{row.modLineNum || ' '}</span>
                    <span className="whitespace-pre-wrap break-all">{row.modContent || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Unified Inline View */
            <div className="space-y-1">
              {diffLines.map((row, idx) => {
                if (row.status === 'same') {
                  return (
                    <div key={idx} className="p-1.5 rounded flex items-start gap-3 text-[var(--c-muted)]">
                      <span className="text-[var(--c-subtle)] select-none w-6 text-right shrink-0">{row.origLineNum}</span>
                      <span className="text-[var(--c-subtle)] select-none w-4"> </span>
                      <span className="whitespace-pre-wrap break-all">{row.origContent}</span>
                    </div>
                  );
                }
                if (row.status === 'removed') {
                  return (
                    <div key={idx} className="p-1.5 rounded flex items-start gap-3 bg-rose-500/15 text-rose-300 border-l-2 border-rose-500">
                      <span className="text-rose-400 select-none w-6 text-right shrink-0">{row.origLineNum}</span>
                      <span className="text-rose-400 select-none w-4 font-bold">-</span>
                      <span className="whitespace-pre-wrap break-all">{row.origContent}</span>
                    </div>
                  );
                }
                if (row.status === 'added') {
                  return (
                    <div key={idx} className="p-1.5 rounded flex items-start gap-3 bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500">
                      <span className="text-emerald-400 select-none w-6 text-right shrink-0">{row.modLineNum}</span>
                      <span className="text-emerald-400 select-none w-4 font-bold">+</span>
                      <span className="whitespace-pre-wrap break-all">{row.modContent}</span>
                    </div>
                  );
                }
                return (
                  <React.Fragment key={idx}>
                    <div className="p-1.5 rounded flex items-start gap-3 bg-rose-500/15 text-rose-300 border-l-2 border-rose-500">
                      <span className="text-rose-400 select-none w-6 text-right shrink-0">{row.origLineNum}</span>
                      <span className="text-rose-400 select-none w-4 font-bold">-</span>
                      <span className="whitespace-pre-wrap break-all">{row.origContent}</span>
                    </div>
                    <div className="p-1.5 rounded flex items-start gap-3 bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500">
                      <span className="text-emerald-400 select-none w-6 text-right shrink-0">{row.modLineNum}</span>
                      <span className="text-emerald-400 select-none w-4 font-bold">+</span>
                      <span className="whitespace-pre-wrap break-all">{row.modContent}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
