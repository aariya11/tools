import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ToolMeta } from '../../types/tools';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: ToolMeta;
  className?: string;
  isFeatured?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className = '', isFeatured = false }) => {
  return (
    <Link
      to={tool.path}
      className={`group relative p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] hover:border-[var(--c-gold)]/40 shadow-sm hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
        isFeatured ? 'border-[var(--c-border-hover)] bg-[var(--c-card)]' : ''
      } ${className}`}
    >
      <div>
        {/* Top Icon & Badge Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] group-hover:border-[var(--c-gold)]/50 text-[var(--c-gold)] flex items-center justify-center transition-colors">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--c-border)] text-[var(--c-accent)] border border-[var(--c-border-hover)]">
                {tool.badge}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]">
              {tool.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors mb-2 leading-snug">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--c-muted)] line-clamp-2 leading-relaxed font-normal">
          {tool.shortDescription}
        </p>
      </div>

      {/* Card Action Link Footer */}
      <div className="mt-6 pt-4 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--c-muted)] group-hover:text-[var(--c-text)] transition-colors">
        <span className="font-medium tracking-wide">Open Tool</span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--c-gold)] group-hover:translate-x-1.5 transition-transform duration-200" />
      </div>
    </Link>
  );
};
