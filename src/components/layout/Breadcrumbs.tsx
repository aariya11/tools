import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 py-3 ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 shrink-0" />
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors capitalize truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
