import React, { useState, useMemo } from 'react';
import {
  Tag,
  DollarSign,
  Percent,
  Users,
  Receipt,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Share2,
  TrendingDown,
  ShoppingBag,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
];

const TAX_PRESETS = [0, 5, 7, 8.875, 10, 13, 15, 20];
const TIP_PRESETS = [0, 10, 15, 18, 20, 25];

export const DiscountCalculator: React.FC = () => {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [originalPrice, setOriginalPrice] = useState<string>('120');

  // Primary Discount
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountVal, setDiscountVal] = useState<string>('25');

  // Stacked Secondary Discount Toggle
  const [hasSecondDiscount, setHasSecondDiscount] = useState<boolean>(false);
  const [secondDiscountType, setSecondDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [secondDiscountVal, setSecondDiscountVal] = useState<string>('10');

  // Sales Tax
  const [taxPercent, setTaxPercent] = useState<string>('8.5');

  // Bill Splitting & Tip
  const [splitCount, setSplitCount] = useState<number>(1);
  const [tipPercent, setTipPercent] = useState<string>('15');

  const [copied, setCopied] = useState<boolean>(false);

  // Core Calculations
  const calculations = useMemo(() => {
    const orig = parseFloat(originalPrice);
    if (isNaN(orig) || orig <= 0) return null;

    const d1Val = parseFloat(discountVal) || 0;
    let d1Amount = 0;
    if (discountType === 'percent') {
      d1Amount = (d1Val / 100) * orig;
    } else {
      d1Amount = Math.min(orig, d1Val);
    }
    const priceAfterD1 = Math.max(0, orig - d1Amount);

    // Stacked second discount (applied on already discounted price)
    let d2Amount = 0;
    if (hasSecondDiscount) {
      const d2Val = parseFloat(secondDiscountVal) || 0;
      if (secondDiscountType === 'percent') {
        d2Amount = (d2Val / 100) * priceAfterD1;
      } else {
        d2Amount = Math.min(priceAfterD1, d2Val);
      }
    }
    const finalPreTaxPrice = Math.max(0, priceAfterD1 - d2Amount);
    const totalSavings = d1Amount + d2Amount;
    const effectiveDiscountPercent = (totalSavings / orig) * 100;

    // Sales Tax
    const taxP = parseFloat(taxPercent) || 0;
    const taxAmount = (taxP / 100) * finalPreTaxPrice;

    // Tip
    const tipP = parseFloat(tipPercent) || 0;
    const tipAmount = (tipP / 100) * finalPreTaxPrice;

    // Final Post-Tax & Tip Price
    const finalTotalWithTaxAndTip = finalPreTaxPrice + taxAmount + tipAmount;

    // Split per person
    const people = Math.max(1, splitCount);
    const perPersonTotal = finalTotalWithTaxAndTip / people;
    const perPersonBase = finalPreTaxPrice / people;
    const perPersonTax = taxAmount / people;
    const perPersonTip = tipAmount / people;

    return {
      orig,
      d1Amount,
      d2Amount,
      totalSavings,
      effectiveDiscountPercent,
      finalPreTaxPrice,
      taxAmount,
      tipAmount,
      finalTotalWithTaxAndTip,
      people,
      perPersonTotal,
      perPersonBase,
      perPersonTax,
      perPersonTip,
    };
  }, [
    originalPrice,
    discountType,
    discountVal,
    hasSecondDiscount,
    secondDiscountType,
    secondDiscountVal,
    taxPercent,
    tipPercent,
    splitCount,
  ]);

  const handleCelebrate = () => {
    if (calculations && calculations.effectiveDiscountPercent >= 25) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      showToast({
        type: 'success',
        title: 'Huge Savings Deal!',
        message: `You saved ${currency.symbol}${calculations.totalSavings.toFixed(2)} (${calculations.effectiveDiscountPercent.toFixed(1)}% off)!`,
      });
    }
  };

  const handleCopyReceipt = async () => {
    if (!calculations) return;
    const text = `🧾 Shopping Savings Summary (${currency.code}):\n` +
      `🏷️ Original Price: ${currency.symbol}${calculations.orig.toFixed(2)}\n` +
      `💸 Total Discount Saved: ${currency.symbol}${calculations.totalSavings.toFixed(2)} (${calculations.effectiveDiscountPercent.toFixed(1)}% Off)\n` +
      `🛒 Discounted Price: ${currency.symbol}${calculations.finalPreTaxPrice.toFixed(2)}\n` +
      `🏛️ Sales Tax (${taxPercent}%): +${currency.symbol}${calculations.taxAmount.toFixed(2)}\n` +
      `🍽️ Tip (${tipPercent}%): +${currency.symbol}${calculations.tipAmount.toFixed(2)}\n` +
      `💵 Final Total: ${currency.symbol}${calculations.finalTotalWithTaxAndTip.toFixed(2)}\n` +
      (calculations.people > 1 ? `👥 Split (${calculations.people} people): ${currency.symbol}${calculations.perPersonTotal.toFixed(2)} each\n` : '') +
      `Calculated with ToolBoxX Free Discount & Tip Calculator.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ type: 'success', title: 'Receipt Copied!', message: 'Shopping summary ready to share.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Price & Discounts Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[var(--c-gold)]" />
              <span>Discount & Savings Calculator</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Calculate sale price, stacked double discounts, sales tax, and group bill-splitting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--c-muted)]">Currency:</span>
            <select
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Original Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Original Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-muted)]">
                {currency.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="100"
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
            </div>
          </div>

          {/* Primary Discount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)]">Discount</label>
              <div className="flex rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-0.5 text-[10px]">
                <button
                  onClick={() => setDiscountType('percent')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    discountType === 'percent' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                  }`}
                >
                  % Off
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    discountType === 'fixed' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                  }`}
                >
                  {currency.symbol} Flat Off
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                placeholder="20"
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--c-muted)]">
                {discountType === 'percent' ? '%' : currency.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Stacked Second Discount Toggle */}
        <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="secondDiscountToggle"
                checked={hasSecondDiscount}
                onChange={(e) => setHasSecondDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--c-gold)] cursor-pointer"
              />
              <label htmlFor="secondDiscountToggle" className="text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                Add Stacked / Additional Second Coupon Discount (e.g. Extra 10% Off)
              </label>
            </div>
          </div>

          {hasSecondDiscount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--c-muted)]">Second Discount Type</label>
                <select
                  value={secondDiscountType}
                  onChange={(e) => setSecondDiscountType(e.target.value as 'percent' | 'fixed')}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-semibold text-[var(--c-text)] outline-none cursor-pointer"
                >
                  <option value="percent">Additional % Off</option>
                  <option value="fixed">Additional {currency.symbol} Flat Off</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--c-muted)]">Second Discount Value</label>
                <input
                  type="number"
                  min="0"
                  value={secondDiscountVal}
                  onChange={(e) => setSecondDiscountVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text)] outline-none font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tax & Bill Splitting Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Sales Tax */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Sales Tax (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                placeholder="8"
                className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--c-muted)]">%</span>
            </div>
          </div>

          {/* Tip % */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Tip / Gratuity (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                placeholder="15"
                className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--c-muted)]">%</span>
            </div>
          </div>

          {/* Number of People */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              <span>Split Bill Among</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={splitCount}
                onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--c-muted)] font-semibold">
                people
              </span>
            </div>
          </div>
        </div>
      </div>

      {calculations && (
        <>
          {/* Hero Final Price Card */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">
                  Final Deal Price (Total With Tax & Tip)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--c-text)] tracking-tight">
                    {currency.symbol}{calculations.finalTotalWithTaxAndTip.toFixed(2)}
                  </span>
                  {calculations.people > 1 && (
                    <span className="text-sm font-semibold text-emerald-400">
                      ({currency.symbol}{calculations.perPersonTotal.toFixed(2)} / person)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--c-muted)]">
                  You save <strong className="text-emerald-400">{currency.symbol}{calculations.totalSavings.toFixed(2)}</strong> ({calculations.effectiveDiscountPercent.toFixed(1)}% total savings)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {calculations.effectiveDiscountPercent >= 25 && (
                  <button
                    onClick={handleCelebrate}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Great Deal!</span>
                  </button>
                )}
                <button
                  onClick={handleCopyReceipt}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Original Price"
              value={`${currency.symbol}${calculations.orig.toFixed(2)}`}
              subValue="Retail MSRP"
              icon={<ShoppingBag className="w-4 h-4" />}
            />
            <StatCard
              label="Total Savings"
              value={`${currency.symbol}${calculations.totalSavings.toFixed(2)}`}
              subValue={`${calculations.effectiveDiscountPercent.toFixed(1)}% off total`}
              icon={<TrendingDown className="w-4 h-4 text-emerald-400" />}
            />
            <StatCard
              label="Discounted (Pre-tax)"
              value={`${currency.symbol}${calculations.finalPreTaxPrice.toFixed(2)}`}
              subValue="After all discounts"
              icon={<Tag className="w-4 h-4 text-[var(--c-gold)]" />}
            />
            <StatCard
              label={calculations.people > 1 ? "Per Person Split" : "Total Tax + Tip"}
              value={calculations.people > 1 ? `${currency.symbol}${calculations.perPersonTotal.toFixed(2)}` : `${currency.symbol}${(calculations.taxAmount + calculations.tipAmount).toFixed(2)}`}
              subValue={calculations.people > 1 ? `Split ${calculations.people} ways` : `${taxPercent}% tax, ${tipPercent}% tip`}
              icon={<Coins className="w-4 h-4 text-amber-400" />}
            />
          </div>

          {/* Receipt Breakdown Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Detailed Receipt Breakdown</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)]">Base Retail Price:</span>
                <span className="font-semibold text-[var(--c-text)]">{currency.symbol}{calculations.orig.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--c-border)] text-emerald-400">
                <span>Primary Discount ({discountType === 'percent' ? `${discountVal}%` : 'Flat'}):</span>
                <span className="font-semibold">−{currency.symbol}{calculations.d1Amount.toFixed(2)}</span>
              </div>
              {hasSecondDiscount && (
                <div className="flex justify-between py-1 border-b border-[var(--c-border)] text-emerald-400">
                  <span>Stacked Second Coupon ({secondDiscountType === 'percent' ? `${secondDiscountVal}%` : 'Flat'}):</span>
                  <span className="font-semibold">−{currency.symbol}{calculations.d2Amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)]">Sale Price (Pre-Tax):</span>
                <span className="font-bold text-[var(--c-text)]">{currency.symbol}{calculations.finalPreTaxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)]">Sales Tax ({taxPercent}%):</span>
                <span className="font-semibold text-[var(--c-text)]">+{currency.symbol}{calculations.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)]">Tip / Gratuity ({tipPercent}%):</span>
                <span className="font-semibold text-[var(--c-text)]">+{currency.symbol}{calculations.tipAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base text-[var(--c-gold)]">
                <span>Final Total:</span>
                <span>{currency.symbol}{calculations.finalTotalWithTaxAndTip.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shareable Banner */}
          <SocialShareButtons
            variant="banner"
            resultSummary={`Got a deal! Saved ${currency.symbol}${calculations.totalSavings.toFixed(2)} (${calculations.effectiveDiscountPercent.toFixed(1)}% off) on a ${currency.symbol}${calculations.orig.toFixed(2)} item! Calculate discounts:`}
            title="Free Discount, Sale & Tip Calculator | ToolBoxX"
          />
        </>
      )}

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="discount-calculator" />
    </div>
  );
};

export default DiscountCalculator;
