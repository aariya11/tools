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

// CSS Custom Properties for each theme/mode combination
function getThemeVars(preset: ThemePreset, mode: ThemeMode): Record<string, string> {
  const isDark = mode === 'dark';

  const themes: Record<ThemePreset, { dark: Record<string, string>; light: Record<string, string> }> = {
    monochrome: {
      dark: {
        '--c-bg': '#11110F',
        '--c-surface': '#161513',
        '--c-card': '#1B1A17',
        '--c-border': '#2A2824',
        '--c-border-hover': '#3D3A34',
        '--c-text': '#F5F1E8',
        '--c-muted': '#B8B2A7',
        '--c-subtle': '#7A756D',
        '--c-accent': '#E8DFCF',
        '--c-gold': '#B79B70',
      },
      light: {
        '--c-bg': '#FAF8F5',
        '--c-surface': '#F0EDE8',
        '--c-card': '#E8E4DD',
        '--c-border': '#D5CFC6',
        '--c-border-hover': '#B8B2A7',
        '--c-text': '#181714',
        '--c-muted': '#5C574F',
        '--c-subtle': '#9C968E',
        '--c-accent': '#2A2824',
        '--c-gold': '#8C6F43',
      },
    },
    slate: {
      dark: {
        '--c-bg': '#0c0f14',
        '--c-surface': '#111520',
        '--c-card': '#161c2d',
        '--c-border': '#1e2a3a',
        '--c-border-hover': '#2d4060',
        '--c-text': '#f1f5f9',
        '--c-muted': '#94a3b8',
        '--c-subtle': '#64748b',
        '--c-accent': '#cbd5e1',
        '--c-gold': '#94a3b8',
      },
      light: {
        '--c-bg': '#f8fafc',
        '--c-surface': '#f1f5f9',
        '--c-card': '#e2e8f0',
        '--c-border': '#cbd5e1',
        '--c-border-hover': '#94a3b8',
        '--c-text': '#0f172a',
        '--c-muted': '#475569',
        '--c-subtle': '#94a3b8',
        '--c-accent': '#1e293b',
        '--c-gold': '#475569',
      },
    },
    midnight: {
      dark: {
        '--c-bg': '#060913',
        '--c-surface': '#0a0f1f',
        '--c-card': '#0f1629',
        '--c-border': '#1a2540',
        '--c-border-hover': '#2d3f6b',
        '--c-text': '#e0e7ff',
        '--c-muted': '#818cf8',
        '--c-subtle': '#4f46e5',
        '--c-accent': '#c7d2fe',
        '--c-gold': '#6366f1',
      },
      light: {
        '--c-bg': '#f5f7ff',
        '--c-surface': '#eef0ff',
        '--c-card': '#e0e7ff',
        '--c-border': '#c7d2fe',
        '--c-border-hover': '#a5b4fc',
        '--c-text': '#1e1b4b',
        '--c-muted': '#4338ca',
        '--c-subtle': '#6366f1',
        '--c-accent': '#312e81',
        '--c-gold': '#4f46e5',
      },
    },
    emerald: {
      dark: {
        '--c-bg': '#071510',
        '--c-surface': '#0a1f17',
        '--c-card': '#0f2a1f',
        '--c-border': '#163d2b',
        '--c-border-hover': '#226040',
        '--c-text': '#d1fae5',
        '--c-muted': '#6ee7b7',
        '--c-subtle': '#10b981',
        '--c-accent': '#a7f3d0',
        '--c-gold': '#34d399',
      },
      light: {
        '--c-bg': '#f0fdf4',
        '--c-surface': '#dcfce7',
        '--c-card': '#bbf7d0',
        '--c-border': '#86efac',
        '--c-border-hover': '#4ade80',
        '--c-text': '#14532d',
        '--c-muted': '#166534',
        '--c-subtle': '#15803d',
        '--c-accent': '#052e16',
        '--c-gold': '#16a34a',
      },
    },
    cyberpunk: {
      dark: {
        '--c-bg': '#0d0617',
        '--c-surface': '#120b22',
        '--c-card': '#180f2e',
        '--c-border': '#251540',
        '--c-border-hover': '#3d2070',
        '--c-text': '#f0e6ff',
        '--c-muted': '#c084fc',
        '--c-subtle': '#a855f7',
        '--c-accent': '#e9d5ff',
        '--c-gold': '#a855f7',
      },
      light: {
        '--c-bg': '#faf5ff',
        '--c-surface': '#f3e8ff',
        '--c-card': '#e9d5ff',
        '--c-border': '#d8b4fe',
        '--c-border-hover': '#c084fc',
        '--c-text': '#3b0764',
        '--c-muted': '#7e22ce',
        '--c-subtle': '#9333ea',
        '--c-accent': '#4c1d95',
        '--c-gold': '#7c3aed',
      },
    },
    sunset: {
      dark: {
        '--c-bg': '#140d05',
        '--c-surface': '#1f1408',
        '--c-card': '#291b0a',
        '--c-border': '#3d2a10',
        '--c-border-hover': '#60411a',
        '--c-text': '#fef3c7',
        '--c-muted': '#fbbf24',
        '--c-subtle': '#f59e0b',
        '--c-accent': '#fde68a',
        '--c-gold': '#f59e0b',
      },
      light: {
        '--c-bg': '#fffbeb',
        '--c-surface': '#fef3c7',
        '--c-card': '#fde68a',
        '--c-border': '#fcd34d',
        '--c-border-hover': '#fbbf24',
        '--c-text': '#451a03',
        '--c-muted': '#92400e',
        '--c-subtle': '#b45309',
        '--c-accent': '#1c1304',
        '--c-gold': '#d97706',
      },
    },
    crimson: {
      dark: {
        '--c-bg': '#140508',
        '--c-surface': '#1f0810',
        '--c-card': '#2a0a16',
        '--c-border': '#400f20',
        '--c-border-hover': '#671830',
        '--c-text': '#ffe4e6',
        '--c-muted': '#fb7185',
        '--c-subtle': '#f43f5e',
        '--c-accent': '#fecdd3',
        '--c-gold': '#f43f5e',
      },
      light: {
        '--c-bg': '#fff1f2',
        '--c-surface': '#ffe4e6',
        '--c-card': '#fecdd3',
        '--c-border': '#fda4af',
        '--c-border-hover': '#fb7185',
        '--c-text': '#4c0519',
        '--c-muted': '#9f1239',
        '--c-subtle': '#be123c',
        '--c-accent': '#881337',
        '--c-gold': '#e11d48',
      },
    },
    ocean: {
      dark: {
        '--c-bg': '#04121a',
        '--c-surface': '#071c28',
        '--c-card': '#0c2738',
        '--c-border': '#133a54',
        '--c-border-hover': '#1e5878',
        '--c-text': '#cffafe',
        '--c-muted': '#22d3ee',
        '--c-subtle': '#06b6d4',
        '--c-accent': '#a5f3fc',
        '--c-gold': '#06b6d4',
      },
      light: {
        '--c-bg': '#ecfeff',
        '--c-surface': '#cffafe',
        '--c-card': '#a5f3fc',
        '--c-border': '#67e8f9',
        '--c-border-hover': '#22d3ee',
        '--c-text': '#083344',
        '--c-muted': '#0e7490',
        '--c-subtle': '#0891b2',
        '--c-accent': '#164e63',
        '--c-gold': '#0284c7',
      },
    },
  };

  return isDark ? themes[preset].dark : themes[preset].light;
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

    // Inject CSS custom properties for the active theme/mode
    const vars = getThemeVars(preset, mode);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

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
