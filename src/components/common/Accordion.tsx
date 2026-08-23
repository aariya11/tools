import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '../../types/tools';

interface AccordionProps {
  items: FAQItem[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className = '' }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={idx}
            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm transition-all"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold">{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
