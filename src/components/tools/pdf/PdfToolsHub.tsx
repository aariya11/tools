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
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          All PDF Tools in One Place
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto sm:mx-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">100% Client-Side Privacy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your contracts, financial records, and medical files never leave your computer or phone.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto sm:mx-0">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">No File Size Limitations</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Since files are processed directly using WebAssembly and JavaScript, there are no cloud upload limits.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto sm:mx-0">
            <FileUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Completely Free Forever</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Zero subscription fees, no watermarks, and no mandatory user accounts.
          </p>
        </div>
      </div>
    </div>
  );
};
