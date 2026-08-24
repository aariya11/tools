import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { getBlogPostBySlug, getRelatedBlogPosts, type BlogPost } from '../data/blogData';
import { getToolById, TOOLS_DATA } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = useMemo(() => (slug ? getBlogPostBySlug(slug) : undefined), [slug]);
  const relatedPosts = useMemo(() => (slug ? getRelatedBlogPosts(slug, 3) : []), [slug]);

  // Reading progress scroll state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const primaryTool = useMemo(() => {
    return post?.primaryToolId ? getToolById(post.primaryToolId) : null;
  }, [post]);

  const relatedTools = useMemo(() => {
    if (!post?.relatedToolIds) return [];
    return post.relatedToolIds
      .map((id) => getToolById(id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
  }, [post]);

  // Track scroll progress & active TOC section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      if (!post) return;
      // Find current active section
      for (const section of post.sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 100) {
            setActiveSectionId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--c-bg)] text-[var(--c-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-gold)] mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
        <p className="text-sm text-[var(--c-muted)] max-w-md mb-6">
          The tutorial or guide you are looking for might have been moved or updated.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-gold)] text-black font-bold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Guides</span>
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Editorial Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title={post.title}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        breadcrumbs={breadcrumbs}
        faqs={post.faqs}
      />

      {/* Sticky Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--c-border)]/40 pointer-events-none">
        <div
          className="h-full bg-[var(--c-gold)] transition-all duration-75 ease-out shadow-sm shadow-[var(--c-gold)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header & Breadcrumbs Area */}
      <header className="pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-mono text-[var(--c-subtle)] flex-wrap">
            <Link to="/" className="hover:text-[var(--c-text)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-[var(--c-text)] transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-[var(--c-gold)]">{post.category}</span>
          </nav>

          {/* Title & Metadata */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[var(--c-gold)]/15 border border-[var(--c-gold)]/40 text-[var(--c-gold)]">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--c-subtle)]">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--c-subtle)]">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
              {post.excerpt}
            </p>
          </div>

          {/* Author Badge & Top Share Row */}
          <div className="pt-6 border-t border-[var(--c-border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center font-bold text-sm shadow-inner">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--c-text)]">{post.author.name}</div>
                <div className="text-xs text-[var(--c-subtle)]">{post.author.role}</div>
              </div>
            </div>

            <SocialShareButtons
              title={post.title}
              description={post.excerpt}
              variant="compact"
            />
          </div>
        </div>
      </header>

      {/* Main Two-Column Reader Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Main Article Content (8 cols) */}
          <main className="lg:col-span-8 space-y-12">
            {/* Key Takeaways Box */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-md space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-[var(--c-gold)]">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Takeaways & Quick Summary</span>
                </div>
                <ul className="space-y-2.5">
                  {post.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-[var(--c-text)] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* In-Article Sections */}
            <div className="space-y-12">
              {post.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="space-y-6 scroll-mt-24"
                >
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--c-text)] pb-2 border-b border-[var(--c-border)]">
                    {section.title}
                  </h2>

                  <div className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed space-y-4 font-normal whitespace-pre-line">
                    {section.content}
                  </div>

                  {/* Step-by-Step Cards if present */}
                  {section.steps && section.steps.length > 0 && (
                    <div className="space-y-3.5 my-6">
                      {section.steps.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center font-mono font-bold text-sm shrink-0">
                            {step.stepNumber}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[var(--c-text)]">
                              {step.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Callout Box if present */}
                  {section.callout && (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
                        section.callout.type === 'warning'
                          ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                          : section.callout.type === 'tip'
                          ? 'border-[var(--c-gold)]/40 bg-[var(--c-gold)]/10 text-[var(--c-text)]'
                          : 'border-blue-500/40 bg-blue-950/20 text-blue-200'
                      }`}
                    >
                      {section.callout.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      ) : section.callout.type === 'tip' ? (
                        <Lightbulb className="w-5 h-5 text-[var(--c-gold)] shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-wider">
                          {section.callout.title}
                        </h5>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {section.callout.message}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Interactive FAQs Section */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="pt-8 border-t border-[var(--c-border)] space-y-6">
                <h3 className="text-xl font-bold text-[var(--c-text)]">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {post.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[var(--c-text)] hover:text-[var(--c-accent)] transition-colors cursor-pointer"
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
            )}

            {/* Author Bio Box */}
            <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center font-bold text-xl shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-bold text-[var(--c-text)]">{post.author.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-subtle)] font-mono">
                    {post.author.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>

            {/* Bottom Social Share Banner */}
            <SocialShareButtons
              variant="banner"
              title={post.title}
              description={post.excerpt}
            />
          </main>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-6">
              {/* "Try the Tool" Interactive CTA Card */}
              {primaryTool && (
                <div className="p-6 rounded-3xl border border-[var(--c-gold)]/40 bg-[var(--c-card)] shadow-lg shadow-black/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--c-gold)]/15 text-[var(--c-gold)] border border-[var(--c-gold)]/30">
                      Recommended Tool
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Free
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--c-text)]">
                      {primaryTool.name}
                    </h3>
                    <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                      {primaryTool.shortDescription}
                    </p>
                  </div>

                  <Link
                    to={primaryTool.path}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--c-gold)] text-black font-bold text-sm hover:brightness-110 transition-all shadow-md shadow-[var(--c-gold)]/20"
                  >
                    <span>Launch {primaryTool.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Table of Contents Box */}
              <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  <span>Table of Contents</span>
                </h4>

                <nav className="space-y-1.5 text-xs">
                  {post.sections.map((section) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(section.id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`block py-1.5 px-3 rounded-xl transition-all leading-snug ${
                          isActive
                            ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold border border-[var(--c-border)]'
                            : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]/50'
                        }`}
                      >
                        {section.title}
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Related Guides List */}
              {relatedPosts.length > 0 && (
                <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-text)]">
                    Related Guides
                  </h4>

                  <div className="space-y-3">
                    {relatedPosts.map((rPost) => (
                      <Link
                        key={rPost.slug}
                        to={`/blog/${rPost.slug}`}
                        className="block group space-y-1"
                      >
                        <span className="text-[10px] font-mono text-[var(--c-gold)]">
                          {rPost.category} • {rPost.readingTime}
                        </span>
                        <h5 className="text-xs font-bold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors leading-snug line-clamp-2">
                          {rPost.title}
                        </h5>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom Section: Related Tools Grid */}
        {relatedTools.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[var(--c-border)] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-[var(--c-text)]">
                  Related Free In-Browser Tools
                </h3>
                <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                  100% Client-Side Processing • No Signups • No Server Uploads
                </p>
              </div>
              <Link
                to="/all-tools"
                className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] flex items-center gap-1 transition-colors"
              >
                <span>View All 60+ Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};