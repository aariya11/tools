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
    <div className={`space-y-3.5 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={idx}
            className="border border-[var(--c-border)] rounded-2xl overflow-hidden bg-[var(--c-surface)] hover:border-[var(--c-border-hover)] transition-all"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-medium text-[var(--c-text)] hover:text-[var(--c-accent)] transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold">{item.question}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-[var(--c-gold)] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[var(--c-accent)]' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-2 text-sm text-[var(--c-muted)] leading-relaxed border-t border-[var(--c-border)]/60">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
