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
    <section className="mt-16 pt-12 border-t border-[#2A2824]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F1E8]">
            Related Utilities
          </h2>
          <p className="text-sm text-[#B8B2A7] mt-1 font-normal">
            Other tools frequently used alongside {currentTool?.name || 'this utility'}
          </p>
        </div>

        <Link
          to="/all-tools"
          className="text-xs font-semibold text-[#B79B70] hover:text-[#E8DFCF] transition-colors flex items-center gap-1.5"
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
    <div className="mt-8 p-6 rounded-2xl border border-[#2A2824] bg-[#161513] shadow-lg animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-[#F5F1E8]">
          <Sparkles className="w-4 h-4 text-[#B79B70]" />
          <h4 className="font-semibold text-sm tracking-wide">Next Recommended Steps:</h4>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-[#B8B2A7] hover:text-[#F5F1E8] underline cursor-pointer"
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
            className="p-4 rounded-xl border border-[#2A2824] bg-[#1B1A17] hover:border-[#B79B70]/50 hover:bg-[#1F1E1B] transition-all flex flex-col justify-between group"
          >
            <span className="text-xs font-bold text-[#F5F1E8] group-hover:text-[#E8DFCF] transition-colors">
              {tool.name}
            </span>
            <span className="text-[11px] text-[#B8B2A7] mt-1 line-clamp-1">
              {tool.shortDescription}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
