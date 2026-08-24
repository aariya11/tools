import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  Layers,
  Wrench,
  Check,
  X as XIcon,
} from 'lucide-react';
import { getToolsByCategory } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const PDF_CATEGORIES = ['All', 'Organize & Edit', 'Convert', 'Security & Sign', 'Optimize & OCR'] as const;

const COMPARISON_DATA = [
  { feature: 'Client-Side Privacy (0 Server Uploads)', toolboxx: true, adobe: false, smallpdf: false },
  { feature: '100% Free Forever with No Limits', toolboxx: true, adobe: false, smallpdf: false },
  { feature: 'No Account or Registration Required', toolboxx: true, adobe: false, smallpdf: false },
  { feature: 'Instant Processing (No Upload Queue)', toolboxx: true, adobe: false, smallpdf: false },
  { feature: 'No Daily Task Limits or Paywalls', toolboxx: true, adobe: false, smallpdf: false },
  { feature: 'Works on Chromebooks, Tablets & Phones', toolboxx: true, adobe: true, smallpdf: true },
];

const PDF_FAQS = [
  {
    question: 'How can ToolBoxX offer 30+ PDF tools completely free?',
    answer: 'Traditional services pay massive cloud server costs to receive, store, and process your files on remote clusters. ToolBoxX uses modern browser-native WebAssembly and PDF-Lib algorithms that run directly on your own computer?s CPU/RAM, reducing server overhead to nearly zero.',
  },
  {
    question: 'Is there a limit on how many pages or files I can process?',
    answer: 'No. You can merge 50 documents, compress a 200-page book, or convert as many files as you need without any limits or subscriptions.',
  },
  {
    question: 'Are my confidential business documents safe here?',
    answer: 'Absolutely. Because processing happens 100% locally in your browser sandbox, your PDF bytes are never transmitted across the internet to any third-party server.',
  },
];
export const FreePdfToolsPage: React.FC = () => {
  const [selectedSubCat, setSelectedSubCat] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const allPdfTools = useMemo(() => {
    return getToolsByCategory('pdf').filter((t) => t.id !== 'pdf-tools');
  }, []);

  const filteredTools = useMemo(() => {
    return allPdfTools.filter((t) => {
      let matchesCat = true;
      if (selectedSubCat === 'Organize & Edit') {
        matchesCat = ['pdf-merge', 'pdf-split', 'rotate-pdf', 'remove-pages', 'organize-pdf', 'crop-pdf', 'edit-pdf', 'add-page-numbers', 'add-watermark'].includes(t.id);
      } else if (selectedSubCat === 'Convert') {
        matchesCat = ['pdf-to-word', 'word-to-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-excel', 'excel-to-pdf', 'pdf-to-powerpoint', 'powerpoint-to-pdf', 'html-to-pdf', 'scan-to-pdf', 'pdf-to-pdfa'].includes(t.id);
      } else if (selectedSubCat === 'Security & Sign') {
        matchesCat = ['sign-pdf', 'protect-pdf', 'unlock-pdf', 'redact-pdf', 'repair-pdf', 'pdf-forms'].includes(t.id);
      } else if (selectedSubCat === 'Optimize & OCR') {
        matchesCat = ['pdf-compress', 'ocr-pdf', 'compare-pdf', 'pdf-extract'].includes(t.id);
      }

      const q = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [allPdfTools, selectedSubCat, searchFilter]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="30+ Free PDF Tools Online ? Unlimited, Private, No Upload Limits | ToolBoxX"
        description="The ultimate 100% free client-side PDF suite: Merge, Split, Compress, Convert (Word, Excel, JPG), OCR, Sign, Protect, and Edit PDFs directly in your browser with zero cloud storage."
        canonicalPath="/free-pdf-tools"
        faqs={PDF_FAQS}
      />

      {/* Hero Section */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>30+ Free Online PDF Utilities</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                The Complete <br className="hidden sm:inline" />
                <span className="text-[var(--c-gold)]">Unlimited & Private</span> PDF Studio.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Everything you need to merge, compress, edit, convert, and sign PDF documents. Processed 100% locally in your browser memory with zero server uploads and zero paywalls.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  100% Client-Side Privacy
                </span>
                <span>?</span>
                <span>Unlimited Batch Use</span>
                <span>?</span>
                <span>No Accounts Required</span>
              </div>
            </div>

            {/* Quick Banner */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                <Sparkles className="w-4 h-4" />
                <span>Top PDF Guides</span>
              </div>
              <div className="space-y-2 text-xs">
                <Link to="/blog/how-to-compress-pdf-without-losing-quality" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? How to Compress PDF Without Losing Quality ?
                </Link>
                <Link to="/blog/how-to-merge-pdf-files-in-order" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? How to Merge PDFs in Sequential Order ?
                </Link>
                <Link to="/blog/how-to-convert-pdf-to-word-doc" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? How to Convert PDF to Word DOCX ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        <section className="space-y-8">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PDF_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSubCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                    selectedSubCat === cat
                      ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                      : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:text-[var(--c-text)]'
                  }`}
                >
                  {cat === 'All' ? 'All 30+ Tools' : cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search PDF tools..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs sm:text-sm text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--c-text)]">
              Why ToolBoxX is Better Than Cloud PDF Apps
            </h2>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
              Direct comparison between ToolBoxX client-side processing vs legacy online converters.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-mono uppercase">
                  <th className="py-3 px-4">Capability & Feature</th>
                  <th className="py-3 px-4 text-center text-[var(--c-gold)] font-bold">ToolBoxX</th>
                  <th className="py-3 px-4 text-center text-[var(--c-subtle)]">Adobe Acrobat Web</th>
                  <th className="py-3 px-4 text-center text-[var(--c-subtle)]">Smallpdf / iLovePDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]/60 text-[var(--c-muted)]">
                {COMPARISON_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--c-surface)] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--c-text)]">{item.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.adobe ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.smallpdf ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            PDF Suite FAQs
          </h2>
          <div className="space-y-3">
            {PDF_FAQS.map((faq, idx) => {
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
          title="30+ Free Online PDF Tools ? ToolBoxX"
          description="Merge, compress, convert, sign, protect and edit PDFs directly in your browser."
        />
      </div>
    </div>
  );
};
