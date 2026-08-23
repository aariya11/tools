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

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-6 sm:p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 space-y-4">
        <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          The Core ToolBoxX Commitment
        </h2>
        <p className="text-sm sm:text-base text-emerald-950 dark:text-emerald-300 leading-relaxed font-medium">
          <strong>"Your files stay on your device whenever possible."</strong> All image compression, image resizing, format conversions, PDF merging, splitting, extraction, word counting, case conversions, and QR code generation are executed entirely within your browser memory.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-8 leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. How Your Files Are Processed
          </h2>
          <p>
            When you select or drop a file (JPEG, PNG, WebP, PDF) or type text into any ToolBoxX tool, the file is read using the HTML5 File API and processed locally by client-side WebAssembly, JavaScript, and Canvas rendering engines.
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>No file contents are uploaded to our backend servers.</li>
            <li>No files are written to permanent cloud databases.</li>
            <li>Once you download your output or close your browser tab, all temporary memory is automatically garbage collected.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            2. Information We Do NOT Collect
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>We do not collect names, email addresses, or phone numbers unless you voluntarily contact us via our support form.</li>
            <li>We do not record the contents of your text, PDFs, or photos.</li>
            <li>We do not sell, rent, or monetize your personal files or personal data to third parties.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Web Analytics & Aggregated Metrics
          </h2>
          <p>
            We may use privacy-preserving, aggregated website analytics to measure overall website traffic, page views, and which tools are most frequently used (e.g. tracking that "Word Counter" was accessed, but never tracking the words entered). This helps us identify popular features and fix technical glitches.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            4. Display Advertising & Cookies
          </h2>
          <p>
            To keep ToolBoxX free for everyone, we may display third-party advertisements in designated, non-intrusive container slots. These advertising partners may use standard cookies to serve relevant ads. You can manage or disable cookies at any time through your browser preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            5. Contacting Us
          </h2>
          <p>
            If you have questions about our privacy architecture or have feedback, please reach out through our <a href="/contact" className="text-indigo-600 dark:text-indigo-400 underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
