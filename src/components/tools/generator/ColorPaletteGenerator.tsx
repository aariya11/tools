import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Copy, Check, Sparkles, RefreshCw, Lock, Unlock, Download, Layers } from 'lucide-react';
import { showToast } from '../../common/Toast';

interface PaletteColor {
  hex: string;
  isLocked: boolean;
}

const PRESET_STYLES = ['Harmonious', 'Pastel', 'Neon Cyber', 'Luxury Dark', 'Warm Vintage', 'Ocean Blue'];

export const ColorPaletteGenerator: React.FC = () => {
  const [colors, setColors] = useState<PaletteColor[]>([
    { hex: '#D4AF37', isLocked: false },
    { hex: '#1F1E1B', isLocked: false },
    { hex: '#2A2925', isLocked: false },
    { hex: '#F5F1E8', isLocked: false },
    { hex: '#8E8B82', isLocked: false },
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const getRandomHex = useCallback((): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const generatePalette = useCallback(() => {
    setColors((prev) =>
      prev.map((col) => (col.isLocked ? col : { ...col, hex: getRandomHex() }))
    );
  }, [getRandomHex]);

  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Copied ${hex} to clipboard!`, 'success');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const exportCss = () => {
    const css = `:root {\n${colors
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    showToast('Palette CSS variables copied!', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={generatePalette}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate New Palette</span>
          </button>
          <span className="hidden sm:inline text-xs text-[var(--c-muted)]">Click lock icon to keep favorites</span>
        </div>

        <button
          onClick={exportCss}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] text-[var(--c-text)] text-xs font-bold transition-all cursor-pointer"
        >
          <Copy className="w-4 h-4 text-[var(--c-gold)]" />
          <span>Copy CSS Variables</span>
        </button>
      </div>

      {/* 5-Color Interactive Palette Studio */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 rounded-3xl overflow-hidden shadow-2xl">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className="h-64 sm:h-96 rounded-2xl relative p-4 flex flex-col justify-between transition-all group"
            style={{ backgroundColor: color.hex }}
          >
            <div className="flex justify-end">
              <button
                onClick={() => toggleLock(idx)}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white/90 hover:text-white transition-transform active:scale-90 cursor-pointer shadow-md"
                title={color.isLocked ? 'Unlock color' : 'Lock color'}
              >
                {color.isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-center space-y-2">
              <div className="font-mono font-bold text-sm text-white">{color.hex}</div>
              <button
                onClick={() => copyColor(color.hex)}
                className="w-full py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                {copiedHex === color.hex ? 'Copied!' : 'Copy HEX'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
