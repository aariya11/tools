import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Lock, Zap, ExternalLink } from 'lucide-react';
import { getToolsByCategory } from '../../data/toolsData';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Footer: React.FC = () => {
  const pdfTools = getToolsByCategory('pdf');
  const imageTools = getToolsByCategory('images');
  const textTools = getToolsByCategory('text');
  const calcTools = getToolsByCategory('calculators');
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

            <div className="flex items-center gap-3 text-xs text-[var(--c-muted)] font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]">
                <Lock className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>Zero Server Uploads</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]">
                <Zap className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>Client-Side Speed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Multi-Column Directory */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">
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
                Free online tools for PDF editing, image compression, file conversions, and digital productivity. 100% private, fast, and browser-based.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[var(--c-subtle)]">
                <span>68+ Free Tools</span>
                <span>•</span>
                <span>Zero File Uploads</span>
                <span>•</span>
                <span>No Accounts</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://www.instagram.com/__.arunfx.__?igsi=bmtxcGhiOTZ6Nmc3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-muted)] hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[var(--c-surface)] transition-all group shadow-xs"
                  aria-label="Instagram @__.arunfx.__"
                >
                  <InstagramIcon className="w-4 h-4 text-[#E4405F] group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Follow @__.arunfx.__</span>
                </a>
              </div>
            </div>

            {/* Col 2: PDF Tools */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                PDF Tools
              </h5>
              <ul className="space-y-2 text-xs text-[var(--c-muted)]">
                <li>
                  <Link to="/pdf-tools" className="text-[var(--c-gold)] font-bold hover:text-[var(--c-text)] transition-colors">
                    All PDF Tools (30+) →
                  </Link>
                </li>
                {pdfTools.filter((t) => t.id !== 'pdf-tools').slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link to={t.path} className="hover:text-[var(--c-text)] transition-colors">
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
              <ul className="space-y-2 text-xs text-[var(--c-muted)]">
                <li>
                  <Link to="/category/images" className="text-[var(--c-gold)] font-bold hover:text-[var(--c-text)] transition-colors">
                    All Image Tools →
                  </Link>
                </li>
                {imageTools.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link to={t.path} className="hover:text-[var(--c-text)] transition-colors">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Converters & Text */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                Converters & Text
              </h5>
              <ul className="space-y-2 text-xs text-[var(--c-muted)]">
                <li>
                  <Link to="/unit-converter" className="text-[var(--c-gold)] font-bold hover:text-[var(--c-text)] transition-colors">
                    Unit Converter
                  </Link>
                </li>
                <li>
                  <Link to="/percentage-calculator" className="hover:text-[var(--c-text)] transition-colors">
                    Percentage Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/word-counter" className="hover:text-[var(--c-text)] transition-colors">
                    Word Counter
                  </Link>
                </li>
                <li>
                  <Link to="/text-diff" className="hover:text-[var(--c-text)] transition-colors">
                    Text Diff Checker
                  </Link>
                </li>
                <li>
                  <Link to="/case-converter" className="hover:text-[var(--c-text)] transition-colors">
                    Case Converter
                  </Link>
                </li>
                <li>
                  <Link to="/category/text" className="text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors">
                    More Text Tools →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Company & Legal */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
                Company & Legal
              </h5>
              <ul className="space-y-2 text-xs text-[var(--c-muted)]">
                <li>
                  <Link to="/about" className="hover:text-[var(--c-text)] transition-colors">
                    About ToolBoxX
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-[var(--c-text)] transition-colors">
                    Editorial Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[var(--c-text)] transition-colors">
                    Contact Support
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
                  <Link to="/all-tools" className="text-[var(--c-gold)] font-bold hover:text-[var(--c-text)] transition-colors">
                    All Tools Directory
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links Row */}
          <div className="mt-10 pt-6 border-t border-[var(--c-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-[var(--c-subtle)]">
              <span>Connect with ToolBoxX:</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--c-muted)] font-medium">
              <a
                href="https://www.instagram.com/__.arunfx.__?igsi=bmtxcGhiOTZ6Nmc3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E4405F] transition-colors flex items-center gap-1.5"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--c-text)] transition-colors flex items-center gap-1"
              >
                <span>X (Twitter)</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--c-text)] transition-colors flex items-center gap-1"
              >
                <span>LinkedIn</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--c-text)] transition-colors flex items-center gap-1"
              >
                <span>YouTube</span>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--c-text)] transition-colors flex items-center gap-1"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="mt-6 pt-6 border-t border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--c-subtle)]">
            <p>© 2026 ToolBoxX. All rights reserved. Free Online Tools That Just Work.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-[var(--c-muted)] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[var(--c-muted)] transition-colors">Terms of Service</Link>
              <Link to="/all-tools" className="hover:text-[var(--c-muted)] transition-colors">All 68+ Tools</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
