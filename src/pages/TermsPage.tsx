import React from 'react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Terms of Service"
        description="Terms and conditions for utilizing ToolBoxX online utility platform."
        canonicalPath="/terms"
      />

      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

      <div className="text-center space-y-4 my-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Effective date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8 text-[var(--c-muted)] text-sm sm:text-base leading-relaxed">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using ToolBoxX (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the website.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Permitted Use
          </h2>
          <p>
            ToolBoxX provides client-side utilities for personal, educational, commercial, and developer use. You agree not to:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Attempt to interfere with or disrupt the operation of the website.</li>
            <li>Use the tools for any illegal purpose or to generate infringing or unlawful content.</li>
            <li>Attempt to reverse-engineer unauthorized parts of the platform or overload public bandwidth.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. Disclaimer of Warranties
          </h2>
          <p>
            ToolBoxX is provided on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied. While we strive for absolute accuracy and high performance in all tool computations, we do not guarantee uninterrupted availability or error-free outputs.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall ToolBoxX or its contributors be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the services.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            5. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Continued use of ToolBoxX constitutes acceptance of any updated terms.
          </p>
        </section>
      </div>
    </div>
  );
};
