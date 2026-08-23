import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ToolMeta } from '../../types/tools';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: ToolMeta;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className = '' }) => {
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'images':
        return {
          badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 group-hover:bg-sky-600 group-hover:text-white',
        };
      case 'pdf':
        return {
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white',
        };
      case 'text':
        return {
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
        };
      case 'generators':
      default:
        return {
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
        };
    }
  };

  const theme = getCategoryTheme(tool.category);

  return (
    <Link
      to={tool.path}
      className={`group relative p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${theme.iconBg}`}
          >
            <DynamicIcon name={tool.icon} className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                {tool.badge}
              </span>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}
            >
              {tool.category}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors mb-2">
          {tool.name}
        </h3>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-200">
        <span>Open Tool</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
