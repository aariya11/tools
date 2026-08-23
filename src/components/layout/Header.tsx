import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Image as ImageIcon,
  FileText,
  Type,
  QrCode,
  Grid,
  ShieldCheck,
  Palette,
  Globe,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SearchModal } from '../common/SearchModal';
import { ThemeModal } from '../common/ThemeModal';
import { LanguageModal } from '../common/LanguageModal';

export const Header: React.FC = () => {
  const { mode, toggleMode, currentPresetConfig } = useTheme();
  const { currentLanguage, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Global keydown for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll detection for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 backdrop-blur-md border-b ${
          isScrolled
            ? 'bg-white/95 dark:bg-black/95 border-zinc-200 dark:border-zinc-800 shadow-sm'
            : 'bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none shrink-0"
            aria-label="ToolBoxX Home"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                ToolBox<span className="text-zinc-500 dark:text-zinc-400">X</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                Free
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <Link
              to="/category/images"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-sky-500" />
              <span>{t('nav.imageTools', 'Image Tools')}</span>
            </Link>

            <Link
              to="/pdf-tools"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>{t('nav.pdfTools', 'PDF Tools')}</span>
            </Link>

            <Link
              to="/category/text"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <Type className="w-4 h-4 text-emerald-500" />
              <span>{t('nav.textTools', 'Text Tools')}</span>
            </Link>

            <Link
              to="/qr-code-generator"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <QrCode className="w-4 h-4 text-purple-500" />
              <span>{t('nav.generators', 'Generators')}</span>
            </Link>

            <Link
              to="/all-tools"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <Grid className="w-4 h-4 text-zinc-400" />
              <span>{t('nav.allTools', 'All Tools')}</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs transition-colors"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('nav.search', 'Search tools...')}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Global Language Selector Button */}
            <button
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 text-xs font-semibold transition-colors"
              title="Change language"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs">{currentLanguage.flag}</span>
              <span className="hidden sm:inline uppercase text-[11px] font-mono font-bold">{currentLanguage.code}</span>
            </button>

            {/* Theme Customizer Button */}
            <button
              onClick={() => setIsThemeOpen(true)}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 text-xs font-semibold transition-colors"
              title="Customize theme"
              aria-label="Customize theme"
            >
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              <div
                className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20 hidden sm:block"
                style={{ backgroundColor: currentPresetConfig.accentColor }}
              />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              aria-label={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <div className="space-y-1 font-medium text-sm">
              <Link
                to="/category/images"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <ImageIcon className="w-5 h-5 text-sky-500" />
                <span>{t('nav.imageTools', 'Image Tools')}</span>
              </Link>

              <Link
                to="/pdf-tools"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <FileText className="w-5 h-5 text-rose-500" />
                <span>{t('nav.pdfTools', 'PDF Tools')}</span>
              </Link>

              <Link
                to="/category/text"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Type className="w-5 h-5 text-emerald-500" />
                <span>{t('nav.textTools', 'Text Tools')}</span>
              </Link>

              <Link
                to="/qr-code-generator"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <QrCode className="w-5 h-5 text-purple-500" />
                <span>{t('nav.generators', 'Generators')}</span>
              </Link>

              <Link
                to="/all-tools"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Grid className="w-5 h-5 text-zinc-400" />
                <span>{t('nav.allTools', 'All Tools Directory')}</span>
              </Link>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLangOpen(true); }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag} Language</span>
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsThemeOpen(true); }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <Palette className="w-4 h-4" />
                <span>Theme Style</span>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Link to="/about" className="p-2 hover:text-zinc-900 dark:hover:text-white">About</Link>
              <Link to="/privacy" className="p-2 hover:text-zinc-900 dark:hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="p-2 hover:text-zinc-900 dark:hover:text-white">Terms of Use</Link>
              <Link to="/contact" className="p-2 hover:text-zinc-900 dark:hover:text-white">Contact</Link>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client-Side Privacy: files stay on your device</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Theme Customizer Modal */}
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Global Language Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </>
  );
};
