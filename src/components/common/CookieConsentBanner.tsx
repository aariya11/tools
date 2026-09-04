import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sliders, Check, X } from 'lucide-react';
import { useCookieConsent } from '../../context/CookieConsentContext';

export const CookieConsentBanner: React.FC = () => {
  const { isBannerOpen, acceptAll, rejectNonEssential, openPreferencesModal } = useCookieConsent();

  if (!isBannerOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-[var(--c-surface)]/95 backdrop-blur-xl border-t border-[var(--c-border)] shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--c-text)]">
              Your Privacy & Cookie Choices
            </h3>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              We use strictly necessary cookies to operate ToolBoxX and optional cookies to analyze aggregated, anonymous traffic and personalize your preferences. All file processing happens locally in your browser memory and is never uploaded. Review our{' '}
              <Link to="/cookie-policy" className="text-[var(--c-gold)] underline hover:text-[var(--c-text)]">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-[var(--c-gold)] underline hover:text-[var(--c-text)]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
          <button
            onClick={openPreferencesModal}
            className="px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-surface)] text-xs font-semibold text-[var(--c-text)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--c-muted)]" />
            <span>Manage Preferences</span>
          </button>

          <button
            onClick={rejectNonEssential}
            className="px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer shadow-xs"
          >
            Reject Non-Essential
          </button>

          <button
            onClick={acceptAll}
            className="px-5 py-2.5 rounded-xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
