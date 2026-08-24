import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  ExternalLink,
  Copy,
  Heart,
  Download,
  CheckCircle2,
  Sliders,
  Tag,
  Building,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type NamingVibe = 'tech' | 'luxury' | 'modern' | 'friendly' | 'short' | 'compound' | 'classic';

interface GeneratedBrand {
  name: string;
  slogan: string;
  vibe: string;
  category: string;
  origin: string;
}

const PREFIXES = [
  'Nova', 'Apex', 'Hyper', 'Omni', 'Velo', 'Aura', 'Pulse', 'Aether', 'Zen', 'Meta',
  'Opti', 'Sync', 'Flex', 'Quant', 'Stratos', 'Lumi', 'Aero', 'Kinet', 'Cyber', 'Terra',
];

const SUFFIXES = [
  'flow', 'stack', 'verse', 'pulse', 'craft', 'hub', 'grid', 'ly', 'ify', 'io',
  'hq', 'nest', 'link', 'scale', 'sync', 'forge', 'wave', 'vault', 'byte', 'shift',
];

const LUXURY_WORDS = [
  'Veritas', 'Aurelia', 'Vespera', 'Solaria', 'Elysian', 'Valence', 'Maison', 'Kallisto',
  'Lavalier', 'Sovereign', 'Meridian', 'Vanguard', 'Celestia', 'Regalia', 'Aethel',
];

const FRIENDLY_WORDS = [
  'Sprout', 'Nestle', 'Bloom', 'Pebble', 'Sunny', 'Pancake', 'Buddy', 'Bumble',
  'Clover', 'Happy', 'Nod', 'Kindle', 'Waffle', 'Pickle', 'Joy', 'Snack',
];

export const BusinessNameGenerator: React.FC = () => {
  const [keyword, setKeyword] = useState<string>('cloud');
  const [industry, setIndustry] = useState<string>('Tech & SaaS');
  const [vibe, setVibe] = useState<NamingVibe>('tech');
  const [alliteration, setAlliteration] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [generatedList, setGeneratedList] = useState<GeneratedBrand[]>([]);

  // Generator Algorithm
  const generateNames = () => {
    const rawKw = keyword.trim().toLowerCase() || 'tech';
    const cleanKw = rawKw.charAt(0).toUpperCase() + rawKw.slice(1);
    const results: GeneratedBrand[] = [];

    // Helper for distinct name pushing
    const pushName = (name: string, slogan: string, origin: string, vibeTag: string) => {
      if (!results.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
        results.push({ name, slogan, origin, vibe: vibeTag, category: industry });
      }
    };

    if (vibe === 'tech') {
      pushName(`${cleanKw}Pulse`, `Intelligent ${rawKw} infrastructure for modern engineering.`, 'Compound: keyword + Pulse', 'Tech');
      pushName(`${cleanKw}Stack`, `Unified developer platform and cloud framework.`, 'Compound: keyword + Stack', 'Tech');
      pushName(`${cleanKw}ify`, `Effortless ${rawKw} automation at hyperscale.`, 'Modern Affix: keyword + ify', 'Tech');
      pushName(`Nova${cleanKw}`, `Next-generation intelligence for ${rawKw}.`, 'Prefix: Nova + keyword', 'Tech');
      pushName(`${cleanKw}Ops`, `Mission-critical operations and monitoring.`, 'Industry Suffix: Ops', 'Tech');
      pushName(`Hyper${cleanKw}`, `High-velocity ${rawKw} engine.`, 'Prefix: Hyper + keyword', 'Tech');
      pushName(`${cleanKw}Grid`, `Distributed, resilient ${rawKw} mesh network.`, 'Compound: keyword + Grid', 'Tech');
      pushName(`${cleanKw}io`, `API-first developer standard for ${rawKw}.`, 'Domain Affix: io', 'Tech');
      pushName(`Sync${cleanKw}`, `Real-time synchronization and collaboration.`, 'Prefix: Sync + keyword', 'Tech');
      pushName(`Quant${cleanKw}`, `Algorithmic optimization for ${rawKw}.`, 'Prefix: Quant + keyword', 'Tech');
      pushName(`${cleanKw}Core`, `The foundational engine for ${rawKw}.`, 'Compound: keyword + Core', 'Tech');
      pushName(`Aero${cleanKw}`, `Lightweight, ultra-fast ${rawKw} platform.`, 'Prefix: Aero + keyword', 'Tech');
    } else if (vibe === 'luxury') {
      LUXURY_WORDS.slice(0, 10).forEach((lw) => {
        pushName(`${lw}`, `Refined elegance and timeless heritage.`, 'Classical Latin / Romance Root', 'Luxury');
        pushName(`${lw} & Co.`, `Bespoke artisanal craftsmanship.`, 'Heritage Studio Naming', 'Luxury');
      });
      pushName(`Maison ${cleanKw}`, `Curated excellence for discerning clientele.`, 'French Maison + Keyword', 'Luxury');
      pushName(`${cleanKw} Privé`, `Exclusive, high-touch luxury solutions.`, 'French Privé Styling', 'Luxury');
      pushName(`Aurelia ${cleanKw}`, `Golden standard in luxury design.`, 'Latin Aurelia (Golden)', 'Luxury');
    } else if (vibe === 'friendly') {
      FRIENDLY_WORDS.slice(0, 10).forEach((fw) => {
        pushName(`${fw}${cleanKw}`, `The delightfully simple way to manage ${rawKw}.`, 'Friendly Prefix + Keyword', 'Friendly');
        pushName(`${cleanKw}${fw}`, `Bright, approachable, and made for everyone.`, 'Keyword + Friendly Word', 'Friendly');
      });
      pushName(`${cleanKw}ly`, `Friendly, fast, and simple for everyday life.`, 'Modern Adverb Affix', 'Friendly');
      pushName(`${cleanKw}Hub`, `Where the community comes together.`, 'Community Naming', 'Friendly');
    } else if (vibe === 'short') {
      const shortRoots = ['Vox', 'Nex', 'Lux', 'Zen', 'Axe', 'Ziv', 'Kyo', 'Flu', 'Qub', 'Vex', 'Rox', 'Vym'];
      shortRoots.forEach((root) => {
        pushName(`${root}${cleanKw.slice(0, 3)}`, `Minimalist power in three syllables.`, 'Compact Monosyllable Root', 'Short');
      });
      pushName(`${cleanKw.slice(0, 4)}o`, `Punchy, modern global brand name.`, 'Four-letter truncation', 'Short');
      pushName(`${cleanKw.slice(0, 3)}ex`, `Fast, snappy tech moniker.`, 'Root + ex ending', 'Short');
    } else {
      // Modern / Compound
      PREFIXES.slice(0, 8).forEach((p) => {
        pushName(`${p}${cleanKw}`, `Pioneering the future of ${industry.toLowerCase()}.`, `Prefix ${p} + Keyword`, 'Modern');
      });
      SUFFIXES.slice(0, 8).forEach((s) => {
        pushName(`${cleanKw}${s.charAt(0).toUpperCase() + s.slice(1)}`, `Empowering seamless ${rawKw} workflows.`, `Keyword + Suffix ${s}`, 'Modern');
      });
    }

    // Add extra compound combinations
    pushName(`${cleanKw}Sphere`, `All-in-one ecosystem for ${rawKw}.`, 'Compound: keyword + Sphere', 'Modern');
    pushName(`Omni${cleanKw}`, `Complete end-to-end ${rawKw} ecosystem.`, 'Prefix: Omni + keyword', 'Modern');
    pushName(`${cleanKw}Forge`, `Build and scale without limits.`, 'Compound: keyword + Forge', 'Modern');
    pushName(`Aether${cleanKw}`, `Boundless innovation in ${industry.toLowerCase()}.`, 'Classical Element Root', 'Modern');

    setGeneratedList(results);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  // Initial Generation
  React.useEffect(() => {
    generateNames();
  }, [vibe, industry]);

  const toggleFavorite = (name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    if (!favorites.includes(name)) {
      showToast({ type: 'success', title: 'Saved to Favorites', message: `Added ${name} to your wishlist.` });
    }
  };

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      showToast({ type: 'success', title: 'Name Copied', message: `Copied "${name}" to clipboard.` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to copy.' });
    }
  };

  const exportFavoritesCsv = () => {
    if (favorites.length === 0) return;
    const csvContent = 'Brand Name\n' + favorites.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, 'saved_business_names.csv');
    showToast({ type: 'success', title: 'CSV Exported', message: 'Saved your favorite brand names.' });
  };

  const VIBE_OPTIONS: { id: NamingVibe; label: string; desc: string }[] = [
    { id: 'tech', label: 'Tech & Futuristic', desc: 'Modern SaaS, APIs & Cloud' },
    { id: 'luxury', label: 'Luxury & Premium', desc: 'Bespoke, Elegant, High-End' },
    { id: 'modern', label: 'Modern & Clean', desc: 'Balanced, High-Growth Brands' },
    { id: 'friendly', label: 'Friendly & Playful', desc: 'Consumer, Fun, Approachable' },
    { id: 'short', label: 'Short & Punchy', desc: '4 to 6 Character Domains' },
  ];

  const INDUSTRIES = [
    'Tech & SaaS',
    'FinTech & Crypto',
    'E-Commerce & Retail',
    'Health & Wellness',
    'Creative & Design Agency',
    'Food & Beverage',
    'Consulting & Strategy',
    'Real Estate & Architecture',
  ];

  return (
    <div className="space-y-8">
      {/* Search & Vibe Controls */}
      <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="text-xs font-semibold text-[var(--c-text)] block mb-1.5">
              Industry Keywords / Seed Words
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateNames()}
                placeholder="e.g. cloud, pay, spark, flow, nova, audio"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
              />
              <button
                type="button"
                onClick={generateNames}
                className="px-5 py-2.5 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Generate
              </button>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1.5">
              Industry Category
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vibe Tabs */}
        <div>
          <label className="text-xs font-semibold text-[var(--c-muted)] block mb-2">Brand Persona & Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {VIBE_OPTIONS.map((v) => {
              const isActive = vibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVibe(v.id)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--c-card)] border border-[var(--c-gold)] shadow-md text-[var(--c-text)]'
                      : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
                  }`}
                >
                  <div className="font-bold text-xs text-[var(--c-text)]">{v.label}</div>
                  <div className="text-[10px] text-[var(--c-muted)] line-clamp-1 mt-0.5">{v.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Favorites Drawer if any */}
      {favorites.length > 0 && (
        <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-xs font-bold text-[var(--c-text)]">
              Saved Favorites ({favorites.length})
            </span>
            <div className="flex flex-wrap gap-1.5 ml-2">
              {favorites.map((fav) => (
                <span
                  key={fav}
                  className="px-2.5 py-0.5 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] flex items-center gap-1"
                >
                  {fav}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(fav)}
                    className="text-[var(--c-subtle)] hover:text-rose-500 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={exportFavoritesCsv}
            className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Export CSV
          </button>
        </div>
      )}

      {/* Generated Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedList.map((brand, idx) => {
          const isFav = favorites.includes(brand.name);
          const domainUrl = `https://www.namecheap.com/domains/registration/results/?domain=${brand.name.toLowerCase()}`;
          const tmUrl = `https://tmsearch.uspto.gov/search/search-results?search_type=keyword&query=${encodeURIComponent(brand.name)}`;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] shadow-sm flex flex-col justify-between space-y-4 transition-all hover:shadow-md group"
            >
              {/* Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)]">
                    {brand.vibe}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(brand.name)}
                    className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-rose-500 cursor-pointer"
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                </div>

                <h3 className="text-xl font-extrabold text-[var(--c-text)] tracking-tight">
                  {brand.name}
                </h3>

                <p className="text-xs text-[var(--c-muted)] leading-relaxed italic">
                  "{brand.slogan}"
                </p>
              </div>

              {/* Origin / Rationale */}
              <div className="text-[11px] text-[var(--c-subtle)] border-t border-[var(--c-border)] pt-2.5">
                <span className="font-semibold text-[var(--c-muted)]">Origin:</span> {brand.origin}
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-[var(--c-border)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={domainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[var(--c-gold)] hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" /> Check Domain (.com)
                  </a>
                  <span className="text-[var(--c-subtle)] text-[10px]">·</span>
                  <a
                    href={tmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[var(--c-subtle)] hover:text-[var(--c-text)]"
                  >
                    Trademark
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => copyName(brand.name)}
                  className="p-1.5 rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-text)]"
                  title="Copy brand name"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="business-name-generator" />
    </div>
  );
};

export default BusinessNameGenerator;
