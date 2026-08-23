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
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Related Tools
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Other utilities frequently used alongside {currentTool?.name || 'this tool'}
          </p>
        </div>

        <Link
          to="/all-tools"
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          View All Tools <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div className="mt-8 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30 backdrop-blur-sm animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-semibold text-base">You might also need:</h4>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline"
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
            className="p-3.5 rounded-xl border border-white dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {tool.name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {tool.shortDescription}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
