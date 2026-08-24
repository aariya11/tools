import React, { useState } from 'react';
import { Search, Grid } from 'lucide-react';
import { ToolCard } from '../components/common/ToolCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { AdSlot } from '../components/common/AdSlot';
import { SeoHead } from '../components/common/SeoHead';
import { TOOLS_DATA, searchTools } from '../data/toolsData';

export const AllToolsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  let filtered = searchTools(query);
  if (category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <SeoHead
        title="All Tools Directory – Complete Online Utility Suite | ToolBoxX"
        description="Browse the complete catalog of 39+ free, browser-based online tools for images, PDFs, text, and QR code generators with 100% on-device privacy."
        canonicalPath="/all-tools"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'All Tools', url: '/all-tools' }
        ]}
      />

      <Breadcrumbs items={[{ label: 'All Tools' }]} />

      <div className="text-center max-w-3xl mx-auto my-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1A17] border border-[#2A2824] text-[#B79B70] text-xs font-mono font-bold uppercase tracking-wider">
          <Grid className="w-3.5 h-3.5" />
          <span>Full Catalog ({TOOLS_DATA.length} Tools)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#F5F1E8]">
          All Online Utilities
        </h1>
        <p className="text-base text-[#B8B2A7] leading-relaxed max-w-2xl mx-auto font-normal">
          Fast, browser-based tools with 100% on-device privacy. Zero server uploads.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="max-w-3xl mx-auto mb-12 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#B79B70] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all tools by name, action or keyword..."
            className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-[#2A2824] bg-[#161513] text-[#F5F1E8] placeholder:text-[#7A756D] focus:ring-1 focus:ring-[#B79B70] focus:border-[#B79B70] shadow-sm outline-none transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'pdf', label: 'PDF Tools' },
            { id: 'images', label: 'Image Tools' },
            { id: 'text', label: 'Text Tools' },
            { id: 'generators', label: 'Utilities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                category === cat.id
                  ? 'bg-[#B79B70] text-[#11110F] font-bold shadow-xs'
                  : 'bg-[#161513] border border-[#2A2824] text-[#B8B2A7] hover:text-[#F5F1E8] hover:border-[#3D3A34]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-[#B8B2A7] bg-[#161513] rounded-3xl border border-[#2A2824]">
          <p className="font-semibold text-lg text-[#F5F1E8]">No tools found matching "{query}"</p>
          <p className="text-sm mt-1 text-[#7A756D]">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* AdSlot */}
      <div className="my-12">
        <AdSlot type="in-content" />
      </div>
    </div>
  );
};
