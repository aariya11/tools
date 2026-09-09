import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { getPopularTools } from '../data/toolsData';

export const NotFoundPage: React.FC = () => {
  const popularTools = getPopularTools().slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8 flex-1">
      <SeoHead
        title="404 — Page Not Found"
        description="The tool or page you are looking for does not exist on ToolBoxX."
        noIndex
      />

      <div className="w-16 h-16 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center mx-auto shadow-inner">
        <span className="font-serif font-bold text-2xl">404</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-bold font-serif text-[var(--c-text)]">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-[var(--c-muted)] max-w-md mx-auto font-normal">
          The requested utility or document could not be found. Explore our most popular tools below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
        <Link
          to="/all-tools"
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] text-[var(--c-text)] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Browse All Tools
        </Link>
      </div>

      {/* Popular Tools Shortcuts */}
      <div className="pt-8 border-t border-[var(--c-border)] space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-subtle)]">
          Popular Online Utilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-gold)]/50 hover:bg-[var(--c-card)] transition-all flex items-center justify-between group"
            >
              <span className="text-xs font-semibold text-[var(--c-text)] group-hover:text-[var(--c-gold)]">
                {tool.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--c-subtle)] group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
