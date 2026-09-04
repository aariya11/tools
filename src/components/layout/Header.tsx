import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Image as ImageIcon,
  FileText,
  Type,
  QrCode,
  Grid,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Code2,
  BookOpen,
  ArrowLeftRight,
  ChevronDown,
  Minimize2,
  Globe,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { SearchModal } from '../common/SearchModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageModal } from '../common/LanguageModal';
import { useLanguage } from '../../context/LanguageContext';

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const { currentLanguage } = useLanguage();

  // Close mobile menu & dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreDropdownOpen(false);
  }, [location.pathname]);

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close More Tools dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
    };
    if (isMoreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreDropdownOpen]);

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-[var(--c-bg)]/90 backdrop-blur-xl border-[var(--c-border)] shadow-md shadow-black/10'
            : 'bg-[var(--c-bg)]/80 backdrop-blur-md border-[var(--c-border)]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo / Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none shrink-0"
            aria-label="ToolBoxX — Free Online Tools for PDF, Images, Text & More"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-accent)] flex items-center justify-center group-hover:border-[var(--c-gold)]/60 transition-colors shadow-inner">
              <span className="font-serif font-bold text-base text-[var(--c-gold)]">X</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-[var(--c-text)]">
                ToolBox<span className="text-[var(--c-gold)]">X</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-[var(--c-muted)]">
            {/* 1. PDF Tools */}
            <Link
              to="/pdf-tools"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('pdf')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)] font-semibold'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <FileText className="w-4 h-4 text-[var(--c-gold)]" />
              <span>PDF Tools</span>
            </Link>

            {/* 2. Image Tools */}
            <Link
              to="/category/images"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('image') || location.pathname.includes('png') || location.pathname.includes('jpg') || location.pathname.includes('webp')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)] font-semibold'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Image Tools</span>
            </Link>

            {/* 3. Text Tools */}
            <Link
              to="/category/text"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('text') || location.pathname.includes('word') || location.pathname.includes('case') || location.pathname.includes('diff') || location.pathname.includes('lorem')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)] font-semibold'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Type className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Text Tools</span>
            </Link>

            {/* 4. Converters */}
            <Link
              to="/unit-converter"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('converter') || location.pathname.includes('calculator')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)] font-semibold'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Converters</span>
            </Link>

            {/* 5. Compress */}
            <Link
              to="/pdf-compress"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname === '/pdf-compress' || location.pathname === '/image-compressor'
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)] font-semibold'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Minimize2 className="w-4 h-4 text-emerald-400" />
              <span>Compress</span>
            </Link>

            {/* 6. More Tools (Dropdown) */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  isMoreDropdownOpen
                    ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                    : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
                }`}
                aria-expanded={isMoreDropdownOpen}
                aria-haspopup="true"
              >
                <span>More Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 py-2 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--c-subtle)]">
                    Directories & Suites
                  </div>
                  <Link
                    to="/category/developer"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>Developer Utilities</span>
                  </Link>
                  <Link
                    to="/category/generators"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>Generators (QR, Password)</span>
                  </Link>
                  <Link
                    to="/category/ai"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
                    <span>AI Productivity Suite</span>
                  </Link>
                  <Link
                    to="/category/business"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>Business & Marketing</span>
                  </Link>

                  <div className="my-1.5 border-t border-[var(--c-border)]" />
                  
                  <Link
                    to="/tools"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-gold)] font-bold hover:bg-[var(--c-card)] transition-colors"
                  >
                    <Grid className="w-4 h-4" />
                    <span>All Tools Directory</span>
                  </Link>
                  <Link
                    to="/guides"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <Compass className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>How-To Guides</span>
                  </Link>
                  <Link
                    to="/faq"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>FAQ Hub</span>
                  </Link>
                  <Link
                    to="/blog"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[var(--c-muted)]" />
                    <span>Editorial Blog</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls: Search, Theme Toggle, Language Selector */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs transition-all cursor-pointer shadow-xs"
              aria-label="Search tools (Press Command K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              <span className="hidden md:inline font-medium">Search tools...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--c-muted)] bg-[var(--c-card)] border border-[var(--c-border)] rounded shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Desktop Theme Toggle (Dropdown support) */}
            <div className="hidden sm:block">
              <ThemeToggle showDropdown={true} />
            </div>

            {/* Language Selector Button */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer shadow-xs"
              aria-label="Select website language"
              title={`Language: ${currentLanguage.name}`}
            >
              <Globe className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              <span className="uppercase text-[11px] font-mono">{currentLanguage.code}</span>
            </button>

            {/* Mobile Menu & Theme Toggle (Quick cycle) */}
            <div className="sm:hidden flex items-center gap-1.5">
              <ThemeToggle showDropdown={false} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] border border-[var(--c-border)] transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[var(--c-text)]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[var(--c-border)] bg-[var(--c-bg)]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 shadow-2xl">
            <div className="space-y-1 font-medium text-sm">
              <Link
                to="/pdf-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <FileText className="w-5 h-5 text-[var(--c-gold)]" />
                <span>PDF Tools</span>
              </Link>

              <Link
                to="/category/images"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <ImageIcon className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Image Tools</span>
              </Link>

              <Link
                to="/category/text"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Type className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Text Tools</span>
              </Link>

              <Link
                to="/unit-converter"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <ArrowLeftRight className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Converters & Math</span>
              </Link>

              <Link
                to="/pdf-compress"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Minimize2 className="w-5 h-5 text-emerald-400" />
                <span>Compress (PDF & Images)</span>
              </Link>

              <Link
                to="/category/developer"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Code2 className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Developer Tools</span>
              </Link>

              <Link
                to="/category/generators"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <QrCode className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Generators</span>
              </Link>

              <Link
                to="/guides"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Compass className="w-5 h-5 text-[var(--c-muted)]" />
                <span>How-To Guides</span>
              </Link>

              <Link
                to="/faq"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <HelpCircle className="w-5 h-5 text-[var(--c-muted)]" />
                <span>FAQ Hub</span>
              </Link>

              <Link
                to="/tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)] font-bold text-[var(--c-gold)]"
              >
                <Grid className="w-5 h-5" />
                <span>Explore All Tools</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-[var(--c-border)] grid grid-cols-2 gap-2 text-xs text-[var(--c-muted)]">
              <Link to="/about" className="p-2 hover:text-[var(--c-text)]">About</Link>
              <Link to="/contact" className="p-2 hover:text-[var(--c-text)]">Contact</Link>
              <Link to="/privacy-policy" className="p-2 hover:text-[var(--c-text)]">Privacy Policy</Link>
              <Link to="/terms" className="p-2 hover:text-[var(--c-text)]">Terms of Service</Link>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center gap-2 text-xs text-[var(--c-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client-Side Privacy: files never leave your browser</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Language Selector Modal */}
      <LanguageModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />
    </>
  );
};
