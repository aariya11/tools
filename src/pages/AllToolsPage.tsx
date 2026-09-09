import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, X, LayoutGrid, ListFilter, Sparkles, FileText, Image as ImageIcon, Code2, Briefcase, Flame, Calculator, Type, FolderArchive, QrCode } from 'lucide-react';
import { ToolCard } from '../components/common/ToolCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { TOOLS_DATA, searchTools } from '../data/toolsData';

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: 'All Tools', icon: <Grid className="w-3.5 h-3.5" /> },
  { id: 'pdf', label: 'PDF Suite', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'images', label: 'Image Tools', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { id: 'ai', label: 'AI Suite', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'developer', label: 'Developer', icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: 'business', label: 'Business', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'social', label: 'Social & Creators', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'calculators', label: 'Calculators', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'text', label: 'Text Tools', icon: <Type className="w-3.5 h-3.5" /> },
  { id: 'file', label: 'File & Archive', icon: <FolderArchive className="w-3.5 h-3.5" /> },
  { id: 'generators', label: 'Generators', icon: <QrCode className="w-3.5 h-3.5" /> },
];

export const AllToolsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const setQuery = (value: string) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set('q', value);
      else next.delete('q');
      return next;
    }, { replace: true });
  };
  const [category, setCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');

  // Category counts computed accurately
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOOLS_DATA.length };
    TOOLS_DATA.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let result = query.trim() ? searchTools(query) : TOOLS_DATA;
    if (category !== 'all') {
      result = result.filter((t) => t.category === category);
    }
    return result;
  }, [query, category]);

  // Grouped tools for categorized view
  const groupedTools = useMemo(() => {
    const groups: { category: CategoryConfig; tools: typeof TOOLS_DATA }[] = [];
    CATEGORIES.filter((c) => c.id !== 'all').forEach((cat) => {
      const catTools = filtered.filter((t) => t.category === cat.id);
      if (catTools.length > 0) {
        groups.push({ category: cat, tools: catTools });
      }
    });
    return groups;
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full">
      <SeoHead
        title={`All Tools Directory – Complete Online Utility Suite (${TOOLS_DATA.length}+ Tools) | ToolBoxX`}
        description={`Browse the complete catalog of ${TOOLS_DATA.length}+ free, browser-based online tools for PDFs, images, AI, text, developer utilities and calculators with 100% on-device privacy.`}
        canonicalPath="/all-tools"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'All Tools', url: '/all-tools' }
        ]}
      />

      <Breadcrumbs items={[{ label: 'All Tools' }]} />

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto my-8 sm:my-12 space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
          <Grid className="w-3.5 h-3.5" />
          <span>Full Catalog ({TOOLS_DATA.length} Online Tools)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)] tracking-tight">
          All Online Utilities
        </h1>
        <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed max-w-2xl mx-auto font-normal">
          Fast, browser-based tools with 100% client-side privacy. Zero server uploads, completely free forever.
        </p>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="max-w-4xl mx-auto mb-10 space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="w-5 h-5 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the tool directory"
            placeholder="Search all tools by name, action or keyword (e.g. compress, merge, pdf, crop, age)..."
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 text-sm sm:text-base rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] shadow-md outline-none transition-all"
          />
          {query.trim() && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap sm:justify-center">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[var(--c-accent)] text-[var(--c-bg)] font-bold shadow-md'
                    : 'bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-border-hover)] hover:bg-[var(--c-card)]'
                }`}
              >
                <span className={isActive ? 'text-[var(--c-bg)]' : 'text-[var(--c-gold)]'}>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[var(--c-bg)]/20 text-[var(--c-bg)] font-bold'
                      : 'bg-[var(--c-card)] text-[var(--c-subtle)] border border-[var(--c-border)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result Stats & View Mode Toggle */}
        <div className="flex items-center justify-between px-1 text-xs text-[var(--c-muted)]">
          <div>
            Showing <strong className="text-[var(--c-text)]">{filtered.length}</strong> of{' '}
            <strong className="text-[var(--c-text)]">{TOOLS_DATA.length}</strong> tools
            {category !== 'all' && (
              <span className="ml-1 text-[var(--c-gold)]">
                in {CATEGORIES.find((c) => c.id === category)?.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[var(--c-surface)] p-1 rounded-xl border border-[var(--c-border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold shadow-xs'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] font-bold shadow-xs'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
              title="Grouped by Category View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tools Content */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-[var(--c-muted)] bg-[var(--c-surface)] rounded-3xl border border-[var(--c-border)] max-w-2xl mx-auto space-y-3">
          <p className="font-semibold text-lg text-[var(--c-text)]">No tools found matching "{query}"</p>
          <p className="text-sm text-[var(--c-subtle)]">Try clearing your search query or switching category filter.</p>
          <button
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="px-5 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grouped' && category === 'all' && !query.trim() ? (
        /* Grouped Sections View */
        <div className="space-y-12 sm:space-y-16">
          {groupedTools.map((group) => (
            <section key={group.category.id} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
                    {group.category.icon}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[var(--c-text)]">
                    {group.category.label}
                  </h2>
                  <span className="text-xs font-mono text-[var(--c-subtle)] bg-[var(--c-card)] px-2 py-0.5 rounded-full border border-[var(--c-border)]">
                    {group.tools.length}
                  </span>
                </div>

                <button
                  onClick={() => setCategory(group.category.id)}
                  className="text-xs font-semibold text-[var(--c-gold)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
                >
                  View Category →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};
