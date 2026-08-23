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

      <div className="text-center max-w-3xl mx-auto my-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Grid className="w-3.5 h-3.5" />
          <span>Full Catalog ({TOOLS_DATA.length} Tools)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          All Online Utilities
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Fast, browser-based tools with 100% on-device privacy. Zero server uploads.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="max-w-3xl mx-auto mb-10 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all tools by name, action or keyword..."
            className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'images', label: 'Image Tools' },
            { id: 'pdf', label: 'PDF Tools' },
            { id: 'text', label: 'Text Tools' },
            { id: 'generators', label: 'Generators' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-lg">No tools found matching "{query}"</p>
          <p className="text-sm mt-1">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
