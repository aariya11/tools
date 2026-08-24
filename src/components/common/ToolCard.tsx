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
      className={`group relative p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#2A2824] bg-[#161513] hover:bg-[#1A1916] hover:border-[#B79B70]/40 shadow-sm hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
        isFeatured ? 'border-[#3D3A34] bg-[#181714]' : ''
      } ${className}`}
    >
      <div>
        {/* Top Icon & Badge Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#1F1E1B] border border-[#2A2824] group-hover:border-[#B79B70]/50 text-[#B79B70] flex items-center justify-center transition-colors">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2A2824] text-[#E8DFCF] border border-[#3D3A34]">
                {tool.badge}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F1E1B] text-[#B8B2A7] border border-[#2A2824]">
              {tool.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#F5F1E8] group-hover:text-[#E8DFCF] transition-colors mb-2 leading-snug">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#B8B2A7] line-clamp-2 leading-relaxed font-normal">
          {tool.shortDescription}
        </p>
      </div>

      {/* Card Action Link Footer */}
      <div className="mt-6 pt-4 border-t border-[#2A2824]/60 flex items-center justify-between text-xs font-semibold text-[#B8B2A7] group-hover:text-[#F5F1E8] transition-colors">
        <span className="font-medium tracking-wide">Open Tool</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#B79B70] group-hover:translate-x-1.5 transition-transform duration-200" />
      </div>
    </Link>
  );
};
