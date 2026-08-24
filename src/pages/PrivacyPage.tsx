import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Privacy Policy — 100% Client-Side Privacy Guarantee"
        description="ToolBoxX processes files and text locally on your device. We do not store, view, or transmit your private files to remote servers."
        canonicalPath="/privacy"
      />

      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-[var(--c-surface)] p-8 sm:p-10 rounded-3xl border border-[var(--c-border)] space-y-4 shadow-xl">
        <h2 className="text-xl font-bold font-serif text-[var(--c-text)] flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-emerald-400" />
          The Core ToolBoxX Commitment
        </h2>
        <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed font-normal">
          <strong className="text-[var(--c-text)]">"Your files stay on your device."</strong> All image compression, image resizing, format conversions, PDF merging, splitting, extraction, editing, calculation, and code generation are executed entirely within your browser memory.
        </p>
      </div>

      <div className="space-y-8 leading-relaxed text-[var(--c-muted)] text-sm sm:text-base">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            1. How Your Files Are Processed
          </h2>
          <p>
            When you select or drop a file (JPEG, PNG, WebP, PDF, CSV, ZIP) or type text into any ToolBoxX tool, the file is read using the HTML5 File API and processed locally by client-side WebAssembly, JavaScript, and Canvas rendering engines.
          </p>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li>No file contents are uploaded to our backend servers.</li>
            <li>No files are written to permanent cloud databases.</li>
            <li>Once you download your output or close your browser tab, all temporary memory is automatically garbage collected.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Information We Do NOT Collect
          </h2>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li>We do not collect names, email addresses, or phone numbers unless you voluntarily contact us via our support form.</li>
            <li>We do not record the contents of your text, PDFs, or photos.</li>
            <li>We do not sell, rent, or monetize your personal files or personal data to third parties.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. Web Analytics & Privacy
          </h2>
          <p>
            We prioritize user privacy above all else. ToolBoxX does not use invasive tracking cookies or cross-site tracking pixels. Local tool preferences (such as theme and language selection) are stored only on your own device in HTML5 localStorage.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            4. Contacting Us
          </h2>
          <p>
            If you have questions about our privacy architecture or have feedback, please reach out through our <a href="/contact" className="text-[var(--c-gold)] underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
