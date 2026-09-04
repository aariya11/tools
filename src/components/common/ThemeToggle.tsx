import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../context/ThemeContext';

interface ThemeToggleProps {
  showDropdown?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showDropdown = false, className = '' }) => {
  const { preference, mode, setPreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options: { id: ThemePreference; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  // If simple toggle without dropdown requested
  if (!showDropdown) {
    const handleQuickCycle = () => {
      if (preference === 'dark') setPreference('light');
      else if (preference === 'light') setPreference('system');
      else setPreference('dark');
    };

    return (
      <button
        onClick={handleQuickCycle}
        className={`p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer flex items-center gap-1.5 ${className}`}
        aria-label={`Theme: ${preference} mode. Click to cycle.`}
        title={`Current: ${preference} (Click to change)`}
      >
        {preference === 'system' ? (
          <Monitor className="w-4 h-4 text-[var(--c-gold)]" />
        ) : mode === 'dark' ? (
          <Moon className="w-4 h-4 text-[var(--c-gold)]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  // Dropdown selector mode
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-xs font-medium text-[var(--c-text)] transition-colors cursor-pointer shadow-xs"
        aria-label="Select theme mode"
        aria-expanded={isOpen}
      >
        {preference === 'system' ? (
          <Monitor className="w-3.5 h-3.5 text-[var(--c-gold)]" />
        ) : mode === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-[var(--c-gold)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="capitalize hidden sm:inline">{preference}</span>
        <ChevronDown className="w-3 h-3 text-[var(--c-muted)] opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preference === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setPreference(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--c-gold)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
