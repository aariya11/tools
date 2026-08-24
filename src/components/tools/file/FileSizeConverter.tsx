import React, { useState, useMemo } from 'react';
import {
  Copy,
  HardDrive,
  Check,
  Search,
  Wifi,
  Clock,
  Layers,
  FileCode
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';

type UnitStandard = 'binary' | 'decimal';

interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  power: number; // 0 for B, 1 for KB/KiB, etc.
}

const UNITS: UnitDefinition[] = [
  { id: 'b', name: 'Bits', symbol: 'bit', power: -1 },
  { id: 'B', name: 'Bytes', symbol: 'B', power: 0 },
  { id: 'KB', name: 'Kilobytes / Kibibytes', symbol: 'KB', power: 1 },
  { id: 'MB', name: 'Megabytes / Mebibytes', symbol: 'MB', power: 2 },
  { id: 'GB', name: 'Gigabytes / Gibibytes', symbol: 'GB', power: 3 },
  { id: 'TB', name: 'Terabytes / Tebibytes', symbol: 'TB', power: 4 },
  { id: 'PB', name: 'Petabytes / Pebibytes', symbol: 'PB', power: 5 }
];

const SPEED_PRESETS = [
  { name: '4G LTE Mobile', speedMbps: 40 },
  { name: '5G Ultra Mobile', speedMbps: 300 },
  { name: 'Home Broadband (100 Mbps)', speedMbps: 100 },
  { name: 'Gigabit Fiber (1 Gbps)', speedMbps: 1000 },
  { name: 'Data Center 10 Gbps', speedMbps: 10000 },
  { name: 'USB 2.0 Transfer', speedMbps: 480 },
  { name: 'USB 3.2 Gen 1 (5 Gbps)', speedMbps: 5000 }
];

const MIME_DIRECTORY = [
  { ext: '.json', mime: 'application/json', cat: 'Developer', desc: 'JavaScript Object Notation data interchange format' },
  { ext: '.pdf', mime: 'application/pdf', cat: 'Document', desc: 'Adobe Portable Document Format' },
  { ext: '.zip', mime: 'application/zip', cat: 'Archive', desc: 'Standard ZIP compressed archive' },
  { ext: '.png', mime: 'image/png', cat: 'Image', desc: 'Portable Network Graphics lossless bitmap image' },
  { ext: '.jpg / .jpeg', mime: 'image/jpeg', cat: 'Image', desc: 'JPEG lossy compressed image' },
  { ext: '.svg', mime: 'image/svg+xml', cat: 'Image', desc: 'Scalable Vector Graphics XML format' },
  { ext: '.webp', mime: 'image/webp', cat: 'Image', desc: 'Modern high-efficiency WebP image format' },
  { ext: '.mp4', mime: 'video/mp4', cat: 'Video', desc: 'MPEG-4 video container format' },
  { ext: '.mp3', mime: 'audio/mpeg', cat: 'Audio', desc: 'MPEG Layer 3 audio stream' },
  { ext: '.csv', mime: 'text/csv', cat: 'Data', desc: 'Comma-Separated Values structured table text' },
  { ext: '.html', mime: 'text/html', cat: 'Web', desc: 'HyperText Markup Language' },
  { ext: '.css', mime: 'text/css', cat: 'Web', desc: 'Cascading Style Sheets' },
  { ext: '.js / .mjs', mime: 'application/javascript', cat: 'Developer', desc: 'JavaScript source script file' },
  { ext: '.ts / .tsx', mime: 'application/typescript', cat: 'Developer', desc: 'TypeScript type-checked code file' },
  { ext: '.wasm', mime: 'application/wasm', cat: 'Developer', desc: 'WebAssembly binary code format' },
  { ext: '.tar.gz', mime: 'application/gzip', cat: 'Archive', desc: 'Gzip compressed tarball archive' },
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', cat: 'Document', desc: 'Microsoft Word Document' },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', cat: 'Document', desc: 'Microsoft Excel Spreadsheet' },
  { ext: '.woff2', mime: 'font/woff2', cat: 'Font', desc: 'Web Open Font Format 2.0' }
];

export const FileSizeConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('10');
  const [inputUnit, setInputUnit] = useState<string>('GB');
  const [standard, setStandard] = useState<UnitStandard>('binary'); // 1024 vs 1000
  const [selectedSpeed, setSelectedSpeed] = useState<number>(100); // 100 Mbps
  const [mimeSearch, setMimeSearch] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseMultiplier = standard === 'binary' ? 1024 : 1000;

  // Convert input to raw bytes
  const totalBytes = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) return 0;

    const unitDef = UNITS.find((u) => u.id === inputUnit);
    if (!unitDef) return 0;

    if (unitDef.id === 'b') {
      return num / 8;
    }
    return num * Math.pow(baseMultiplier, unitDef.power);
  }, [inputValue, inputUnit, baseMultiplier]);

  // Convert raw bytes to all units
  const conversions = useMemo(() => {
    return UNITS.map((unit) => {
      let val = 0;
      let symbol = unit.symbol;

      if (unit.id === 'b') {
        val = totalBytes * 8;
        symbol = 'bits';
      } else if (unit.power === 0) {
        val = totalBytes;
        symbol = 'Bytes';
      } else {
        val = totalBytes / Math.pow(baseMultiplier, unit.power);
        symbol = standard === 'binary' ? `${unit.id.slice(0, 1)}iB` : `${unit.id}`;
      }

      const formatted =
        val >= 1000000
          ? val.toExponential(4)
          : val >= 100
          ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : val >= 1
          ? val.toLocaleString(undefined, { maximumFractionDigits: 4 })
          : val > 0
          ? val.toFixed(6)
          : '0';

      return {
        ...unit,
        value: formatted,
        rawNumber: val,
        displaySymbol: symbol
      };
    });
  }, [totalBytes, baseMultiplier, standard]);

  // Transfer Time Calculation
  const transferTime = useMemo(() => {
    if (totalBytes <= 0 || selectedSpeed <= 0) return '-';
    const totalBits = totalBytes * 8;
    const speedBitsPerSec = selectedSpeed * 1000000;
    const totalSeconds = totalBits / speedBitsPerSec;

    if (totalSeconds < 1) return '< 1 second';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }, [totalBytes, selectedSpeed]);

  // Filtered MIME directory
  const filteredMime = useMemo(() => {
    if (!mimeSearch.trim()) return MIME_DIRECTORY;
    const q = mimeSearch.toLowerCase();
    return MIME_DIRECTORY.filter(
      (m) =>
        m.ext.toLowerCase().includes(q) ||
        m.mime.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.cat.toLowerCase().includes(q)
    );
  }, [mimeSearch]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast({ type: 'success', title: `Copied ${label}`, message: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Base Standard"
          value={standard === 'binary' ? 'Binary (1024)' : 'Decimal (1000)'}
          badge={standard === 'binary' ? 'IEC Standard' : 'SI Standard'}
          badgeType="neutral"
        />
        <StatCard
          label="Total Equivalent"
          value={conversions.find((c) => c.id === 'MB')?.value || '0'}
          subValue={standard === 'binary' ? 'MiB' : 'MB'}
        />
        <StatCard label="Estimated Transfer" value={transferTime} subValue={`@ ${selectedSpeed} Mbps`} />
        <StatCard label="Total Bytes" value={`${Math.round(totalBytes).toLocaleString()} B`} />
      </div>

      {/* Main Converter Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-7">
        {/* Converter Header & Standard Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[var(--c-gold)]" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--c-text)]">
              Data Storage Unit Converter
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs">
            <button
              type="button"
              onClick={() => setStandard('binary')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                standard === 'binary'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              Binary (KiB / MiB / GiB - 1024)
            </button>
            <button
              type="button"
              onClick={() => setStandard('decimal')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                standard === 'decimal'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              Decimal (KB / MB / GB - 1000)
            </button>
          </div>
        </div>

        {/* Primary Input Controls */}
        <div className="p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Quantity / Value</label>
            <input
              type="number"
              min="0"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter size..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-base font-bold focus:ring-2 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-[var(--c-muted)]">Source Unit</label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs sm:text-sm focus:ring-2 focus:ring-[var(--c-gold)] outline-none"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Converted Values Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Equivalent Data Units
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {conversions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.id === inputUnit
                    ? 'bg-[var(--c-card)] border-[var(--c-gold)] shadow-md'
                    : 'bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/40'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-[var(--c-subtle)] uppercase">
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--c-card)] border border-[var(--c-border)] font-mono text-[10px] font-bold text-[var(--c-gold)]">
                    {item.displaySymbol}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 gap-2">
                  <span className="font-mono text-base font-bold text-[var(--c-text)] truncate select-all">
                    {item.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${item.value} ${item.displaySymbol}`, item.displaySymbol)}
                    className="p-1 rounded text-[var(--c-muted)] hover:text-[var(--c-text)] shrink-0"
                  >
                    {copiedKey === item.displaySymbol ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bandwidth & Download Time Calculator */}
        <div className="p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[var(--c-gold)]" /> Network Transfer & Download Time Calculator
            </h4>
            <span className="text-xs font-bold text-[var(--c-gold)] font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Estimated: {transferTime}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSelectedSpeed(preset.speedMbps)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedSpeed === preset.speedMbps
                    ? 'bg-[var(--c-card)] border-[var(--c-gold)] text-[var(--c-gold)] shadow-sm'
                    : 'bg-[var(--c-card)]/50 border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.name}</div>
                <div className="text-[11px] font-mono mt-0.5 opacity-80">{preset.speedMbps} Mbps</div>
              </button>
            ))}
          </div>
        </div>

        {/* MIME Type & Extension Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[var(--c-gold)]" /> Standard File Extensions & MIME Types Directory
            </h4>
            <span className="text-xs text-[var(--c-muted)] font-mono">{filteredMime.length} types</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-subtle)]" />
            <input
              type="text"
              value={mimeSearch}
              onChange={(e) => setMimeSearch(e.target.value)}
              placeholder="Search file extension (e.g. .pdf, .json, .png) or MIME string..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[var(--c-subtle)] font-medium border-b border-[var(--c-border)]">
                <tr>
                  <th className="py-2 px-2.5 w-28">Extension</th>
                  <th className="py-2 px-2.5 w-24">Category</th>
                  <th className="py-2 px-2.5">Standard MIME Content-Type</th>
                  <th className="py-2 px-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)] font-mono">
                {filteredMime.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--c-card)]/50 transition-colors">
                    <td className="py-2.5 px-2.5 font-bold text-[var(--c-gold)]">{item.ext}</td>
                    <td className="py-2.5 px-2.5 font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--c-card)] border border-[var(--c-border)] text-[10px] text-[var(--c-muted)]">
                        {item.cat}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-[var(--c-text)] select-all">{item.mime}</td>
                    <td className="py-2.5 px-2.5 font-sans text-xs text-[var(--c-muted)]">
                      {item.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="file-size-converter" onReset={() => setInputValue('10')} />
    </div>
  );
};
