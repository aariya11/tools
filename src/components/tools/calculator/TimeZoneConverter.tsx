import React, { useState, useMemo } from 'react';
import {
  Globe,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Copy,
  Check,
  Download,
  Users,
  Search,
  Sparkles,
  Sun,
  Moon,
  Briefcase,
  Share2
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

interface CityTimezone {
  id: string;
  name: string;
  country: string;
  tz: string;
  flag: string;
}

const WORLD_CITIES: CityTimezone[] = [
  { id: 'nyc', name: 'New York', country: 'United States', tz: 'America/New_York', flag: '🇺🇸' },
  { id: 'lon', name: 'London', country: 'United Kingdom', tz: 'Europe/London', flag: '🇬🇧' },
  { id: 'tyo', name: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'syd', name: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'dxb', name: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'bom', name: 'Mumbai / Delhi', country: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'par', name: 'Paris', country: 'France', tz: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'sfo', name: 'San Francisco', country: 'United States', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'sin', name: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'ber', name: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'yto', name: 'Toronto', country: 'Canada', tz: 'America/Toronto', flag: '🇨🇦' },
  { id: 'hkg', name: 'Hong Kong', country: 'Hong Kong', tz: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { id: 'sao', name: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { id: 'akl', name: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', flag: '🇳🇿' },
  { id: 'chi', name: 'Chicago', country: 'United States', tz: 'America/Chicago', flag: '🇺🇸' },
];

export const TimeZoneConverter: React.FC = () => {
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([
    'sfo',
    'nyc',
    'lon',
    'bom',
    'sin',
    'tyo',
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [baseDateStr, setBaseDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sliderHour, setSliderHour] = useState<number>(14); // 0 to 23 (UTC)
  const [sliderMinute, setSliderMinute] = useState<number>(0);
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Selected cities objects
  const selectedCities = useMemo(() => {
    return selectedCityIds
      .map((id) => WORLD_CITIES.find((c) => c.id === id))
      .filter((c): c is CityTimezone => !!c);
  }, [selectedCityIds]);

  const addCity = (id: string) => {
    if (!selectedCityIds.includes(id)) {
      setSelectedCityIds((prev) => [...prev, id]);
      showToast({ type: 'success', title: 'City Added', message: 'Added to world clock.' });
    }
  };

  const removeCity = (id: string) => {
    if (selectedCityIds.length <= 1) {
      showToast({ type: 'info', title: 'Minimum 1 City', message: 'Keep at least one city in the list.' });
      return;
    }
    setSelectedCityIds((prev) => prev.filter((cId) => cId !== id));
  };

  // Base UTC reference date
  const baseUtcDate = useMemo(() => {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, sliderHour, sliderMinute, 0));
    return date;
  }, [baseDateStr, sliderHour, sliderMinute]);

  // Helper to format city time
  const getCityTimeInfo = (tz: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      const formatted = new Intl.DateTimeFormat('en-US', options).format(baseUtcDate);

      // Get 24-hour hour integer in that timezone to determine Day/Night/Work
      const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hour12: false,
      }).format(baseUtcDate);
      const hourInt = parseInt(hourStr, 10) % 24;

      // Get timezone abbreviation & UTC offset
      const tzName = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short',
      }).formatToParts(baseUtcDate).find((p) => p.type === 'timeZoneName')?.value || '';

      // Status: Business (9-17), Extended (7-9 & 17-22), Sleeping (22-7)
      let status: 'work' | 'awake' | 'sleep' = 'sleep';
      if (hourInt >= 9 && hourInt < 17) status = 'work';
      else if (hourInt >= 7 && hourInt < 22) status = 'awake';

      return {
        formatted,
        hourInt,
        tzName,
        status,
      };
    } catch {
      return {
        formatted: 'Invalid TZ',
        hourInt: 12,
        tzName: 'UTC',
        status: 'work' as const,
      };
    }
  };

  // Find Overlapping Business / Awake Hours across ALL selected cities
  const overlapAnalysis = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const overlappingHours: {
      utcHour: number;
      allWorking: boolean;
      allAwake: boolean;
      workingCount: number;
    }[] = [];

    const [y, m, d] = baseDateStr.split('-').map(Number);

    for (const h of hours) {
      const testDate = new Date(Date.UTC(y, m - 1, d, h, 0, 0));
      let workingCount = 0;
      let awakeCount = 0;

      selectedCities.forEach((city) => {
        const hourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: city.tz,
          hour: 'numeric',
          hour12: false,
        }).format(testDate);
        const hourInt = parseInt(hourStr, 10) % 24;

        if (hourInt >= 9 && hourInt < 17) workingCount++;
        if (hourInt >= 7 && hourInt < 22) awakeCount++;
      });

      overlappingHours.push({
        utcHour: h,
        allWorking: workingCount === selectedCities.length,
        allAwake: awakeCount === selectedCities.length,
        workingCount,
      });
    }

    const bestSlots = overlappingHours.filter((s) => s.allWorking || s.allAwake);

    return {
      overlappingHours,
      bestSlots,
    };
  }, [selectedCities, baseDateStr]);

  const handleCopyMeetingInvite = async () => {
    let invite = `📅 Team Meeting Schedule:\n`;
    invite += `Date: ${baseDateStr}\n\n`;
    selectedCities.forEach((c) => {
      const info = getCityTimeInfo(c.tz);
      invite += `${c.flag} ${c.name} (${c.tz.split('/')[1]}): ${info.formatted} (${info.tzName})\n`;
    });
    invite += `\nCoordinated via ToolBoxX World Clock & Timezone Planner.`;

    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      showToast({ type: 'success', title: 'Meeting Invite Copied!', message: 'Schedule copied for all time zones.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  const downloadIcs = () => {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    const startIso = new Date(Date.UTC(y, m - 1, d, sliderHour, sliderMinute, 0))
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';
    const endIso = new Date(Date.UTC(y, m - 1, d, sliderHour + 1, sliderMinute, 0))
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ToolBoxX//Global Meeting Planner//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@toolboxx.dev`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'SUMMARY:Global Sync Meeting',
      `DESCRIPTION:International sync meeting coordinated across ${selectedCities.length} global cities.`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global_Meeting_${baseDateStr}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'Calendar .ICS Downloaded', message: 'Import into Google Calendar or Outlook.' });
  };

  // Filter available cities for adding
  const filteredAvailableCities = WORLD_CITIES.filter(
    (c) =>
      !selectedCityIds.includes(c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Control Header & Synchronized 24h Slider */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--c-gold)]" />
              <span>World Clock & Meeting Planner</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Synchronize time across global cities and find overlapping working hours for remote teams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={baseDateStr}
              onChange={(e) => setBaseDateStr(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] outline-none cursor-pointer"
            />
            <button
              onClick={() => setUse24Hour(!use24Hour)}
              className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
            >
              {use24Hour ? '24-Hour' : '12-Hour'}
            </button>
          </div>
        </div>

        {/* Synchronized 24-Hour Interactive Slider */}
        <div className="space-y-3 p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Synchronized Time Controller (UTC Reference: {String(sliderHour).padStart(2, '0')}:00 UTC)</span>
            </label>
            <span className="text-sm font-extrabold text-[var(--c-gold)]">
              {String(sliderHour).padStart(2, '0')}:00
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={sliderHour}
            onChange={(e) => setSliderHour(parseInt(e.target.value, 10))}
            className="w-full h-3 rounded-lg bg-[var(--c-surface)] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[var(--c-muted)] font-mono">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--c-muted)]">
          <span className="font-semibold text-[var(--c-text)]">Status:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Working Hours (9AM – 5PM)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Awake Hours (7AM – 10PM)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Night / Sleeping (10PM – 7AM)</span>
          </span>
        </div>
      </div>

      {/* Global Cities Cards List */}
      <div className="space-y-3">
        {selectedCities.map((city) => {
          const info = getCityTimeInfo(city.tz);
          const isWork = info.status === 'work';
          const isAwake = info.status === 'awake';

          return (
            <div
              key={city.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isWork
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isAwake
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-[var(--c-border)] bg-[var(--c-surface)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{city.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--c-text)]">{city.name}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
                      {info.tzName}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--c-muted)]">{city.country} • {city.tz}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-extrabold text-[var(--c-text)]">
                    {info.formatted}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isWork ? 'text-emerald-400' : isAwake ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {isWork ? '● Working Hours' : isAwake ? '● Awake / Off-Hours' : '☾ Sleeping Hours'}
                  </span>
                </div>

                <button
                  onClick={() => removeCity(city.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Remove City"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add More Cities Selector */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[var(--c-gold)]" />
          <span>Add More Global Cities</span>
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {filteredAvailableCities.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => addCity(c.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlapping Hours & Meeting Export Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)]/40 bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">Team Meeting Planner</span>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              Coordinated Meeting Across {selectedCities.length} Global Cities
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMeetingInvite}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Schedule' : 'Copy All City Times'}</span>
            </button>
            <button
              onClick={downloadIcs}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export .ICS Calendar</span>
            </button>
          </div>
        </div>

        <SocialShareButtons
          variant="banner"
          resultSummary={`Planning international sync meeting across ${selectedCities.map((c) => c.name).join(', ')}. Convert time zones:`}
          title="Free Multi-City Timezone Converter & World Clock | ToolBoxX"
        />
      </div>

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="timezone-converter" />
    </div>
  );
};

export default TimeZoneConverter;
