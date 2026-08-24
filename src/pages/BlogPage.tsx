import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  Sparkles,
  Wrench,
  X,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getAllBlogPosts } from '../data/blogData';
import { getToolById } from '../data/toolsData';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const CATEGORIES = ['All', 'PDF', 'Image', 'Productivity', 'Security'] as const;

export const BlogPage: React.FC = () => {
  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const featuredPost = useMemo(() => {
    return allPosts.find((p) => p.featured) || allPosts[0];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query)) ||
        post.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  const featuredPrimaryTool = featuredPost ? getToolById(featuredPost.primaryToolId) : null;

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 transition-colors">
      <SeoHead
        title="ToolBoxX Editorial & Tutorials – PDF, Image, Privacy & Productivity Guides"
        description="Comprehensive, actionable engineering tutorials and productivity guides for client-side PDF manipulation, image optimization, EXIF privacy, and web performance."
        canonicalPath="/blog"
      />

      {/* Hero Header */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ToolBoxX Editorial & Guides</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
              Actionable Guides for <br className="hidden sm:inline" />
              <span className="text-[var(--c-gold)]">Private, High-Speed</span> Productivity.
            </h1>

            <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
              Learn how to optimize files, protect digital metadata, and unlock browser-native workflows with zero server uploads and zero paywalls.
            </p>
          </div>

          {/* Search & Category Filter Strip */}
          <div className="mt-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)] hover:text-[var(--c-text)]'
                    }`}
                  >
                    {cat === 'All' ? 'All Guides' : cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials, keywords, tags..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:border-[var(--c-gold)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-subtle)] hover:text-[var(--c-text)] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-14">
        {/* Featured Hero Article Banner (Shown when no active search/filtered category) */}
        {selectedCategory === 'All' && !searchQuery && featuredPost && (
          <div className="relative group rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden shadow-xl shadow-black/20 hover:border-[var(--c-gold)]/50 transition-all duration-300">
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--c-gold)]/15 border border-[var(--c-gold)]/40 text-[var(--c-gold)] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Guide
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-accent)] font-semibold">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1 text-[var(--c-subtle)]">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readingTime}
                </span>
                <span className="flex items-center gap-1 text-[var(--c-subtle)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredPost.date}
                </span>
              </div>

              <div className="space-y-3 max-w-4xl">
                <Link to={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                </Link>
                <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              {/* Tags & Action Buttons */}
              <div className="pt-4 border-t border-[var(--c-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {featuredPrimaryTool && (
                    <Link
                      to={featuredPrimaryTool.path}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                      <span>Try {featuredPrimaryTool.name}</span>
                    </Link>
                  )}

                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-gold)] text-black font-bold text-xs sm:text-sm hover:brightness-110 transition-all shadow-md shadow-[var(--c-gold)]/20"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--c-gold)]" />
              <h3 className="text-xl font-bold text-[var(--c-text)]">
                {selectedCategory === 'All' ? 'Latest Tutorials & Articles' : `${selectedCategory} Guides`}
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--c-subtle)]">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] space-y-3">
              <p className="text-base font-semibold text-[var(--c-muted)]">No articles found matching your criteria</p>
              <p className="text-xs text-[var(--c-subtle)]">Try clearing search terms or switching to "All Guides"</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group relative rounded-2xl sm:rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] hover:border-[var(--c-gold)]/40 shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between p-6 sm:p-7"
                >
                  <div className="space-y-4">
                    {/* Header meta */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[var(--c-subtle)] font-medium">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                      </span>
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug}`}>
                      <h4 className="text-lg font-bold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[var(--c-muted)] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center font-bold text-[10px]">
                        {post.author.name.charAt(0)}
                      </div>
                      <span className="text-[var(--c-subtle)] font-medium">{post.author.name}</span>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="font-semibold text-[var(--c-gold)] group-hover:text-[var(--c-text)] flex items-center gap-1 transition-colors"
                    >
                      <span>Read Guide</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="ToolBoxX Editorial & Tutorials – Free Private Productivity Guides"
          description="Read actionable client-side file optimization, security, and productivity tutorials with 0 server uploads."
        />
      </div>
    </div>
  );
};