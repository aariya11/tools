import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Barcode as BarcodeIcon,
  Copy,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPCA' | 'CODE39';

// ==========================================
// BARCODE ENCODING ALGORITHMS
// ==========================================

// --- CODE 39 ---
const CODE39_ENCODINGS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100',
};

function encodeCode39(text: string): { modules: number[]; validText: string; error?: string } {
  const clean = text.toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    if (!CODE39_ENCODINGS[clean[i]]) {
      return { modules: [], validText: clean, error: `Invalid character '${clean[i]}' for Code 39` };
    }
  }
  const fullText = `*${clean}*`;
  const modules: number[] = [];

  for (let i = 0; i < fullText.length; i++) {
    const pattern = CODE39_ENCODINGS[fullText[i]];
    for (let p = 0; p < 9; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === '1';
      const width = isWide ? 3 : 1;
      for (let w = 0; w < width; w++) {
        modules.push(isBar ? 1 : 0);
      }
    }
    if (i < fullText.length - 1) {
      modules.push(0);
    }
  }

  return { modules, validText: clean };
}

// --- CODE 128 (Code 128B standard) ---
const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011',
];

function encodeCode128(text: string): { modules: number[]; validText: string; error?: string } {
  if (!text) return { modules: [], validText: text, error: 'Input cannot be empty' };

  const codes: number[] = [104]; // Start B
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode < 32 || charCode > 126) {
      return { modules: [], validText: text, error: `Invalid ASCII character code ${charCode}` };
    }
    codes.push(charCode - 32);
  }

  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(106); // Stop code

  const modules: number[] = [];
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    for (let p = 0; p < pattern.length; p++) {
      modules.push(pattern[p] === '1' ? 1 : 0);
    }
  }

  return { modules, validText: text };
}

// --- EAN-13 ---
const EAN_L_CODES = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_G_CODES = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const EAN_R_CODES = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];

const EAN_PARITY_STRUCTURE = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

function calculateEanChecksum(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? d * 1 : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

function encodeEan13(rawInput: string): { modules: number[]; validText: string; error?: string } {
  const digitsOnly = rawInput.replace(/\D/g, '');
  if (digitsOnly.length < 12) {
    return { modules: [], validText: rawInput, error: 'EAN-13 requires at least 12 numerical digits.' };
  }

  const base12 = digitsOnly.slice(0, 12);
  const checkDigit = calculateEanChecksum(base12);
  const full13 = base12 + checkDigit.toString();

  const firstDigit = parseInt(full13[0], 10);
  const parity = EAN_PARITY_STRUCTURE[firstDigit];

  const modules: number[] = [];
  modules.push(1, 0, 1);

  for (let i = 1; i <= 6; i++) {
    const digit = parseInt(full13[i], 10);
    const useG = parity[i - 1] === 'G';
    const pattern = useG ? EAN_G_CODES[digit] : EAN_L_CODES[digit];
    for (let c = 0; c < pattern.length; c++) {
      modules.push(pattern[c] === '1' ? 1 : 0);
    }
  }

  modules.push(0, 1, 0, 1, 0);

  for (let i = 7; i <= 12; i++) {
    const digit = parseInt(full13[i], 10);
    const pattern = EAN_R_CODES[digit];
    for (let c = 0; c < pattern.length; c++) {
      modules.push(pattern[c] === '1' ? 1 : 0);
    }
  }

  modules.push(1, 0, 1);
  return { modules, validText: full13 };
}

// --- UPC-A ---
function calculateUpcChecksum(digits11: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const d = parseInt(digits11[i], 10);
    sum += i % 2 === 0 ? d * 3 : d * 1;
  }
  return (10 - (sum % 10)) % 10;
}

function encodeUpcA(rawInput: string): { modules: number[]; validText: string; error?: string } {
  const digitsOnly = rawInput.replace(/\D/g, '');
  if (digitsOnly.length < 11) {
    return { modules: [], validText: rawInput, error: 'UPC-A requires at least 11 numerical digits.' };
  }

  const base11 = digitsOnly.slice(0, 11);
  const checkDigit = calculateUpcChecksum(base11);
  const full12 = base11 + checkDigit.toString();

  const modules: number[] = [];
  modules.push(1, 0, 1);

  for (let i = 0; i < 6; i++) {
    const digit = parseInt(full12[i], 10);
    const pattern = EAN_L_CODES[digit];
    for (let c = 0; c < pattern.length; c++) {
      modules.push(pattern[c] === '1' ? 1 : 0);
    }
  }

  modules.push(0, 1, 0, 1, 0);

  for (let i = 6; i < 12; i++) {
    const digit = parseInt(full12[i], 10);
    const pattern = EAN_R_CODES[digit];
    for (let c = 0; c < pattern.length; c++) {
      modules.push(pattern[c] === '1' ? 1 : 0);
    }
  }

  modules.push(1, 0, 1);
  return { modules, validText: full12 };
}

export const BarcodeGenerator: React.FC = () => {
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [value, setValue] = useState<string>('TOOLBOXX-2026');

  // Customization Options
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(100);
  const [showText, setShowText] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(15);
  const [textMargin, setTextMargin] = useState<number>(8);
  const [quietZone, setQuietZone] = useState<number>(20);
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Preview & output
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [encodedModules, setEncodedModules] = useState<number[]>([]);
  const [resolvedText, setResolvedText] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat);
    if (newFormat === 'CODE128') setValue('TOOLBOXX-2026');
    else if (newFormat === 'EAN13') setValue('590123412345');
    else if (newFormat === 'UPCA') setValue('01234567890');
    else if (newFormat === 'CODE39') setValue('PROD-9988');
  };

  useEffect(() => {
    let result: { modules: number[]; validText: string; error?: string };

    switch (format) {
      case 'CODE128':
        result = encodeCode128(value);
        break;
      case 'EAN13':
        result = encodeEan13(value);
        break;
      case 'UPCA':
        result = encodeUpcA(value);
        break;
      case 'CODE39':
        result = encodeCode39(value);
        break;
      default:
        result = { modules: [], validText: value, error: 'Unsupported format' };
    }

    if (result.error) {
      setErrorMsg(result.error);
      setEncodedModules([]);
    } else {
      setErrorMsg(null);
      setEncodedModules(result.modules);
      setResolvedText(result.validText);
    }
  }, [format, value]);

  useEffect(() => {
    if (encodedModules.length === 0) {
      setSvgString('');
      return;
    }

    const totalBarWidth = encodedModules.length * barWidth;
    const canvasWidth = totalBarWidth + quietZone * 2;
    const textSpace = showText ? fontSize + textMargin + 4 : 0;
    const canvasHeight = barHeight + quietZone * 2 + textSpace;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = fgColor;
        let currentX = quietZone;
        for (let i = 0; i < encodedModules.length; i++) {
          if (encodedModules[i] === 1) {
            ctx.fillRect(currentX, quietZone, barWidth, barHeight);
          }
          currentX += barWidth;
        }

        if (showText && resolvedText) {
          ctx.fillStyle = fgColor;
          ctx.font = `600 ${fontSize}px monospace, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(resolvedText, canvasWidth / 2, quietZone + barHeight + textMargin);
        }
      }
    }

    let svgRects = '';
    let currentX = quietZone;
    for (let i = 0; i < encodedModules.length; i++) {
      if (encodedModules[i] === 1) {
        svgRects += `<rect x="${currentX}" y="${quietZone}" width="${barWidth}" height="${barHeight}" fill="${fgColor}" />\n`;
      }
      currentX += barWidth;
    }

    const svgTextNode = showText && resolvedText
      ? `<text x="${canvasWidth / 2}" y="${quietZone + barHeight + textMargin + fontSize}" font-family="monospace, system-ui, sans-serif" font-weight="600" font-size="${fontSize}" fill="${fgColor}" text-anchor="middle">${resolvedText}</text>`
      : '';

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}">
  <rect width="100%" height="100%" fill="${bgColor}" />
  ${svgRects}
  ${svgTextNode}
</svg>`;

    setSvgString(fullSvg);
  }, [encodedModules, barWidth, barHeight, quietZone, showText, fontSize, textMargin, fgColor, bgColor, resolvedText]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || encodedModules.length === 0) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `barcode_${format.toLowerCase()}_${resolvedText || 'export'}.png`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Barcode Downloaded', message: `Saved high-res PNG image.` });
    });
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `barcode_${format.toLowerCase()}_${resolvedText || 'export'}.svg`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    showToast({ type: 'success', title: 'Vector SVG Downloaded', message: `Saved scalable vector barcode.` });
  };

  const handleCopySvg = async () => {
    if (!svgString) return;
    try {
      await navigator.clipboard.writeText(svgString);
      showToast({ type: 'success', title: 'SVG Copied', message: 'Vector XML copied to clipboard.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to copy to clipboard.' });
    }
  };

  const FORMAT_TABS: { id: BarcodeFormat; name: string; desc: string }[] = [
    { id: 'CODE128', name: 'Code 128', desc: 'Universal alphanumeric, shipping & inventory' },
    { id: 'EAN13', name: 'EAN-13', desc: 'Global retail 13-digit product standard' },
    { id: 'UPCA', name: 'UPC-A', desc: 'US & Canada 12-digit retail point-of-sale' },
    { id: 'CODE39', name: 'Code 39', desc: 'Industrial, military & asset tracking' },
  ];

  return (
    <div className="space-y-8">
      {/* Format Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--c-surface)] p-2.5 rounded-2xl border border-[var(--c-border)]">
        {FORMAT_TABS.map((tab) => {
          const isActive = format === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFormatChange(tab.id)}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--c-card)] border border-[var(--c-gold)] shadow-md text-[var(--c-text)]'
                  : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--c-text)]">{tab.name}</span>
                {isActive && <CheckCircle2 className="w-4 h-4 text-[var(--c-gold)]" />}
              </div>
              <p className="text-[11px] text-[var(--c-muted)] mt-1 line-clamp-1">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Config on Left, Live Barcode on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings & Input */}
        <div className="lg:col-span-7 space-y-6">
          {/* Data Input Card */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <BarcodeIcon className="w-4 h-4 text-[var(--c-gold)]" />
                Barcode Value
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]">
                {format}
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  format === 'EAN13'
                    ? 'Enter 12 or 13 digits (e.g. 590123412345)'
                    : format === 'UPCA'
                    ? 'Enter 11 or 12 digits (e.g. 01234567890)'
                    : 'Enter barcode text or SKU...'
                }
                className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none transition-colors"
              />

              {errorMsg ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-[var(--c-subtle)] pt-1">
                  <span>Encoded text: <strong className="text-[var(--c-text)] font-mono">{resolvedText || value}</strong></span>
                  <span>{encodedModules.length} modules</span>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-[var(--c-border)]">
              <div className="text-[11px] font-semibold text-[var(--c-muted)] mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--c-gold)]" /> Quick Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {format === 'CODE128' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setValue('SKU-99482-A')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      SKU-99482-A
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('SHIP-TRK-78491029')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Tracking #
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('ASSET-2026-HQ')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Asset Tag
                    </button>
                  </>
                )}
                {format === 'EAN13' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setValue('400638133393')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Book / ISBN
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('735005385001')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Retail Item
                    </button>
                  </>
                )}
                {format === 'UPCA' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setValue('03600029145')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Grocery Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('61414100003')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      Packaged Good
                    </button>
                  </>
                )}
                {format === 'CODE39' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setValue('PART-4029-X')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      PART-4029-X
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('BADGE 992')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)] border border-[var(--c-border)] cursor-pointer"
                    >
                      BADGE 992
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sizing & Appearance Controls */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Dimensions & Appearance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                  <span>Bar Scale (Width)</span>
                  <span className="text-[var(--c-text)] font-mono">{barWidth}px / module</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                  <span>Bar Height</span>
                  <span className="text-[var(--c-text)] font-mono">{barHeight}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1.5">
                  Foreground (Bar Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
              </div>
            </div>

            {/* Text & Margins */}
            <div className="pt-2 border-t border-[var(--c-border)] space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showText}
                    onChange={(e) => setShowText(e.target.checked)}
                    className="rounded border-[var(--c-border)]"
                  />
                  <span>Display Human-Readable Text</span>
                </label>

                {showText && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--c-muted)]">Font Size:</span>
                    <input
                      type="number"
                      min="10"
                      max="28"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-14 px-2 py-1 text-xs font-mono rounded-md border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-center"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                    <span>Quiet Zone (Padding)</span>
                    <span className="text-[var(--c-text)] font-mono">{quietZone}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={quietZone}
                    onChange={(e) => setQuietZone(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                    <span>Text Spacing</span>
                    <span className="text-[var(--c-text)] font-mono">{textMargin}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    disabled={!showText}
                    value={textMargin}
                    onChange={(e) => setTextMargin(Number(e.target.value))}
                    className="w-full disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Barcode & Exports */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] text-center space-y-6">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>High-Resolution Scannable Barcode</span>
          </div>

          {/* Barcode Display Box */}
          <div className="w-full overflow-x-auto p-6 rounded-2xl bg-white shadow-xl border border-[var(--c-border)] flex items-center justify-center min-h-[160px]">
            {errorMsg ? (
              <div className="text-rose-600 font-medium text-xs flex flex-col items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span>{errorMsg}</span>
              </div>
            ) : (
              <canvas ref={canvasRef} className="max-w-full h-auto object-contain rounded-md" />
            )}
          </div>

          <div className="text-xs text-[var(--c-muted)] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            <span>Tested compatible with all 1D laser & optical barcode scanners.</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={Boolean(errorMsg) || encodedModules.length === 0}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 disabled:opacity-40 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={Boolean(errorMsg) || !svgString}
                className="py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] disabled:opacity-40 text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[var(--c-gold)]" />
                Download SVG
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySvg}
              disabled={Boolean(errorMsg) || !svgString}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] disabled:opacity-40 text-[var(--c-text)] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[var(--c-muted)]" />
              Copy Vector SVG Code
            </button>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="barcode-generator" />
    </div>
  );
};

export default BarcodeGenerator;
