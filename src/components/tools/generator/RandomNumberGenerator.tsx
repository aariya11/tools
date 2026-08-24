import React, { useState } from 'react';
import { Dices, Copy, Check, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { showToast } from '../../common/Toast';

export const RandomNumberGenerator: React.FC = () => {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [isDecimal, setIsDecimal] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [results, setResults] = useState<number[]>([42]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (min >= max) {
      showToast('Min value must be less than Max value.', 'error');
      return;
    }

    const maxUnique = Math.floor(max - min + 1);
    if (!allowDuplicates && !isDecimal && count > maxUnique) {
      showToast(`Cannot generate ${count} unique numbers in range ${min}–${max}.`, 'error');
      return;
    }

    const generated: number[] = [];
    const used = new Set<number>();

    while (generated.length < count) {
      let num: number;
      if (isDecimal) {
        num = Number((Math.random() * (max - min) + min).toFixed(decimalPlaces));
      } else {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      if (allowDuplicates || isDecimal || !used.has(num)) {
        used.add(num);
        generated.push(num);
      }
    }

    if (sortOrder === 'asc') generated.sort((a, b) => a - b);
    if (sortOrder === 'desc') generated.sort((a, b) => b - a);

    setResults(generated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    showToast('Results copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (pMin: number, pMax: number, pCount: number) => {
    setMin(pMin);
    setMax(pMax);
    setCount(pCount);
    setIsDecimal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Quick Presets Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => { setPreset(1, 6, 1); }}
          className="px-3.5 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] font-semibold shrink-0 cursor-pointer"
        >
          🎲 6-Sided Die (1-6)
        </button>
        <button
          onClick={() => { setPreset(1, 20, 1); }}
          className="px-3.5 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] font-semibold shrink-0 cursor-pointer"
        >
          🎯 D20 (1-20)
        </button>
        <button
          onClick={() => { setPreset(1, 100, 1); }}
          className="px-3.5 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] font-semibold shrink-0 cursor-pointer"
        >
          🔢 1 to 100
        </button>
        <button
          onClick={() => { setPreset(1, 50, 6); setAllowDuplicates(false); setSortOrder('asc'); }}
          className="px-3.5 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] font-semibold shrink-0 cursor-pointer"
        >
          🎟️ Lottery (6 of 50)
        </button>
      </div>

      {/* Config Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Minimum</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value) || 0)}
              className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-bold font-mono outline-none focus:border-[var(--c-gold)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Maximum</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value) || 0)}
              className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-bold font-mono outline-none focus:border-[var(--c-gold)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Quantity to Generate</label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
              className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-bold font-mono outline-none focus:border-[var(--c-gold)]"
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--c-border)]">
          <label className="flex items-center gap-2 text-xs text-[var(--c-text)] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="accent-[var(--c-accent)] rounded"
            />
            <span>Allow duplicate numbers</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--c-text)] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={isDecimal}
              onChange={(e) => setIsDecimal(e.target.checked)}
              className="accent-[var(--c-accent)] rounded"
            />
            <span>Decimal numbers</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--c-muted)] shrink-0">Sort:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-xs font-semibold outline-none"
            >
              <option value="none">Random Order</option>
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full py-4 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <Dices className="w-5 h-5" />
          <span>Generate Random Numbers</span>
        </button>
      </div>

      {/* Result Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-gold)]">
            Generated Output ({results.length} item{results.length > 1 ? 's' : ''})
          </span>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] text-[var(--c-text)] text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[var(--c-gold)]" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 max-h-[360px] overflow-y-auto p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)]">
          {results.map((n, idx) => (
            <div
              key={idx}
              className="px-4 py-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-lg sm:text-2xl font-bold font-mono text-[var(--c-text)] text-center min-w-[64px] shadow-xs"
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
