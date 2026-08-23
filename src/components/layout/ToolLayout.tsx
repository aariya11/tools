import React from 'react';
import { ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import type { ToolMeta } from '../../types/tools';
import { Breadcrumbs } from './Breadcrumbs';
import { Accordion } from '../common/Accordion';
import { RelatedTools } from '../common/RelatedTools';
import { AdSlot } from '../common/AdSlot';
import { SeoHead } from '../common/SeoHead';
import { DynamicIcon } from '../common/DynamicIcon';

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
      {/* Dynamic SEO & Schema */}
      <SeoHead
        title={tool.name}
        description={tool.fullDescription}
        canonicalPath={tool.path}
        keywords={tool.keywords}
        faqs={tool.faqs}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: `${tool.category} tools`, path: `/category/${tool.category}` },
          { label: tool.name },
        ]}
      />

      {/* Top Banner Ad Container */}
      <AdSlot type="leaderboard" className="my-4 hidden sm:flex" />

      {/* Tool Header */}
      <div className="text-center max-w-3xl mx-auto my-6 sm:my-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4">
          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
          <span>{tool.category} Utility</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
          {tool.name}
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {tool.fullDescription}
        </p>

        {/* Privacy Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Your files stay on your device. 100% private, client-side processing.</span>
        </div>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="my-8">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800/90 p-4 sm:p-8 shadow-xl backdrop-blur-md">
          {children}
        </div>
      </div>

      {/* In-Content AdSlot */}
      <AdSlot type="in-content" className="my-8" />

      {/* How to Use Section */}
      {tool.howToSteps && tool.howToSteps.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              How to Use {tool.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Follow these simple steps to complete your task quickly and safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tool.howToSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Features Section */}
      {tool.features && tool.features.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Key Features & Capabilities
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Engineered for performance, accuracy, and absolute privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {tool.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything you need to know about using {tool.name}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion items={tool.faqs} />
          </div>
        </section>
      )}

      {/* Related Tools */}
      <RelatedTools
        currentToolId={tool.id}
        relatedToolIds={tool.relatedToolIds}
      />
    </div>
  );
};
