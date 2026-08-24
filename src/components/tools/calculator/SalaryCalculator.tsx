import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Layers,
  Copy,
  Check,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Building
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

type Frequency = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annual';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'INR', symbol: '₹' },
];

export const SalaryCalculator: React.FC = () => {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [inputAmount, setInputAmount] = useState<string>('85000');
  const [inputFreq, setInputFreq] = useState<Frequency>('annual');

  // Schedule Parameters
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [unpaidWeeks, setUnpaidWeeks] = useState<number>(0);

  // Overtime Parameters
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);

  // Bonus & Additional
  const [annualBonus, setAnnualBonus] = useState<string>('5000');

  // Tax Estimation Preview Toggle
  const [includeTaxEst, setIncludeTaxEst] = useState<boolean>(false);
  const [taxRateEst, setTaxRateEst] = useState<number>(22); // combined estimated effective tax

  // Compare Job Mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [jobBAmount, setJobBAmount] = useState<string>('45');
  const [jobBFreq, setJobBFreq] = useState<Frequency>('hourly');
  const [jobBHoursPerWeek, setJobBHoursPerWeek] = useState<number>(40);
  const [jobBBonus, setJobBBonus] = useState<string>('2000');

  const [copied, setCopied] = useState<boolean>(false);

  // Calculations for Primary Job
  const calculations = useMemo(() => {
    const rawAmt = parseFloat(inputAmount);
    if (isNaN(rawAmt) || rawAmt <= 0) return null;

    const workingWeeks = Math.max(1, weeksPerYear - unpaidWeeks);
    const standardHoursPerWeek = hoursPerDay * daysPerWeek;
    const annualStandardHours = standardHoursPerWeek * workingWeeks;

    // Convert input to base standard hourly wage
    let baseHourly = 0;
    switch (inputFreq) {
      case 'hourly':
        baseHourly = rawAmt;
        break;
      case 'daily':
        baseHourly = rawAmt / Math.max(1, hoursPerDay);
        break;
      case 'weekly':
        baseHourly = rawAmt / Math.max(1, standardHoursPerWeek);
        break;
      case 'biweekly':
        baseHourly = rawAmt / Math.max(1, standardHoursPerWeek * 2);
        break;
      case 'semimonthly':
        baseHourly = (rawAmt * 24) / annualStandardHours;
        break;
      case 'monthly':
        baseHourly = (rawAmt * 12) / annualStandardHours;
        break;
      case 'annual':
        baseHourly = rawAmt / annualStandardHours;
        break;
    }

    // Overtime calculations
    const otRate = baseHourly * overtimeMultiplier;
    const weeklyOvertimePay = overtimeHours * otRate;
    const annualOvertimePay = weeklyOvertimePay * workingWeeks;

    // Base Annual & Total Gross Annual
    const baseAnnual = baseHourly * annualStandardHours;
    const bonus = parseFloat(annualBonus) || 0;
    const totalGrossAnnual = baseAnnual + annualOvertimePay + bonus;

    // Conversion breakdown for Total Gross
    const annual = totalGrossAnnual;
    const monthly = annual / 12;
    const semiMonthly = annual / 24;
    const biWeekly = annual / 26;
    const weekly = annual / 52;
    const daily = weekly / Math.max(1, daysPerWeek);
    const hourly = annual / (annualStandardHours + overtimeHours * workingWeeks);

    // Estimated Net Take-Home
    const effTaxRate = includeTaxEst ? taxRateEst / 100 : 0;
    const annualNet = annual * (1 - effTaxRate);
    const monthlyNet = monthly * (1 - effTaxRate);
    const biWeeklyNet = biWeekly * (1 - effTaxRate);
    const weeklyNet = weekly * (1 - effTaxRate);
    const hourlyNet = hourly * (1 - effTaxRate);

    return {
      baseHourly,
      annualStandardHours,
      standardHoursPerWeek,
      workingWeeks,
      baseAnnual,
      annualOvertimePay,
      bonus,
      totalGrossAnnual,
      breakdown: {
        annual,
        monthly,
        semiMonthly,
        biWeekly,
        weekly,
        daily,
        hourly,
      },
      netBreakdown: {
        annualNet,
        monthlyNet,
        biWeeklyNet,
        weeklyNet,
        hourlyNet,
        taxAmount: annual * effTaxRate,
      },
    };
  }, [
    inputAmount,
    inputFreq,
    hoursPerDay,
    daysPerWeek,
    weeksPerYear,
    unpaidWeeks,
    overtimeHours,
    overtimeMultiplier,
    annualBonus,
    includeTaxEst,
    taxRateEst,
  ]);

  // Calculations for Job B (Comparison)
  const calcJobB = useMemo(() => {
    if (!compareMode) return null;
    const amt = parseFloat(jobBAmount);
    if (isNaN(amt) || amt <= 0) return null;

    let baseHourlyB = 0;
    const annualHoursB = jobBHoursPerWeek * 52;
    switch (jobBFreq) {
      case 'hourly':
        baseHourlyB = amt;
        break;
      case 'weekly':
        baseHourlyB = amt / jobBHoursPerWeek;
        break;
      case 'biweekly':
        baseHourlyB = amt / (jobBHoursPerWeek * 2);
        break;
      case 'monthly':
        baseHourlyB = (amt * 12) / annualHoursB;
        break;
      case 'annual':
        baseHourlyB = amt / annualHoursB;
        break;
      default:
        baseHourlyB = amt / 8;
    }

    const bonusB = parseFloat(jobBBonus) || 0;
    const totalAnnualB = baseHourlyB * annualHoursB + bonusB;
    const totalMonthlyB = totalAnnualB / 12;

    return {
      baseHourlyB,
      totalAnnualB,
      totalMonthlyB,
    };
  }, [compareMode, jobBAmount, jobBFreq, jobBHoursPerWeek, jobBBonus]);

  const handleCopy = async () => {
    if (!calculations) return;
    const summary = `💼 Salary Conversion Breakdown (${currency.code}):\n` +
      `💵 Annual Gross: ${currency.symbol}${Math.round(calculations.breakdown.annual).toLocaleString()}\n` +
      `📅 Monthly: ${currency.symbol}${Math.round(calculations.breakdown.monthly).toLocaleString()}/mo\n` +
      `🗓️ Bi-Weekly: ${currency.symbol}${Math.round(calculations.breakdown.biWeekly).toLocaleString()} (26 pay periods)\n` +
      `📆 Weekly: ${currency.symbol}${Math.round(calculations.breakdown.weekly).toLocaleString()}/wk\n` +
      `⏱️ Hourly Equivalent: ${currency.symbol}${calculations.breakdown.hourly.toFixed(2)}/hr\n` +
      (includeTaxEst ? `🏛️ Estimated Net Take-Home: ${currency.symbol}${Math.round(calculations.netBreakdown.annualNet).toLocaleString()}/yr (${currency.symbol}${Math.round(calculations.netBreakdown.monthlyNet).toLocaleString()}/mo)\n` : '') +
      `Calculated with ToolBoxX Free Salary & Wage Calculator.`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast({ type: 'success', title: 'Salary Copied!', message: 'Formatted salary breakdown copied.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[var(--c-gold)]" />
              <span>Salary & Wage Calculator</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Convert between hourly, weekly, monthly, and annual pay with overtime & tax estimators.
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

        {/* Primary Salary Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Salary / Wage Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-muted)]">
                {currency.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="85000"
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-base font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Pay Frequency</label>
            <select
              value={inputFreq}
              onChange={(e) => setInputFreq(e.target.value as Frequency)}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
            >
              <option value="hourly">per Hour</option>
              <option value="daily">per Day</option>
              <option value="weekly">per Week</option>
              <option value="biweekly">Bi-Weekly (Every 2 Weeks / 26 pays)</option>
              <option value="semimonthly">Semi-Monthly (Twice a Month / 24 pays)</option>
              <option value="monthly">per Month (12 pays)</option>
              <option value="annual">per Year (Annual)</option>
            </select>
          </div>
        </div>

        {/* Working Hours & Schedule Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--c-muted)]">Hours / Day</label>
            <input
              type="number"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Math.max(1, parseFloat(e.target.value) || 8))}
              className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--c-muted)]">Days / Week</label>
            <input
              type="number"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Math.max(1, parseFloat(e.target.value) || 5))}
              className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--c-muted)]">Weeks / Year</label>
            <input
              type="number"
              min="1"
              max="52"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(Math.max(1, parseFloat(e.target.value) || 52))}
              className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--c-muted)]">Annual Bonus ({currency.symbol})</label>
            <input
              type="number"
              min="0"
              value={annualBonus}
              onChange={(e) => setAnnualBonus(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
            />
          </div>
        </div>

        {/* Overtime & Tax Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Overtime */}
          <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>Overtime Hours / Week</span>
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-right text-xs font-bold text-[var(--c-text)] outline-none"
              />
            </div>
            {overtimeHours > 0 && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[var(--c-muted)]">Multiplier:</span>
                <select
                  value={overtimeMultiplier}
                  onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-bold text-[var(--c-text)] outline-none cursor-pointer"
                >
                  <option value={1.5}>1.5x (Time & Half)</option>
                  <option value={2.0}>2.0x (Double Time)</option>
                  <option value={1.0}>1.0x (Straight Time)</option>
                </select>
              </div>
            )}
          </div>

          {/* Tax Estimator */}
          <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTaxEst}
                  onChange={(e) => setIncludeTaxEst(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--c-gold)]"
                />
                <span>Estimate Net Take-Home Pay</span>
              </label>
            </div>
            {includeTaxEst && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[var(--c-muted)]">Effective Tax Rate:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={taxRateEst}
                    onChange={(e) => setTaxRateEst(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-right text-xs font-bold text-[var(--c-text)] outline-none"
                  />
                  <span>%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {calculations && (
        <>
          {/* Hero Converted Summary Card */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">
                  Total Gross Annual Compensation
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--c-text)] tracking-tight">
                    {currency.symbol}{Math.round(calculations.totalGrossAnnual).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--c-muted)]">/ year</span>
                </div>
                <p className="text-xs text-[var(--c-muted)]">
                  Equivalent to <strong className="text-[var(--c-gold)]">{currency.symbol}{calculations.breakdown.hourly.toFixed(2)} / hour</strong> • {currency.symbol}{Math.round(calculations.breakdown.monthly).toLocaleString()} / month
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{compareMode ? 'Close Comparison' : 'Compare 2 Job Offers'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Hourly Equivalent"
              value={`${currency.symbol}${calculations.breakdown.hourly.toFixed(2)}`}
              subValue="per standard hour"
              icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
              label="Weekly Gross"
              value={`${currency.symbol}${Math.round(calculations.breakdown.weekly).toLocaleString()}`}
              subValue="52 weeks / year"
              icon={<Calendar className="w-4 h-4 text-emerald-400" />}
            />
            <StatCard
              label="Bi-Weekly (26 Pays)"
              value={`${currency.symbol}${Math.round(calculations.breakdown.biWeekly).toLocaleString()}`}
              subValue="Every 2 weeks"
              icon={<Briefcase className="w-4 h-4 text-[var(--c-gold)]" />}
            />
            <StatCard
              label="Monthly Gross"
              value={`${currency.symbol}${Math.round(calculations.breakdown.monthly).toLocaleString()}`}
              subValue="12 paychecks / year"
              icon={<DollarSign className="w-4 h-4 text-amber-400" />}
            />
          </div>

          {/* Full Pay Frequency Table */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Full Pay Schedule Breakdown</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-[var(--c-muted)] uppercase bg-[var(--c-card)] border-b border-[var(--c-border)]">
                  <tr>
                    <th className="py-2.5 px-3">Pay Frequency</th>
                    <th className="py-2.5 px-3">Gross Pay</th>
                    {includeTaxEst && <th className="py-2.5 px-3 text-emerald-400">Est. Net Take-Home</th>}
                    <th className="py-2.5 px-3">Pay Periods / Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-border)]">
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Annual</td>
                    <td className="py-2 px-3 font-bold text-[var(--c-gold)]">{currency.symbol}{Math.round(calculations.breakdown.annual).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400 font-bold">{currency.symbol}{Math.round(calculations.netBreakdown.annualNet).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">1</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Monthly</td>
                    <td className="py-2 px-3 font-bold">{currency.symbol}{Math.round(calculations.breakdown.monthly).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(calculations.netBreakdown.monthlyNet).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">12</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Semi-Monthly</td>
                    <td className="py-2 px-3">{currency.symbol}{Math.round(calculations.breakdown.semiMonthly).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(calculations.netBreakdown.annualNet / 24).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">24 (15th & End of mo)</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Bi-Weekly</td>
                    <td className="py-2 px-3">{currency.symbol}{Math.round(calculations.breakdown.biWeekly).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(calculations.netBreakdown.biWeeklyNet).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">26 (Every 2 weeks)</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Weekly</td>
                    <td className="py-2 px-3">{currency.symbol}{Math.round(calculations.breakdown.weekly).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(calculations.netBreakdown.weeklyNet).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">52</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Daily</td>
                    <td className="py-2 px-3">{currency.symbol}{Math.round(calculations.breakdown.daily).toLocaleString()}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(calculations.netBreakdown.weeklyNet / daysPerWeek).toLocaleString()}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">{daysPerWeek * 52} days</td>
                  </tr>
                  <tr className="hover:bg-[var(--c-card)]">
                    <td className="py-2 px-3 font-semibold text-[var(--c-text)]">Hourly</td>
                    <td className="py-2 px-3 font-bold text-[var(--c-gold)]">{currency.symbol}{calculations.breakdown.hourly.toFixed(2)}</td>
                    {includeTaxEst && <td className="py-2 px-3 text-emerald-400">{currency.symbol}{calculations.netBreakdown.hourlyNet.toFixed(2)}</td>}
                    <td className="py-2 px-3 text-[var(--c-muted)]">{calculations.annualStandardHours} hrs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Job Offer Comparison Box */}
          {compareMode && (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)] bg-[var(--c-surface)] space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-4">
                <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-[var(--c-gold)]" />
                  <span>Job Offer A vs. Job Offer B Side-by-Side</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Job A */}
                <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-3">
                  <span className="text-xs font-bold text-[var(--c-gold)] uppercase">Job Offer A</span>
                  <div className="text-2xl font-extrabold text-[var(--c-text)]">
                    {currency.symbol}{Math.round(calculations.totalGrossAnnual).toLocaleString()} / yr
                  </div>
                  <div className="text-xs space-y-1 text-[var(--c-muted)]">
                    <p>• Hourly: {currency.symbol}{calculations.breakdown.hourly.toFixed(2)}/hr</p>
                    <p>• Monthly: {currency.symbol}{Math.round(calculations.breakdown.monthly).toLocaleString()}/mo</p>
                    <p>• Bonus: {currency.symbol}{calculations.bonus.toLocaleString()}</p>
                  </div>
                </div>

                {/* Job B */}
                <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-3">
                  <span className="text-xs font-bold text-sky-400 uppercase">Job Offer B</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={jobBAmount}
                      onChange={(e) => setJobBAmount(e.target.value)}
                      placeholder="45"
                      className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-bold text-[var(--c-text)] outline-none"
                    />
                    <select
                      value={jobBFreq}
                      onChange={(e) => setJobBFreq(e.target.value as Frequency)}
                      className="px-2 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-bold text-[var(--c-text)] outline-none cursor-pointer"
                    >
                      <option value="hourly">/ Hour</option>
                      <option value="annual">/ Year</option>
                      <option value="monthly">/ Month</option>
                    </select>
                  </div>

                  {calcJobB && (
                    <div className="space-y-2 pt-1">
                      <div className="text-2xl font-extrabold text-sky-400">
                        {currency.symbol}{Math.round(calcJobB.totalAnnualB).toLocaleString()} / yr
                      </div>
                      <div className="text-xs space-y-1 text-[var(--c-muted)]">
                        <p>• Hourly: {currency.symbol}{calcJobB.baseHourlyB.toFixed(2)}/hr</p>
                        <p>• Monthly: {currency.symbol}{Math.round(calcJobB.totalMonthlyB).toLocaleString()}/mo</p>
                        <p className="font-bold text-[var(--c-text)]">
                          Difference: {calcJobB.totalAnnualB >= calculations.totalGrossAnnual ? '+' : '−'}{currency.symbol}{Math.abs(Math.round(calcJobB.totalAnnualB - calculations.totalGrossAnnual)).toLocaleString()} / year
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Share Banner */}
          <SocialShareButtons
            variant="banner"
            resultSummary={`My compensation converts to ${currency.symbol}${calculations.breakdown.hourly.toFixed(2)}/hr (${currency.symbol}${Math.round(calculations.totalGrossAnnual).toLocaleString()}/yr). Calculate salary:`}
            title="Free Salary, Wage & Overtime Calculator | ToolBoxX"
          />
        </>
      )}

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="salary-calculator" />
    </div>
  );
};

export default SalaryCalculator;
