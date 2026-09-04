import React, { useState } from 'react';
import { X, Check, ShieldCheck, Sliders, Lock } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from '../../context/CookieConsentContext';
import { showToast } from './Toast';

export const CookiePreferencesModal: React.FC = () => {
  const { isPreferencesModalOpen, closePreferencesModal, preferences, savePreferences, acceptAll, rejectNonEssential } = useCookieConsent();

  const [form, setForm] = useState<CookiePreferences>(preferences);

  // Sync state when modal opens
  React.useEffect(() => {
    setForm(preferences);
  }, [preferences, isPreferencesModalOpen]);

  if (!isPreferencesModalOpen) return null;

  const handleSave = () => {
    savePreferences(form);
    showToast('Cookie preferences updated successfully.', 'success');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closePreferencesModal}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-[var(--c-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--c-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cookie-preferences-title" className="text-lg font-bold font-serif">
                Cookie Preferences
              </h2>
              <p className="text-xs text-[var(--c-muted)]">
                Control how cookies and tracking identifiers are used on ToolBoxX.
              </p>
            </div>
          </div>
          <button
            onClick={closePreferencesModal}
            className="p-2 rounded-xl text-[var(--c-subtle)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
            aria-label="Close cookie preferences modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto divide-y divide-[var(--c-border)]">
          {/* Necessary Cookies */}
          <div className="pt-2 first:pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">Strictly Necessary Cookies</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--c-card)] text-emerald-400 border border-[var(--c-border)]">
                Always Active
              </span>
            </div>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Essential for the site to function properly, maintaining security, theme mode preference, session stability, and storing your consent choices.
            </p>
          </div>

          {/* Functional Cookies */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Functional Cookies</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.functional}
                  onChange={(e) => setForm({ ...form, functional: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--c-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--c-gold)]"></div>
              </label>
            </div>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Allow ToolBoxX to remember your personalized tool settings, recently used tool shortcuts, and custom tool preferences.
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Analytics & Performance</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.analytics}
                  onChange={(e) => setForm({ ...form, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--c-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--c-gold)]"></div>
              </label>
            </div>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Help us understand aggregate site usage, popular tools, and technical error rates so we can optimize load times. No personal data or file content is ever collected.
            </p>
          </div>

          {/* Advertising Cookies */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Advertising & Marketing</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.advertising}
                  onChange={(e) => setForm({ ...form, advertising: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--c-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--c-gold)]"></div>
              </label>
            </div>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Used if optional non-intrusive sponsorships or advertising partners are enabled to measure campaign performance without profiling your documents.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--c-border)] bg-[var(--c-surface)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={rejectNonEssential}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
            >
              Reject All
            </button>
            <button
              onClick={acceptAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
