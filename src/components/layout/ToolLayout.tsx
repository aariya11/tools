import React from 'react';
import { ShieldCheck, CheckCircle2, HelpCircle, BookOpen, Check } from 'lucide-react';
import type { ToolMeta } from '../../types/tools';
import { Breadcrumbs } from './Breadcrumbs';
import { Accordion } from '../common/Accordion';
import { RelatedTools } from '../common/RelatedTools';
import { SeoHead } from '../common/SeoHead';
import { DynamicIcon } from '../common/DynamicIcon';

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  const seoTitle = tool.seoTitle || `${tool.name} Online Free – ${tool.category === 'pdf' ? 'PDF Tools' : tool.category === 'images' ? 'Image Utilities' : 'Free Online Tools'}`;
  const seoDescription = tool.metaDescription || tool.fullDescription;
  const h1Title = tool.h1Heading || tool.name;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: `${tool.category.charAt(0).toUpperCase() + tool.category.slice(1)} Tools`, url: `/category/${tool.category}` },
    { name: tool.name, url: tool.path }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
      {/* Dynamic SEO & Schema (WebApplication, HowTo, FAQPage, BreadcrumbList) */}
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={tool.path}
        faqs={tool.faqs}
        howToSteps={tool.howToSteps}
        breadcrumbs={breadcrumbs}
      />

      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { label: `${tool.category} tools`, path: `/category/${tool.category}` },
          { label: tool.name },
        ]}
      />

      {/* Tool Header */}
      <div className="text-center max-w-3xl mx-auto my-8 sm:my-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
          <span>{tool.category} Utility</span>
        </div>

        {/* SEO Editorial H1 Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#F5F1E8] tracking-tight mb-4 leading-[1.15]">
          {h1Title}
        </h1>

        <p className="text-base sm:text-lg text-[#B8B2A7] leading-relaxed max-w-2xl mx-auto font-normal">
          {tool.fullDescription}
        </p>

        {/* Privacy Assurance Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161513] border border-[#2A2824] text-[#B8B2A7] text-xs font-medium shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>100% Client-Side Privacy: Your files never leave your device</span>
        </div>
      </div>

      {/* Main Interactive Tool Workspace Container */}
      <div className="my-8">
        <div className="bg-[#161513] rounded-3xl border border-[#2A2824] p-4 sm:p-8 shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </div>

      {/* Step-by-Step "How to Use" Section */}
      {tool.howToSteps && tool.howToSteps.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#2A2824]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F1E8]">
              How to Use {tool.name} Online
            </h2>
            <p className="text-sm text-[#B8B2A7] mt-2">
              Follow these simple steps to process your files securely in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tool.howToSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl border border-[#2A2824] bg-[#161513] hover:border-[#3D3A34] shadow-xs flex flex-col justify-start transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] font-mono font-bold text-xs flex items-center justify-center mb-4 shadow-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[#F5F1E8] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#B8B2A7] leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rich Educational Section (Overview & Use Cases) */}
      {tool.educationalSection && (
        <section className="mt-16 pt-12 border-t border-[#2A2824]">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#161513] border border-[#2A2824] space-y-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Overview & Guide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F1E8] mb-4">
                {tool.educationalSection.title}
              </h2>
              {tool.educationalSection.paragraphs.map((p, i) => (
                <p key={i} className="text-sm sm:text-base text-[#B8B2A7] leading-relaxed mb-4 font-normal">
                  {p}
                </p>
              ))}
            </div>

            {tool.educationalSection.useCases && tool.educationalSection.useCases.length > 0 && (
              <div className="pt-4 border-t border-[#2A2824]/80">
                <h3 className="text-base font-bold text-[#F5F1E8] mb-3">
                  Common Use Cases
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tool.educationalSection.useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-[#B8B2A7]">
                      <div className="w-5 h-5 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#B79B70]" />
                      </div>
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Key Features & Capabilities Section */}
      {tool.features && tool.features.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#2A2824]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F1E8]">
              Key Features & Capabilities
            </h2>
            <p className="text-sm text-[#B8B2A7] mt-2">
              Engineered for maximum speed, precision, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {tool.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#2A2824] bg-[#161513] hover:border-[#3D3A34] shadow-xs flex items-start gap-4 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E8] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#B8B2A7] leading-relaxed font-normal">
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
        <section className="mt-16 pt-12 border-t border-[#2A2824]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F1E8]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#B8B2A7] mt-2">
              Everything you need to know about using our {tool.name} tool.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion items={tool.faqs} />
          </div>
        </section>
      )}

      {/* Related Tools with Contextual Internal Links */}
      <RelatedTools
        currentToolId={tool.id}
        relatedToolIds={tool.relatedToolIds}
      />
    </div>
  );
};
