import React from 'react';
import { Eye, CheckCircle2, Keyboard, Monitor, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Accessibility Statement — WCAG 2.2 AA Compliance | ToolBoxX"
        description="ToolBoxX accessibility statement, keyboard navigation standards, screen reader compatibility, and WCAG 2.2 AA conformance."
        canonicalPath="/accessibility"
      />

      <Breadcrumbs items={[{ label: 'Accessibility' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Eye className="w-4 h-4" />
          <span>Universal Access</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Accessibility Statement
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Last updated: September 4, 2026
        </p>
      </div>

      <div className="space-y-8 leading-relaxed text-[var(--c-muted)] text-sm sm:text-base">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            Our Commitment to Universal Accessibility
          </h2>
          <p>
            ToolBoxX is dedicated to making online productivity utilities universally accessible to everyone, including individuals with visual, auditory, motor, and cognitive disabilities. We target the standards outlined in the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-4">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            Implemented Accessibility Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--c-text)]">
                <Keyboard className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Full Keyboard Navigation</span>
              </div>
              <p className="text-[var(--c-muted)]">
                All buttons, sliders, modals, search inputs, and file download actions are reachable and triggerable via standard keyboard Tab, Shift+Tab, Enter, and Escape keys.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--c-text)]">
                <Eye className="w-4 h-4 text-[var(--c-gold)]" />
                <span>High Color Contrast</span>
              </div>
              <p className="text-[var(--c-muted)]">
                Text and interactive elements meet or exceed the minimum 4.5:1 contrast ratio against both light and dark backgrounds.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--c-text)]">
                <Monitor className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Screen Reader Support</span>
              </div>
              <p className="text-[var(--c-muted)]">
                Semantic HTML landmarks (`header`, `nav`, `main`, `section`, `footer`), descriptive `aria-label` tags, and accessible dialog roles are used throughout.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--c-text)]">
                <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Reduced Motion Friendly</span>
              </div>
              <p className="text-[var(--c-muted)]">
                We respect operating system `prefers-reduced-motion` settings and suppress non-essential animations for users sensitive to motion.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            Feedback & Assistance
          </h2>
          <p>
            If you encounter any barrier while using any tool on ToolBoxX or require assistance in an alternative format, please reach out via our Contact Page. We welcome your feedback to continuously improve our platform.
          </p>
        </section>
      </div>
    </div>
  );
};
