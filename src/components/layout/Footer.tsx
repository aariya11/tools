import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Zap, Sliders, ExternalLink } from 'lucide-react';
import { getToolsByCategory } from '../../data/toolsData';
import { useCookieConsent } from '../../context/CookieConsentContext';

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
  const { openPreferencesModal } = useCookieConsent();

  return (
    <footer className="mt-auto border-t border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-muted)] transition-colors">
      {/* Privacy Architecture Highlight Strip */}
      <div className="border-b border-[var(--c-border)]/70 bg-[var(--c-surface)]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--c-text)]">
                Privacy-First Architecture
              </h4>
              <p className="text-xs text-[var(--c-muted)]">
                Your files are processed locally in your browser and are not uploaded to remote servers.
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info & Mission */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-accent)] flex items-center justify-center">
                <span className="font-serif font-bold text-base text-[var(--c-gold)]">X</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--c-text)]">
                ToolBox<span className="text-[var(--c-gold)]">X</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Free online tools for PDF, images, text, file conversions, and daily productivity. Simple, fast, and privacy-preserving.
            </p>
            <div className="pt-1">
              <a
                href="https://www.instagram.com/__.arunfx.__?igsi=bmtxcGhiOTZ6Nmc3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-muted)] hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[var(--c-surface)] transition-all group shadow-xs"
                aria-label="Instagram profile of __.arunfx.__"
              >
                <InstagramIcon className="w-4 h-4 text-[#E4405F] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Follow @__.arunfx.__</span>
              </a>
            </div>
          </div>

          {/* Col 1: Tools */}
          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
              Tools
            </h5>
            <ul className="space-y-2 text-xs text-[var(--c-muted)]">
              <li>
                <Link to="/pdf-tools" className="hover:text-[var(--c-text)] transition-colors">
                  PDF Tools
                </Link>
              </li>
              <li>
                <Link to="/category/images" className="hover:text-[var(--c-text)] transition-colors">
                  Image Tools
                </Link>
              </li>
              <li>
                <Link to="/category/text" className="hover:text-[var(--c-text)] transition-colors">
                  Text Tools
                </Link>
              </li>
              <li>
                <Link to="/category/developer" className="hover:text-[var(--c-text)] transition-colors">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-[var(--c-gold)] font-bold hover:text-[var(--c-text)] transition-colors">
                  All Tools Directory →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Company */}
          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
              Company
            </h5>
            <ul className="space-y-2 text-xs text-[var(--c-muted)]">
              <li>
                <Link to="/about" className="hover:text-[var(--c-text)] transition-colors">
                  About ToolBoxX
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--c-text)] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
              Legal
            </h5>
            <ul className="space-y-2 text-xs text-[var(--c-muted)]">
              <li>
                <Link to="/privacy-policy" className="hover:text-[var(--c-text)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[var(--c-text)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-[var(--c-text)] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[var(--c-text)] transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="hover:text-[var(--c-text)] transition-colors">
                  DMCA Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-[var(--c-text)] transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <button
                  onClick={openPreferencesModal}
                  className="flex items-center gap-1.5 text-xs text-[var(--c-gold)] hover:text-[var(--c-text)] font-semibold transition-colors cursor-pointer text-left"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Cookie Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] mb-3.5">
              Resources
            </h5>
            <ul className="space-y-2 text-xs text-[var(--c-muted)]">
              <li>
                <Link to="/blog" className="hover:text-[var(--c-text)] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[var(--c-text)] transition-colors">
                  How-To Guides
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[var(--c-text)] transition-colors">
                  FAQ Hub
                </Link>
              </li>
              <li>
                <Link to="/student-tools" className="hover:text-[var(--c-text)] transition-colors">
                  Student Tools
                </Link>
              </li>
              <li>
                <Link to="/productivity-tools" className="hover:text-[var(--c-text)] transition-colors">
                  Productivity Toolkit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and persistent settings */}
        <div className="mt-12 pt-6 border-t border-[var(--c-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--c-subtle)]">
          <p>© 2026 ToolBoxX. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/privacy-policy" className="hover:text-[var(--c-muted)] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-[var(--c-muted)] transition-colors">
              Terms
            </Link>
            <Link to="/cookie-policy" className="hover:text-[var(--c-muted)] transition-colors">
              Cookies
            </Link>
            <button
              onClick={openPreferencesModal}
              className="hover:text-[var(--c-gold)] transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
