import React, { useState, useMemo } from 'react';
import {
  Percent,
  TrendingUp,
  TrendingDown,
  Scale,
  Calculator,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  PieChart,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

type PercentageTab = 'mode1' | 'mode2' | 'mode3' | 'mode4' | 'modeQuick';

export const PercentageCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PercentageTab>('mode1');

  // Mode 1: What is X% of Y?
  const [m1Percent, setM1Percent] = useState<string>('20');
  const [m1Total, setM1Total] = useState<string>('150');

  // Mode 2: X is what percentage of Y?
  const [m2Part, setM2Part] = useState<string>('45');
  const [m2Whole, setM2Whole] = useState<string>('180');

  // Mode 3: Percentage Increase / Decrease from X to Y
  const [m3From, setM3From] = useState<string>('120');
  const [m3To, setM3To] = useState<string>('150');

  // Mode 4: Percentage difference between X and Y
  const [m4Val1, setM4Val1] = useState<string>('80');
  const [m4Val2, setM4Val2] = useState<string>('100');

  // Quick Tools: Add / Subtract % to value
  const [quickBase, setQuickBase] = useState<string>('100');
  const [quickPercent, setQuickPercent] = useState<string>('15');
  const [quickOp, setQuickOp] = useState<'add' | 'sub'>('add');

  const [copied, setCopied] = useState<boolean>(false);

  // Common presets
  const commonPresets = [5, 10, 15, 20, 25, 30, 50, 75];

  // Calculations for Mode 1: What is X% of Y?
  const res1 = useMemo(() => {
    const p = parseFloat(m1Percent);
    const t = parseFloat(m1Total);
    if (isNaN(p) || isNaN(t)) return null;
    const result = (p / 100) * t;
    const remaining = t - result;
    const decimal = p / 100;
    return {
      result,
      remaining,
      decimal,
      percentage: p,
      total: t,
      formatted: `${p}% of ${t} = ${Number(result.toFixed(4)).toLocaleString()}`,
    };
  }, [m1Percent, m1Total]);

  // Calculations for Mode 2: X is what percentage of Y?
  const res2 = useMemo(() => {
    const part = parseFloat(m2Part);
    const whole = parseFloat(m2Whole);
    if (isNaN(part) || isNaN(whole) || whole === 0) return null;
    const pct = (part / whole) * 100;
    const ratio = whole !== 0 ? (part / whole) : 0;
    return {
      percentage: pct,
      part,
      whole,
      ratio,
      formatted: `${part} is ${pct.toFixed(2)}% of ${whole}`,
    };
  }, [m2Part, m2Whole]);

  // Calculations for Mode 3: Percentage Increase / Decrease from X to Y
  const res3 = useMemo(() => {
    const from = parseFloat(m3From);
    const to = parseFloat(m3To);
    if (isNaN(from) || isNaN(to) || from === 0) return null;
    const diff = to - from;
    const pctChange = (diff / Math.abs(from)) * 100;
    const isIncrease = diff >= 0;
    const multiplier = to / from;
    return {
      pctChange,
      diff,
      isIncrease,
      multiplier,
      from,
      to,
      formatted: `From ${from} to ${to} is a ${Math.abs(pctChange).toFixed(2)}% ${isIncrease ? 'increase' : 'decrease'}`,
    };
  }, [m3From, m3To]);

  // Calculations for Mode 4: Percentage difference between X and Y
  const res4 = useMemo(() => {
    const v1 = parseFloat(m4Val1);
    const v2 = parseFloat(m4Val2);
    if (isNaN(v1) || isNaN(v2)) return null;
    const diff = Math.abs(v1 - v2);
    const avg = (v1 + v2) / 2;
    if (avg === 0) return null;
    const pctDiff = (diff / avg) * 100;
    return {
      pctDiff,
      diff,
      avg,
      v1,
      v2,
      formatted: `Percentage difference between ${v1} and ${v2} is ${pctDiff.toFixed(2)}%`,
    };
  }, [m4Val1, m4Val2]);

  // Calculations for Quick Tool
  const resQuick = useMemo(() => {
    const b = parseFloat(quickBase);
    const p = parseFloat(quickPercent);
    if (isNaN(b) || isNaN(p)) return null;
    const changeAmt = (p / 100) * b;
    const finalVal = quickOp === 'add' ? b + changeAmt : b - changeAmt;
    return {
      base: b,
      percent: p,
      changeAmt,
      finalVal,
      op: quickOp,
      formatted: `${b} ${quickOp === 'add' ? '+' : '-'} ${p}% = ${Number(finalVal.toFixed(4)).toLocaleString()}`,
    };
  }, [quickBase, quickPercent, quickOp]);

  const currentFormattedResult = useMemo(() => {
    switch (activeTab) {
      case 'mode1': return res1?.formatted || '';
      case 'mode2': return res2?.formatted || '';
      case 'mode3': return res3?.formatted || '';
      case 'mode4': return res4?.formatted || '';
      case 'modeQuick': return resQuick?.formatted || '';
      default: return '';
    }
  }, [activeTab, res1, res2, res3, res4, resQuick]);

  const handleCopy = async () => {
    if (!currentFormattedResult) return;
    try {
      await navigator.clipboard.writeText(currentFormattedResult);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Result Copied!',
        message: currentFormattedResult,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        type: 'error',
        title: 'Failed to Copy',
        message: 'Could not write to clipboard.',
      });
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('mode1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mode1'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>What is X% of Y?</span>
        </button>

        <button
          onClick={() => setActiveTab('mode2')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mode2'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>X is what % of Y?</span>
        </button>

        <button
          onClick={() => setActiveTab('mode3')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mode3'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>% Increase / Decrease</span>
        </button>

        <button
          onClick={() => setActiveTab('mode4')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mode4'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>% Difference</span>
        </button>

        <button
          onClick={() => setActiveTab('modeQuick')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'modeQuick'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Add / Subtract %</span>
        </button>
      </div>

      {/* Mode 1: What is X% of Y? */}
      {activeTab === 'mode1' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">What is X% of Y?</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">Calculate the exact portion of any number given a percentage.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                Formula: (X ÷ 100) × Y
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Percentage (X %)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={m1Percent}
                    onChange={(e) => setM1Percent(e.target.value)}
                    placeholder="20"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-muted)]">%</span>
                </div>
              </div>

              <div className="sm:col-span-1 flex justify-center text-xl font-bold text-[var(--c-muted)]">
                of
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Total Value (Y)</label>
                <input
                  type="number"
                  value={m1Total}
                  onChange={(e) => setM1Total(e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={triggerConfetti}
                  className="w-full py-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Animate</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-medium text-[var(--c-muted)] mr-1">Quick Presets:</span>
              {commonPresets.map((pct) => (
                <button
                  key={pct}
                  onClick={() => setM1Percent(String(pct))}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    m1Percent === String(pct)
                      ? 'border-[var(--c-gold)] bg-[var(--c-gold)]/10 text-[var(--c-gold)]'
                      : 'border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {res1 && (
              <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Result Output:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--c-gold)]">
                      {Number(res1.result.toFixed(4)).toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--c-muted)]">
                      ({res1.percentage}% of {res1.total})
                    </span>
                  </div>
                </div>

                {/* Visual Bar Comparison */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--c-muted)] font-medium">
                    <span>Part: {Number(res1.result.toFixed(2)).toLocaleString()} ({Math.min(100, Math.max(0, res1.percentage))}%)</span>
                    <span>Remaining: {Number(res1.remaining.toFixed(2)).toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] overflow-hidden flex">
                    <div
                      className="h-full bg-[var(--c-gold)] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, res1.percentage))}%` }}
                    />
                    <div className="h-full flex-1 bg-slate-700/30" />
                  </div>
                </div>

                {/* Step-by-step formula breakdown */}
                <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs space-y-1.5 font-mono">
                  <span className="text-[var(--c-gold)] font-bold block mb-1">Step-by-step Calculation:</span>
                  <p className="text-[var(--c-muted)]">1. Convert percentage to decimal: {res1.percentage} ÷ 100 = {res1.decimal}</p>
                  <p className="text-[var(--c-muted)]">2. Multiply by total value: {res1.decimal} × {res1.total} = <strong className="text-[var(--c-text)]">{res1.result}</strong></p>
                  <p className="text-[var(--c-muted)]">3. Fraction representation: {res1.percentage}/100 = {res1.result}/{res1.total}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: X is what percentage of Y? */}
      {activeTab === 'mode2' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">X is what % of Y?</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">Determine what percentage a portion represents of the whole.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                Formula: (X ÷ Y) × 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Part Value (X)</label>
                <input
                  type="number"
                  value={m2Part}
                  onChange={(e) => setM2Part(e.target.value)}
                  placeholder="45"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-center text-xs font-bold text-[var(--c-muted)]">
                is what % of
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Total Whole (Y)</label>
                <input
                  type="number"
                  value={m2Whole}
                  onChange={(e) => setM2Whole(e.target.value)}
                  placeholder="180"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>

            {res2 && (
              <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Calculated Percentage:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--c-gold)]">
                      {res2.percentage.toFixed(2)}%
                    </span>
                    <span className="text-xs text-[var(--c-muted)]">
                      ({res2.part} out of {res2.whole})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--c-muted)] font-medium">
                    <span>{res2.part} of {res2.whole}</span>
                    <span>{res2.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--c-gold)] to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, res2.percentage))}%` }}
                    />
                  </div>
                </div>

                {/* Step-by-step */}
                <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs space-y-1.5 font-mono">
                  <span className="text-[var(--c-gold)] font-bold block mb-1">Step-by-step Calculation:</span>
                  <p className="text-[var(--c-muted)]">1. Divide part by total whole: {res2.part} ÷ {res2.whole} = {res2.ratio.toFixed(4)}</p>
                  <p className="text-[var(--c-muted)]">2. Multiply quotient by 100: {res2.ratio.toFixed(4)} × 100 = <strong className="text-[var(--c-text)]">{res2.percentage.toFixed(2)}%</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Percentage Increase / Decrease from X to Y */}
      {activeTab === 'mode3' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">Percentage Increase / Decrease</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">Calculate growth or reduction rate between an initial and final value.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                Formula: ((Y − X) ÷ |X|) × 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Starting / Initial Value (X)</label>
                <input
                  type="number"
                  value={m3From}
                  onChange={(e) => setM3From(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-center text-xs font-bold text-[var(--c-muted)]">
                <ArrowRight className="w-5 h-5 text-[var(--c-gold)]" />
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">New / Final Value (Y)</label>
                <input
                  type="number"
                  value={m3To}
                  onChange={(e) => setM3To(e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>

            {res3 && (
              <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Rate of Change:</span>
                  <div className="flex items-center gap-2">
                    {res3.isIncrease ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <TrendingUp className="w-4 h-4" /> Increase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                        <TrendingDown className="w-4 h-4" /> Decrease
                      </span>
                    )}
                    <span className={`text-3xl sm:text-4xl font-extrabold ${res3.isIncrease ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {res3.isIncrease ? '+' : ''}{res3.pctChange.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Absolute Difference:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">
                      {res3.diff >= 0 ? `+${res3.diff}` : res3.diff}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Multiplier Factor:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">
                      {res3.multiplier.toFixed(4)}x
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] col-span-2 sm:col-span-1">
                    <span className="text-[var(--c-muted)] block">Direction:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">
                      {res3.isIncrease ? 'Growth / Markup' : 'Drop / Discount'}
                    </span>
                  </div>
                </div>

                {/* Step-by-step */}
                <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs space-y-1.5 font-mono">
                  <span className="text-[var(--c-gold)] font-bold block mb-1">Step-by-step Calculation:</span>
                  <p className="text-[var(--c-muted)]">1. Calculate difference: {res3.to} − {res3.from} = {res3.diff}</p>
                  <p className="text-[var(--c-muted)]">2. Divide difference by starting value: {res3.diff} ÷ {res3.from} = {(res3.diff / res3.from).toFixed(4)}</p>
                  <p className="text-[var(--c-muted)]">3. Multiply by 100: {(res3.diff / res3.from).toFixed(4)} × 100 = <strong className="text-[var(--c-text)]">{res3.pctChange.toFixed(2)}%</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 4: Percentage Difference between X and Y */}
      {activeTab === 'mode4' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">Percentage Difference</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">
                  Used when comparing two non-ordered values without a designated start or end point.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                Formula: |X − Y| ÷ ((X + Y) ÷ 2) × 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">First Value (X)</label>
                <input
                  type="number"
                  value={m4Val1}
                  onChange={(e) => setM4Val1(e.target.value)}
                  placeholder="80"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Second Value (Y)</label>
                <input
                  type="number"
                  value={m4Val2}
                  onChange={(e) => setM4Val2(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>

            {res4 && (
              <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Relative Percentage Difference:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--c-gold)]">
                      {res4.pctDiff.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Absolute Difference:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">{res4.diff}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Average Midpoint:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">{res4.avg}</span>
                  </div>
                </div>

                {/* Step-by-step */}
                <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs space-y-1.5 font-mono">
                  <span className="text-[var(--c-gold)] font-bold block mb-1">Step-by-step Calculation:</span>
                  <p className="text-[var(--c-muted)]">1. Absolute difference: |{res4.v1} − {res4.v2}| = {res4.diff}</p>
                  <p className="text-[var(--c-muted)]">2. Average of both numbers: ({res4.v1} + {res4.v2}) ÷ 2 = {res4.avg}</p>
                  <p className="text-[var(--c-muted)]">3. Ratio to midpoint: {res4.diff} ÷ {res4.avg} × 100 = <strong className="text-[var(--c-text)]">{res4.pctDiff.toFixed(2)}%</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Quick: Add / Subtract % */}
      {activeTab === 'modeQuick' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">Add / Subtract Percentage</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">Quickly add sales tax, tips, or deduct percentage discounts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Initial Amount</label>
                <input
                  type="number"
                  value={quickBase}
                  onChange={(e) => setQuickBase(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Operation</label>
                <div className="flex rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] p-1">
                  <button
                    onClick={() => setQuickOp('add')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      quickOp === 'add' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    + Add %
                  </button>
                  <button
                    onClick={() => setQuickOp('sub')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      quickOp === 'sub' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    − Subtract %
                  </button>
                </div>
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Percentage (% to {quickOp})</label>
                <div className="relative">
                  <input
                    type="number"
                    value={quickPercent}
                    onChange={(e) => setQuickPercent(e.target.value)}
                    placeholder="15"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-muted)]">%</span>
                </div>
              </div>
            </div>

            {resQuick && (
              <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Final Calculated Value:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--c-gold)]">
                      {Number(resQuick.finalVal.toFixed(4)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Delta Amount ({quickOp === 'add' ? 'Added' : 'Subtracted'}):</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">
                      {quickOp === 'add' ? '+' : '−'}{Number(resQuick.changeAmt.toFixed(2)).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <span className="text-[var(--c-muted)] block">Original Base:</span>
                    <span className="text-sm font-bold text-[var(--c-text)]">{resQuick.base}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Action Bar */}
      {currentFormattedResult && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--c-text)]">
            <Calculator className="w-4 h-4 text-[var(--c-gold)]" />
            <span>{currentFormattedResult}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Social Share Banner */}
      <SocialShareButtons
        variant="banner"
        resultSummary={currentFormattedResult ? `Calculated: ${currentFormattedResult}` : 'Free multi-mode Percentage Calculator on ToolBoxX'}
        title="Percentage Calculator Online – 4 Essential Modes | ToolBoxX"
      />

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="percentage-calculator" />
    </div>
  );
};

export default PercentageCalculator;
