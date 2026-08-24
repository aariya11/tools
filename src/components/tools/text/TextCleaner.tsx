import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  AlignLeft,
  ArrowUpDown,
  Filter,
  Scissors,
  Layers,
  Wrench,
  Type
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

const SAMPLE_TEXT = `  1. Titanium FIDO2 Key - Enterprise Grade  
  2. Software Developer License - Pro Suite
  3. API Cloud Gateway Access Token
  
  1. Titanium FIDO2 Key - Enterprise Grade  
  
  4. Encrypted Backup Storage (1TB)
  5. Dedicated Hardware Security Module
  
  <b>Important Note:</b> <i>Contact support@toolboxx.dev for renewal inquiries.</i>
  2. Software Developer License - Pro Suite
`;

export const TextCleaner: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [prefixText, setPrefixText] = useState<string>('');
  const [suffixText, setSuffixText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Live Statistics
  const stats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const lines = inputText ? inputText.split('\n').length : 0;
    const nonBlankLines = inputText
      ? inputText.split('\n').filter((l) => l.trim().length > 0).length
      : 0;
    const bytes = new Blob([inputText]).size;

    return {
      chars: chars.toLocaleString(),
      words: words.toLocaleString(),
      lines: lines.toLocaleString(),
      nonBlankLines: nonBlankLines.toLocaleString(),
      size: formatFileSize(bytes)
    };
  }, [inputText]);

  // Transform Actions
  const handleRemoveDuplicates = (caseInsensitive = false) => {
    const lines = inputText.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];

    for (const line of lines) {
      const key = caseInsensitive ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }

    const removed = lines.length - result.length;
    setInputText(result.join('\n'));
    showToast({
      type: 'success',
      title: 'Duplicates Removed',
      message: `Removed ${removed} duplicate line${removed === 1 ? '' : 's'}`
    });
  };

  const handleRemoveEmptyLines = () => {
    const lines = inputText.split('\n');
    const result = lines.filter((l) => l.trim().length > 0);
    const removed = lines.length - result.length;
    setInputText(result.join('\n'));
    showToast({
      type: 'success',
      title: 'Empty Lines Removed',
      message: `Removed ${removed} blank line${removed === 1 ? '' : 's'}`
    });
  };

  const handleTrimLines = () => {
    const result = inputText
      .split('\n')
      .map((l) => l.trim())
      .join('\n');
    setInputText(result);
    showToast({ type: 'success', title: 'Trimmed Leading & Trailing Spaces' });
  };

  const handleCollapseSpaces = () => {
    const result = inputText
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .join('\n');
    setInputText(result);
    showToast({ type: 'success', title: 'Collapsed Consecutive Spaces' });
  };

  const handleStripHtml = () => {
    let cleaned = inputText.replace(/<[^>]*>/g, '');
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    setInputText(cleaned);
    showToast({ type: 'success', title: 'Stripped HTML / XML Tags' });
  };

  const handleSort = (direction: 'az' | 'za' | 'length-asc' | 'length-desc' | 'reverse' | 'shuffle') => {
    const lines = inputText.split('\n');
    let sorted = [...lines];

    if (direction === 'az') {
      sorted.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } else if (direction === 'za') {
      sorted.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
    } else if (direction === 'length-asc') {
      sorted.sort((a, b) => a.length - b.length);
    } else if (direction === 'length-desc') {
      sorted.sort((a, b) => b.length - a.length);
    } else if (direction === 'reverse') {
      sorted.reverse();
    } else if (direction === 'shuffle') {
      sorted = sorted.sort(() => Math.random() - 0.5);
    }

    setInputText(sorted.join('\n'));
    showToast({ type: 'success', title: 'Lines Sorted', message: `Applied ${direction.toUpperCase()} order` });
  };

  const handleCaseChange = (targetCase: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab') => {
    let result = '';
    if (targetCase === 'upper') {
      result = inputText.toUpperCase();
    } else if (targetCase === 'lower') {
      result = inputText.toLowerCase();
    } else if (targetCase === 'title') {
      result = inputText.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    } else if (targetCase === 'camel') {
      result = inputText
        .split('\n')
        .map((l) =>
          l
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        )
        .join('\n');
    } else if (targetCase === 'snake') {
      result = inputText
        .split('\n')
        .map((l) =>
          l
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w_]/g, '')
            .toLowerCase()
        )
        .join('\n');
    } else if (targetCase === 'kebab') {
      result = inputText
        .split('\n')
        .map((l) =>
          l
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .toLowerCase()
        )
        .join('\n');
    }
    setInputText(result);
    showToast({ type: 'success', title: `Converted to ${targetCase.toUpperCase()} case` });
  };

  const handleApplyPrefixSuffix = () => {
    if (!prefixText && !suffixText) return;
    const lines = inputText.split('\n');
    const result = lines.map((l) => `${prefixText}${l}${suffixText}`);
    setInputText(result.join('\n'));
    showToast({ type: 'success', title: 'Prefix & Suffix Applied' });
  };

  const handleAddNumbering = () => {
    const lines = inputText.split('\n');
    let counter = 1;
    const result = lines.map((l) => {
      if (!l.trim()) return l;
      const numbered = `${counter}. ${l.trim()}`;
      counter++;
      return numbered;
    });
    setInputText(result.join('\n'));
    showToast({ type: 'success', title: 'Sequential Line Numbers Added' });
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!inputText) return;
    const blob = new Blob([inputText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'cleaned_text.txt');
    showToast({ type: 'success', title: 'Saved as .txt file' });
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Characters" value={stats.chars} />
        <StatCard label="Word Count" value={stats.words} />
        <StatCard label="Total Lines" value={stats.lines} subValue={`${stats.nonBlankLines} non-empty`} />
        <StatCard label="Raw Data Size" value={stats.size} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Quick Operations Button Strip */}
        <div className="space-y-3 pb-4 border-b border-[var(--c-border)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Cleaning & Filtering Tools
            </span>
            <button
              type="button"
              onClick={() => setInputText(SAMPLE_TEXT)}
              className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Reset Sample
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleRemoveDuplicates(false)}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Remove Duplicates
            </button>
            <button
              type="button"
              onClick={handleRemoveEmptyLines}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Remove Empty Lines
            </button>
            <button
              type="button"
              onClick={handleTrimLines}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlignLeft className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Trim Whitespace
            </button>
            <button
              type="button"
              onClick={handleCollapseSpaces}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Collapse Spaces
            </button>
            <button
              type="button"
              onClick={handleStripHtml}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Strip HTML Tags
            </button>
            <button
              type="button"
              onClick={handleAddNumbering}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Add Numbering (1, 2, 3...)
            </button>
          </div>
        </div>

        {/* Sorting & Case Conversion Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[var(--c-border)]">
          {/* Sorting */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--c-muted)] flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Sort Lines:
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSort('az')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                A → Z
              </button>
              <button
                type="button"
                onClick={() => handleSort('za')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Z → A
              </button>
              <button
                type="button"
                onClick={() => handleSort('length-asc')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Shortest First
              </button>
              <button
                type="button"
                onClick={() => handleSort('length-desc')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Longest First
              </button>
              <button
                type="button"
                onClick={() => handleSort('reverse')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Reverse Order
              </button>
              <button
                type="button"
                onClick={() => handleSort('shuffle')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Shuffle
              </button>
            </div>
          </div>

          {/* Letter Case */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--c-muted)] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Transform Case:
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCaseChange('upper')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                UPPERCASE
              </button>
              <button
                type="button"
                onClick={() => handleCaseChange('lower')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                lowercase
              </button>
              <button
                type="button"
                onClick={() => handleCaseChange('title')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium"
              >
                Title Case
              </button>
              <button
                type="button"
                onClick={() => handleCaseChange('camel')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium font-mono"
              >
                camelCase
              </button>
              <button
                type="button"
                onClick={() => handleCaseChange('snake')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium font-mono"
              >
                snake_case
              </button>
              <button
                type="button"
                onClick={() => handleCaseChange('kebab')}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] text-xs font-medium font-mono"
              >
                kebab-case
              </button>
            </div>
          </div>
        </div>

        {/* Prefix & Suffix Adder */}
        <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Add to lines:
          </span>
          <input
            type="text"
            value={prefixText}
            onChange={(e) => setPrefixText(e.target.value)}
            placeholder="Prefix (e.g. - or ')"
            className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none flex-1 min-w-[120px]"
          />
          <input
            type="text"
            value={suffixText}
            onChange={(e) => setSuffixText(e.target.value)}
            placeholder="Suffix (e.g. , or ')"
            className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none flex-1 min-w-[120px]"
          />
          <button
            type="button"
            onClick={handleApplyPrefixSuffix}
            disabled={!prefixText && !suffixText}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-xs shadow-sm disabled:opacity-40"
          >
            Apply to All Lines
          </button>
        </div>

        {/* Main Text Editor Box */}
        <div className="space-y-2">
          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your lines of text here..."
            className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!inputText.trim()}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download .txt
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!inputText.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Cleaned Text'}
            </button>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="text-cleaner" onReset={() => setInputText('')} />
    </div>
  );
};
