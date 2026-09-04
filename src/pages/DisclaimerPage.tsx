import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Disclaimer — ToolBoxX Terms & Limitations"
        description="Important legal disclaimer regarding browser-based processing, data accuracy, and limitations of liability for ToolBoxX utilities."
        canonicalPath="/disclaimer"
      />

      <Breadcrumbs items={[{ label: 'Disclaimer' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Legal Disclaimer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Website Disclaimer
        </h1>
        <p className="text-sm text-[var(--c-subtle)] font-mono">
          Last updated: September 4, 2026
        </p>
      </div>

      <div className="space-y-8 leading-relaxed text-[var(--c-muted)] text-sm sm:text-base">
        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            1. "As Is" and "As Available" Service
          </h2>
          <p>
            The tools, calculators, file converters, generators, and content on ToolBoxX are provided strictly on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we strive to maintain high accuracy, speed, and reliability across all tools, ToolBoxX makes no guarantees regarding the completeness, exactness, or fitness for any specific commercial or legal purpose.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            2. Local Browser-Based Processing
          </h2>
          <p>
            ToolBoxX operates primarily via client-side WebAssembly, Canvas, and JavaScript running inside your web browser. Performance and processing limits depend on your device's available system memory (RAM), browser version, and hardware capacity. Users are advised to retain original backups of sensitive files before running batch conversion or editing routines.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            3. No Financial, Legal, or Professional Advice
          </h2>
          <p>
            Calculators (including loan EMI, salary, tip splitting, discount, and percentage calculations) provide general mathematical estimates for personal convenience only. They do not constitute certified accounting, tax, investment, or legal counsel. Always verify complex financial figures with a qualified professional.
          </p>
        </section>

        <section className="bg-[var(--c-surface)] p-8 rounded-3xl border border-[var(--c-border)] space-y-3">
          <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall ToolBoxX, its creators, contributors, or infrastructure providers be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use the platform, including but not limited to file loss, corrupted outputs, or operational interruptions.
          </p>
        </section>
      </div>
    </div>
  );
};
