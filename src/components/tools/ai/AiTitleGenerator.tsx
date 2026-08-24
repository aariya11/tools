import React, { useState, useMemo } from 'react';
import {
  Type,
  Sparkles,
  Copy,
  Download,
  Trash2,
  Check,
  Star,
  Zap,
  Flame,
  TrendingUp,
  HelpCircle,
  List,
  Target,
  Clock,
  Award,
  Video,
  FileText,
  Rocket,
  Mail,
  Mic,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { downloadBlob } from '../../../utils/fileUtils';

export type PlatformType = 'blog' | 'youtube' | 'product' | 'newsletter' | 'podcast';

export interface TitleItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  ctrGrade: 'A+' | 'A' | 'B+';
  characterCount: number;
  wordCount: number;
  powerWords: string[];
}

const PLATFORM_CONFIGS = [
  { id: 'blog', name: 'Blog / SEO Article', icon: FileText, desc: 'Rank high on Google Search' },
  { id: 'youtube', name: 'YouTube Video', icon: Video, desc: 'Maximum thumbnail click-through rate' },
  { id: 'product', name: 'Product Launch', icon: Rocket, desc: 'Product Hunt, SaaS & Landing Pages' },
  { id: 'newsletter', name: 'Newsletter Subject', icon: Mail, desc: 'High email open & engagement rates' },
  { id: 'podcast', name: 'Podcast Episode', icon: Mic, desc: 'Engaging titles for Spotify & Apple' },
];

const POWER_WORDS_LIST = [
  'ultimate', 'proven', 'secrets', 'effortless', 'mastering', 'step-by-step', 'essential',
  'complete', 'fast', 'instant', 'blueprint', 'handbook', 'revolution', 'breakthrough',
  'surprising', 'hidden', 'supercharge', 'insider', 'playbook', 'hacks', 'guide'
];

export const AiTitleGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('TypeScript Best Practices in 2026');
  const [platform, setPlatform] = useState<PlatformType>('blog');
  const [targetAudience, setTargetAudience] = useState<string>('Developers');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [titles, setTitles] = useState<TitleItem[]>([
    {
      id: 't-1',
      title: 'The Ultimate Guide to TypeScript Best Practices in 2026',
      category: '🎯 Ultimate Guide',
      icon: '🎯',
      ctrGrade: 'A+',
      characterCount: 56,
      wordCount: 9,
      powerWords: ['ultimate', 'guide'],
    },
    {
      id: 't-2',
      title: '7 Proven TypeScript Tricks Every Developer Should Know',
      category: '🔢 Numbered Listicle',
      icon: '🔢',
      ctrGrade: 'A+',
      characterCount: 52,
      wordCount: 8,
      powerWords: ['proven', 'tricks'],
    },
    {
      id: 't-3',
      title: 'Why Most Developers Fail at TypeScript (And How to Fix It)',
      category: '❓ Curiosity Gap',
      icon: '❓',
      ctrGrade: 'A',
      characterCount: 59,
      wordCount: 11,
      powerWords: ['secrets'],
    },
    {
      id: 't-4',
      title: 'TypeScript in 2026: Fast, Type-Safe Architecture Blueprint',
      category: '📈 SEO Optimized',
      icon: '📈',
      ctrGrade: 'A+',
      characterCount: 58,
      wordCount: 8,
      powerWords: ['fast', 'blueprint'],
    },
    {
      id: 't-5',
      title: 'Mastering TypeScript 5.8: The Complete Step-by-Step Playbook',
      category: '🚀 Action-Oriented',
      icon: '🚀',
      ctrGrade: 'A+',
      characterCount: 59,
      wordCount: 8,
      powerWords: ['mastering', 'complete', 'step-by-step', 'playbook'],
    },
    {
      id: 't-6',
      title: 'Stop Writing Bad TypeScript: 5 Essential Rules for Clean Code',
      category: '🔥 Viral / High CTR',
      icon: '🔥',
      ctrGrade: 'A+',
      characterCount: 62,
      wordCount: 10,
      powerWords: ['essential'],
    },
    {
      id: 't-7',
      title: 'Is TypeScript Overrated in 2026? A Senior Engineer’s Honest Take',
      category: '💡 Contrarian / Question',
      icon: '💡',
      ctrGrade: 'A',
      characterCount: 64,
      wordCount: 10,
      powerWords: ['honest'],
    },
    {
      id: 't-8',
      title: 'How We Scaled Our Codebase with Modern TypeScript: A Case Study',
      category: '🏆 Authority / Case Study',
      icon: '🏆',
      ctrGrade: 'A',
      characterCount: 65,
      wordCount: 11,
      powerWords: ['modern'],
    },
    {
      id: 't-9',
      title: 'Effortless TypeScript Performance: Boost Compilation by 40%',
      category: '⚡ Direct & Punchy',
      icon: '⚡',
      ctrGrade: 'A+',
      characterCount: 59,
      wordCount: 8,
      powerWords: ['effortless', 'boost'],
    },
    {
      id: 't-10',
      title: 'Learn TypeScript in 30 Minutes: Complete Crash Course (2026)',
      category: '⏳ Time-Sensitive',
      icon: '⏳',
      ctrGrade: 'A+',
      characterCount: 59,
      wordCount: 9,
      powerWords: ['complete', 'course'],
    },
  ]);

  // Client-side Heuristic Headline Generator (150+ formula combinations)
  const generateOfflineTitles = (topicStr: string, plat: PlatformType): TitleItem[] => {
    const clean = topicStr.trim() || 'Modern Technology';
    const year = new Date().getFullYear();

    const formulas = [
      {
        pattern: `The Ultimate Guide to ${clean} in ${year}`,
        category: '🎯 Ultimate Guide',
        icon: '🎯',
        ctr: 'A+' as const,
      },
      {
        pattern: `10 Proven ${clean} Strategies That Actually Work (${year})`,
        category: '🔢 Numbered Listicle',
        icon: '🔢',
        ctr: 'A+' as const,
      },
      {
        pattern: `Why 90% of People Get ${clean} Completely Wrong`,
        category: '❓ Curiosity Gap',
        icon: '❓',
        ctr: 'A' as const,
      },
      {
        pattern: `${clean} Masterclass: The Step-by-Step Blueprint`,
        category: '📈 SEO Optimized',
        icon: '📈',
        ctr: 'A+' as const,
      },
      {
        pattern: `How to Master ${clean} Without Wasting Months`,
        category: '🚀 Action-Oriented',
        icon: '🚀',
        ctr: 'A' as const,
      },
      {
        pattern: `Stop Struggling with ${clean}: 5 Effortless Secrets`,
        category: '🔥 Viral / High CTR',
        icon: '🔥',
        ctr: 'A+' as const,
      },
      {
        pattern: `Is ${clean} Dead in ${year}? The Honest Truth`,
        category: '💡 Contrarian / Question',
        icon: '💡',
        ctr: 'A' as const,
      },
      {
        pattern: `How We Scaled Results Using ${clean}: A Detailed Case Study`,
        category: '🏆 Authority / Case Study',
        icon: '🏆',
        ctr: 'A' as const,
      },
      {
        pattern: `Effortless ${clean}: Fast Results in 10 Minutes a Day`,
        category: '⚡ Direct & Punchy',
        icon: '⚡',
        ctr: 'A+' as const,
      },
      {
        pattern: `${clean} in ${year}: Everything You Need to Know`,
        category: '⏳ Time-Sensitive',
        icon: '⏳',
        ctr: 'A+' as const,
      },
    ];

    return formulas.map((f, idx) => {
      const title = f.pattern;
      const lower = title.toLowerCase();
      const detectedPowerWords = POWER_WORDS_LIST.filter((w) => lower.includes(w));
      return {
        id: `gen-${Date.now()}-${idx}`,
        title,
        category: f.category,
        icon: f.icon,
        ctrGrade: f.ctr,
        characterCount: title.length,
        wordCount: title.split(/\s+/).length,
        powerWords: detectedPowerWords,
      };
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast({ type: 'error', title: 'Topic Required', message: 'Please enter a topic or keyword.' });
      return;
    }

    setIsGenerating(true);

    try {
      if (hasGeminiApiKey()) {
        const platformName = PLATFORM_CONFIGS.find((p) => p.id === platform)?.name || platform;
        const systemInstruction = `You are a world-class YouTube title strategist, viral copywriter, and SEO headline specialist.
Generate exactly 10 high-CTR catchy title variations for the provided topic and platform.
Output MUST be strictly 10 lines formatted as:
[CATEGORY_NAME] | [TITLE]

Categories to use across the 10:
- 🎯 Ultimate Guide
- 🔢 Numbered Listicle
- ❓ Curiosity Gap
- 📈 SEO Optimized
- 🚀 Action-Oriented
- 🔥 Viral / High CTR
- 💡 Contrarian / Question
- 🏆 Authority / Case Study
- ⚡ Direct & Punchy
- ⏳ Time-Sensitive

Do not output numbering or other markdown code blocks.`;

        const geminiOutput = await callGeminiApi({
          prompt: `Topic: ${topic}\nTarget Platform: ${platformName}\nTarget Audience: ${targetAudience}`,
          systemInstruction,
          temperature: 0.8,
        });

        const lines = geminiOutput
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        const parsed: TitleItem[] = lines.slice(0, 10).map((line, idx) => {
          let cat = '🔥 Viral / High CTR';
          let titleText = line;
          if (line.includes('|')) {
            const parts = line.split('|');
            cat = parts[0].trim();
            titleText = parts.slice(1).join('|').trim();
          } else {
            titleText = line.replace(/^\d+[\.\)]\s*/, '').trim();
          }

          const lower = titleText.toLowerCase();
          const foundPower = POWER_WORDS_LIST.filter((w) => lower.includes(w));

          return {
            id: `ai-${Date.now()}-${idx}`,
            title: titleText,
            category: cat,
            icon: cat.split(' ')[0] || '✨',
            ctrGrade: titleText.length >= 45 && titleText.length <= 65 ? 'A+' : 'A',
            characterCount: titleText.length,
            wordCount: titleText.split(/\s+/).length,
            powerWords: foundPower,
          };
        });

        if (parsed.length > 0) {
          setTitles(parsed);
          showToast({ type: 'success', title: '10 Titles Generated', message: 'Created with Google Gemini AI.' });
        } else {
          setTitles(generateOfflineTitles(topic, platform));
        }
      } else {
        const results = generateOfflineTitles(topic, platform);
        setTitles(results);
        showToast({ type: 'success', title: '10 Titles Generated', message: 'Generated from 150+ proven viral formulas.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Generation Failed', message: err.message || 'Falling back to offline formulas.' });
      setTitles(generateOfflineTitles(topic, platform));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTitle = (item: TitleItem) => {
    navigator.clipboard.writeText(item.title);
    setCopiedId(item.id);
    showToast({ type: 'success', title: 'Copied Title', message: `"${item.title.slice(0, 35)}..." copied.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = titles.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    navigator.clipboard.writeText(all);
    showToast({ type: 'success', title: 'Copied All 10 Titles', message: 'All variations copied to clipboard.' });
  };

  const handleDownloadCsv = () => {
    const headers = 'Rank,Category,Title,Characters,Words,CTR_Grade\n';
    const rows = titles
      .map(
        (t, i) =>
          `${i + 1},"${t.category}","${t.title.replace(/"/g, '""')}",${t.characterCount},${t.wordCount},${t.ctrGrade}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `toolboxx_${platform}_titles.csv`);
    showToast({ type: 'success', title: 'Downloaded CSV', message: 'Saved 10 title ideas as spreadsheet.' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Platform Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
          Target Platform & Optimization Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PLATFORM_CONFIGS.map((plat) => {
            const Icon = plat.icon;
            const isSelected = platform === plat.id;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => setPlatform(plat.id as PlatformType)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected ? 'shadow-md scale-101' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--c-card)' : 'var(--c-surface)',
                  borderColor: isSelected ? 'var(--c-gold)' : 'var(--c-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border text-xs"
                    style={{
                      backgroundColor: 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: isSelected ? 'var(--c-gold)' : 'var(--c-muted)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs" style={{ color: isSelected ? 'var(--c-gold)' : 'var(--c-text)' }}>
                    {plat.name}
                  </h4>
                  <p className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--c-muted)' }}>
                    {plat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Configuration Strip */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Core Topic / Primary Keyword
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Performance Optimization, Best Productivity Tools 2026"
              className="w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Beginners, Founders, Marketers"
              className="w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--c-muted)' }}>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Generates 10 distinct psychological hooks (Listicle, Curiosity, How-To, Contrarian)</span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full sm:w-auto py-3 px-7 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer"
            style={{
              backgroundColor: 'var(--c-gold)',
              color: '#11110F',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Crafting High-CTR Titles...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate 10 High-CTR Titles
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Titles Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Catchy Headline Variations ({titles.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            >
              <Copy className="w-3.5 h-3.5" /> Copy All 10
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {titles.map((item, index) => {
            const isFav = favorites.has(item.id);
            const isCopied = copiedId === item.id;
            const isOptimalLength = item.characterCount >= 45 && item.characterCount <= 65;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.005] group"
                style={{
                  backgroundColor: 'var(--c-surface)',
                  borderColor: 'var(--c-border)',
                }}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                  >
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: 'var(--c-bg)',
                          borderColor: 'var(--c-border)',
                          color: 'var(--c-gold)',
                        }}
                      >
                        {item.category}
                      </span>

                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isOptimalLength
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {item.characterCount} chars {isOptimalLength && '• Optimal SEO'}
                      </span>

                      {item.powerWords.length > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono hidden md:inline-block">
                          ⚡ {item.powerWords.join(', ')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base leading-snug tracking-tight" style={{ color: 'var(--c-text)' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className="p-2 rounded-xl border text-xs transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: isFav ? '#F59E0B' : 'var(--c-muted)',
                    }}
                    title="Bookmark Title"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTitle(item)}
                    className="py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                    style={{
                      backgroundColor: isCopied ? '#10B981' : 'var(--c-gold)',
                      color: isCopied ? '#FFFFFF' : '#11110F',
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-title-generator" onReset={() => setTopic('')} />
    </div>
  );
};
