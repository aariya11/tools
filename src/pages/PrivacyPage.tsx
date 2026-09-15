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
            1. Data Controller Identification
          </h2>
          <p>
            The data controller responsible for the operation of ToolBoxX is:
          </p>
          <ul className="space-y-1.5 list-none font-mono text-xs sm:text-sm text-[var(--c-text)] bg-[var(--c-card)] p-4 rounded-xl border border-[var(--c-border)]">
            <li><strong>Legal Entity:</strong> TOOLBOXX</li>
            <li><strong>Address:</strong> Bhubaneswar, Odisha, India</li>
            <li><strong>Contact Email:</strong> <a href="mailto:Lsatoneof69@gmail.com" className="text-[var(--c-gold)]">Lsatoneof69@gmail.com</a></li>
            <li><strong>Jurisdiction:</strong> Odisha, India</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Local Browser-Based File Processing Architecture
          </h2>
          <p>
            When you select or drop a file (PDF, Word, Excel, PowerPoint, JPEG, PNG, WebP, CSV, TXT) into any ToolBoxX tool, the file is read using the HTML5 File API and processed strictly within your browser's local sandbox environment using client-side JavaScript, Canvas, and WebAssembly (via open-source engines including pdf-lib and pdfjs-dist).
          </p>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li><strong>Zero Server Uploads:</strong> Document bytes never leave your device memory and are not uploaded to remote servers.</li>
            <li><strong>Zero Server Storage:</strong> We do not store, copy, catalog, or inspect your files.</li>
            <li><strong>Automatic Memory Cleanup:</strong> When you download your finalized file or close/refresh the tab, the in-memory representation is automatically released by your browser's garbage collector.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. Optional AI Features & Third-Party APIs
          </h2>
          <p>
            Certain optional writing and text-assistance utilities offer integration with Google Gemini AI.
          </p>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li>Users may optionally input their own personal Gemini API key. This key is stored exclusively in your browser's local storage (<code className="text-[var(--c-gold)] text-xs">localStorage</code>) and is never transmitted to our servers.</li>
            <li>When an AI request is initiated, prompt data is sent directly from your browser to Google Generative Language API endpoints, subject to Google's Privacy Policy and API Terms of Service.</li>
            <li>If you do not provide an API key, ToolBoxX automatically defaults to local offline rule-based algorithms with zero network calls.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            4. Information We Collect & Data Retention
          </h2>
          <p>
            We adhere strictly to the principle of data minimization:
          </p>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li><strong>Contact Submissions:</strong> If you voluntarily send a message through our Contact Page, we collect your name, email address, topic, and message text solely to respond to your query.</li>
            <li><strong>Data Retention:</strong> Inquiries submitted via the contact form are retained for 90 days to resolve follow-ups, after which they are permanently purged. Document files processed in tools are retained on servers for 0 seconds.</li>
            <li><strong>No User Accounts:</strong> ToolBoxX does not require user registration, passwords, or personal profiles.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            5. Cookies, Local Storage & Analytics
          </h2>
          <p>
            ToolBoxX uses local browser storage for essential site preferences (active visual theme, cookie consent preferences, and optional tool configurations). Optional aggregate analytics may be provided by privacy-focused aggregate analytics only after explicit consent via our cookie consent banner. Please refer to our <a href="/cookie-policy" className="text-[var(--c-gold)] underline">Cookie Policy</a> to view details or modify your preferences.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            6. Your Legal Rights (GDPR, CCPA/CPRA, India DPDP)
          </h2>
          <p>
            Depending on your jurisdiction, you may have statutory rights regarding your personal information, including:
          </p>
          <ul className="space-y-2 list-disc pl-5 text-[var(--c-muted)]">
            <li><strong>Right of Access & Portability:</strong> Request confirmation and a copy of any personal data we hold about you.</li>
            <li><strong>Right to Rectification & Erasure:</strong> Request correction or deletion of your personal data.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for non-essential cookies or contact communication at any time.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will never discriminate against you for exercising your privacy rights.</li>
            <li><strong>Right to Lodge a Complaint:</strong> Lodge a complaint with your competent data protection authority.</li>
          </ul>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            7. Contacting Us
          </h2>
          <p>
            To exercise your privacy rights or discuss our privacy safeguards, contact TOOLBOXX at <a href="mailto:Lsatoneof69@gmail.com" className="text-[var(--c-gold)] font-mono underline">Lsatoneof69@gmail.com</a> or via our <a href="/contact" className="text-[var(--c-gold)] underline">Contact Form</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
