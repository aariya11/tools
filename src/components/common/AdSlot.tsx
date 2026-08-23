import React from 'react';

export type AdSlotType = 'leaderboard' | 'in-content' | 'sidebar' | 'bottom-banner';

interface AdSlotProps {
  type?: AdSlotType;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type = 'in-content', className = '' }) => {
  // Configured ad dimensions based on standard IAB specifications
  const getDimensions = () => {
    switch (type) {
      case 'leaderboard':
        return 'min-h-[90px] max-w-[728px]';
      case 'sidebar':
        return 'min-h-[250px] max-w-[300px]';
      case 'bottom-banner':
        return 'min-h-[60px] max-w-[468px] sm:max-w-[728px]';
      case 'in-content':
      default:
        return 'min-h-[120px] max-w-[728px]';
    }
  };

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full mx-auto my-6 flex flex-col items-center justify-center ${getDimensions()} ${className}`}
    >
      <div className="w-full h-full border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 p-4 flex flex-col items-center justify-center text-center transition-colors">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
          Advertisement Space
        </span>
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Reserved non-intrusive container for future monetization
        </p>
      </div>
    </aside>
  );
};
