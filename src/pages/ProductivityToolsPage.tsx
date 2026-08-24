import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Search,
  CheckCircle2,
  Sliders,
  Briefcase,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { getToolById } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const PRODUCTIVITY_TOOL_IDS = [
  'pdf-compress',
  'pdf-merge',
  'organize-pdf',
  'bulk-renamer',
  'zip-creator',
  'markdown-editor',
  'text-cleaner',
  'csv-converter',
  'invoice-generator',
  'password-generator',
  'email-signature-generator',
  'ai-email-writer',
  'ai-summarizer',
  'file-size-converter',
];

const PRODUCTIVITY_PILLARS = [
  {
    title: 'Zero Latency Document Processing',
    description: 'Merge, split, and compress multi-gigabyte files directly in your computer memory with no network upload wait time.',
    icon: Zap,
  },
  {
    title: 'Enterprise Data Privacy',
    description: 'NDAs, customer spreadsheets, and tax invoices are processed strictly on-device. Zero cloud storage or GDPR compliance risks.',
    icon: ShieldCheck,
  },
  {
    title: 'Instant Multi-Tasking Hub',
    description: 'No browser tabs bogged down by heavy SaaS signups. Every tool opens instantaneously with clean, keyboard-friendly interfaces.',
    icon: Layers,
  },
];

const PRODUCTIVITY_FAQS = [
  {
    question: 'How do ToolBoxX productivity tools compare to desktop software?',
    answer: 'ToolBoxX uses cutting-edge WebAssembly, HTML5 Canvas, and Web Crypto APIs to achieve native-speed execution without requiring you to install heavy desktop applications or purchase expensive licenses.',
  },
  {
    question: 'Can I process sensitive business contracts and invoices here?',
    answer: 'Yes! ToolBoxX is built on a 100% client-side zero-knowledge architecture. Your document binary streams and form fields are never sent over the wire.',
  },
  {
    question: 'Is there a limit on how many batch operations I can perform?',
    answer: 'No. There are no daily quotas, queue delays, or rate limits.',
  },
];
export const ProductivityToolsPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const productivityTools = useMemo(() => {
    return PRODUCTIVITY_TOOL_IDS.map((id) => getToolById(id)).filter(
      (t): t is NonNullable<typeof t> => Boolean(t)
    );
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchFilter.trim()) return productivityTools;
    const q = searchFilter.toLowerCase();
    return productivityTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [productivityTools, searchFilter]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="High-Performance Browser Productivity Suite ? Batch Tools & Document Automation"
        description="Streamline daily document pipelines: client-side PDF organization, bulk renamers, invoice generators, markdown formatting, and password tools. 100% free and private."
        canonicalPath="/productivity-tools"
        faqs={PRODUCTIVITY_FAQS}
      />

      {/* Hero Section */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Modern Productivity Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                High-Leverage Workflows <br className="hidden sm:inline" />
                with <span className="text-[var(--c-gold)]">Zero Lag & Zero Subscriptions</span>.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Eliminate daily digital friction. Rename hundreds of files, format CSV spreadsheets, generate clean PDF invoices, and compress documents in milliseconds.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  100% Local Execution
                </span>
                <span>?</span>
                <span>No Network Bottlenecks</span>
                <span>?</span>
                <span>Unlimited Free Usage</span>
              </div>
            </div>

            {/* Quick Card */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                <Briefcase className="w-4 h-4" />
                <span>Professional Suite</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-[var(--c-text)]">14+ Utilities</div>
                <p className="text-xs text-[var(--c-muted)]">Everything needed for frictionless daily operations</p>
              </div>
              <Link
                to="/all-tools"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-gold)] hover:underline"
              >
                <span>Explore all 60+ ToolBoxX utilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Curated Grid */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
                Curated Productivity Utilities
              </h2>
              <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                Lightning fast client-side tools with no account setup.
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter productivity tools..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs sm:text-sm text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* 3 Pillars */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Built for Serious Speed & Confidentiality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTIVITY_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--c-text)]">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Productivity FAQ
          </h2>
          <div className="space-y-3">
            {PRODUCTIVITY_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[var(--c-text)] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--c-gold)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed border-t border-[var(--c-border)]/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="ToolBoxX Productivity Suite ? Fast In-Browser Utilities"
          description="Process documents, rename files, and format spreadsheets without server uploads."
        />
      </div>
    </div>
  );
};
