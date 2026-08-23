import React from 'react';
import { X, Check, Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { useTheme, THEME_PRESETS, type ThemePreset, type ThemeMode } from '../../context/ThemeContext';
import { showToast } from './Toast';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { mode, preset, setMode, setPreset } = useTheme();

  if (!isOpen) return null;

  const handleSelectPreset = (p: ThemePreset) => {
    setPreset(p);
    showToast({
      type: 'success',
      title: 'Theme Updated',
      message: `Switched to ${THEME_PRESETS.find(tp => tp.id === p)?.name}`,
    });
  };

  const handleModeChange = (m: ThemeMode) => {
    setMode(m);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                Customize Theme
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose your aesthetic style & display mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Light / Dark Mode Toggle */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-3">
              Display Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('dark')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  mode === 'dark'
                    ? 'border-white bg-zinc-900 text-white shadow-md ring-2 ring-white/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div className="text-left">
                    <div className="text-sm font-bold">Dark Mode</div>
                    <div className="text-[11px] opacity-70">Deep contrast & slick darks</div>
                  </div>
                </div>
                {mode === 'dark' && <Check className="w-5 h-5 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('light')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  mode === 'light'
                    ? 'border-black bg-white text-black shadow-md ring-2 ring-black/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <div className="text-sm font-bold">Light Mode</div>
                    <div className="text-[11px] opacity-70">Crisp clean bright tones</div>
                  </div>
                </div>
                {mode === 'light' && <Check className="w-5 h-5 text-black" />}
              </button>
            </div>
          </div>

          {/* Color Palettes / Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Color Palette & Theme Style
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {THEME_PRESETS.length} Themes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_PRESETS.map((p) => {
                const isSelected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-900 shadow-md ring-2 ring-zinc-500/20'
                        : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Swatch */}
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 shadow-xs"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {p.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                      ) : p.id === 'monochrome' ? (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme persists across your browser sessions</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
