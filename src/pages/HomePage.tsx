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
} from 'lucide-react';
import { ToolCard } from '../components/common/ToolCard';
import { AdSlot } from '../components/common/AdSlot';
import { SeoHead } from '../components/common/SeoHead';
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
    { label: 'Compress an image', path: '/image-compressor' },
    { label: 'Convert JPG to PNG', path: '/jpg-to-png' },
    { label: 'Merge PDF files', path: '/pdf-merge' },
    { label: 'Count words', path: '/word-counter' },
    { label: 'Create a QR code', path: '/qr-code-generator' },
    { label: 'Convert PNG to WebP', path: '/png-to-webp' },
    { label: 'PDF to JPG', path: '/pdf-to-jpg' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
    }
  };

  return (
    <div className="w-full">
      <SeoHead
        title="ToolBoxX — Free Online Tools That Just Work"
        description="Compress, convert, resize, generate and transform your files and text — quickly, privately and for free directly in your browser."
        canonicalPath="/"
        keywords={[
          'image compressor',
          'pdf merge',
          'pdf split',
          'jpg to png',
          'png to webp',
          'word counter',
          'character counter',
          'case converter',
          'qr code generator',
          'free online tools',
        ]}
      />

      {/* Top Header AdSlot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 hidden sm:block">
        <AdSlot type="leaderboard" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Background glow gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Privacy Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Client-Side Privacy: Your files never leave your device</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Free Online Tools That{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              Just Work.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Compress, convert, resize, generate and transform your files and text — quickly, privately and for free.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative flex items-center rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to do? (e.g. compress photo, count words, pdf merge)..."
                  className="w-full px-4 py-4 text-base bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown if typing */}
              {searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-left">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      No matching tools found for "{searchQuery}".
                    </div>
                  ) : (
                    searchResults.map((tool) => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {tool.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {tool.shortDescription}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
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
              <span className="text-slate-400 font-medium mr-1">Popular:</span>
              {QUICK_SUGGESTIONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium transition-all shadow-2xs backdrop-blur-xs"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const count = TOOLS_DATA.filter((t) => t.category === category.id).length;
            const getCatIcon = (id: string) => {
              switch (id) {
                case 'images':
                  return <ImageIcon className="w-6 h-6 text-sky-500" />;
                case 'pdf':
                  return <FileText className="w-6 h-6 text-rose-500" />;
                case 'text':
                  return <Type className="w-6 h-6 text-emerald-500" />;
                case 'generators':
                  return <QrCode className="w-6 h-6 text-purple-500" />;
                default:
                  return <Wrench className="w-6 h-6 text-indigo-500" />;
              }
            };

            return (
              <Link
                key={category.id}
                to={category.id === 'pdf' ? '/pdf-tools' : `/category/${category.id}`}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {getCatIcon(category.id)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{count} Tools</span>
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Top Rated</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Popular Tools
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              The most loved browser utilities on ToolBoxX.
            </p>
          </div>

          <Link
            to="/all-tools"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Recently Added & Updated
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              New utilities added to our client-side platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trust & Privacy Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Why Choose ToolBoxX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Built Different: Fast, Free, and 100% Private.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike traditional online converters that upload your confidential files to remote servers, ToolBoxX executes processing locally in your browser memory using modern WebAssembly and Canvas APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Zero Cloud Uploads
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your images, contracts, and text never leave your device. All computations execute directly inside your browser sandbox.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Instant Processing Speed
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No server queueing, no file upload waiting times, and no artificial delays. Tasks finish instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Free Forever, No Sign-Up
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No subscription walls, no watermarks, and no mandatory account registration to access any tool.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
