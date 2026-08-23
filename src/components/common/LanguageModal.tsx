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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                Global Languages
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose your native language ({languages.length} languages supported)
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

        {/* Search Bar & Region Filter */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language name, native script, or region..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              autoFocus
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                  selectedRegion === reg
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
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
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-900 shadow-md ring-2 ring-zinc-500/20'
                      : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xl shrink-0" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div className="truncate text-left">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" />
                  ) : lang.isRtl ? (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                      RTL
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-zinc-400">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No languages found matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                className="mt-3 text-xs text-zinc-900 dark:text-white underline font-bold"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Active: <span className="font-bold text-zinc-900 dark:text-white">{currentLanguage.nativeName}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
