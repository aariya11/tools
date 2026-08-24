import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToolCard } from './ToolCard';
import { getToolById, TOOLS_DATA } from '../../data/toolsData';

interface RelatedToolsProps {
  currentToolId: string;
  relatedToolIds: string[];
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  currentToolId,
  relatedToolIds,
}) => {
  const currentTool = getToolById(currentToolId);
  const relatedTools = relatedToolIds
    .map((id) => getToolById(id))
    .filter(Boolean) as typeof TOOLS_DATA;

  if (relatedTools.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[var(--c-border)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--c-text)]">
            Related Utilities
          </h2>
          <p className="text-sm text-[var(--c-muted)] mt-1 font-normal">
            Other tools frequently used alongside {currentTool?.name || 'this utility'}
          </p>
        </div>

        <Link
          to="/all-tools"
          className="text-xs font-semibold text-[var(--c-gold)] hover:text-[var(--c-accent)] transition-colors flex items-center gap-1.5"
        >
          View All Tools <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {relatedTools.slice(0, 4).map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};

export const PostCompletionRecommendations: React.FC<{
  currentToolId: string;
  onReset?: () => void;
}> = ({ currentToolId, onReset }) => {
  const currentTool = getToolById(currentToolId);
  const relatedTools = (currentTool?.relatedToolIds || [])
    .map((id) => getToolById(id))
    .filter(Boolean) as typeof TOOLS_DATA;

  if (relatedTools.length === 0) return null;

  return (
    <div className="mt-8 p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-[var(--c-text)]">
          <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
          <h4 className="font-semibold text-sm tracking-wide">Next Recommended Steps:</h4>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-[var(--c-muted)] hover:text-[var(--c-text)] underline cursor-pointer"
          >
            Process another file
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {relatedTools.slice(0, 4).map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)]/50 hover:bg-[var(--c-surface)] transition-all flex flex-col justify-between group"
          >
            <span className="text-xs font-bold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors">
              {tool.name}
            </span>
            <span className="text-[11px] text-[var(--c-muted)] mt-1 line-clamp-1">
              {tool.shortDescription}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
