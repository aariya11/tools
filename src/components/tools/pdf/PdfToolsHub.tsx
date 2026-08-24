import React from 'react';
import { Layers, FileUp, ShieldCheck } from 'lucide-react';
import { ToolCard } from '../../common/ToolCard';
import { getToolsByCategory } from '../../../data/toolsData';

export const PdfToolsHub: React.FC = () => {
  const pdfTools = getToolsByCategory('pdf').filter((t) => t.id !== 'pdf-tools');

  return (
    <div className="space-y-12">
      {/* Intro Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c-text)]">
          All PDF Tools in One Place
        </h2>
        <p className="text-sm sm:text-base text-[var(--c-muted)] mt-2">
          Select a dedicated utility below. All PDF operations run 100% inside your browser with complete data privacy.
        </p>
      </div>

      {/* Grid of PDF Sub-Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Trust & Capability highlights */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] flex items-center justify-center mx-auto sm:mx-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-[var(--c-text)]">100% Client-Side Privacy</h4>
          <p className="text-xs text-[var(--c-subtle)]">
            Your contracts, financial records, and medical files never leave your computer or phone.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] flex items-center justify-center mx-auto sm:mx-0">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-[var(--c-text)]">No File Size Limitations</h4>
          <p className="text-xs text-[var(--c-subtle)]">
            Since files are processed directly using WebAssembly and JavaScript, there are no cloud upload limits.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] flex items-center justify-center mx-auto sm:mx-0">
            <FileUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-[var(--c-text)]">Completely Free Forever</h4>
          <p className="text-xs text-[var(--c-subtle)]">
            Zero subscription fees, no watermarks, and no mandatory user accounts.
          </p>
        </div>
      </div>
    </div>
  );
};
