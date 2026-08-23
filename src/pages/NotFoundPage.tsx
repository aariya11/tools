import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, Search, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { getPopularTools } from '../data/toolsData';

export const NotFoundPage: React.FC = () => {
  const popularTools = getPopularTools().slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8 flex-1">
      <SeoHead
        title="404 — Page Not Found"
        description="The tool or page you are looking for does not exist on ToolBoxX."
      />

      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
        <Wrench className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
          Page or Tool Not Found
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The requested page could not be found or may have moved. Check our popular tools below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
        <Link
          to="/all-tools"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Browse All Tools
        </Link>
      </div>

      {/* Popular Tools Shortcuts */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Popular Online Utilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition-colors flex items-center justify-between group"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {tool.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
