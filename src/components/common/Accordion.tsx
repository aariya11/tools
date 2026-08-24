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
            className="border border-[#2A2824] rounded-2xl overflow-hidden bg-[#161513] hover:border-[#3D3A34] transition-all"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-medium text-[#F5F1E8] hover:text-[#E8DFCF] transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold">{item.question}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-[#B79B70] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#E8DFCF]' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-2 text-sm text-[#B8B2A7] leading-relaxed border-t border-[#2A2824]/60">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
