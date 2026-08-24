import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Search,
  CheckCircle2,
  Zap,
  Sliders,
  Check,
  Minimize2,
} from 'lucide-react';
import { getToolsByCategory } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const FORMAT_COMPARISON = [
  { format: 'WebP', transparency: true, animation: true, bestFor: 'Websites, E-commerce, High Core Web Vitals (30% smaller than JPEG)' },
  { format: 'JPEG / JPG', transparency: false, animation: false, bestFor: 'Standard photos, print attachments, legacy compatibility' },
  { format: 'PNG', transparency: true, animation: false, bestFor: 'Logos, transparent graphics, UI screenshots with sharp lines' },
  { format: 'SVG', transparency: true, animation: true, bestFor: 'Vector icons, logos, illustrations that scale infinitely' },
];

const IMAGE_FAQS = [
  {
    question: 'How much image file size can I save with ToolBoxX Image Compressor?',
    answer: 'Depending on your starting resolution and quality level, you can typically reduce file weight by 40% to 85% with zero perceptible loss in visual clarity.',
  },
  {
    question: 'Are my photos uploaded to any remote server or AI cloud?',
    answer: 'No. All image resizing, compression, format conversion, and EXIF metadata stripping happens strictly inside your browser memory using HTML5 Canvas and Blob APIs.',
  },
  {
    question: 'Does ToolBoxX support converting WebP back to JPG or PNG?',
    answer: 'Yes! Our Image Converter and JPG to PNG / PNG to WebP tools support bidirectional conversion across all modern web image formats.',
  },
];
export const FreeImageToolsPage: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const allImageTools = useMemo(() => {
    return getToolsByCategory('images');
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchFilter.trim()) return allImageTools;
    const q = searchFilter.toLowerCase();
    return allImageTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q)
    );
  }, [allImageTools, searchFilter]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="Free In-Browser Image Studio ? Compress, Resize, Convert, Background Remover | ToolBoxX"
        description="Comprehensive client-side image editor: Compress JPG/PNG/WebP, resize with social presets, remove backgrounds, strip EXIF privacy metadata, watermark, upscale, and convert formats."
        canonicalPath="/free-image-tools"
        faqs={IMAGE_FAQS}
      />

      {/* Hero Section */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Client-Side Image Processing Studio</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                High-Performance <br className="hidden sm:inline" />
                <span className="text-[var(--c-gold)]">Browser Image Tools</span> with Zero Uploads.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Compress graphics by 80%, change dimensions with aspect ratio lock, convert between WebP, PNG, and JPG, and remove backgrounds with real-time browser canvas speed.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  100% Client-Side Privacy
                </span>
                <span>?</span>
                <span>Live Before / After Previews</span>
                <span>?</span>
                <span>Lossless & Perceptual Compression</span>
              </div>
            </div>

            {/* Quick Banner */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                <Sparkles className="w-4 h-4" />
                <span>Image Optimization Guides</span>
              </div>
              <div className="space-y-2 text-xs">
                <Link to="/blog/how-to-reduce-image-size-for-instagram-and-web" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? Reduce Image Size for Instagram & Web ?
                </Link>
                <Link to="/blog/how-to-convert-jpg-to-png-transparent-background" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? Convert JPG to PNG Transparent Background ?
                </Link>
                <Link to="/blog/how-to-remove-metadata-from-images-exif-privacy" className="block text-[var(--c-text)] hover:text-[var(--c-gold)] font-semibold">
                  ? Strip EXIF Metadata for Privacy ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Tools Grid */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
                All 14+ Image Studio Utilities
              </h2>
              <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                Drag, drop, and optimize photos instantly without cloud processing.
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search image tools..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs sm:text-sm text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Web Format Guide */}
        <section className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--c-text)]">
              Modern Web Image Formats: When to Use Which?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
              Select the optimal format to achieve maximum Google PageSpeed and visual quality.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-mono uppercase">
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Transparency</th>
                  <th className="py-3 px-4">Animation</th>
                  <th className="py-3 px-4">Recommended Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]/60 text-[var(--c-muted)]">
                {FORMAT_COMPARISON.map((f, idx) => (
                  <tr key={idx} className="hover:bg-[var(--c-surface)] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--c-gold)]">{f.format}</td>
                    <td className="py-3.5 px-4">
                      {f.transparency ? <span className="text-emerald-400 font-semibold">Yes</span> : <span className="text-[var(--c-subtle)]">No</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      {f.animation ? <span className="text-emerald-400 font-semibold">Yes</span> : <span className="text-[var(--c-subtle)]">No</span>}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--c-text)]">{f.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Image Studio FAQs
          </h2>
          <div className="space-y-3">
            {IMAGE_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[var(--c-text)] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--c-gold)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed border-t border-[var(--c-border)]/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="Free In-Browser Image Studio ? ToolBoxX"
          description="Compress, resize, convert, remove backgrounds, and strip EXIF metadata without uploading files."
        />
      </div>
    </div>
  );
};
