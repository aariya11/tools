import React from 'react';
import { ShieldCheck, Cookie, Sliders, Lock, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { useCookieConsent } from '../context/CookieConsentContext';

export const CookiePolicyPage: React.FC = () => {
  const { openPreferencesModal } = useCookieConsent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Cookie Policy — ToolBoxX Privacy & Consent Architecture"
        description="Learn how ToolBoxX uses cookies and local storage. Configure your cookie preferences anytime."
        canonicalPath="/cookie-policy"
      />

      <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
          <Cookie className="w-4 h-4" />
          <span>Transparency & Choice</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Cookie Policy
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Last updated: September 4, 2026
        </p>
      </div>

      {/* Interactive Preferences Banner */}
      <div className="bg-[var(--c-surface)] p-8 sm:p-10 rounded-3xl border border-[var(--c-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)] flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[var(--c-gold)]" />
            Manage Your Cookie Preferences
          </h2>
          <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
            You can modify, review, or withdraw your cookie consent choices at any time directly in your browser.
          </p>
        </div>
        <button
          onClick={openPreferencesModal}
          className="px-6 py-3 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shrink-0"
        >
          Open Cookie Settings
        </button>
      </div>

      <div className="space-y-8 leading-relaxed text-[var(--c-muted)] text-sm sm:text-base">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies and HTML5 Local Storage are compact text fragments and key-value entries stored directly by your browser on your device. They enable web applications to remember user preferences across sessions, maintain security, and optimize performance.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-4">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Categories of Cookies Used by ToolBoxX
          </h2>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--c-text)] text-sm">Strictly Necessary Cookies</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Always Active</span>
              </div>
              <p className="text-[var(--c-muted)] leading-relaxed">
                Required for core website functionality, maintaining your active visual theme (light, dark, or system), preserving your cookie consent state, and ensuring security. These cannot be disabled.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <span className="font-bold text-[var(--c-text)] text-sm block">Functional Cookies</span>
              <p className="text-[var(--c-muted)] leading-relaxed">
                Allow ToolBoxX to remember optional tool parameters, such as recently accessed utilities, default unit types, or formatting choices for a smoother workflow.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <span className="font-bold text-[var(--c-text)] text-sm block">Analytics Cookies (Consent-Gated)</span>
              <p className="text-[var(--c-muted)] leading-relaxed">
                Measure aggregate, anonymized technical telemetry such as page load speed, error occurrences, and overall feature usage. They do not record document text or user identities. Gated strictly behind your consent.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <span className="font-bold text-[var(--c-text)] text-sm block">Advertising & Marketing (Optional)</span>
              <p className="text-[var(--c-muted)] leading-relaxed">
                May be used in the future if non-intrusive sponsorships are displayed to support free hosting infrastructure without compromising your document privacy.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. Browser-Level Cookie Control
          </h2>
          <p>
            In addition to our on-site settings panel, you can configure your browser to block or delete cookies at any time via your browser settings (Chrome, Firefox, Safari, Edge). Please note that blocking essential cookies may prevent theme preferences from persisting.
          </p>
        </section>
      </div>
    </div>
  );
};
