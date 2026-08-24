import React, { useState, useMemo } from 'react';
import { X, Search, Globe, Check } from 'lucide-react';
import { useLanguage, type LanguageOption } from '../../context/LanguageContext';
import { showToast } from './Toast';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = useMemo(() => {
    const set = new Set<string>();
    languages.forEach(l => set.add(l.region));
    return ['All', ...Array.from(set)];
  }, [languages]);

  const filteredLanguages = useMemo(() => {
    return languages.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'All' || l.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [languages, searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: LanguageOption) => {
    setLanguage(lang.code);
    showToast({
      type: 'success',
      title: 'Language Selected',
      message: `Interface language set to ${lang.nativeName} (${lang.name})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--c-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[var(--c-text)]">
                Global Languages
              </h3>
              <p className="text-xs text-[var(--c-muted)]">
                Choose your preferred interface language ({languages.length} supported)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--c-subtle)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Region Filter */}
        <div className="p-4 border-b border-[var(--c-border)] bg-[var(--c-bg)]/60 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language name, native script, or region..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:border-[var(--c-gold)] focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
              autoFocus
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)] font-bold'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-[var(--c-gold)] bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                      : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)] hover:bg-[var(--c-card)]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xl shrink-0" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div className="truncate text-left">
                      <div className="text-xs font-bold text-[var(--c-text)] truncate">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-[var(--c-muted)] truncate">
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-[var(--c-gold)] shrink-0" />
                  ) : lang.isRtl ? (
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] shrink-0">
                      RTL
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-[var(--c-subtle)]">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--c-gold)]" />
              <p className="text-sm font-semibold text-[var(--c-muted)]">No languages found matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                className="mt-3 text-xs text-[var(--c-gold)] hover:underline font-bold"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--c-border)] bg-[var(--c-bg)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--c-muted)]">
            Active: <span className="font-bold text-[var(--c-text)]">{currentLanguage.nativeName}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] font-bold text-xs hover:bg-[var(--c-gold)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
