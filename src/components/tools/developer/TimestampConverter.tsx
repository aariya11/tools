import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Clock,
  Calendar,
  Check,
  Pause,
  Play,
  RotateCcw,
  Calculator,
  Compass
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';

// Timezone options
const TIMEZONES = [
  { label: 'Local Browser Timezone', value: 'local' },
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'New York (EST/EDT - UTC-5/4)', value: 'America/New_York' },
  { label: 'San Francisco / LA (PST/PDT - UTC-8/7)', value: 'America/Los_Angeles' },
  { label: 'London (GMT/BST - UTC+0/1)', value: 'Europe/London' },
  { label: 'Paris / Berlin (CET/CEST - UTC+1/2)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST - UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST/AEDT - UTC+10/11)', value: 'Australia/Sydney' },
  { label: 'India / New Delhi (IST - UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'Singapore (SGT - UTC+8)', value: 'Asia/Singapore' }
];

export const TimestampConverter: React.FC = () => {
  // Live ticker clock
  const [currentEpoch, setCurrentEpoch] = useState<number>(Date.now());
  const [isTicking, setIsTicking] = useState<boolean>(true);

  // Conversion state
  const [tsInput, setTsInput] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [unitMode, setUnitMode] = useState<'auto' | 'seconds' | 'milliseconds'>('auto');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Human date to timestamp state
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [timeInput, setTimeInput] = useState<string>(() => new Date().toTimeString().split(' ')[0]);
  const [selectedTz, setSelectedTz] = useState<string>('local');

  // Difference calculator state
  const [diffDateA, setDiffDateA] = useState<string>(() => new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 16));
  const [diffDateB, setDiffDateB] = useState<string>(() => new Date().toISOString().slice(0, 16));

  // Timer loop
  useEffect(() => {
    if (!isTicking) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isTicking]);

  // Convert Unix Timestamp -> Human representations
  const parsedTimestamp = useMemo(() => {
    const raw = tsInput.trim();
    if (!raw) return null;
    const num = Number(raw);
    if (isNaN(num)) return null;

    let ms = num;
    let isSec = false;

    if (unitMode === 'seconds') {
      ms = num * 1000;
      isSec = true;
    } else if (unitMode === 'milliseconds') {
      ms = num;
    } else {
      // Auto-detect: if < 100,000,000,000 treat as seconds
      if (num < 100000000000) {
        ms = num * 1000;
        isSec = true;
      }
    }

    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;

    // Calculations
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weekNumber = Math.ceil(dayOfYear / 7);
    const isLeapYear = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0;

    // Relative format
    const diffSec = Math.floor((date.getTime() - Date.now()) / 1000);
    let relative = '';
    const absDiff = Math.abs(diffSec);
    if (absDiff < 60) relative = `${absDiff} seconds ${diffSec >= 0 ? 'from now' : 'ago'}`;
    else if (absDiff < 3600) relative = `${Math.floor(absDiff / 60)} minutes ${diffSec >= 0 ? 'from now' : 'ago'}`;
    else if (absDiff < 86400) relative = `${Math.floor(absDiff / 3600)} hours ${diffSec >= 0 ? 'from now' : 'ago'}`;
    else relative = `${Math.floor(absDiff / 86400)} days ${diffSec >= 0 ? 'from now' : 'ago'}`;

    return {
      date,
      detectedUnit: isSec ? 'Seconds' : 'Milliseconds',
      localStr: date.toString(),
      utcStr: date.toUTCString(),
      isoStr: date.toISOString(),
      dateOnly: date.toLocaleDateString(),
      timeOnly: date.toLocaleTimeString(),
      relative,
      dayOfYear,
      weekNumber,
      isLeapYear,
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime()
    };
  }, [tsInput, unitMode]);

  // Convert Human Date -> Unix Timestamp
  const generatedTimestamp = useMemo(() => {
    if (!dateInput) return null;
    const isoString = `${dateInput}T${timeInput || '00:00:00'}`;
    const localDate = new Date(isoString);
    if (isNaN(localDate.getTime())) return null;

    let targetMs = localDate.getTime();
    if (selectedTz === 'UTC') {
      targetMs = Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes(),
        localDate.getSeconds()
      );
    }

    return {
      seconds: Math.floor(targetMs / 1000),
      milliseconds: targetMs,
      utcFormatted: new Date(targetMs).toUTCString()
    };
  }, [dateInput, timeInput, selectedTz]);

  // Date Difference Calculation
  const differenceResult = useMemo(() => {
    const d1 = new Date(diffDateA).getTime();
    const d2 = new Date(diffDateB).getTime();
    if (isNaN(d1) || isNaN(d2)) return null;

    const diffMs = Math.abs(d2 - d1);
    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalHours: (totalSec / 3600).toFixed(1),
      totalDays: (totalSec / 86400).toFixed(2),
      totalMs: diffMs
    };
  }, [diffDateA, diffDateB]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast({ type: 'success', title: `Copied ${label}`, message: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const applyOffset = (offsetSec: number) => {
    const current = parsedTimestamp ? parsedTimestamp.seconds : Math.floor(Date.now() / 1000);
    const next = current + offsetSec;
    setTsInput(String(next));
  };

  return (
    <div className="space-y-8">
      {/* Live Unix Epoch Ticker Banner */}
      <div className="p-5 sm:p-6 rounded-3xl border border-[var(--c-border)] bg-gradient-to-r from-[var(--c-card)] to-[var(--c-surface)] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[var(--c-subtle)] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--c-gold)]" /> Current Unix Epoch Timestamp
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[var(--c-gold)] tracking-tight select-all">
              {Math.floor(currentEpoch / 1000)}
            </span>
            <span className="text-xs sm:text-sm font-mono text-[var(--c-muted)]">
              .{String(currentEpoch % 1000).padStart(3, '0')} ms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTicking(!isTicking)}
            className="px-3.5 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isTicking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isTicking ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTsInput(String(Math.floor(Date.now() / 1000)));
              showToast({ type: 'success', title: 'Timestamp Reset to Now' });
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Use Current Time
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Detected Format"
          value={parsedTimestamp ? parsedTimestamp.detectedUnit : 'Invalid'}
          badge={unitMode.toUpperCase()}
          badgeType="neutral"
        />
        <StatCard
          label="Relative Distance"
          value={parsedTimestamp ? parsedTimestamp.relative : '-'}
        />
        <StatCard
          label="Day of Year"
          value={parsedTimestamp ? `Day ${parsedTimestamp.dayOfYear} of 365` : '-'}
          subValue={parsedTimestamp ? `Week ${parsedTimestamp.weekNumber}` : undefined}
        />
        <StatCard
          label="Leap Year Status"
          value={parsedTimestamp ? (parsedTimestamp.isLeapYear ? 'Leap Year (366d)' : 'Common Year (365d)') : '-'}
        />
      </div>

      {/* Section 1: Timestamp to Human Date */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--c-gold)]" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--c-text)]">
              Convert Unix Timestamp → Human Date
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs">
            {(['auto', 'seconds', 'milliseconds'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setUnitMode(m)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase transition-all ${
                  unitMode === m
                    ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                {m === 'auto' ? 'Auto Detect' : m === 'seconds' ? 'Seconds (10d)' : 'MS (13d)'}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--c-muted)]">Unix Timestamp</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="e.g. 1771928400 or 1771928400000"
              className="flex-1 px-4 py-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-sm sm:text-base font-bold focus:ring-2 focus:ring-[var(--c-gold)] outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(tsInput, 'Timestamp')}
              className="px-4 py-3 rounded-2xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'Timestamp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Offset Buttons Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--c-subtle)] font-medium">Quick Adjust:</span>
          <button
            type="button"
            onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => applyOffset(-3600)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            -1 Hour
          </button>
          <button
            type="button"
            onClick={() => applyOffset(3600)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            +1 Hour
          </button>
          <button
            type="button"
            onClick={() => applyOffset(-86400)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            -1 Day
          </button>
          <button
            type="button"
            onClick={() => applyOffset(86400)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            +1 Day
          </button>
          <button
            type="button"
            onClick={() => applyOffset(86400 * 7)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            +1 Week
          </button>
          <button
            type="button"
            onClick={() => applyOffset(86400 * 30)}
            className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            +30 Days
          </button>
        </div>

        {/* Output Representation Grid */}
        {parsedTimestamp && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                  Local Browser Time
                </span>
                <p className="text-sm font-bold text-[var(--c-text)] font-mono mt-0.5">
                  {parsedTimestamp.localStr}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(parsedTimestamp.localStr, 'Local Time')}
                className="p-2 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                {copiedKey === 'Local Time' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-gold)] uppercase">
                  UTC Time (RFC 7231 / GMT)
                </span>
                <p className="text-sm font-bold text-[var(--c-text)] font-mono mt-0.5">
                  {parsedTimestamp.utcStr}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(parsedTimestamp.utcStr, 'UTC Time')}
                className="p-2 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                {copiedKey === 'UTC Time' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                  ISO-8601 String
                </span>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {parsedTimestamp.isoStr}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(parsedTimestamp.isoStr, 'ISO String')}
                className="p-2 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                {copiedKey === 'ISO String' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                  Relative Time
                </span>
                <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                  {parsedTimestamp.relative}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(parsedTimestamp.relative, 'Relative Time')}
                className="p-2 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                {copiedKey === 'Relative Time' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Human Date to Timestamp */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--c-border)]">
          <Compass className="w-5 h-5 text-[var(--c-gold)]" />
          <h3 className="font-bold text-sm sm:text-base text-[var(--c-text)]">
            Convert Human Date & Time → Unix Timestamp
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Date</label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Time (HH:MM:SS)</label>
            <input
              type="time"
              step="1"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Timezone</label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Timestamp Results */}
        {generatedTimestamp && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                  Seconds (Epoch)
                </span>
                <p className="text-lg font-bold font-mono text-[var(--c-gold)] mt-0.5">
                  {generatedTimestamp.seconds}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(generatedTimestamp.seconds), 'Seconds')}
                className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'Seconds' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                  Milliseconds (JS Epoch)
                </span>
                <p className="text-lg font-bold font-mono text-[var(--c-text)] mt-0.5">
                  {generatedTimestamp.milliseconds}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(generatedTimestamp.milliseconds), 'Milliseconds')}
                className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'Milliseconds' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Date Duration & Difference Calculator */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--c-border)]">
          <Calculator className="w-5 h-5 text-[var(--c-gold)]" />
          <h3 className="font-bold text-sm sm:text-base text-[var(--c-text)]">
            Date Interval & Duration Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Date & Time A</label>
            <input
              type="datetime-local"
              value={diffDateA}
              onChange={(e) => setDiffDateA(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Date & Time B</label>
            <input
              type="datetime-local"
              value={diffDateB}
              onChange={(e) => setDiffDateB(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>
        </div>

        {differenceResult && (
          <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center justify-around gap-4 text-center">
            <div>
              <span className="text-2xl font-bold text-[var(--c-gold)] font-mono">
                {differenceResult.days}
              </span>
              <p className="text-xs text-[var(--c-muted)] uppercase font-semibold">Days</p>
            </div>
            <span className="text-[var(--c-subtle)] text-xl font-bold">:</span>
            <div>
              <span className="text-2xl font-bold text-[var(--c-text)] font-mono">
                {differenceResult.hours}
              </span>
              <p className="text-xs text-[var(--c-muted)] uppercase font-semibold">Hours</p>
            </div>
            <span className="text-[var(--c-subtle)] text-xl font-bold">:</span>
            <div>
              <span className="text-2xl font-bold text-[var(--c-text)] font-mono">
                {differenceResult.minutes}
              </span>
              <p className="text-xs text-[var(--c-muted)] uppercase font-semibold">Minutes</p>
            </div>
            <span className="text-[var(--c-subtle)] text-xl font-bold">:</span>
            <div>
              <span className="text-2xl font-bold text-[var(--c-text)] font-mono">
                {differenceResult.seconds}
              </span>
              <p className="text-xs text-[var(--c-muted)] uppercase font-semibold">Seconds</p>
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations
        currentToolId="timestamp-converter"
        onReset={() => setTsInput(String(Math.floor(Date.now() / 1000)))}
      />
    </div>
  );
};
