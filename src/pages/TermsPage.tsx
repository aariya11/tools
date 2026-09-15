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
            1. Acceptance of Terms & Operator Identification
          </h2>
          <p>
            By accessing or using ToolBoxX (the "Service"), operated by <strong>TOOLBOXX</strong> ("we", "us", or "our"), located at <strong>Bhubaneswar, Odisha, India</strong> (Contact: <a href="mailto:Lsatoneof69@gmail.com" className="text-[var(--c-gold)] font-mono">Lsatoneof69@gmail.com</a>), you agree to be bound by these Terms of Service. If you do not agree, do not access or use the website.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Permitted Use & Conduct
          </h2>
          <p>
            ToolBoxX provides browser-based utilities for personal, educational, commercial, and professional use. You agree not to:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Attempt to interfere with, disrupt, or impair website operations or hosting infrastructure.</li>
            <li>Use the tools for any unlawful purpose, fraud, or generation of infringing materials.</li>
            <li>Launch automated spiders or scrapers that place unreasonable request loads on our hosting servers.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. Intellectual Property & Your Content Ownership
          </h2>
          <p>
            <strong>You own your files:</strong> ToolBoxX does not claim any ownership, copyright, or intellectual property rights over files, text, images, or documents you process. Because operations execute locally in your browser memory, we never acquire rights, copies, or licenses over your content.
          </p>
          <p>
            All website software, branding, interface designs, logos, and original educational guides are the intellectual property of TOOLBOXX and protected under applicable copyright laws.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            4. Free Service & Refund Policy
          </h2>
          <p>
            ToolBoxX core web utilities are offered free of charge. No registration, payment, or credit card is required. In the event that optional paid tiers or enterprise licensing are made available, all transactions and cancellations will be governed by our statutory refund policy: <strong>14-day refund window for any future paid tiers or subscriptions</strong>.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            5. Disclaimer of Warranties
          </h2>
          <p>
            ToolBoxX is provided on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied. While we strive for high precision and performance, we make no guarantees that tool outputs will be error-free or uninterrupted. Users should maintain original backups of important files.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, TOOLBOXX and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the platform.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            7. Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms of Service and any disputes arising under or related to them shall be governed by and construed in accordance with the laws of <strong>Odisha, India</strong>, without regard to conflict of law principles.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            8. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Continued use of ToolBoxX constitutes acceptance of updated terms.
          </p>
        </section>
      </div>
    </div>
  );
};
