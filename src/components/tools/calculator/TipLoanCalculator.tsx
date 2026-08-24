import React, { useState, useMemo } from 'react';
import { DollarSign, Users, Percent, Copy, Check, Sparkles, Receipt, Calculator } from 'lucide-react';
import { showToast } from '../../common/Toast';

export const TipLoanCalculator: React.FC = () => {
  const [billAmount, setBillAmount] = useState<number>(85.0);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const rawTip = (billAmount * tipPercent) / 100;
    let total = billAmount + rawTip;
    if (roundUp) {
      total = Math.ceil(total);
    }
    const tip = total - billAmount;
    const perPersonTotal = total / splitCount;
    const perPersonTip = tip / splitCount;
    const perPersonBill = billAmount / splitCount;

    return {
      tip: Number(tip.toFixed(2)),
      total: Number(total.toFixed(2)),
      perPersonTotal: Number(perPersonTotal.toFixed(2)),
      perPersonTip: Number(perPersonTip.toFixed(2)),
      perPersonBill: Number(perPersonBill.toFixed(2)),
    };
  }, [billAmount, tipPercent, splitCount, roundUp]);

  const handleCopy = () => {
    const text = `Bill: $${billAmount.toFixed(2)} | Tip (${tipPercent}%): $${calculations.tip.toFixed(2)} | Total: $${calculations.total.toFixed(2)} (${splitCount} people = $${calculations.perPersonTotal.toFixed(2)}/person)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Breakdown copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Input Calculator Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bill Amount */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Bill Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-gold)] font-bold text-base">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-lg font-bold font-mono outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          {/* Tip Percentage */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Tip Percentage</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 15, 18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTipPercent(pct)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    tipPercent === pct
                      ? 'bg-[var(--c-accent)] text-[var(--c-bg)] font-bold'
                      : 'bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={tipPercent}
              onChange={(e) => setTipPercent(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Custom %"
              className="w-full p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-xs font-mono outline-none focus:border-[var(--c-gold)] mt-1"
            />
          </div>

          {/* Number of People */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Split Among People</label>
            <div className="relative">
              <Users className="w-4 h-4 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                max={50}
                value={splitCount}
                onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-lg font-bold font-mono outline-none focus:border-[var(--c-gold)]"
              />
            </div>
            <label className="flex items-center gap-2 pt-1 text-xs text-[var(--c-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={roundUp}
                onChange={(e) => setRoundUp(e.target.checked)}
                className="accent-[var(--c-accent)] rounded"
              />
              <span>Round up to nearest dollar</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Summary Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--c-text)]">
            <Receipt className="w-5 h-5 text-[var(--c-gold)]" />
            <span>Bill & Tip Summary</span>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] text-[var(--c-text)] text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[var(--c-gold)]" />}
            <span>{copied ? 'Copied' : 'Copy Breakdown'}</span>
          </button>
        </div>

        {/* Big Per-Person Callout */}
        <div className="p-6 rounded-3xl bg-[var(--c-card)] border border-[var(--c-border)] text-center space-y-1">
          <div className="text-xs text-[var(--c-muted)] uppercase tracking-wider font-semibold">Each Person Pays</div>
          <div className="text-4xl sm:text-5xl font-bold font-serif text-[var(--c-gold)]">
            ${calculations.perPersonTotal.toFixed(2)}
          </div>
          <div className="text-xs text-[var(--c-subtle)] font-mono">
            (${(calculations.perPersonBill).toFixed(2)} bill + ${(calculations.perPersonTip).toFixed(2)} tip)
          </div>
        </div>

        {/* 4 Stat Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
            <div className="text-xs text-[var(--c-muted)]">Tip Amount</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">${calculations.tip.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
            <div className="text-xs text-[var(--c-muted)]">Total Bill</div>
            <div className="text-xl font-bold text-[var(--c-text)] font-mono mt-1">${calculations.total.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
            <div className="text-xs text-[var(--c-muted)]">Tip / Person</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">${calculations.perPersonTip.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-center">
            <div className="text-xs text-[var(--c-muted)]">Split Count</div>
            <div className="text-xl font-bold text-[var(--c-text)] font-mono mt-1">{splitCount} people</div>
          </div>
        </div>
      </div>
    </div>
  );
};
