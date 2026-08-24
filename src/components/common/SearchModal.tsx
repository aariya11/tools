import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TOOLS_DATA, searchTools } from '../../data/toolsData';
import type { ToolMeta } from '../../types/tools';
import { DynamicIcon } from './DynamicIcon';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [results, setResults] = useState<ToolMeta[]>(TOOLS_DATA);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = searchTools(query);
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }
    setResults(filtered);
    setActiveIndex(0);
  }, [query, selectedCategory]);

  const handleSelectTool = (tool: ToolMeta) => {
    navigate(tool.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      handleSelectTool(results[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#161513] border border-[#2A2824] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#2A2824] gap-3">
          <Search className="w-5 h-5 text-[#B79B70] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools (e.g., 'compress pdf', 'jpg to png', 'word counter')..."
            className="w-full bg-transparent border-none text-[#F5F1E8] placeholder:text-[#7A756D] text-base focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#7A756D] hover:text-[#F5F1E8]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#B8B2A7] bg-[#1B1A17] border border-[#2A2824] rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#11110F]/60 border-b border-[#2A2824] overflow-x-auto text-xs">
          {['all', 'pdf', 'images', 'text', 'generators'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full capitalize font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#B79B70] text-[#11110F] font-bold shadow-xs'
                  : 'text-[#B8B2A7] hover:bg-[#1B1A17] hover:text-[#F5F1E8]'
              }`}
            >
              {cat === 'generators' ? 'utilities' : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 divide-y divide-[#2A2824]/40">
          {results.length === 0 ? (
            <div className="p-10 text-center text-[#B8B2A7]">
              <p className="font-semibold text-base text-[#F5F1E8]">No tools found matching "{query}"</p>
              <p className="text-xs mt-1 text-[#7A756D]">Try searching for "compress", "merge", "pdf", "convert", or "word".</p>
            </div>
          ) : (
            results.map((tool, idx) => {
              const isSelected = idx === activeIndex;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1B1A17] border border-[#2A2824] text-[#F5F1E8]'
                      : 'hover:bg-[#1B1A17]/60 text-[#B8B2A7]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#B79B70] text-[#11110F]'
                          : 'bg-[#1B1A17] border border-[#2A2824] text-[#B79B70]'
                      }`}
                    >
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F5F1E8] truncate">{tool.name}</span>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1B1A17] border border-[#2A2824] text-[#B8B2A7]">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8B2A7] truncate mt-0.5 font-normal">
                        {tool.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#B79B70] font-medium">
                        Select <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-[#7A756D]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-5 py-3 bg-[#11110F]/80 border-t border-[#2A2824] flex items-center justify-between text-xs text-[#7A756D]">
          <span>{results.length} tools indexed</span>
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
