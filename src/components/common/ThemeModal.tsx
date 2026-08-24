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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#161513] border border-[#2A2824] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2A2824] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#F5F1E8]">
                Atmosphere & Theme
              </h3>
              <p className="text-xs text-[#B8B2A7]">
                Choose your aesthetic style & display mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A756D] hover:text-[#F5F1E8] hover:bg-[#1B1A17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Light / Dark Mode Toggle */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A756D] block mb-3">
              Display Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('dark')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'border-[#B79B70] bg-[#1B1A17] text-[#F5F1E8] shadow-md'
                    : 'border-[#2A2824] bg-[#161513] text-[#B8B2A7] hover:border-[#3D3A34]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-[#B79B70]" />
                  <div className="text-left">
                    <div className="text-sm font-bold">Dark Mode</div>
                    <div className="text-[11px] opacity-70">Deep contrast & editorial darks</div>
                  </div>
                </div>
                {mode === 'dark' && <Check className="w-4 h-4 text-[#B79B70]" />}
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('light')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'border-[#B79B70] bg-[#FAF8F5] text-[#181714] shadow-md'
                    : 'border-[#2A2824] bg-[#161513] text-[#B8B2A7] hover:border-[#3D3A34]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <div className="text-sm font-bold">Light Mode</div>
                    <div className="text-[11px] opacity-70">Crisp clean ivory tones</div>
                  </div>
                </div>
                {mode === 'light' && <Check className="w-4 h-4 text-[#181714]" />}
              </button>
            </div>
          </div>

          {/* Color Palettes / Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A756D]">
                Color Palettes
              </label>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B8B2A7]">
                {THEME_PRESETS.length} Styles
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
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#B79B70] bg-[#1B1A17] text-[#F5F1E8] shadow-sm'
                        : 'border-[#2A2824] bg-[#161513] hover:border-[#3D3A34] hover:bg-[#1B1A17]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Swatch */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <span className="text-xs font-bold text-[#F5F1E8]">
                          {p.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#B79B70]" />
                      ) : p.id === 'monochrome' ? (
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1B1A17] border border-[#2A2824] text-[#B8B2A7]">
                          Editorial
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#B8B2A7] line-clamp-2">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2824] bg-[#11110F] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#7A756D]">
            <Sparkles className="w-3.5 h-3.5 text-[#B79B70]" />
            <span>Theme persists across your browser sessions</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#E8DFCF] text-[#11110F] font-bold text-xs hover:bg-[#F5F1E8] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
