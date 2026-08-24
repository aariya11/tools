import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Palette, Globe, ArrowUpRight } from 'lucide-react';
import { getToolsByCategory } from '../../data/toolsData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeModal } from '../common/ThemeModal';
import { LanguageModal } from '../common/LanguageModal';

export const Footer: React.FC = () => {
  const { currentPresetConfig } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const imageTools = getToolsByCategory('images');
  const pdfTools = getToolsByCategory('pdf');
  const textTools = getToolsByCategory('text');
  const generatorTools = getToolsByCategory('generators');

  return (
    <>
      <footer className="mt-auto border-t border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-muted)] transition-colors">
        {/* Privacy Architecture Highlight Strip */}
        <div className="border-b border-[var(--c-border)]/70 bg-[var(--c-surface)]/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--c-text)]">
                  Privacy First Architecture
                </h4>
                <p className="text-xs text-[var(--c-muted)]">
                  Your files stay private. Processed 100% locally in your browser with zero cloud storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLangOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>{currentLanguage.flag} {currentLanguage.nativeName}</span>
              </button>

              <button
                onClick={() => setIsThemeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-colors cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>Theme: {currentPresetConfig.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Multi-Column Directory */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Col 1: Brand Wordmark & Mission */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-accent)] flex items-center justify-center">
                  <span className="font-serif font-bold text-base text-[var(--c-gold)]">X</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-[var(--c-text)]">
                  ToolBox<span className="text-[var(--c-gold)]">X</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--c-muted)] max-w-sm leading-relaxed font-normal">
                Simple online tools for everyday digital tasks. High-performance browser utilities for PDFs, images, text, and productivity.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[var(--c-subtle)]">
                <span>100% Free</span>
                <span>•</span>
                <span>Zero File Uploads</span>
                <span>•</span>
                <span>No Accounts</span>
              </div>
            </div>

            {/* Col 2: PDF Tools */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                PDF Tools
              </h5>
              <ul className="space-y-2.5 text-xs text-[var(--c-muted)]">
                <li>
                  <Link
                    to="/pdf-tools"
                    className="font-bold text-[var(--c-accent)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1"
                  >
                    PDF Hub (30 Tools) <ArrowUpRight className="w-3 h-3 text-[var(--c-gold)]" />
                  </Link>
                </li>
                {pdfTools.filter(t => t.id !== 'pdf-tools').slice(0, 7).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[var(--c-text)] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Image Tools */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                Image Tools
              </h5>
              <ul className="space-y-2.5 text-xs text-[var(--c-muted)]">
                {imageTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[var(--c-text)] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Text & Utilities */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                Text & Utilities
              </h5>
              <ul className="space-y-2.5 text-xs text-[var(--c-muted)]">
                {textTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[var(--c-text)] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                {generatorTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[var(--c-text)] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-[var(--c-border)]/60">
                  <Link to="/about" className="hover:text-[var(--c-text)] transition-colors">
                    About ToolBoxX
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[var(--c-text)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[var(--c-text)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[var(--c-text)] transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--c-subtle)]">
            <p>© {new Date().getFullYear()} ToolBoxX. All rights reserved. Built for private, fast productivity.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-[var(--c-muted)] transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-[var(--c-muted)] transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-[var(--c-muted)] transition-colors">Contact</Link>
              <Link to="/all-tools" className="hover:text-[var(--c-muted)] transition-colors">All Tools</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Theme Modal */}
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Language Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </>
  );
};
