import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
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

  // Scroll detection for sticky header state
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
        className={`sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-xl border-b ${
          isScrolled
            ? 'bg-[#11110F]/90 dark:bg-[#11110F]/90 border-[#2A2824] shadow-lg shadow-black/20'
            : 'bg-[#11110F]/75 dark:bg-[#11110F]/75 border-[#2A2824]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo / Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none shrink-0"
            aria-label="ToolBoxX Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1B1A17] border border-[#2A2824] text-[#E8DFCF] flex items-center justify-center group-hover:border-[#B79B70]/60 transition-colors shadow-inner">
              <span className="font-serif font-bold text-base text-[#B79B70]">X</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-[#F5F1E8]">
                ToolBox<span className="text-[#B79B70]">X</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[10px] font-mono tracking-widest text-[#B79B70] uppercase bg-[#1B1A17] px-2 py-0.5 rounded border border-[#2A2824]">
                Pro Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-[#B8B2A7]">
            <Link
              to="/pdf-tools"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('pdf')
                  ? 'text-[#F5F1E8] bg-[#1B1A17] border border-[#2A2824]'
                  : 'hover:text-[#F5F1E8] hover:bg-[#1B1A17]/60'
              }`}
            >
              <FileText className="w-4 h-4 text-[#B79B70]" />
              <span>{t('nav.pdfTools', 'PDF Tools')}</span>
            </Link>

            <Link
              to="/category/images"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('images') || location.pathname.includes('image') || location.pathname.includes('png') || location.pathname.includes('jpg')
                  ? 'text-[#F5F1E8] bg-[#1B1A17] border border-[#2A2824]'
                  : 'hover:text-[#F5F1E8] hover:bg-[#1B1A17]/60'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#B8B2A7]" />
              <span>{t('nav.imageTools', 'Image Tools')}</span>
            </Link>

            <Link
              to="/category/text"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('text') || location.pathname.includes('word') || location.pathname.includes('case')
                  ? 'text-[#F5F1E8] bg-[#1B1A17] border border-[#2A2824]'
                  : 'hover:text-[#F5F1E8] hover:bg-[#1B1A17]/60'
              }`}
            >
              <Type className="w-4 h-4 text-[#B8B2A7]" />
              <span>{t('nav.textTools', 'Text Tools')}</span>
            </Link>

            <Link
              to="/qr-code-generator"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('qr')
                  ? 'text-[#F5F1E8] bg-[#1B1A17] border border-[#2A2824]'
                  : 'hover:text-[#F5F1E8] hover:bg-[#1B1A17]/60'
              }`}
            >
              <QrCode className="w-4 h-4 text-[#B8B2A7]" />
              <span>{t('nav.generators', 'Utilities')}</span>
            </Link>

            <Link
              to="/all-tools"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-150 ${
                location.pathname === '/all-tools'
                  ? 'text-[#F5F1E8] bg-[#1B1A17] border border-[#2A2824]'
                  : 'hover:text-[#F5F1E8] hover:bg-[#1B1A17]/60'
              }`}
            >
              <Grid className="w-4 h-4 text-[#B8B2A7]" />
              <span>{t('nav.allTools', 'All Tools')}</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#2A2824] bg-[#161513] hover:border-[#3D3A34] text-[#B8B2A7] hover:text-[#F5F1E8] text-xs transition-all"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5 text-[#B79B70]" />
              <span className="hidden md:inline font-medium">{t('nav.search', 'Search tools...')}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#B8B2A7] bg-[#1B1A17] border border-[#2A2824] rounded shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Global Language Selector */}
            <button
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#2A2824] bg-[#161513] text-[#B8B2A7] hover:text-[#F5F1E8] hover:border-[#3D3A34] text-xs font-semibold transition-all"
              title="Change language"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-[#B8B2A7]" />
              <span className="text-xs">{currentLanguage.flag}</span>
              <span className="hidden sm:inline uppercase text-[11px] font-mono font-bold">{currentLanguage.code}</span>
            </button>

            {/* Theme Customizer */}
            <button
              onClick={() => setIsThemeOpen(true)}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-xl border border-[#2A2824] bg-[#161513] text-[#B8B2A7] hover:text-[#F5F1E8] hover:border-[#3D3A34] text-xs font-semibold transition-all"
              title="Customize theme atmosphere"
              aria-label="Customize theme"
            >
              <Palette className="w-3.5 h-3.5 text-[#B79B70]" />
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/20 hidden sm:block"
                style={{ backgroundColor: currentPresetConfig.accentColor }}
              />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-xl text-[#B8B2A7] hover:text-[#F5F1E8] hover:bg-[#1B1A17] transition-colors border border-transparent hover:border-[#2A2824]"
              aria-label={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mode === 'dark' ? <Sun className="w-4 h-4 text-[#B79B70]" /> : <Moon className="w-4 h-4 text-[#F5F1E8]" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#B8B2A7] hover:text-[#F5F1E8] hover:bg-[#1B1A17] border border-[#2A2824] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[#2A2824] bg-[#11110F]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-1 font-medium text-sm">
              <Link
                to="/pdf-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#F5F1E8] hover:bg-[#1B1A17] border border-transparent hover:border-[#2A2824]"
              >
                <FileText className="w-5 h-5 text-[#B79B70]" />
                <span>{t('nav.pdfTools', 'PDF Tools (30+ Utilities)')}</span>
              </Link>

              <Link
                to="/category/images"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#F5F1E8] hover:bg-[#1B1A17] border border-transparent hover:border-[#2A2824]"
              >
                <ImageIcon className="w-5 h-5 text-[#B8B2A7]" />
                <span>{t('nav.imageTools', 'Image Tools')}</span>
              </Link>

              <Link
                to="/category/text"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#F5F1E8] hover:bg-[#1B1A17] border border-transparent hover:border-[#2A2824]"
              >
                <Type className="w-5 h-5 text-[#B8B2A7]" />
                <span>{t('nav.textTools', 'Text Tools')}</span>
              </Link>

              <Link
                to="/qr-code-generator"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#F5F1E8] hover:bg-[#1B1A17] border border-transparent hover:border-[#2A2824]"
              >
                <QrCode className="w-5 h-5 text-[#B8B2A7]" />
                <span>{t('nav.generators', 'Utilities & QR')}</span>
              </Link>

              <Link
                to="/all-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#F5F1E8] hover:bg-[#1B1A17] border border-transparent hover:border-[#2A2824]"
              >
                <Grid className="w-5 h-5 text-[#B79B70]" />
                <span>{t('nav.allTools', 'All Tools Catalog')}</span>
              </Link>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLangOpen(true); }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#2A2824] bg-[#161513] text-xs font-semibold text-[#F5F1E8]"
              >
                <Globe className="w-4 h-4 text-[#B79B70]" />
                <span>{currentLanguage.flag} Language</span>
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsThemeOpen(true); }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#2A2824] bg-[#161513] text-xs font-semibold text-[#F5F1E8]"
              >
                <Palette className="w-4 h-4 text-[#B79B70]" />
                <span>Atmosphere</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#2A2824] grid grid-cols-2 gap-2 text-xs text-[#B8B2A7]">
              <Link to="/about" className="p-2 hover:text-[#F5F1E8]">About</Link>
              <Link to="/privacy" className="p-2 hover:text-[#F5F1E8]">Privacy Policy</Link>
              <Link to="/terms" className="p-2 hover:text-[#F5F1E8]">Terms of Use</Link>
              <Link to="/contact" className="p-2 hover:text-[#F5F1E8]">Contact</Link>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-[#161513] border border-[#2A2824] flex items-center gap-2 text-xs text-[#B8B2A7]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client-Side Privacy: files never leave your device</span>
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
