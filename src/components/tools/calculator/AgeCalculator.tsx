import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Heart,
  Moon,
  Globe,
  Copy,
  Check,
  PartyPopper,
  Flame,
  Droplets,
  Wind,
  Compass,
  Milestone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

// Western Zodiac data
const ZODIAC_SIGNS = [
  { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 – Jan 19', traits: 'Ambitious, disciplined, patient, strategic', icon: Compass },
  { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 – Feb 18', traits: 'Innovative, original, humanitarian, independent', icon: Wind },
  { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 – Mar 20', traits: 'Intuitive, artistic, empathetic, compassionate', icon: Droplets },
  { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 – Apr 19', traits: 'Bold, energetic, pioneering, confident', icon: Flame },
  { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 – May 20', traits: 'Reliable, patient, practical, devoted', icon: Compass },
  { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 – Jun 20', traits: 'Adaptable, curious, witty, expressive', icon: Wind },
  { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 – Jul 22', traits: 'Nurturing, intuitive, protective, loyal', icon: Droplets },
  { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 – Aug 22', traits: 'Charismatic, generous, warm-hearted, passionate', icon: Flame },
  { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 – Sep 22', traits: 'Analytical, meticulous, practical, loyal', icon: Compass },
  { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 – Oct 22', traits: 'Diplomatic, gracious, fair-minded, social', icon: Wind },
  { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 – Nov 21', traits: 'Passionate, resourceful, brave, magnetic', icon: Droplets },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 – Dec 21', traits: 'Optimistic, adventurous, generous, philosophical', icon: Flame },
];

const CHINESE_ANIMALS = [
  { name: 'Rat', symbol: '🐀', traits: 'Quick-witted, resourceful, versatile, kind' },
  { name: 'Ox', symbol: '🐂', traits: 'Diligent, dependable, strong, determined' },
  { name: 'Tiger', symbol: '🐅', traits: 'Brave, confident, competitive, magnetic' },
  { name: 'Rabbit', symbol: '🐇', traits: 'Quiet, elegant, kind, responsible' },
  { name: 'Dragon', symbol: '🐉', traits: 'Confident, intelligent, enthusiastic, courageous' },
  { name: 'Snake', symbol: '🐍', traits: 'Enigmatic, intelligent, wise, graceful' },
  { name: 'Horse', symbol: '🐎', traits: 'Animated, active, energetic, independent' },
  { name: 'Goat', symbol: '🐐', traits: 'Calm, gentle, sympathetic, creative' },
  { name: 'Monkey', symbol: '🐒', traits: 'Sharp, smart, curious, innovative' },
  { name: 'Rooster', symbol: '🐓', traits: 'Observant, hardworking, courageous, punctual' },
  { name: 'Dog', symbol: '🐕', traits: 'Lovely, honest, prudent, loyal' },
  { name: 'Pig', symbol: '🐖', traits: 'Compassionate, generous, diligent, realistic' },
];

const CHINESE_ELEMENTS = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];

function getWesternZodiac(month: number, day: number) {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[1]; // Aquarius
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[2]; // Pisces
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[3]; // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[4]; // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[5]; // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[6]; // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[7]; // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[8]; // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[9]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[10]; // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[11]; // Sagittarius
  return ZODIAC_SIGNS[0]; // Capricorn
}

function getChineseZodiac(year: number) {
  const animalIndex = (year - 4) % 12;
  const normalizedAnimal = (animalIndex + 12) % 12;
  const elementIndex = Math.floor(((year - 4) % 10) / 2);
  const normalizedElement = (elementIndex + 5) % 5;
  return {
    animal: CHINESE_ANIMALS[normalizedAnimal],
    element: CHINESE_ELEMENTS[normalizedElement],
  };
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [includeTime, setIncludeTime] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Alex');
  const [now, setNow] = useState<Date>(new Date());
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Live ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const birthDateTime = useMemo(() => {
    if (!birthDate) return null;
    const [year, month, day] = birthDate.split('-').map(Number);
    if (!year || !month || !day) return null;

    if (includeTime && birthTime) {
      const [hours, minutes] = birthTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
    }
    return new Date(year, month - 1, day, 0, 0, 0);
  }, [birthDate, birthTime, includeTime]);

  const calculations = useMemo(() => {
    if (!birthDateTime || birthDateTime > now) return null;

    const diffMs = now.getTime() - birthDateTime.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    // Exact Years, Months, Days calculation
    const birthYear = birthDateTime.getFullYear();
    const birthMonth = birthDateTime.getMonth();
    const birthDay = birthDateTime.getDate();

    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curDay = now.getDate();

    let years = curYear - birthYear;
    let months = curMonth - birthMonth;
    let days = curDay - birthDay;

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(curYear, curMonth, 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Live remaining hours, minutes, seconds for current day
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Next Birthday calculation
    let nextBday = new Date(curYear, birthMonth, birthDay);
    if (nextBday.getTime() <= now.getTime()) {
      nextBday = new Date(curYear + 1, birthMonth, birthDay);
    }

    const diffNextBdayMs = nextBday.getTime() - now.getTime();
    const nextBdayDays = Math.floor(diffNextBdayMs / (1000 * 60 * 60 * 24));
    const nextBdayHours = Math.floor((diffNextBdayMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const nextBdayMinutes = Math.floor((diffNextBdayMs % (1000 * 60 * 60)) / (1000 * 60));
    const nextBdaySeconds = Math.floor((diffNextBdayMs % (1000 * 60)) / 1000);
    const nextBdayDayOfWeek = DAYS_OF_WEEK[nextBday.getDay()];
    const turningAge = years + 1;

    // Day born
    const dayBornName = DAYS_OF_WEEK[birthDateTime.getDay()];

    // Zodiacs
    const westernZodiac = getWesternZodiac(birthMonth + 1, birthDay);
    const chineseZodiac = getChineseZodiac(birthYear);

    // Milestones
    const date10kDays = new Date(birthDateTime.getTime() + 10000 * 24 * 60 * 60 * 1000);
    const date20kDays = new Date(birthDateTime.getTime() + 20000 * 24 * 60 * 60 * 1000);
    const date1BillionSec = new Date(birthDateTime.getTime() + 1000000000 * 1000);
    const halfBirthday = new Date(birthYear + years, birthMonth + 6, birthDay);

    // Life stats approximations
    const heartbeats = Math.round(totalMinutes * 72);
    const breaths = Math.round(totalMinutes * 16);
    const sleepHours = Math.round(totalDays * 8);

    // Planetary ages (Solar orbital periods)
    const mercuryAge = (totalDays / 87.97).toFixed(2);
    const venusAge = (totalDays / 224.7).toFixed(2);
    const marsAge = (totalDays / 686.98).toFixed(2);
    const jupiterAge = (totalDays / (365.25 * 11.86)).toFixed(2);
    const saturnAge = (totalDays / (365.25 * 29.46)).toFixed(2);

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBdayDays,
      nextBdayHours,
      nextBdayMinutes,
      nextBdaySeconds,
      nextBdayDayOfWeek,
      turningAge,
      dayBornName,
      westernZodiac,
      chineseZodiac,
      milestones: {
        date10kDays,
        date20kDays,
        date1BillionSec,
        halfBirthday,
      },
      stats: {
        heartbeats,
        breaths,
        sleepHours,
      },
      planets: {
        mercury: mercuryAge,
        venus: venusAge,
        mars: marsAge,
        jupiter: jupiterAge,
        saturn: saturnAge,
      },
    };
  }, [birthDateTime, now]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast({
      type: 'success',
      title: 'Happy Birthday Celebration!',
      message: 'Life is a journey worth celebrating every single second!',
    });
  };

  const handleCopySummary = async () => {
    if (!calculations) return;
    const text = `🎉 Age Milestone for ${userName}:\n` +
      `📅 Exact Age: ${calculations.years} Years, ${calculations.months} Months, ${calculations.days} Days\n` +
      `⏳ Total Days Lived: ${calculations.totalDays.toLocaleString()} days\n` +
      `🎂 Next Birthday: in ${calculations.nextBdayDays} days (turning ${calculations.turningAge} on a ${calculations.nextBdayDayOfWeek})\n` +
      `✨ Zodiac: ${calculations.westernZodiac.name} ${calculations.westernZodiac.symbol} | Chinese: ${calculations.chineseZodiac.element} ${calculations.chineseZodiac.animal.name}\n` +
      `Calculated with ToolBoxX Free Age Calculator.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      showToast({
        type: 'success',
        title: 'Copied to Clipboard!',
        message: 'Milestone card summary ready to share.',
      });
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy summary to clipboard.',
      });
    }
  };

  const shareSummary = calculations
    ? `I am ${calculations.years} years, ${calculations.months} months, and ${calculations.days} days old (${calculations.totalDays.toLocaleString()} total days lived)! Calculate yours:`
    : 'Free online live Age & Milestone Calculator on ToolBoxX';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Configuration Card */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--c-gold)]" />
              <span>Select Date of Birth</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Enter your birth date to calculate exact live age, zodiac signs, and life milestones.
            </p>
          </div>
          <button
            onClick={handleCelebrate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Celebrate Life</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Name (Optional)</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)]">Time of Birth</label>
              <button
                type="button"
                onClick={() => setIncludeTime(!includeTime)}
                className={`text-[11px] font-medium transition-colors ${
                  includeTime ? 'text-[var(--c-gold)]' : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                {includeTime ? 'Enabled' : '+ Add Time'}
              </button>
            </div>
            <input
              type="time"
              value={birthTime}
              disabled={!includeTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none ${
                !includeTime ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
          </div>
        </div>
      </div>

      {calculations && (
        <>
          {/* Hero Live Age Banner */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48 text-[var(--c-gold)]" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-gold)]/10 text-[var(--c-gold)] text-xs font-semibold border border-[var(--c-gold)]/20">
                  <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Exact Live Age for {userName || 'You'}</span>
                </div>
                <div className="flex items-baseline flex-wrap gap-2 text-[var(--c-text)]">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {calculations.years}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[var(--c-muted)]">years,</span>
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-gold)]">
                    {calculations.months}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[var(--c-muted)]">months,</span>
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {calculations.days}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[var(--c-muted)]">days</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--c-muted)] flex items-center gap-2">
                  <span>Born on a <strong className="text-[var(--c-text)]">{calculations.dayBornName}</strong></span>
                  <span>•</span>
                  <span>Live ticking: {String(calculations.hours).padStart(2, '0')}h {String(calculations.minutes).padStart(2, '0')}m {String(calculations.seconds).padStart(2, '0')}s</span>
                </p>
              </div>

              {/* Next Birthday Countdown Box */}
              <div className="w-full md:w-auto p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] flex flex-col items-center md:items-end text-center md:text-right min-w-[220px]">
                <span className="text-xs font-semibold text-[var(--c-muted)]">Next Birthday</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--c-gold)] mt-0.5">
                  {calculations.nextBdayDays} <span className="text-sm font-semibold text-[var(--c-text)]">days left</span>
                </span>
                <p className="text-[11px] text-[var(--c-muted)] mt-1">
                  Turning {calculations.turningAge} on {calculations.nextBdayDayOfWeek}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Days Lived"
              value={calculations.totalDays.toLocaleString()}
              subValue="consecutive calendar days"
              icon={<Calendar className="w-4 h-4" />}
            />
            <StatCard
              label="Total Weeks Lived"
              value={calculations.totalWeeks.toLocaleString()}
              subValue="full weeks"
              icon={<Milestone className="w-4 h-4" />}
            />
            <StatCard
              label="Total Hours Lived"
              value={calculations.totalHours.toLocaleString()}
              subValue="hours of experience"
              icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
              label="Total Minutes"
              value={calculations.totalMinutes.toLocaleString()}
              subValue="minutes passed"
              icon={<Sparkles className="w-4 h-4" />}
            />
          </div>

          {/* Zodiac & Astrology Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Western Zodiac */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-xl">
                    {calculations.westernZodiac.symbol}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--c-gold)] uppercase tracking-wider">Western Zodiac</span>
                    <h3 className="text-lg font-bold text-[var(--c-text)]">{calculations.westernZodiac.name}</h3>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
                  {calculations.westernZodiac.dates}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--c-border)]">
                  <span className="text-[var(--c-muted)]">Element:</span>
                  <span className="font-semibold text-[var(--c-text)]">{calculations.westernZodiac.element}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[var(--c-muted)] block mb-1">Key Traits:</span>
                  <p className="text-[var(--c-text)] leading-relaxed">{calculations.westernZodiac.traits}</p>
                </div>
              </div>
            </div>

            {/* Chinese Zodiac */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-xl">
                    {calculations.chineseZodiac.animal.symbol}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--c-gold)] uppercase tracking-wider">Chinese Zodiac</span>
                    <h3 className="text-lg font-bold text-[var(--c-text)]">
                      {calculations.chineseZodiac.element} {calculations.chineseZodiac.animal.name}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
                  Lunar Sign
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--c-border)]">
                  <span className="text-[var(--c-muted)]">Element:</span>
                  <span className="font-semibold text-[var(--c-text)]">{calculations.chineseZodiac.element}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[var(--c-muted)] block mb-1">Key Traits:</span>
                  <p className="text-[var(--c-text)] leading-relaxed">{calculations.chineseZodiac.animal.traits}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Biological Stats & Planetary Ages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Biological Milestones */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Life Vitals (Estimated)</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-medium text-[var(--c-muted)]">Heartbeats:</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--c-text)]">~{calculations.stats.heartbeats.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-medium text-[var(--c-muted)]">Breaths Taken:</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--c-text)]">~{calculations.stats.breaths.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium text-[var(--c-muted)]">Time Slept:</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--c-text)]">~{calculations.stats.sleepHours.toLocaleString()} hours</span>
                </div>
              </div>
            </div>

            {/* Planetary Ages */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Age on Other Planets</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <span className="text-[var(--c-muted)] block">Mercury (88d):</span>
                  <span className="text-sm font-bold text-[var(--c-text)]">{calculations.planets.mercury} yrs</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <span className="text-[var(--c-muted)] block">Venus (225d):</span>
                  <span className="text-sm font-bold text-[var(--c-text)]">{calculations.planets.venus} yrs</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <span className="text-[var(--c-muted)] block">Mars (687d):</span>
                  <span className="text-sm font-bold text-[var(--c-text)]">{calculations.planets.mars} yrs</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
                  <span className="text-[var(--c-muted)] block">Jupiter (11.8y):</span>
                  <span className="text-sm font-bold text-[var(--c-text)]">{calculations.planets.jupiter} yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shareable Milestone Card Component */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)]/40 bg-[var(--c-surface)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">Shareable Milestone Card</span>
                <h3 className="text-lg font-bold text-[var(--c-text)]">
                  {userName ? `${userName}'s Life Milestone` : 'My Life Milestone'}
                </h3>
              </div>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
              >
                {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSummary ? 'Copied Milestone' : 'Copy Summary'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)]">Current Exact Age:</span>
                <span className="font-bold text-[var(--c-text)]">
                  {calculations.years} yrs, {calculations.months} mos, {calculations.days} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)]">Total Days Lived:</span>
                <span className="font-bold text-[var(--c-gold)]">{calculations.totalDays.toLocaleString()} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)]">Next Milestone:</span>
                <span className="font-bold text-[var(--c-text)]">
                  Turning {calculations.turningAge} ({calculations.nextBdayDays} days away)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-muted)]">Zodiac Identity:</span>
                <span className="font-bold text-[var(--c-text)]">
                  {calculations.westernZodiac.name} {calculations.westernZodiac.symbol} • {calculations.chineseZodiac.animal.name} {calculations.chineseZodiac.animal.symbol}
                </span>
              </div>
            </div>

            <SocialShareButtons
              variant="banner"
              resultSummary={shareSummary}
              title={`Age & Milestone Calculator Result for ${userName || 'Me'}`}
            />
          </div>
        </>
      )}

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="age-calculator" />
    </div>
  );
};

export default AgeCalculator;
