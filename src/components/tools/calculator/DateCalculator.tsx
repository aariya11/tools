import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  Layers,
  Repeat
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

type DateCalcTab = 'difference' | 'addSubtract' | 'businessDays';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DateCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DateCalcTab>('difference');

  // Mode 1: Difference
  const [startDateStr, setStartDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });
  const [includeEndDay, setIncludeEndDay] = useState<boolean>(false);

  // Mode 2: Add / Subtract
  const [addStartDateStr, setAddStartDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [addOp, setAddOp] = useState<'add' | 'subtract'>('add');
  const [addYears, setAddYears] = useState<number>(0);
  const [addMonths, setAddMonths] = useState<number>(0);
  const [addWeeks, setAddWeeks] = useState<number>(0);
  const [addDays, setAddDays] = useState<number>(30);
  const [businessDaysOnly, setBusinessDaysOnly] = useState<boolean>(false);

  // Mode 3: Custom Business Days
  const [customHolidays, setCustomHolidays] = useState<number>(0);
  const [weekendType, setWeekendType] = useState<'satSun' | 'friSat'>('satSun');

  const [copied, setCopied] = useState<boolean>(false);

  // Calculations for Mode 1: Difference
  const diffCalc = useMemo(() => {
    if (!startDateStr || !endDateStr) return null;
    const [y1, m1, d1] = startDateStr.split('-').map(Number);
    const [y2, m2, d2] = endDateStr.split('-').map(Number);

    const dStart = new Date(y1, m1 - 1, d1);
    const dEnd = new Date(y2, m2 - 1, d2);

    const isReversed = dEnd < dStart;
    const from = isReversed ? dEnd : dStart;
    const to = isReversed ? dStart : dEnd;

    // Total milliseconds and calendar days
    let diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (includeEndDay) diffDays += 1;

    // Exact Years, Months, Days breakdown
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate() + (includeEndDay ? 1 : 0);

    if (days < 0) {
      months -= 1;
      const prevMonthLast = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
      days += prevMonthLast;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Business days & weekends count
    let workingDays = 0;
    let weekendDays = 0;
    const cur = new Date(from);
    const limit = new Date(to);
    if (!includeEndDay) limit.setDate(limit.getDate() - 1);

    while (cur <= limit) {
      const dayOfWeek = cur.getDay();
      const isWeekend = weekendType === 'satSun'
        ? (dayOfWeek === 0 || dayOfWeek === 6)
        : (dayOfWeek === 5 || dayOfWeek === 6);

      if (isWeekend) weekendDays++;
      else workingDays++;

      cur.setDate(cur.getDate() + 1);
    }

    const effectiveWorkingDays = Math.max(0, workingDays - customHolidays);
    const totalWeeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    const totalHours = diffDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    return {
      diffDays,
      years,
      months,
      days,
      workingDays: effectiveWorkingDays,
      weekendDays,
      totalWeeks,
      remainingDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      isReversed,
      formattedSummary: `${diffDays} days (${years} yrs, ${months} mos, ${days} days • ${effectiveWorkingDays} business days)`,
    };
  }, [startDateStr, endDateStr, includeEndDay, weekendType, customHolidays]);

  // Calculations for Mode 2: Add / Subtract
  const addCalc = useMemo(() => {
    if (!addStartDateStr) return null;
    const [y, m, d] = addStartDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);

    const sign = addOp === 'add' ? 1 : -1;

    if (businessDaysOnly) {
      // Add or subtract only business days
      let daysRemaining = (addDays + addWeeks * 5) * sign;
      while (daysRemaining !== 0) {
        target.setDate(target.getDate() + (daysRemaining > 0 ? 1 : -1));
        const dow = target.getDay();
        const isWeekend = weekendType === 'satSun' ? (dow === 0 || dow === 6) : (dow === 5 || dow === 6);
        if (!isWeekend) {
          daysRemaining -= (daysRemaining > 0 ? 1 : -1);
        }
      }
    } else {
      if (addYears) target.setFullYear(target.getFullYear() + addYears * sign);
      if (addMonths) target.setMonth(target.getMonth() + addMonths * sign);
      if (addWeeks) target.setDate(target.getDate() + addWeeks * 7 * sign);
      if (addDays) target.setDate(target.getDate() + addDays * sign);
    }

    const dayName = DAYS_OF_WEEK[target.getDay()];
    const monthName = MONTHS_LONG[target.getMonth()];
    const formattedDate = `${dayName}, ${monthName} ${target.getDate()}, ${target.getFullYear()}`;
    const isoDate = target.toISOString().split('T')[0];

    // Day of Year
    const startOfYear = new Date(target.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((target.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      target,
      dayName,
      monthName,
      formattedDate,
      isoDate,
      dayOfYear,
    };
  }, [addStartDateStr, addOp, addYears, addMonths, addWeeks, addDays, businessDaysOnly, weekendType]);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'difference'
      ? `📅 Date Interval: ${diffCalc?.formattedSummary}\nFrom: ${startDateStr} to ${endDateStr}\nCalculated with ToolBoxX Free Date Calculator.`
      : `📅 Target Date: ${addCalc?.formattedDate} (${addCalc?.isoDate})\nCalculated with ToolBoxX Free Date Calculator.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast({ type: 'success', title: 'Date Copied!', message: 'Interval breakdown copied.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  // Quick Preset Handlers
  const setQuickAddDays = (days: number) => {
    setAddYears(0);
    setAddMonths(0);
    setAddWeeks(0);
    setAddDays(days);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('difference')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'difference'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Difference Between Two Dates</span>
        </button>

        <button
          onClick={() => setActiveTab('addSubtract')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'addSubtract'
              ? 'bg-[var(--c-gold)] text-black shadow-sm'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Add / Subtract Days & Time</span>
        </button>
      </div>

      {/* Mode 1: Difference Between Two Dates */}
      {activeTab === 'difference' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">Date Duration & Difference</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">
                  Calculates total calendar days, working business days, weeks, months, and hours.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Start Date</label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">End Date</label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[var(--c-text)]">
                <input
                  type="checkbox"
                  checked={includeEndDay}
                  onChange={(e) => setIncludeEndDay(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--c-gold)]"
                />
                <span>Include End Day (+1 day in calculation)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[var(--c-muted)]">Weekend Standard:</span>
                <select
                  value={weekendType}
                  onChange={(e) => setWeekendType(e.target.value as 'satSun' | 'friSat')}
                  className="px-2.5 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] font-bold text-[var(--c-text)] outline-none cursor-pointer"
                >
                  <option value="satSun">Saturday & Sunday</option>
                  <option value="friSat">Friday & Saturday</option>
                </select>
              </div>
            </div>
          </div>

          {diffCalc && (
            <>
              {/* Hero Difference Result Banner */}
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">
                      Total Interval Duration
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-[var(--c-text)] tracking-tight">
                        {diffCalc.diffDays.toLocaleString()}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-[var(--c-muted)]">total days</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--c-muted)]">
                      Exact: <strong className="text-[var(--c-text)]">{diffCalc.years} years, {diffCalc.months} months, {diffCalc.days} days</strong>
                    </p>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy Interval'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Business Working Days"
                  value={diffCalc.workingDays.toLocaleString()}
                  subValue="Mon – Fri (Excl. weekends)"
                  icon={<Briefcase className="w-4 h-4 text-emerald-400" />}
                />
                <StatCard
                  label="Weekend Days"
                  value={diffCalc.weekendDays.toLocaleString()}
                  subValue="Saturdays & Sundays"
                  icon={<Calendar className="w-4 h-4 text-amber-400" />}
                />
                <StatCard
                  label="Total Weeks"
                  value={`${diffCalc.totalWeeks} wks`}
                  subValue={`+ ${diffCalc.remainingDays} days`}
                  icon={<Layers className="w-4 h-4 text-[var(--c-gold)]" />}
                />
                <StatCard
                  label="Total Hours"
                  value={diffCalc.totalHours.toLocaleString()}
                  subValue={`${diffCalc.totalMinutes.toLocaleString()} minutes`}
                  icon={<Clock className="w-4 h-4 text-sky-400" />}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Add / Subtract Time from Date */}
      {activeTab === 'addSubtract' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--c-text)]">Add / Subtract Time from Date</h2>
                <p className="text-xs text-[var(--c-muted)] mt-1">Shift dates forward or backward by years, months, weeks, or days.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Starting Date</label>
                <input
                  type="date"
                  value={addStartDateStr}
                  onChange={(e) => setAddStartDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
                />
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--c-text)]">Action</label>
                <div className="flex rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-1">
                  <button
                    onClick={() => setAddOp('add')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      addOp === 'add' ? 'bg-[var(--c-gold)] text-black font-bold' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    + Add Date Time
                  </button>
                  <button
                    onClick={() => setAddOp('subtract')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      addOp === 'subtract' ? 'bg-[var(--c-gold)] text-black font-bold' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    − Subtract Date Time
                  </button>
                </div>
              </div>
            </div>

            {/* Shift Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--c-text)]">Years</label>
                <input
                  type="number"
                  min="0"
                  value={addYears}
                  onChange={(e) => setAddYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--c-text)]">Months</label>
                <input
                  type="number"
                  min="0"
                  value={addMonths}
                  onChange={(e) => setAddMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--c-text)]">Weeks</label>
                <input
                  type="number"
                  min="0"
                  value={addWeeks}
                  onChange={(e) => setAddWeeks(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--c-text)]">Days</label>
                <input
                  type="number"
                  min="0"
                  value={addDays}
                  onChange={(e) => setAddDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-semibold text-[var(--c-muted)] mr-1">Quick Presets:</span>
              {[7, 14, 30, 60, 90, 180, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setQuickAddDays(d)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                >
                  +{d} days
                </button>
              ))}
            </div>

            {/* Business days only toggle */}
            <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[var(--c-text)]">
                <input
                  type="checkbox"
                  checked={businessDaysOnly}
                  onChange={(e) => setBusinessDaysOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--c-gold)]"
                />
                <span>Only count business / working days (skipping weekends)</span>
              </label>
            </div>
          </div>

          {addCalc && (
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">
                    Calculated Result Date
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[var(--c-text)] tracking-tight mt-1">
                    {addCalc.formattedDate}
                  </div>
                  <p className="text-xs text-[var(--c-muted)] mt-1">
                    ISO: <strong className="text-[var(--c-text)]">{addCalc.isoDate}</strong> • Day {addCalc.dayOfYear} of the year
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Date'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Share Banner */}
      <SocialShareButtons
        variant="banner"
        resultSummary="Calculate exact intervals, business days, and future dates with ToolBoxX Free Date Calculator."
        title="Free Date Difference & Business Days Calculator | ToolBoxX"
      />

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="date-calculator" />
    </div>
  );
};

export default DateCalculator;
