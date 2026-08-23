import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export type ThemePreset = 
  | 'monochrome'    // Default Black & White
  | 'slate'         // Modern Dark Slate
  | 'midnight'      // Deep Obsidian & Indigo
  | 'emerald'       // Forest & Mint
  | 'cyberpunk'     // Neon Violet & Fuchsia
  | 'sunset'        // Warm Amber & Orange
  | 'crimson'       // Bold Ruby & Rose
  | 'ocean';        // Aquatic Cyan & Blue

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  description: string;
  accentColor: string;
  previewClass: string;
  darkBg: string;
  lightBg: string;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'monochrome',
    name: 'Black & White (Default)',
    description: 'High contrast stark black & white minimalist aesthetic',
    accentColor: '#ffffff',
    previewClass: 'bg-black border-white text-white',
    darkBg: '#000000',
    lightBg: '#ffffff',
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    description: 'Refined neutral zinc and cool gray tones',
    accentColor: '#94a3b8',
    previewClass: 'bg-slate-900 border-slate-500 text-slate-200',
    darkBg: '#090d16',
    lightBg: '#f8fafc',
  },
  {
    id: 'midnight',
    name: 'Midnight Indigo',
    description: 'Deep obsidian navy with electric indigo glow',
    accentColor: '#6366f1',
    previewClass: 'bg-indigo-950 border-indigo-500 text-indigo-200',
    darkBg: '#030712',
    lightBg: '#f5f7ff',
  },
  {
    id: 'emerald',
    name: 'Emerald Mint',
    description: 'Lush dark forest green and crisp emerald highlights',
    accentColor: '#10b981',
    previewClass: 'bg-emerald-950 border-emerald-500 text-emerald-200',
    darkBg: '#021e17',
    lightBg: '#f0fdf4',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Violet',
    description: 'Vibrant neon purple, magenta, and electric violet',
    accentColor: '#a855f7',
    previewClass: 'bg-purple-950 border-purple-500 text-purple-200',
    darkBg: '#120420',
    lightBg: '#faf5ff',
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    description: 'Warm golden amber and sunset copper glow',
    accentColor: '#f59e0b',
    previewClass: 'bg-amber-950 border-amber-500 text-amber-200',
    darkBg: '#1c1304',
    lightBg: '#fffbeb',
  },
  {
    id: 'crimson',
    name: 'Crimson Rose',
    description: 'Striking dark ruby red and elegant rose accents',
    accentColor: '#f43f5e',
    previewClass: 'bg-rose-950 border-rose-500 text-rose-200',
    darkBg: '#1c040a',
    lightBg: '#fff1f2',
  },
  {
    id: 'ocean',
    name: 'Ocean Cyan',
    description: 'Deep nautical marine and vivid cyan highlights',
    accentColor: '#06b6d4',
    previewClass: 'bg-cyan-950 border-cyan-500 text-cyan-200',
    darkBg: '#021824',
    lightBg: '#ecfeff',
  },
];

interface ThemeContextType {
  mode: ThemeMode;
  preset: ThemePreset;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePreset) => void;
  currentPresetConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to monochrome black & white theme
  const [preset, setPresetState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('toolboxx_preset');
    if (saved && THEME_PRESETS.some(p => p.id === saved)) {
      return saved as ThemePreset;
    }
    return 'monochrome';
  });

  // Default to dark mode for the black & white / monochrome aesthetic
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('toolboxx_mode');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Default dark for slick B&W aesthetic
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark class
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply data-theme attribute
    root.setAttribute('data-theme', preset);

    localStorage.setItem('toolboxx_mode', mode);
    localStorage.setItem('toolboxx_preset', preset);
  }, [mode, preset]);

  const toggleMode = () => {
    setModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
  };

  const setPreset = (p: ThemePreset) => {
    setPresetState(p);
  };

  const currentPresetConfig = THEME_PRESETS.find(p => p.id === preset) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider value={{ mode, preset, toggleMode, setMode, setPreset, currentPresetConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
