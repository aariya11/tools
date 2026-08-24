import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Copy, Check, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { showToast } from '../../common/Toast';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

const CATEGORY_UNITS: Record<UnitCategory, { name: string; units: UnitDef[] }> = {
  length: {
    name: 'Length & Distance',
    units: [
      { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ],
  },
  weight: {
    name: 'Weight & Mass',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      { id: 'ton', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  temperature: {
    name: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  area: {
    name: 'Area',
    units: [
      { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqkm', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      { id: 'hectare', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  volume: {
    name: 'Volume & Liquid',
    units: [
      { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'gal', name: 'US Gallons', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'cup', name: 'US Cups', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: 'floz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    ],
  },
  speed: {
    name: 'Speed',
    units: [
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', toBase: (v) => v, fromBase: (v) => v },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
      { id: 'ms', name: 'Meters per second', symbol: 'm/s', toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
      { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 },
    ],
  },
  time: {
    name: 'Time',
    units: [
      { id: 's', name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ms', name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'min', name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'hr', name: 'Hours', symbol: 'hr', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', name: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'wk', name: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    ],
  },
  data: {
    name: 'Digital Data & Storage',
    units: [
      { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnitId, setFromUnitId] = useState('m');
  const [toUnitId, setToUnitId] = useState('ft');
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  const units = CATEGORY_UNITS[category].units;

  // Sync unit selections when category changes
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const newUnits = CATEGORY_UNITS[newCat].units;
    setFromUnitId(newUnits[0].id);
    setToUnitId(newUnits[1]?.id || newUnits[0].id);
  };

  // Convert calculation
  const convertedValue = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return '';

    const fromUnit = units.find((u) => u.id === fromUnitId);
    const toUnit = units.find((u) => u.id === toUnitId);

    if (!fromUnit || !toUnit) return '';

    const baseVal = fromUnit.toBase(num);
    const result = toUnit.fromBase(baseVal);

    if (Math.abs(result) < 0.000001 && result !== 0) {
      return result.toExponential(4);
    }
    return Number(result.toFixed(6)).toString();
  }, [inputValue, fromUnitId, toUnitId, units]);

  // Swap units
  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const handleCopy = () => {
    if (!convertedValue) return;
    const fromUnit = units.find((u) => u.id === fromUnitId);
    const toUnit = units.find((u) => u.id === toUnitId);
    const text = `${inputValue} ${fromUnit?.symbol} = ${convertedValue} ${toUnit?.symbol}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Result copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(Object.keys(CATEGORY_UNITS) as UnitCategory[]).map((catKey) => {
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--c-accent)] text-[var(--c-bg)] font-bold shadow-md'
                  : 'bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
              }`}
            >
              {CATEGORY_UNITS[catKey].name}
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* FROM Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">From</label>
            <div className="space-y-3">
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-semibold outline-none focus:border-[var(--c-gold)]"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-xl font-bold font-mono outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSwap}
              className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] hover:text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-transform active:scale-90 cursor-pointer shadow-md"
              title="Swap Units"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO Output Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">To</label>
            <div className="space-y-3">
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-semibold outline-none focus:border-[var(--c-gold)]"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>

              <div className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-gold)] text-xl font-bold font-mono min-h-[58px] flex items-center overflow-x-auto">
                {convertedValue || '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Result Hero Banner */}
        {convertedValue && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs text-[var(--c-muted)]">Conversion Formula / Result:</span>
              <div className="text-base sm:text-lg font-bold text-[var(--c-text)] font-mono">
                {inputValue} {units.find((u) => u.id === fromUnitId)?.symbol} = {convertedValue}{' '}
                {units.find((u) => u.id === toUnitId)?.symbol}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Reference Table for Current Category */}
      <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--c-gold)]" />
          <span>All {CATEGORY_UNITS[category].name} Conversions for 1 {units.find((u) => u.id === fromUnitId)?.symbol}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {units.map((u) => {
            const baseVal = units.find((from) => from.id === fromUnitId)?.toBase(1) || 1;
            const res = Number(u.fromBase(baseVal).toFixed(4));
            return (
              <div key={u.id} className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs">
                <div className="text-[var(--c-muted)] truncate">{u.name}</div>
                <div className="font-bold text-[var(--c-text)] font-mono mt-0.5">
                  {res} <span className="text-[var(--c-gold)]">{u.symbol}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
