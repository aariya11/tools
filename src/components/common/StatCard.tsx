import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeType?: 'success' | 'neutral' | 'warning';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  badge,
  badgeType = 'neutral',
  icon,
  className = '',
  style,
}) => {
  const getBadgeClasses = () => {
    switch (badgeType) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      style={style}
      className={`p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getBadgeClasses()}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subValue && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subValue}</p>
      )}
    </div>
  );
};
