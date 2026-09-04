import React from 'react';
import { Shield, FileCheck, Mail } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { Link } from 'react-router-dom';

export const DmcaPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="DMCA Copyright Policy — ToolBoxX"
        description="Digital Millennium Copyright Act (DMCA) compliance, intellectual property guidelines, and copyright notice procedures for ToolBoxX."
        canonicalPath="/dmca"
      />

      <Breadcrumbs items={[{ label: 'DMCA Policy' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Copyright Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          DMCA Notice & Policy
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Last updated: September 4, 2026
        </p>
      </div>

      <div className="space-y-8 leading-relaxed text-[var(--c-muted)] text-sm sm:text-base">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            1. Zero Host Storage Architecture
          </h2>
          <p>
            ToolBoxX operates as a client-side utility suite. We do not host, store, catalog, or publicly distribute user documents, copyrighted books, PDFs, or photos. All file processing occurs strictly in the end-user's local browser instance and files are automatically erased when the page session terminates.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Notice and Takedown Procedure
          </h2>
          <p>
            If you believe that any editorial guide, icon, software component, or content on this website infringes upon your copyright under Title 17, United States Code, Section 512(c)(2), please transmit a written notification containing:
          </p>
          <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm">
            <li>Physical or electronic signature of the copyright owner or authorized representative.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Specific URL or location on ToolBoxX where the alleged infringing material appears.</li>
            <li>Your contact information (full name, address, telephone number, and email address).</li>
            <li>A statement that you have a good-faith belief that use of the material is unauthorized.</li>
            <li>A statement made under penalty of perjury that the information in the notification is accurate.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-4">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--c-gold)]" />
            3. Contacting the DMCA Agent
          </h2>
          <p>
            You can submit copyright inquiries directly via our{' '}
            <Link to="/contact" className="text-[var(--c-gold)] underline hover:text-[var(--c-text)]">
              Contact Form
            </Link>
            . We review and respond to legitimate notices promptly.
          </p>
        </section>
      </div>
    </div>
  );
};
