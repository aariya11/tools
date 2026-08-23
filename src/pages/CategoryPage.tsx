import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ToolCard } from '../components/common/ToolCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { AdSlot } from '../components/common/AdSlot';
import { SeoHead } from '../components/common/SeoHead';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { CATEGORIES, getToolsByCategory } from '../data/toolsData';

export const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryMeta = CATEGORIES.find((c) => c.id === id);

  if (!categoryMeta) {
    return <Navigate to="/all-tools" replace />;
  }

  const tools = getToolsByCategory(categoryMeta.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <SeoHead
        title={`${categoryMeta.name} – Free Online Utilities | ToolBoxX`}
        description={categoryMeta.description}
        canonicalPath={`/category/${categoryMeta.id}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'All Tools', url: '/all-tools' },
          { name: categoryMeta.name, url: `/category/${categoryMeta.id}` }
        ]}
      />

      <Breadcrumbs
        items={[
          { label: 'All Tools', path: '/all-tools' },
          { label: categoryMeta.name },
        ]}
      />

      <div className="text-center max-w-3xl mx-auto my-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <DynamicIcon name={categoryMeta.icon} className="w-3.5 h-3.5" />
          <span>{categoryMeta.name}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          {categoryMeta.name}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          {categoryMeta.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-8">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="my-12">
        <AdSlot type="in-content" />
      </div>
    </div>
  );
};
