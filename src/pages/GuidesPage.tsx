import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Clock, ArrowRight, Search, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { getAllBlogPosts, type BlogPost } from '../data/blogData';

export const GuidesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const allPosts = getAllBlogPosts();

  const categories = ['All', 'PDF', 'Image', 'Productivity', 'Security'];

  const filteredGuides = allPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-12">
      <SeoHead
        title="Practical How-To Guides & Tutorials — ToolBoxX"
        description="Step-by-step guides on how to compress PDFs, convert images, merge files, extract text, and enhance digital productivity."
        canonicalPath="/guides"
      />

      <Breadcrumbs items={[{ label: 'How-To Guides' }]} />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Knowledge & Workflow Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[var(--c-text)] tracking-tight">
          How-To Productivity Guides
        </h1>
        <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed font-normal">
          In-depth tutorials written by digital workflow experts to help you solve everyday file and conversion challenges with ease.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-lg mx-auto relative">
          <Search className="w-4 h-4 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. compress pdf, convert jpg)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs sm:text-sm text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-2 focus:ring-[var(--c-gold)]/30 focus:border-[var(--c-gold)] shadow-sm outline-none transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-gold)]/40 font-bold shadow-xs'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border border-[var(--c-border)] hover:text-[var(--c-text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <article
            key={guide.slug}
            className="flex flex-col p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] shadow-lg hover:shadow-xl transition-all group relative"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[var(--c-subtle)] mb-3">
              <span className="px-2.5 py-1 rounded-md bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] font-bold">
                {guide.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {guide.readingTime}
              </span>
            </div>

            <h2 className="text-lg font-bold font-serif text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors leading-snug mb-3">
              <Link to={`/blog/${guide.slug}`} className="focus:outline-none">
                {guide.title}
              </Link>
            </h2>

            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal line-clamp-3 mb-6 flex-1">
              {guide.excerpt}
            </p>

            <div className="pt-4 border-t border-[var(--c-border)] flex items-center justify-between mt-auto">
              <span className="text-[11px] text-[var(--c-subtle)] font-mono">By {guide.author.name}</span>
              <Link
                to={`/blog/${guide.slug}`}
                className="text-xs font-bold text-[var(--c-gold)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
