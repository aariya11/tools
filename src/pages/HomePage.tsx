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
  Type,
  ArrowLeftRight,
  QrCode,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Smartphone,
  Flame,
  Code2,
  BookOpen,
  Compass,
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
import { getAllBlogPosts } from '../data/blogData';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const popularTools = getPopularTools().slice(0, 12);
  const pdfTools = getToolsByCategory('pdf');
  const imageTools = getToolsByCategory('images');
  const textTools = getToolsByCategory('text');
  const calcTools = getToolsByCategory('calculators');
  const devTools = getToolsByCategory('developer');
  const generatorTools = getToolsByCategory('generators');

  const featuredTools = [
    TOOLS_DATA.find((t) => t.id === 'pdf-compress'),
    TOOLS_DATA.find((t) => t.id === 'pdf-to-word'),
    TOOLS_DATA.find((t) => t.id === 'image-compressor'),
    TOOLS_DATA.find((t) => t.id === 'background-remover'),
    TOOLS_DATA.find((t) => t.id === 'unit-converter'),
    TOOLS_DATA.find((t) => t.id === 'qr-code-generator'),
    TOOLS_DATA.find((t) => t.id === 'word-counter'),
    TOOLS_DATA.find((t) => t.id === 'json-formatter'),
  ].filter(Boolean) as typeof TOOLS_DATA;

  const searchResults = searchQuery.trim() ? searchTools(searchQuery) : [];
  const popularGuides = getAllBlogPosts().slice(0, 4);

  // Exact popular shortcuts from prompt Section 3
  const POPULAR_SHORTCUTS = [
    { label: 'PDF to Word', path: '/pdf-to-word' },
    { label: 'Word to PDF', path: '/word-to-pdf' },
    { label: 'Compress PDF', path: '/pdf-compress' },
    { label: 'Merge PDF', path: '/pdf-merge' },
    { label: 'Split PDF', path: '/pdf-split' },
    { label: 'JPG to PDF', path: '/jpg-to-pdf' },
    { label: 'Compress Image', path: '/image-compressor' },
    { label: 'Resize Image', path: '/image-cropper' },
    { label: 'Remove Image Background', path: '/background-remover' },
    { label: 'QR Code Generator', path: '/qr-code-generator' },
  ];

  const HOMEPAGE_FAQS = [
    {
      question: 'Is ToolBoxX really 100% free to use?',
      answer: `Yes! Every tool across our ${TOOLS_DATA.length}+ utilities is free forever with no hidden paywalls, subscriptions, daily limits, or watermarks.`,
    },
    {
      question: 'Do I need to install software or register an account?',
      answer: 'No complicated software installation or account sign-up is required. All utilities run directly inside your web browser on desktop, tablet, and mobile devices.',
    },
    {
      question: 'Are my files uploaded to your servers?',
      answer: 'No. ToolBoxX implements client-side processing using WebAssembly, Canvas, and JavaScript. Your files are processed locally in your browser and are not uploaded to our servers.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, DOCX, XLSX, PPTX, JPG, PNG, WebP, GIF, SVG, CSV, JSON, ZIP, and plain text formats.',
    },
    {
      question: 'How does PDF and image compression work?',
      answer: 'Our compression algorithms remove internal metadata, optimize embedded color streams, and strip duplicate fonts while preserving high-definition visual fidelity and sharp vector text.',
    },
    {
      question: 'How large can my files be?',
      answer: 'Because processing happens on your local device using your browser memory rather than over a congested server connection, you can comfortably process large files up to several hundred megabytes.',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/all-tools?q=${encodeURIComponent(query)}` : '/all-tools');
  };

  return (
    <div className="w-full bg-[var(--c-bg)] text-[var(--c-text)]">
      <SeoHead
        title="ToolBoxX — Free Online Tools for PDF, Images, Text & More"
        description="Fast, free and easy-to-use online tools for converting, editing, compressing and managing your files. No software installation required."
        canonicalPath="/"
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION & PROMINENT TOOL SEARCH */}
      {/* ========================================================================= */}
      <section className="home-hero relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[var(--c-border)]/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
          {/* Subtle Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)] font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            <span>Free to use • Fast processing • Simple interface • Privacy-focused</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-[var(--c-text)] leading-tight sm:leading-tight">
            Free Online Tools for PDF, Images, Text & More
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed max-w-3xl mx-auto font-normal">
            Fast, free and easy-to-use online tools for converting, editing, compressing and managing your files. No software installation required.
          </p>

          {/* Prominent Tool Search Box (Dynamically uses actual real tool count) */}
          <div className="max-w-2xl mx-auto pt-2">
            <form role="search" onSubmit={handleSearchSubmit} className="relative group">
              <Search className="w-5 h-5 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                name="q"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery(''); }}
                placeholder={`Search ${TOOLS_DATA.length} tools…`}
                className="w-full pl-12 pr-24 py-4 sm:py-5 rounded-2xl sm:rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-sm sm:text-base placeholder:text-[var(--c-muted)] focus:ring-2 focus:ring-[var(--c-gold)]/30 focus:border-[var(--c-gold)] shadow-xl outline-none transition-all"
                aria-label="Search all online tools"
                aria-controls={searchQuery.trim() ? 'home-search-results' : undefined}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--c-accent)] px-4 py-3 text-sm font-semibold text-[var(--c-bg)] hover:bg-[var(--c-gold)] transition-colors">
                Search
              </button>

              {/* Instant Dropdown Search Results */}
              {searchQuery.trim().length > 0 && (
                <div id="home-search-results" className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl z-30 text-left max-h-96 overflow-y-auto">
                  <p role="status" className="px-3 py-2 text-xs text-[var(--c-muted)]">{searchResults.length} results. Press Enter to browse all matches.</p>
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

            {/* Popular Tool Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="text-xs text-[var(--c-subtle)] mr-1">Popular Shortcuts:</span>
              {POPULAR_SHORTCUTS.map((item) => (
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
              to="/tools"
              className="px-8 py-3.5 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
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
      {/* 2. POPULAR TOOLS */}
      {/* ========================================================================= */}
      <section id="popular-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>High-Demand Utilities</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Popular Tools
            </h2>
            <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
              Most frequently used online utilities for editing documents, optimizing graphics, and daily tasks.
            </p>
          </div>

          <Link
            to="/tools"
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
      {/* 3. TOOL CATEGORIES */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Explore Tool Categories
            </h2>
            <p className="text-sm text-[var(--c-muted)] font-normal">
              Find exactly what you need organized across our specialized utility suites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* PDF Tools Category */}
            <Link
              to="/pdf-tools"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                PDF Tools ({pdfTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                Compress, merge, split, convert to Word, rotate, unlock, sign, and organize PDF documents.
              </p>
            </Link>

            {/* Image Tools Category */}
            <Link
              to="/category/images"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                Image Tools ({imageTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                Compress, resize, crop, remove backgrounds, upscale, and convert between JPG, PNG, and WebP.
              </p>
            </Link>

            {/* Text Tools Category */}
            <Link
              to="/category/text"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                Text Tools ({textTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                Word counter, character counter, text diff comparison, case converter, and dummy text generator.
              </p>
            </Link>

            {/* Converters Category */}
            <Link
              to="/unit-converter"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                Converters & Math ({calcTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                Unit converter (8 dimensions), percentages, timestamps, file sizes, and time zones.
              </p>
            </Link>

            {/* Developer Tools Category */}
            <Link
              to="/category/developer"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                Developer Tools ({devTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                JSON formatter & validator, Base64 encoder/decoder, URL tools, JWT inspector, and regex tester.
              </p>
            </Link>

            {/* Generators Category */}
            <Link
              to="/category/generators"
              className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)]/60 transition-all group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors">
                Generators ({generatorTools.length})
              </h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed line-clamp-2">
                Custom QR codes with logos, QR webcam scanner, barcodes, passwords, UUIDs, and sitemaps.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED TOOLS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hand-Picked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              Featured Tools
            </h2>
            <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
              Essential utilities designed to streamline your document, graphic, and code workflows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHY TOOLBOXX? (Honest, factual benefits) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Why ToolBoxX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)]">
            Honest Benefits. No Gimmicks.
          </h2>
          <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
            Built to solve real daily productivity hurdles with maximum speed, accessibility, and respect for your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Easy to Use</h3>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
              Clean, distraction-free interfaces with drag-and-drop support, sensible defaults, and instant previews.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Works in Your Browser</h3>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
              Where technically supported, processing happens locally in your browser memory. Your files are not uploaded.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Fast Processing</h3>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
              Zero network upload delays. WebAssembly and HTML5 Canvas deliver near-instant results directly on your CPU.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Mobile Friendly</h3>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
              Responsive layouts and touch-friendly controls optimized across iPhone, Android, tablets, and laptops.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW IT WORKS (4 simple steps) */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Step-by-Step Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
              How ToolBoxX Works
            </h2>
            <p className="text-sm sm:text-base text-[var(--c-muted)]">
              Get tasks done in four simple steps with zero technical hurdles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">01</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Choose a Tool</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Select from our categorized catalog of PDF, image, text, converter, or generator tools.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">02</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Upload or Enter Content</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Drag and drop your file or paste your text directly into the designated workspace.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">03</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Process Your File</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Configure your target parameters and let our browser-native algorithms process the task instantly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
              <div className="text-3xl font-serif font-bold text-[var(--c-gold)]">04</div>
              <h3 className="text-base font-bold text-[var(--c-text)]">Download Your Result</h3>
              <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                Save your finished document, copy your formatted code, or download your archive with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRIVACY & SECURITY EXPLANATION (Technically accurate statement) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--c-text)]">
                Privacy-First Architecture
              </h2>
              <p className="text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                Client-Side Verification Guarantee
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed font-normal">
            <p>
              <strong className="text-[var(--c-text)]">Your files are processed locally in your browser and are not uploaded.</strong>
            </p>
            <p>
              Unlike traditional cloud converter platforms that upload your confidential PDFs, contracts, photos, and spreadsheets to unfamiliar remote servers, ToolBoxX processes your data directly inside your web browser using HTML5 Canvas, File System APIs, and WebAssembly binaries.
            </p>
            <p>
              This architectural choice means zero network upload latency, zero cloud storage risk, and complete confidentiality for legal agreements, financial statements, and personal photos.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. POPULAR GUIDES */}
      {/* ========================================================================= */}
      <section className="border-t border-[var(--c-border)]/60 bg-[var(--c-surface)]/20 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Productivity Knowledge Base</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
                Popular Guides & Tutorials
              </h2>
              <p className="text-sm text-[var(--c-muted)] font-normal max-w-xl">
                Practical, human-written guides to help you optimize documents and conquer everyday file tasks.
              </p>
            </div>

            <Link
              to="/guides"
              className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Guides →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularGuides.map((guide) => (
              <article
                key={guide.slug}
                className="flex flex-col p-5 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] shadow-sm hover:shadow-md transition-all group"
              >
                <span className="text-[10px] font-mono text-[var(--c-gold)] font-bold uppercase mb-2">
                  {guide.category}
                </span>
                <h3 className="text-sm font-bold font-serif text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors line-clamp-2 mb-2">
                  <Link to={`/blog/${guide.slug}`}>
                    {guide.title}
                  </Link>
                </h3>
                <p className="text-xs text-[var(--c-muted)] line-clamp-2 mb-4 flex-1">
                  {guide.excerpt}
                </p>
                <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between text-xs text-[var(--c-subtle)] mt-auto">
                  <span>{guide.readingTime}</span>
                  <Link
                    to={`/blog/${guide.slug}`}
                    className="text-[var(--c-gold)] font-bold hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FAQ SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-[var(--c-border)]/60">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--c-text)]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[var(--c-muted)] font-normal">
            Real answers to common questions about file security, browser processing, and tool capabilities.
          </p>
        </div>

        <Accordion items={HOMEPAGE_FAQS} />
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-10 sm:p-14 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)] tracking-tight">
              Find the Right Tool for Your Task
            </h2>
            <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed font-normal">
              Join thousands of users converting, compressing, and editing files for free with complete on-device privacy.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/tools"
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
