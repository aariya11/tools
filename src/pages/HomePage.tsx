import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  HeartHandshake,
  HelpCircle,
  Wrench,
  Sliders,
  Type,
  ArrowLeftRight,
  QrCode,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Smartphone,
  Flame,
  Calculator,
} from 'lucide-react';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { Accordion } from '../components/common/Accordion';
import {
  TOOLS_DATA,
  getPopularTools,
  getToolsByCategory,
  searchTools,
} from '../data/toolsData';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const popularTools = getPopularTools().slice(0, 12);
  const pdfTools = getToolsByCategory('pdf');
  const imageTools = getToolsByCategory('images');
  const textTools = getToolsByCategory('text');
  const calcTools = getToolsByCategory('calculators');
  const generatorTools = getToolsByCategory('generators');

  // Converters list combining unit & file conversions
  const converterTools = [
    ...calcTools.filter((t) => t.id === 'unit-converter' || t.id === 'percentage-calculator' || t.id === 'timezone-converter' || t.id === 'age-calculator' || t.id === 'emi-calculator' || t.id === 'discount-calculator'),
    ...getToolsByCategory('file').filter((t) => t.id === 'file-size-converter'),
  ].slice(0, 8);

  const searchResults = searchQuery.trim() ? searchTools(searchQuery) : [];

  const QUICK_SUGGESTIONS = [
    { label: 'Compress PDF', path: '/pdf-compress' },
    { label: 'Merge PDF', path: '/pdf-merge' },
    { label: 'PDF Editor', path: '/edit-pdf' },
    { label: 'Image Compressor', path: '/image-compressor' },
    { label: 'Unit Converter', path: '/unit-converter' },
    { label: 'Background Remover', path: '/background-remover' },
    { label: 'Text Diff Checker', path: '/text-diff' },
    { label: 'QR Code Generator', path: '/qr-code-generator' },
    { label: 'Word Counter', path: '/word-counter' },
    { label: 'Percentage Calculator', path: '/percentage-calculator' },
  ];

  const HOMEPAGE_FAQS = [
    {
      question: 'What is ToolBoxX?',
      answer: `ToolBoxX is an all-in-one suite of ${TOOLS_DATA.length}+ free, browser-based digital productivity tools for editing PDFs, compressing images, converting units and files, calculating data, and creating custom QR codes with 100% on-device privacy.`
    },
    {
      question: 'Are all ToolBoxX tools completely free to use?',
      answer: 'Yes! Every single tool on ToolBoxX is 100% free forever with no usage caps, subscriptions, paywalls, or watermarks.'
    },
    {
      question: 'How does client-side browser processing protect my privacy?',
      answer: 'Unlike traditional web converters that upload your private documents to remote cloud servers, ToolBoxX executes file processing locally inside your web browser using WebAssembly and Canvas APIs. Your files never leave your computer or phone.'
    },
    {
      question: 'How do I compress a PDF or image without losing quality?',
      answer: 'Simply upload your PDF or image to our Compress PDF or Image Compressor tool. Our perceptual compression algorithms remove redundant data and metadata, shrinking file size by up to 85% while preserving visual clarity.'
    },
    {
      question: 'Can I use ToolBoxX on mobile phones and tablets?',
      answer: 'Yes! ToolBoxX is built mobile-first and fully responsive across iOS Safari, Android Chrome, tablets, iPads, laptops, and desktop monitors.'
    },
    {
      question: 'Do I need to install any software, extensions, or create an account?',
      answer: 'No installation, registration, or sign-up is required. All tools open instantly in your web browser and are immediately ready to use.'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
    }
  };

  return (
    <div className="w-full bg-[var(--c-bg)] text-[var(--c-text)]">
      <SeoHead
        title="ToolBoxX — Free Online Tools for PDF, Images, Text & More"
        description="Fast, simple and free online tools to edit PDFs, compress images, convert files, generate QR codes, count words and get everyday tasks done with 100% privacy."
        canonicalPath="/"
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION + LARGE SEARCH BOX */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[var(--c-border)]/60">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)] font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            <span>Free to use • Fast processing • Simple interface • Privacy-focused</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-[var(--c-text)] leading-tight sm:leading-tight">
            Free Online Tools for PDF, Images, Text & More
          </h1>

          {/* Supporting Subtitle */}
          <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed max-w-3xl mx-auto font-normal">
            Fast, simple and free online tools to edit PDFs, compress images, convert files, generate QR codes, count words and get everyday tasks done.
          </p>

          {/* Large Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="w-5 h-5 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What tool do you need? (e.g. compress pdf, resize image, word count, qr code)..."
                className="w-full pl-12 pr-4 py-4 sm:py-5 rounded-2xl sm:rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-sm sm:text-base placeholder:text-[var(--c-subtle)] focus:ring-2 focus:ring-[var(--c-gold)]/30 focus:border-[var(--c-gold)] shadow-xl outline-none transition-all"
              />

              {/* Instant Dropdown Search Results */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl z-50 text-left max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 8).map((tool) => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--c-card)] transition-colors group/item"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-[var(--c-text)] group-hover/item:text-[var(--c-gold)]">
                            {tool.name}
                          </div>
                          <div className="text-xs text-[var(--c-muted)] line-clamp-1">
                            {tool.shortDescription}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] shrink-0 ml-3">
                          {tool.category}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--c-muted)]">
                      No tools found matching "{searchQuery}". Browse all tools below!
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="text-xs text-[var(--c-subtle)] mr-1">Popular:</span>
              {QUICK_SUGGESTIONS.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-1 text-xs rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Primary & Secondary Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/all-tools"
              className="px-8 py-3.5 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-sm font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore All Tools ({TOOLS_DATA.length}+)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#popular-tools"
              className="px-8 py-3.5 rounded-2xl bg-[var(--c-surface)] hover:bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-sm font-semibold transition-all"
            >
              Popular Tools
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. POPULAR TOOLS (8–12 Top-Demand Tools) */}
      {/* ========================================================================= */}
      <section id="popular-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>High-Demand Utilities</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Popular Online Tools
            </h2>
            <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
              Our most frequently used utilities for editing documents, optimizing graphics, and calculating results.
            </p>
          </div>

          <Link
            to="/all-tools"
            className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>View All ({TOOLS_DATA.length}) Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PDF TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Suite ({pdfTools.length} Utilities)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                PDF Tools
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Merge, split, compress, convert, edit, sign, redact, protect, and organize PDF documents in seconds.
              </p>
            </div>

            <Link
              to="/pdf-tools"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All PDF Tools →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pdfTools.slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. IMAGE TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Suite ({imageTools.length} Utilities)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Image Tools
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Compress, crop, upscale, convert, remove backgrounds, and strip metadata with 100% on-device privacy.
              </p>
            </div>

            <Link
              to="/category/images"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Image Tools →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {imageTools.slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TEXT TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <Type className="w-3.5 h-3.5" />
                <span>Text Suite ({textTools.length} Utilities)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Text Tools
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Word counts, text diff comparison, case conversion, duplicate line removal, and dummy text generation.
              </p>
            </div>

            <Link
              to="/category/text"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Text Tools →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {textTools.slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONVERTERS & CALCULATORS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Conversion & Math</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Converters & Calculators
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Unit conversion, percentages, timestamps, file sizes, tip splitting, loan estimates, and time zones.
              </p>
            </div>

            <Link
              to="/unit-converter"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Open Unit Converter →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {converterTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. GENERATORS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Generators ({generatorTools.length} Utilities)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Generators
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Custom QR codes, QR scanners, barcodes, passwords, UUIDs, sitemaps, and color palettes.
              </p>
            </div>

            <Link
              to="/category/generators"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Generators →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {generatorTools.slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. WHY TOOLBOXX? (Concise Benefits) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Why ToolBoxX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)]">
            Built for Speed. Engineered for Privacy.
          </h2>
          <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
            Every tool is designed to solve common everyday document and media tasks with instant speed and zero server reliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">Free Online Tools</h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Zero subscription paywalls, watermarks, or account walls. Free forever for everyone.
            </p>
          </div>

          {/* No Installation */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">No Installation</h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              No bloated desktop software to download. Everything runs instantly in your modern web browser.
            </p>
          </div>

          {/* Privacy-Focused */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">Privacy-Focused</h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              100% on-device client processing. Your confidential files never upload to any remote server.
            </p>
          </div>

          {/* Mobile Friendly */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">Mobile Friendly</h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Engineered with responsive touch targets for flawless operation on iPhone, Android, and tablets.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HOW IT WORKS (4 Simple Steps) */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Simple Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              How ToolBoxX Works
            </h2>
            <p className="text-sm sm:text-base text-[var(--c-muted)]">
              Transform, compress, and analyze your files in 4 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 relative">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">01</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Choose a Tool</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Pick from our extensive directory of PDF, image, text, converter, and generator utilities.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 relative">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">02</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Upload or Enter Content</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Drag and drop your file or paste your text directly into the interactive workspace.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 relative">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">03</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Process Your File</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Adjust custom parameters and let our browser-native algorithms process the task instantly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 relative">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">04</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Download Your Result</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Download your optimized file, copy the formatted text, or save your archive with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. SEO-FRIENDLY USEFUL CONTENT (Structured & Natural) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Free Online Tools for Everyday Tasks
            </h2>
            <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed">
              ToolBoxX is designed to deliver fast, reliable, and privacy-preserving utilities for professionals, students, creators, and developers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[var(--c-muted)] leading-relaxed">
            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Advanced PDF Management</span>
              </h3>
              <p>
                Manage your PDF documents without expensive desktop licenses. With ToolBoxX, you can merge multiple contracts into a single file, split large PDFs into individual chapters, reduce file sizes for email attachments, and add watermarks or page numbers with client-side cryptographic reliability.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Fast Image Optimization</span>
              </h3>
              <p>
                Optimize photos for web performance and social media publishing. Compress JPG, PNG, and WebP assets to improve Google Core Web Vitals and LCP scores, remove backgrounds automatically with canvas contouring, and crop images to exact platform aspect ratios.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                <Type className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Text Analysis & Formatting</span>
              </h3>
              <p>
                Analyze essays, articles, and copy with live character and word counters, reading time estimators, case converters, line cleaners, and diff checkers. Perfect for content creators, copywriters, and developers reviewing revisions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Generators & Converters</span>
              </h3>
              <p>
                Create branded QR codes for Wi-Fi, URLs, and business cards, scan QR codes via live webcam, convert between metric and imperial units across 8 dimensions, calculate tips and EMI payments, and generate strong cryptographically secure passwords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Everything You Need to Know
            </h2>
            <p className="text-sm text-[var(--c-muted)] font-normal">
              Common questions regarding online tools, privacy, browser processing, and file security.
            </p>
          </div>

          <Accordion items={HOMEPAGE_FAQS} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-10 sm:p-14 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)] tracking-tight">
              Find the Right Tool for Your Task
            </h2>
            <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed font-normal">
              Start using our {TOOLS_DATA.length}+ free, private browser utilities immediately. No downloads, no credit cards, no sign-ups required.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/all-tools"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
