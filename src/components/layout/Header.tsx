import React, { useState, useEffect } from 'react';
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
  Flame,
  GraduationCap,
} from 'lucide-react';
import { SearchModal } from '../common/SearchModal';

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
            ? 'bg-[var(--c-bg)]/90 border-[var(--c-border)] shadow-lg shadow-black/20'
            : 'bg-[var(--c-bg)]/75 border-[var(--c-border)]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo / Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none shrink-0"
            aria-label="ToolBoxX Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-accent)] flex items-center justify-center group-hover:border-[var(--c-gold)]/60 transition-colors shadow-inner">
              <span className="font-serif font-bold text-base text-[var(--c-gold)]">X</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-[var(--c-text)]">
                ToolBox<span className="text-[var(--c-gold)]">X</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[10px] font-mono tracking-widest text-[var(--c-gold)] uppercase bg-[var(--c-card)] px-2 py-0.5 rounded border border-[var(--c-border)]">
                Pro Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium text-[var(--c-muted)]">
            <Link
              to="/pdf-tools"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('pdf')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <FileText className="w-4 h-4 text-[var(--c-gold)]" />
              <span>PDF</span>
            </Link>

            <Link
              to="/category/images"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('image') || location.pathname.includes('png') || location.pathname.includes('jpg')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Images</span>
            </Link>

            <Link
              to="/category/ai"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('ai-') || location.pathname.includes('/category/ai')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
              <span>AI</span>
            </Link>

            <Link
              to="/category/developer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('developer') || location.pathname.includes('json') || location.pathname.includes('jwt') || location.pathname.includes('base64') || location.pathname.includes('regex')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Developer</span>
            </Link>

            <Link
              to="/category/business"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('business') || location.pathname.includes('invoice') || location.pathname.includes('resume') || location.pathname.includes('utm') || location.pathname.includes('barcode')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Briefcase className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Business</span>
            </Link>

            <Link
              to="/category/text"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.includes('text') || location.pathname.includes('word') || location.pathname.includes('case') || location.pathname.includes('clean')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Type className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Text</span>
            </Link>

            <Link
              to="/blog"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.startsWith('/blog')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[var(--c-muted)]" />
              <span>Blog</span>
            </Link>

            <Link
              to="/social"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname.startsWith('/social')
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Flame className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Social Hub</span>
            </Link>

            <Link
              to="/all-tools"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                location.pathname === '/all-tools'
                  ? 'text-[var(--c-text)] bg-[var(--c-card)] border border-[var(--c-border)]'
                  : 'hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/60'
              }`}
            >
              <Grid className="w-4 h-4 text-[var(--c-muted)]" />
              <span>All 60+ Tools</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs transition-all cursor-pointer"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              <span className="hidden md:inline font-medium">Search tools...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--c-muted)] bg-[var(--c-card)] border border-[var(--c-border)] rounded shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] border border-[var(--c-border)] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[var(--c-border)] bg-[var(--c-bg)]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-1 font-medium text-sm">
              <Link
                to="/pdf-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <FileText className="w-5 h-5 text-[var(--c-gold)]" />
                <span>PDF Tools (30+ Utilities)</span>
              </Link>

              <Link
                to="/category/images"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <ImageIcon className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Image Tools</span>
              </Link>

              <Link
                to="/category/ai"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Sparkles className="w-5 h-5 text-[var(--c-gold)]" />
                <span>AI Productivity Suite</span>
              </Link>

              <Link
                to="/category/developer"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Code2 className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Developer Tools (JSON, JWT, Hash)</span>
              </Link>

              <Link
                to="/category/business"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Briefcase className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Business & Marketing Tools</span>
              </Link>

              <Link
                to="/category/text"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Type className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Text & Document Tools</span>
              </Link>

              <Link
                to="/qr-code-generator"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <QrCode className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Utilities & QR</span>
              </Link>

              <Link
                to="/blog"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <BookOpen className="w-5 h-5 text-[var(--c-gold)]" />
                <span>Editorial Blog & Tutorials</span>
              </Link>

              <Link
                to="/social"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Flame className="w-5 h-5 text-[var(--c-gold)]" />
                <span>Social Hub & Creator Studio</span>
              </Link>

              <Link
                to="/student-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <GraduationCap className="w-5 h-5 text-[var(--c-muted)]" />
                <span>Student & Academic Toolkit</span>
              </Link>

              <Link
                to="/all-tools"
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[var(--c-text)] hover:bg-[var(--c-card)] border border-transparent hover:border-[var(--c-border)]"
              >
                <Grid className="w-5 h-5 text-[var(--c-gold)]" />
                <span>All 60+ Tools Catalog</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-[var(--c-border)] grid grid-cols-2 gap-2 text-xs text-[var(--c-muted)]">
              <Link to="/about" className="p-2 hover:text-[var(--c-text)]">About</Link>
              <Link to="/privacy" className="p-2 hover:text-[var(--c-text)]">Privacy Policy</Link>
              <Link to="/terms" className="p-2 hover:text-[var(--c-text)]">Terms of Use</Link>
              <Link to="/contact" className="p-2 hover:text-[var(--c-text)]">Contact</Link>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center gap-2 text-xs text-[var(--c-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client-Side Privacy: files never leave your device</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
