import React, { useState, useMemo } from 'react';
import {
  Copy,
  Palette,
  Check,
  Sliders,
  SunMedium,
  Layers
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';

// Color math helpers
function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('') + 'ff';
  } else if (clean.length === 6) {
    clean += 'ff';
  } else if (clean.length === 4) {
    clean = clean.split('').map((c) => c + c).join('');
  }

  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 69, b: 0, a: 1 };

  return {
    r: (num >> 24) & 255,
    g: (num >> 16) & 255,
    b: (num >> 8) & 255,
    a: Number(((num & 255) / 255).toFixed(2))
  };
}

function rgbToHex(r: number, g: number, b: number, a = 1): { hex: string; hex8: string } {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const aHex = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
    hex8: `#${toHex(r)}${toHex(g)}${toHex(b)}${aHex}`.toUpperCase()
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  return {
    c: Math.round(((1 - rNorm - k) / (1 - k)) * 100),
    m: Math.round(((1 - gNorm - k) / (1 - k)) * 100),
    y: Math.round(((1 - bNorm - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// Relative luminance for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export const ColorConverter: React.FC = () => {
  const [hexInput, setHexInput] = useState<string>('#FF4500');
  const [alpha, setAlpha] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse color
  const colorData = useMemo(() => {
    const rgb = hexToRgb(hexInput);
    const hexClean = rgbToHex(rgb.r, rgb.g, rgb.b, alpha);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    // WCAG contrast ratios
    const whiteContrast = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
    const blackContrast = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });

    return {
      hex: hexClean.hex,
      hex8: hexClean.hex8,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      hsv: `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`,
      rawRgb: rgb,
      rawHsl: hsl,
      whiteContrast,
      blackContrast
    };
  }, [hexInput, alpha]);

  // Harmonies
  const harmonies = useMemo(() => {
    const { h, s, l } = colorData.rawHsl;

    const makeColor = (hueOffset: number, sat = s, lit = l) => {
      const targetH = (h + hueOffset + 360) % 360;
      const rgb = hslToRgb(targetH, sat, lit);
      return rgbToHex(rgb.r, rgb.g, rgb.b).hex;
    };

    return {
      complementary: makeColor(180),
      analogous1: makeColor(-30),
      analogous2: makeColor(30),
      triadic1: makeColor(120),
      triadic2: makeColor(240),
      tetradic1: makeColor(90),
      tetradic2: makeColor(180),
      tetradic3: makeColor(270),
      shades: [10, 20, 30, 40, 50, 60, 70, 80, 90].map((lit) => makeColor(0, s, lit))
    };
  }, [colorData]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast({ type: 'success', title: `Copied ${label}`, message: text });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleHslSlider = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b).hex;
    setHexInput(hex);
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Color (HEX)"
          value={colorData.hex}
          badge={`RGB(${colorData.rawRgb.r}, ${colorData.rawRgb.g}, ${colorData.rawRgb.b})`}
          badgeType="neutral"
        />
        <StatCard
          label="White Contrast (WCAG)"
          value={`${colorData.whiteContrast}:1`}
          badge={colorData.whiteContrast >= 4.5 ? 'AA PASS' : colorData.whiteContrast >= 3 ? 'AA LARGE' : 'FAIL'}
          badgeType={colorData.whiteContrast >= 4.5 ? 'success' : colorData.whiteContrast >= 3 ? 'neutral' : 'warning'}
        />
        <StatCard
          label="Black Contrast (WCAG)"
          value={`${colorData.blackContrast}:1`}
          badge={colorData.blackContrast >= 4.5 ? 'AA PASS' : colorData.blackContrast >= 3 ? 'AA LARGE' : 'FAIL'}
          badgeType={colorData.blackContrast >= 4.5 ? 'success' : colorData.blackContrast >= 3 ? 'neutral' : 'warning'}
        />
        <StatCard
          label="HSL Coordinates"
          value={`${colorData.rawHsl.h}° ${colorData.rawHsl.s}% ${colorData.rawHsl.l}%`}
        />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-7">
        {/* Color Picker & Sliders Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Swatch & Visual Color Input (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="h-44 sm:h-52 w-full rounded-2xl border-2 border-[var(--c-border)] shadow-inner flex flex-col justify-end p-4 transition-all relative overflow-hidden group"
              style={{ backgroundColor: colorData.rgba }}
            >
              <input
                type="color"
                value={colorData.hex}
                onChange={(e) => setHexInput(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="p-2.5 rounded-xl bg-[var(--c-card)]/90 backdrop-blur-md border border-[var(--c-border)] flex items-center justify-between pointer-events-none">
                <span className="font-mono font-bold text-xs text-[var(--c-text)]">
                  {colorData.hex}
                </span>
                <span className="text-[11px] text-[var(--c-muted)] font-semibold">
                  Click swatch to pick
                </span>
              </div>
            </div>

            {/* Direct Hex Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-muted)]">HEX Value</label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="#FF4500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-sm font-bold focus:ring-2 focus:ring-[var(--c-gold)] outline-none"
              />
            </div>
          </div>

          {/* Precision Sliders (8 cols) */}
          <div className="lg:col-span-8 space-y-4 p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[var(--c-border)]">
              <Sliders className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Precision Color Sliders
            </h4>

            {/* Hue Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--c-muted)]">Hue (H)</span>
                <span className="font-mono font-bold text-[var(--c-text)]">{colorData.rawHsl.h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={colorData.rawHsl.h}
                onChange={(e) =>
                  handleHslSlider(Number(e.target.value), colorData.rawHsl.s, colorData.rawHsl.l)
                }
                className="w-full accent-[var(--c-gold)] cursor-pointer h-2 bg-[var(--c-card)] rounded-lg"
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--c-muted)]">Saturation (S)</span>
                <span className="font-mono font-bold text-[var(--c-text)]">{colorData.rawHsl.s}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={colorData.rawHsl.s}
                onChange={(e) =>
                  handleHslSlider(colorData.rawHsl.h, Number(e.target.value), colorData.rawHsl.l)
                }
                className="w-full accent-[var(--c-gold)] cursor-pointer h-2 bg-[var(--c-card)] rounded-lg"
              />
            </div>

            {/* Lightness Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--c-muted)]">Lightness (L)</span>
                <span className="font-mono font-bold text-[var(--c-text)]">{colorData.rawHsl.l}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={colorData.rawHsl.l}
                onChange={(e) =>
                  handleHslSlider(colorData.rawHsl.h, colorData.rawHsl.s, Number(e.target.value))
                }
                className="w-full accent-[var(--c-gold)] cursor-pointer h-2 bg-[var(--c-card)] rounded-lg"
              />
            </div>

            {/* Alpha Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--c-muted)]">Alpha Transparency (A)</span>
                <span className="font-mono font-bold text-[var(--c-text)]">{Math.round(alpha * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-[var(--c-gold)] cursor-pointer h-2 bg-[var(--c-card)] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Color Formats Conversion Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-[var(--c-gold)]" /> Converted Formats
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { label: 'HEX', val: colorData.hex },
              { label: 'HEX8', val: colorData.hex8 },
              { label: 'RGB', val: colorData.rgb },
              { label: 'RGBA', val: colorData.rgba },
              { label: 'HSL', val: colorData.hsl },
              { label: 'HSLA', val: colorData.hsla },
              { label: 'CMYK', val: colorData.cmyk },
              { label: 'HSV', val: colorData.hsv }
            ].map((item) => (
              <div
                key={item.label}
                className="p-3.5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-between gap-3 hover:border-[var(--c-gold)]/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[var(--c-subtle)] uppercase">
                    {item.label}
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-[var(--c-text)] break-all select-all">
                    {item.val}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.val, item.label)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedKey === item.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === item.label ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WCAG Contrast Ratio Checker Matrix */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
          <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
            <SunMedium className="w-4 h-4 text-[var(--c-gold)]" /> WCAG 2.1 Contrast & Accessibility Compliance
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* White Background Test */}
            <div className="p-4 rounded-xl border border-[var(--c-border)] bg-white text-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">On White Background (#FFF)</span>
                <span className="font-mono font-extrabold text-sm">{colorData.whiteContrast}:1</span>
              </div>
              <p style={{ color: colorData.hex }} className="font-bold text-sm">
                Sample Text against White Background
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    colorData.whiteContrast >= 4.5
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {colorData.whiteContrast >= 4.5 ? 'AA Normal: PASS' : 'AA Normal: FAIL'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    colorData.whiteContrast >= 3
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {colorData.whiteContrast >= 3 ? 'AA Large: PASS' : 'AA Large: FAIL'}
                </span>
              </div>
            </div>

            {/* Black Background Test */}
            <div className="p-4 rounded-xl border border-[var(--c-border)] bg-black text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">On Black Background (#000)</span>
                <span className="font-mono font-extrabold text-sm">{colorData.blackContrast}:1</span>
              </div>
              <p style={{ color: colorData.hex }} className="font-bold text-sm">
                Sample Text against Black Background
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    colorData.blackContrast >= 4.5
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : 'bg-rose-900/60 text-rose-300'
                  }`}
                >
                  {colorData.blackContrast >= 4.5 ? 'AA Normal: PASS' : 'AA Normal: FAIL'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    colorData.blackContrast >= 3
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : 'bg-rose-900/60 text-rose-300'
                  }`}
                >
                  {colorData.blackContrast >= 3 ? 'AA Large: PASS' : 'AA Large: FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Color Harmonies & Palettes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--c-gold)]" /> Color Harmonies & Palette Variations
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Complementary', color: harmonies.complementary },
              { label: 'Analogous A', color: harmonies.analogous1 },
              { label: 'Analogous B', color: harmonies.analogous2 },
              { label: 'Triadic A', color: harmonies.triadic1 },
              { label: 'Triadic B', color: harmonies.triadic2 },
              { label: 'Tetradic A', color: harmonies.tetradic1 },
              { label: 'Tetradic B', color: harmonies.tetradic2 },
              { label: 'Tetradic C', color: harmonies.tetradic3 }
            ].map((harm) => (
              <div
                key={harm.label}
                onClick={() => setHexInput(harm.color)}
                className="p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] cursor-pointer group transition-all"
              >
                <div
                  className="h-16 rounded-xl border border-[var(--c-border)] mb-2.5 shadow-sm"
                  style={{ backgroundColor: harm.color }}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--c-muted)] font-medium">{harm.label}</span>
                  <span className="font-mono font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)]">
                    {harm.color}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Monochromatic Tints & Shades Ladder */}
          <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-2">
            <span className="text-xs font-bold text-[var(--c-subtle)] uppercase">
              Monochromatic Lightness Scale (10% to 90%)
            </span>
            <div className="grid grid-cols-9 gap-1.5">
              {harmonies.shades.map((shade, idx) => (
                <div
                  key={idx}
                  onClick={() => setHexInput(shade)}
                  title={`Shade ${idx + 1}: ${shade}`}
                  className="h-12 rounded-lg cursor-pointer border border-[var(--c-border)] hover:scale-105 transition-transform"
                  style={{ backgroundColor: shade }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="color-converter" onReset={() => setHexInput('#FF4500')} />
    </div>
  );
};
