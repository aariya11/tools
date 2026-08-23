import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Type,
  QrCode,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';
import { ToolCard } from '../components/common/ToolCard';
import { AdSlot } from '../components/common/AdSlot';
import { SeoHead } from '../components/common/SeoHead';
import { Accordion } from '../components/common/Accordion';
import {
  TOOLS_DATA,
  CATEGORIES,
  getPopularTools,
  getRecentTools,
  searchTools,
} from '../data/toolsData';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const popularTools = getPopularTools();
  const recentTools = getRecentTools();
  const searchResults = searchTools(searchQuery);

  const QUICK_SUGGESTIONS = [
    { label: 'Compress PDF', path: '/pdf-compress' },
    { label: 'Merge PDF', path: '/pdf-merge' },
    { label: 'Image Compressor', path: '/image-compressor' },
    { label: 'JPG to PNG', path: '/jpg-to-png' },
    { label: 'Word Counter', path: '/word-counter' },
    { label: 'QR Code Generator', path: '/qr-code-generator' },
    { label: 'Text to Handwriting', path: '/text-to-handwriting' },
    { label: 'Edit PDF', path: '/edit-pdf' },
  ];

  const HOMEPAGE_FAQS = [
    {
      question: 'What is ToolBoxX?',
      answer: 'ToolBoxX is a comprehensive online utility platform featuring 39+ free browser-based tools for editing PDFs, compressing images, converting document formats, counting words, and generating custom QR codes without software installation.'
    },
    {
      question: 'Are all tools on ToolBoxX completely free to use?',
      answer: 'Yes, 100% of the tools on ToolBoxX are completely free with no usage limits, hidden fees, subscriptions, or watermarks.'
    },
    {
      question: 'Do I need to create an account or sign up to use the tools?',
      answer: 'No registration or account sign-up is required. All utilities are immediately accessible directly in your web browser.'
    },
    {
      question: 'How does client-side privacy work on ToolBoxX?',
      answer: 'Unlike traditional web converters that upload your sensitive documents to remote cloud servers, ToolBoxX executes file processing locally in your browser memory using modern WebAssembly, Canvas, and JavaScript APIs. Your files never leave your computer or phone.'
    },
    {
      question: 'Can I use ToolBoxX on mobile phones and tablets?',
      answer: 'Yes! ToolBoxX is fully responsive and optimized for all modern mobile devices, tablets, and desktop browsers including Chrome, Safari, Firefox, and Edge.'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
    }
  };

  const getCatIcon = (id: string) => {
    switch (id) {
      case 'images':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'text':
        return <Type className="w-5 h-5" />;
      case 'generators':
      default:
        return <QrCode className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full">
      <SeoHead
        title="Free Online Tools – PDF, Image, Text & QR Code Utilities"
        description="Discover 39+ fast, free online tools to compress images, merge and edit PDF files, convert formats, count words, and generate QR codes with 100% browser privacy."
        canonicalPath="/"
        faqs={HOMEPAGE_FAQS}
      />

      {/* Top Header AdSlot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 hidden sm:block">
        <AdSlot type="leaderboard" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Background subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-zinc-500/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Privacy Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Privacy: Your files never leave your device</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
            Free Online Tools That{' '}
            <span className="text-zinc-500 dark:text-zinc-400">
              Just Work.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Compress, convert, resize, generate and transform your files and text — quickly, privately and for free directly in your browser.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative flex items-center rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 backdrop-blur-md overflow-hidden focus-within:ring-2 focus-within:ring-zinc-400 transition-all">
                <Search className="w-5 h-5 text-zinc-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to do? (e.g. compress pdf, jpg to png, word counter)..."
                  className="w-full px-4 py-4 text-base bg-transparent border-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold shadow-md transition-all shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown if typing */}
              {searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-left">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-zinc-400">
                      No matching tools found for "{searchQuery}".
                    </div>
                  ) : (
                    searchResults.map((tool) => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {tool.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {tool.shortDescription}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                          Use <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-zinc-400 font-bold mr-1">Popular:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors border border-zinc-200/80 dark:border-zinc-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Directory Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const count = TOOLS_DATA.filter((t) => t.category === category.id).length;
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                    {getCatIcon(category.id)}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-200 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>{count} Tools Available</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Top Rated</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              Popular Tools
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              The most frequently used browser utilities on ToolBoxX.
            </p>
          </div>

          <Link
            to="/all-tools"
            className="text-sm font-bold text-zinc-900 dark:text-white hover:underline flex items-center gap-1"
          >
            View All ({TOOLS_DATA.length}) Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Mid Page In-Content AdSlot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <AdSlot type="in-content" />
      </div>

      {/* Recently Added Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              Recently Added & Updated Tools
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              New client-side tools and office conversion capabilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Comprehensive SEO Content & Platform Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              <span>Online Toolbox Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
              All-in-One Free Online Tools Platform
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              ToolBoxX is a modern suite of free web tools designed to solve daily digital file tasks effortlessly. Whether you need to compress large PDF documents, convert image formats like JPG to PNG and PNG to WebP, inspect text with our word counter, or generate scannable QR codes with custom logos, our browser-based utilities give you fast, reliable, and private results without requiring downloads or subscriptions.
            </p>
          </div>

          {/* 4 Feature Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF Tools</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Merge, split, compress, edit, sign, redact, OCR, and convert PDFs to and from Word, Excel, PowerPoint, and JPG formats.
              </p>
              <Link to="/category/pdf" className="text-xs font-bold text-zinc-900 dark:text-white inline-flex items-center gap-1 hover:underline pt-2">
                Explore PDF Tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Image Tools</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Compress JPG, PNG, and WebP photos with quality sliders, resize image dimensions with aspect ratio lock, and convert formats.
              </p>
              <Link to="/category/images" className="text-xs font-bold text-zinc-900 dark:text-white inline-flex items-center gap-1 hover:underline pt-2">
                Explore Image Tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-500" />
                <span>Text Tools</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Count words and characters, analyze reading time, convert case styles (UPPERCASE, Title Case, camelCase), and generate realistic handwriting.
              </p>
              <Link to="/category/text" className="text-xs font-bold text-zinc-900 dark:text-white inline-flex items-center gap-1 hover:underline pt-2">
                Explore Text Tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                <span>QR Generators</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Create static QR codes for links, Wi-Fi credentials, emails, and phone numbers with custom color palettes and embedded logos.
              </p>
              <Link to="/qr-code-generator" className="text-xs font-bold text-zinc-900 dark:text-white inline-flex items-center gap-1 hover:underline pt-2">
                Create QR Codes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Client-Side Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Why Choose ToolBoxX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
              Fast, Free, and 100% Client-Side Private.
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Unlike traditional cloud converters that upload your confidential files to remote servers, ToolBoxX executes processing locally in your browser memory using modern WebAssembly and Canvas APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Zero Cloud Uploads
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your images, contracts, and text never leave your device. All computations execute directly inside your browser sandbox.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Instant Processing Speed
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                No server queues, no file transfer delays, and no upload waiting times. Everything processes in real-time.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Free Forever, No Sign-Up
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                No subscription walls, no watermarks, and no mandatory account registration required to access any tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>Platform FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Answers to common questions about using ToolBoxX online utilities.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion items={HOMEPAGE_FAQS} />
        </div>
      </section>
    </div>
  );
};
