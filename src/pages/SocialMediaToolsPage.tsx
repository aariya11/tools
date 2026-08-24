import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Sparkles,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Search,
  CheckCircle2,
  Video,
  Camera,
  Layers,
} from 'lucide-react';
import { getToolById } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const SOCIAL_TOOL_IDS = [
  'image-resizer',
  'image-compressor',
  'background-remover',
  'ai-social-caption',
  'image-cropper',
  'image-watermark',
  'favicon-generator',
  'image-enhancer',
  'utm-builder',
  'qr-code-generator',
  'ai-title-generator',
  'case-converter',
];

const CREATOR_BENEFITS = [
  {
    title: 'Beat Social Compression Algorithms',
    description: 'Pre-optimize your photos and reels to exact platform aspect ratios (4:5, 9:16, 16:9) to prevent Instagram & TikTok from blurry re-encoding.',
  },
  {
    title: 'Transparent Overlays & Watermarks',
    description: 'Knock out solid backgrounds in seconds to create transparent PNG logos, stamps, and watermarks for brand protection.',
  },
  {
    title: 'Marketing Campaign Tracking',
    description: 'Generate trackable UTM links and high-res QR codes for bios, email newsletters, and sponsored influencer campaigns.',
  },
];

const SOCIAL_FAQS = [
  {
    question: 'Why do my Instagram photos look pixelated after uploading?',
    answer: 'If you upload an image larger than 1080px wide or exceeding 30MB, Instagram?s servers compress it aggressively. Using ToolBoxX Image Resizer (preset to 1080x1350px 4:5) and Image Compressor ensures your image stays razor sharp.',
  },
  {
    question: 'Can I generate captions with hashtags for multiple social platforms?',
    answer: 'Yes! You can use our AI Social Caption tool or visit the ToolBoxX Social Hub to generate tailored captions with custom tone, hashtags, and emojis.',
  },
  {
    question: 'Are there limits on watermark additions or image resizing?',
    answer: 'No. All tools are 100% free with unlimited batch processing directly in your browser.',
  },
];
export const SocialMediaToolsPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const socialTools = useMemo(() => {
    return SOCIAL_TOOL_IDS.map((id) => getToolById(id)).filter(
      (t): t is NonNullable<typeof t> => Boolean(t)
    );
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchFilter.trim()) return socialTools;
    const q = searchFilter.toLowerCase();
    return socialTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [socialTools, searchFilter]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="Free Social Media Creator & Marketing Tools ? Resizer, Caption Writer, UTM Builder"
        description="All-in-one in-browser creator suite: resize graphics to Instagram & TikTok aspect ratios, compress photos, generate viral captions, remove backgrounds, and create trackable UTM links."
        canonicalPath="/social-media-tools"
        faqs={SOCIAL_FAQS}
      />

      {/* Hero Section */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Social Creator & Marketing Suite</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                Create High-Impact Content <br className="hidden sm:inline" />
                with <span className="text-[var(--c-gold)]">Fast In-Browser</span> Tools.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Optimize image aspect ratios for Instagram, TikTok, and LinkedIn, knock out transparent backgrounds for logos, generate viral captions, and track campaigns.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  0 Cloud Server Uploads
                </span>
                <span>?</span>
                <span>Instant Canvas Preview</span>
                <span>?</span>
                <span>Ready-to-Use Social Presets</span>
              </div>
            </div>

            {/* Quick Card */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                <Sparkles className="w-4 h-4" />
                <span>Creator Studio Hub</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-[var(--c-text)]">Interactive Studio</div>
                <p className="text-xs text-[var(--c-muted)]">Check out our Social Hub for live caption & script generators</p>
              </div>
              <Link
                to="/social"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-gold)] hover:underline"
              >
                <span>Launch Social Hub & Script Writer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Curated Grid */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
                Essential Social Media & Creator Tools
              </h2>
              <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                Zero signups ? 100% Client-side processing
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter creator tools..."
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

        {/* Benefits Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Built for Content Creators & Growth Marketers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREATOR_BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center font-mono font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[var(--c-text)]">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed font-normal">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Creator FAQs
          </h2>
          <div className="space-y-3">
            {SOCIAL_FAQS.map((faq, idx) => {
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
          title="Free Social Media Creator Tools ? ToolBoxX"
          description="Resize images, generate captions, create transparent PNGs, and build UTM links."
        />
      </div>
    </div>
  );
};
