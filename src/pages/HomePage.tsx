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

  const popularTools = getPopularTools();
  const pdfTools = getToolsByCategory('pdf');
  const imageTools = getToolsByCategory('images');
  const aiTools = getToolsByCategory('ai');
  const devTools = getToolsByCategory('developer');
  const bizTools = getToolsByCategory('business');
  const socialTools = getToolsByCategory('social');
  const calcTools = getToolsByCategory('calculators');
  const textTools = getToolsByCategory('text');
  const generatorTools = getToolsByCategory('generators');

  const searchResults = searchQuery.trim() ? searchTools(searchQuery) : [];

  const QUICK_SUGGESTIONS = [
    { label: 'Compress PDF', path: '/pdf-compress' },
    { label: 'Merge PDF', path: '/pdf-merge' },
    { label: 'PDF Editor', path: '/edit-pdf' },
    { label: 'Background Remover', path: '/background-remover' },
    { label: 'Age Calculator', path: '/age-calculator' },
    { label: 'Social Post Generator', path: '/social-content-generator' },
    { label: 'AI Summarizer', path: '/ai-summarizer' },
    { label: 'JSON Formatter', path: '/json-formatter' },
    { label: 'Resume Builder', path: '/resume-builder' },
    { label: 'QR Code Generator', path: '/qr-code-generator' },
  ];

  const HOMEPAGE_FAQS = [
    {
      question: 'What is ToolBoxX?',
      answer: `ToolBoxX is an all-in-one suite of ${TOOLS_DATA.length}+ free, browser-based digital productivity tools for editing PDFs, compressing images, converting file formats, calculating finances, generating social media content, and creating custom QR codes without software installation.`
    },
    {
      question: 'Are ToolBoxX tools completely free to use?',
      answer: 'Yes, 100% of the tools on ToolBoxX are free with no usage limits, hidden fees, subscriptions, or watermarks.'
    },
    {
      question: 'How does client-side file privacy work?',
      answer: 'Unlike traditional cloud converters that upload your confidential files to remote servers, ToolBoxX executes processing locally in your browser memory using modern WebAssembly, Canvas, and JavaScript APIs. Your files never leave your computer or phone.'
    },
    {
      question: 'How can I compress a PDF online?',
      answer: 'Navigate to our Compress PDF tool, drop your document into the upload zone, select your preferred compression level (Extreme, Recommended, or Low), and download your optimized PDF in seconds.'
    },
    {
      question: 'How can I merge multiple PDF files?',
      answer: 'Open the Merge PDF tool, select two or more PDF documents, drag and drop the files to arrange your desired sequence, and click "Merge PDF Files" to download a unified document.'
    },
    {
      question: 'Can I convert JPG to PNG online?',
      answer: 'Yes! Use our JPG to PNG Converter to instantly transform JPEG photos into lossless PNG format with transparency readiness directly in your browser.'
    },
    {
      question: 'Can I use ToolBoxX on mobile phones and tablets?',
      answer: 'Yes! ToolBoxX is fully responsive and optimized for all modern mobile devices and touchscreens including iPhone (iOS Safari) and Android (Chrome).'
    },
    {
      question: 'Do I need to create an account or sign up to use the tools?',
      answer: 'No registration or account sign-up is required. All utilities are immediately accessible directly in your web browser.'
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
        title="Free Online Tools – PDF, Image, AI, Developer & Calculator Utilities"
        description={`Discover ${TOOLS_DATA.length}+ fast, free online tools to compress images, edit PDFs, generate social content, calculate finances, and build resumes with 100% browser privacy.`}
        canonicalPath="/"
        faqs={HOMEPAGE_FAQS}
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Editorial, Minimalist, High-Impact) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[var(--c-border)]/60">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--c-gold)]/5 blur-[140px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Trust / Privacy Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] text-xs font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Client-Side Privacy: Your files never leave your device</span>
          </div>

          {/* Editorial Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-[var(--c-text)] leading-[1.1]">
            All the tools you need.<br />
            <span className="text-[var(--c-gold)] italic font-normal">
              In one simple toolbox.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-[var(--c-muted)] max-w-2xl mx-auto leading-relaxed font-normal">
            Free, fast and privacy-friendly online tools for PDFs, images, AI, developer utilities and daily productivity.
          </p>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative flex items-center rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--c-border)] bg-[var(--c-surface)] backdrop-blur-md overflow-hidden focus-within:border-[var(--c-gold)]/70 focus-within:ring-1 focus-within:ring-[var(--c-gold)]/70 transition-all">
                <Search className="w-5 h-5 text-[var(--c-gold)] ml-5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a tool (e.g. compress PDF, word counter, JPG to PNG, age calculator)..."
                  className="w-full px-4 py-4 text-sm sm:text-base bg-transparent border-0 text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2.5 px-6 py-2.5 rounded-xl sm:rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)] shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-[var(--c-border)]/60 text-left">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--c-subtle)]">
                      No matching tools found for "{searchQuery}".
                    </div>
                  ) : (
                    searchResults.map((tool) => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--c-card)] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-[var(--c-text)]">
                            {tool.name}
                          </p>
                          <p className="text-xs text-[var(--c-muted)] line-clamp-1">
                            {tool.shortDescription}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[var(--c-gold)] flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-[var(--c-subtle)] font-mono font-medium mr-1">Trending:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="px-3 py-1 rounded-full bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] font-medium transition-colors border border-[var(--c-border)]"
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
              className="px-8 py-3.5 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-sm font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <span>Explore All {TOOLS_DATA.length}+ Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#popular-tools"
              className="px-8 py-3.5 rounded-2xl bg-[var(--c-surface)] hover:bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-sm font-semibold transition-all"
            >
              Popular Tools
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-[var(--c-border)]/60 text-center">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[var(--c-text)]">{TOOLS_DATA.length}+</div>
              <div className="text-xs text-[var(--c-subtle)] uppercase tracking-wider font-mono">Free Utilities</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[var(--c-text)]">100%</div>
              <div className="text-xs text-[var(--c-subtle)] uppercase tracking-wider font-mono">Private In-Browser</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[var(--c-text)]">0 KB</div>
              <div className="text-xs text-[var(--c-subtle)] uppercase tracking-wider font-mono">Server Uploads</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[var(--c-text)]">$0</div>
              <div className="text-xs text-[var(--c-subtle)] uppercase tracking-wider font-mono">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. POPULAR TOOLS SECTION */}
      {/* ========================================================================= */}
      <section id="popular-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-gold)] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Most Used Tools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Popular Tools
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1 font-normal">
              The most loved browser utilities on ToolBoxX.
            </p>
          </div>

          <Link
            to="/all-tools"
            className="text-xs font-semibold text-[var(--c-gold)] hover:text-[var(--c-accent)] transition-colors flex items-center gap-1.5"
          >
            View All ({TOOLS_DATA.length}) Tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {popularTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.id} tool={tool} isFeatured={true} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CATEGORY SHOWCASE: PDF TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/30 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>{pdfTools.length} Tools Available</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                PDF Tools
              </h2>
              <p className="text-sm text-[var(--c-muted)] mt-1 font-normal">
                Edit, compress, merge, split, sign, convert, and protect PDF documents.
              </p>
            </div>

            <Link
              to="/pdf-tools"
              className="text-xs font-semibold text-[var(--c-gold)] hover:text-[var(--c-accent)] transition-colors flex items-center gap-1.5"
            >
              Open PDF Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pdfTools.filter(t => t.id !== 'pdf-tools').slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/pdf-tools"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] transition-colors"
            >
              <span>Explore all {pdfTools.length} PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CATEGORY SHOWCASE: IMAGE TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Processing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Image Tools
              </h2>
              <p className="text-sm text-[var(--c-muted)] mt-1 font-normal">
                Compress photos, resize dimensions, remove backgrounds, upscale, and convert formats.
              </p>
            </div>

            <Link
              to="/category/images"
              className="text-xs font-semibold text-[var(--c-gold)] hover:text-[var(--c-accent)] transition-colors flex items-center gap-1.5"
            >
              View Image Category <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {imageTools.slice(0, 8).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CATEGORY SHOWCASE: AI & DEVELOPER & CREATOR TOOLS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/30 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* AI Tools Column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--c-gold)]" />
                    <h3 className="text-2xl font-bold font-serif text-[var(--c-text)]">
                      AI Productivity Tools
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">Intelligent summaries, content rewriters, grammar checkers & email drafts</p>
                </div>
                <Link to="/category/ai" className="text-xs font-semibold text-[var(--c-gold)] hover:underline">
                  All AI Tools →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiTools.slice(0, 4).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>

            {/* Developer Tools Column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[var(--c-text)]">
                    Developer Tools
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">JSON formatters, code minifiers, Base64, JWT, hashes, and regex testers</p>
                </div>
                <Link to="/category/developer" className="text-xs font-semibold text-[var(--c-gold)] hover:underline">
                  All Developer Tools →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {devTools.slice(0, 4).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Business Tools Column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[var(--c-text)]">
                    Business & Marketing
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">Invoices, resume builders, UTM campaign trackers & barcode generators</p>
                </div>
                <Link to="/category/business" className="text-xs font-semibold text-[var(--c-gold)] hover:underline">
                  All Business Tools →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bizTools.slice(0, 4).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>

            {/* Calculators & Social Column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[var(--c-text)]">
                    Calculators & Social Studio
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">Age, percentage, EMI calculators, viral script generators & image studios</p>
                </div>
                <Link to="/category/calculators" className="text-xs font-semibold text-[var(--c-gold)] hover:underline">
                  All Calculators →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calcTools.slice(0, 3).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
                <Link
                  to="/all-tools"
                  className="p-6 rounded-2xl sm:rounded-3xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)]/50 hover:border-[var(--c-gold)]/60 flex flex-col justify-center items-center text-center group transition-all"
                >
                  <Sliders className="w-8 h-8 text-[var(--c-gold)] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-[var(--c-text)]">Browse All Tools</span>
                  <span className="text-xs text-[var(--c-muted)] mt-1">{TOOLS_DATA.length}+ Free Utilities</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY TOOLBOXX (4 Luxury Feature Blocks) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Why ToolBoxX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)]">
            Built with Craft. Engineered for Privacy.
          </h2>
          <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
            Every tool is designed to solve common document and media tasks with instant speed and zero server reliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fast */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              Fast
            </h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Get your task done quickly without complicated software, installation delays, or server queues.
            </p>
          </div>

          {/* Simple */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              Simple
            </h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Clean, distraction-free interfaces designed for everyone with zero learning curve.
            </p>
          </div>

          {/* Private */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              Private
            </h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Keep privacy at the center of every file-based tool. 100% on-device browser processing.
            </p>
          </div>

          {/* Free */}
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 hover:border-[var(--c-border-hover)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              Free
            </h3>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              Provide useful everyday utilities without subscription paywalls, watermarks, or account walls.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/30 py-20 sm:py-24">
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
              Common questions about ToolBoxX, file security, and browser utilities.
            </p>
          </div>

          <Accordion items={HOMEPAGE_FAQS} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-10 sm:p-14 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)] tracking-tight">
              Ready to streamline your workflow?
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
              <span>Get Started — It's Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
