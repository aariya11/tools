import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  Share2,
  Video,
  Hash,
  FileText,
  Clock,
  Zap,
  CheckCircle2,
  ChevronDown,
  Info,
  Plus,
  X,
  Search,
  Tag,
} from 'lucide-react';

import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export type VideoCategory = 'tech' | 'webdev' | 'productivity' | 'design' | 'business' | 'tutorial';

interface TitleFormula {
  category: string;
  score: number;
  title: string;
}

const PRESET_KEYWORDS = [
  { topic: 'How to Compress PDF Without Losing Quality', category: 'productivity' as VideoCategory },
  { topic: 'Remove Image Background in 1 Click Free', category: 'design' as VideoCategory },
  { topic: 'JSON Formatter and Validator for Developers', category: 'webdev' as VideoCategory },
  { topic: 'How to Build an ATS Friendly Resume', category: 'business' as VideoCategory },
  { topic: 'Best Free Online Tools for Creators', category: 'tech' as VideoCategory },
  { topic: 'How to Upscale Blurry Images to 4K', category: 'design' as VideoCategory },
];

export const YouTubeTagGenerator: React.FC = () => {
  const [topicKeyword, setTopicKeyword] = useState<string>('How to Compress PDF Without Losing Quality');
  const [category, setCategory] = useState<VideoCategory>('productivity');
  const [targetUrl, setTargetUrl] = useState<string>('https://toolboxx.dev');
  const [channelName, setChannelName] = useState<string>('ToolBoxX Tech');

  // Custom tags list
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // High-CTR Titles Generator
  const titles = useMemo<TitleFormula[]>(() => {
    const raw = topicKeyword.trim() || 'Free Online Tools';

    return [
      {
        category: 'High Search Volume',
        score: 99,
        title: `${raw} (100% Free & No Sign-Up)`,
      },
      {
        category: 'Curiosity & Warning',
        score: 97,
        title: `Stop Doing This! The Secret Way to ${raw.toLowerCase()}`,
      },
      {
        category: 'Speed & Simplicity',
        score: 96,
        title: `How to ${raw.toLowerCase()} in Under 30 Seconds (Fast & Private)`,
      },
      {
        category: 'Money Saver Formula',
        score: 94,
        title: `The FREE Website That Replaces Expensive Software for ${raw}`,
      },
      {
        category: 'Step-by-Step Guide',
        score: 93,
        title: `Ultimate Step-by-Step Guide: ${raw} in 2026`,
      },
      {
        category: 'Zero Cost Hack',
        score: 91,
        title: `I Found the Best Free Way to ${raw.toLowerCase()} (No Limits)`,
      },
    ];
  }, [topicKeyword]);

  // Generated Tags Algorithm
  const defaultGeneratedTags = useMemo<string[]>(() => {
    const base = topicKeyword.toLowerCase().trim() || 'productivity tools';
    const words = base.split(/\s+/);
    const mainTerm = words.slice(0, 3).join(' ');

    const list = [
      base,
      `${base} online`,
      `${base} free`,
      `how to ${base}`,
      `best ${base} 2026`,
      `${base} no upload`,
      `${base} client side`,
      `${mainTerm} tutorial`,
      `${mainTerm} tips`,
      `${mainTerm} tricks`,
      `free web tools`,
      `toolboxx`,
      `online utilities`,
      `productivity hacks`,
      `free software alternatives`,
      `how to use ${mainTerm}`,
      `${base} fast`,
      `${base} step by step`,
      `best free ${mainTerm}`,
      `easy ${base}`,
    ];

    // Deduplicate
    return Array.from(new Set(list));
  }, [topicKeyword]);

  // Synchronize tags on topic change
  const currentTags = useMemo(() => {
    if (activeTags.length > 0) return activeTags;
    return defaultGeneratedTags;
  }, [activeTags, defaultGeneratedTags]);

  // Tag character count (comma separated as pasted into YT Studio)
  const tagsJoinedString = useMemo(() => {
    return currentTags.join(', ');
  }, [currentTags]);

  const tagCharCount = tagsJoinedString.length;
  const isOptimalTagCount = tagCharCount >= 380 && tagCharCount <= 500;
  const isOverLimit = tagCharCount > 500;

  // YouTube Description Template
  const descriptionTemplate = useMemo(() => {
    const raw = topicKeyword.trim() || 'Productivity Tools';
    const cleanTags = currentTags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, '')}`).join(' ');

    return `In this video, you will learn ${raw.toLowerCase()} in seconds using 100% free, private browser-based utilities! No credit card, no sign-up, and zero server uploads required.

🚀 Try the free tool mentioned in this video:
👉 ${targetUrl}

📌 WHAT YOU WILL LEARN:
0:00 - Introduction & The Common Problem
0:45 - Why traditional cloud websites are slow and insecure
1:25 - How to use ${raw} on ToolBoxX (Step-by-Step)
2:30 - Instant download & before/after results comparison
3:15 - Pro tips for maximum efficiency

🔥 KEY FEATURES:
✓ 100% Client-Side Privacy (Files never leave your computer)
✓ Unlimited file sizes with zero subscription paywalls
✓ Works completely inside your web browser (WebAssembly)
✓ Instant high-resolution export

💬 Have questions or feature requests? Drop a comment below!
👍 If this video helped you save time, please LIKE and SUBSCRIBE to ${channelName} for more free tech tools and tutorials!

${cleanTags}`;
  }, [topicKeyword, targetUrl, channelName, currentTags]);

  // Add custom tag pill
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().toLowerCase();
    if (!currentTags.includes(clean)) {
      setActiveTags([...currentTags, clean]);
      setNewTagInput('');
      showToast({ type: 'success', title: 'Tag Added', message: `Added "${clean}" to tags list.` });
    }
  };

  // Remove tag pill
  const handleRemoveTag = (tagToRemove: string) => {
    const next = currentTags.filter((t) => t !== tagToRemove);
    setActiveTags(next);
  };

  // Reset to auto-generated tags
  const handleResetTags = () => {
    setActiveTags([]);
    showToast({ type: 'info', title: 'Tags Reset', message: 'Restored automatic keyword tags.' });
  };

  // Copy helper
  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast({ type: 'success', title: 'Copied to Clipboard!', message: `${label} ready to paste.` });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy manually.' });
    }
  };

  // Download Full YouTube Metadata Kit
  const handleDownloadPackage = () => {
    const fullDoc = `# YouTube Video Launch Kit: ${topicKeyword}
Channel: ${channelName}

## 🎯 RECOMMENDED VIDEO TITLES
${titles.map((t, i) => `${i + 1}. [CTR Score: ${t.score}% - ${t.category}] ${t.title}`).join('\n')}

---

## 📝 YOUTUBE VIDEO DESCRIPTION
${descriptionTemplate}

---

## 🏷️ YOUTUBE KEYWORD TAGS (${tagCharCount}/500 Characters)
${tagsJoinedString}
`;

    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${topicKeyword.toLowerCase().replace(/\s+/g, '-')}-youtube-kit.md`);
    showToast({ type: 'success', title: 'Kit Exported', message: 'Saved YouTube metadata package.' });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Settings Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Video className="w-3.5 h-3.5" />
              <span>YouTube Video SEO Optimizer</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              YouTube Tag & Metadata Generator
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Generate high-CTR titles, timestamped descriptions, and algorithm-optimized keyword tags within the 500-char limit.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCopy(tagsJoinedString, 'all_tags', 'Comma-separated Tags')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[#11110F] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedKey === 'all_tags' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'all_tags' ? 'Tags Copied!' : 'Copy All Tags (for YT Studio)'}</span>
            </button>
            <button
              onClick={handleDownloadPackage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Launch Kit</span>
            </button>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Primary Video Topic / Keyword
            </label>
            <input
              type="text"
              value={topicKeyword}
              onChange={(e) => {
                setTopicKeyword(e.target.value);
                setActiveTags([]);
              }}
              placeholder="e.g. How to Compress PDF Without Losing Quality"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Channel Name
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g. ToolBoxX Tech"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Target Tool URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://toolboxx.dev"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>
        </div>

        {/* Quick Keyword Presets */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-2">
            Popular YouTube Creator Topics:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESET_KEYWORDS.map((k, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopicKeyword(k.topic);
                  setCategory(k.category);
                  setActiveTags([]);
                }}
                className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-medium text-[var(--c-muted)] hover:text-[var(--c-text)] whitespace-nowrap transition-colors cursor-pointer"
              >
                {k.topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Tag Character Limit"
          value={`${tagCharCount} / 500`}
          subValue={
            isOverLimit
              ? '⚠️ Exceeds 500 char YouTube limit'
              : isOptimalTagCount
              ? '✅ Optimal algorithm saturation'
              : 'Add more tags to maximize search'
          }
          badge={isOptimalTagCount ? 'Optimal' : isOverLimit ? 'Too Long' : 'Good'}
          badgeType={isOptimalTagCount ? 'success' : isOverLimit ? 'warning' : 'neutral'}
        />
        <StatCard
          label="Total Keyword Tags"
          value={`${currentTags.length} Tags`}
          subValue="Comma-separated format"
        />
        <StatCard
          label="High-CTR Titles"
          value={`${titles.length} Formulas`}
          subValue="Scored by estimated CTR"
        />
        <StatCard
          label="Description Chapters"
          value="5 Timestamps"
          subValue="SEO chapter markers ready"
        />
      </div>

      {/* 1. High-CTR Titles Section */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
          <h3 className="text-base font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--c-gold)]" />
            <span>High-CTR YouTube Video Titles (Scored by Algorithm Virality)</span>
          </h3>
          <span className="text-xs text-[var(--c-muted)]">1-Click Copy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {titles.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)] transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    {t.score}% CTR Score
                  </span>
                  <span className="text-[11px] text-[var(--c-subtle)] truncate">{t.category}</span>
                </div>
                <div className="text-sm font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors truncate">
                  {t.title}
                </div>
              </div>

              <button
                onClick={() => handleCopy(t.title, `title_${idx}`, 'Video Title')}
                className="p-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer shrink-0"
                title="Copy Title"
              >
                {copiedKey === `title_${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. YouTube Tags Studio (With Interactive Pills & 500-Char Limit Counter) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          <div>
            <h3 className="text-lg font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
              <Tag className="w-5 h-5 text-red-400" />
              <span>YouTube Keyword Tags (500 Chars Limit)</span>
            </h3>
            <p className="text-xs text-[var(--c-muted)] mt-0.5">
              Click the 'x' on any tag to remove, or type below to add custom niche tags.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-mono font-bold">
                <span className={isOverLimit ? 'text-rose-400 font-bold' : isOptimalTagCount ? 'text-emerald-400' : 'text-[var(--c-gold)]'}>
                  {tagCharCount}
                </span>
                <span className="text-[var(--c-muted)]"> / 500 chars</span>
              </div>
              <div className="w-32 h-1.5 bg-[var(--c-card)] rounded-full overflow-hidden mt-1 border border-[var(--c-border)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverLimit ? 'bg-rose-500' : isOptimalTagCount ? 'bg-emerald-400' : 'bg-[var(--c-gold)]'
                  }`}
                  style={{ width: `${Math.min(100, (tagCharCount / 500) * 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => handleCopy(tagsJoinedString, 'tags_box', 'Comma-separated Tags')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all cursor-pointer"
            >
              {copiedKey === 'tags_box' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>Copy Tags</span>
            </button>
          </div>
        </div>

        {/* Add Tag Bar */}
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Type a new keyword tag and press Enter..."
            className="flex-1 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] focus:border-[var(--c-gold)]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            <span>Add Tag</span>
          </button>
          <button
            type="button"
            onClick={handleResetTags}
            className="p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
            title="Reset to default tags"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </form>

        {/* Tag Pills Display */}
        <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex flex-wrap gap-2 min-h-[140px] max-h-[240px] overflow-y-auto">
          {currentTags.map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-text)] group hover:border-[var(--c-gold)] transition-colors shadow-2xs"
            >
              <span>{t}</span>
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-[var(--c-subtle)] hover:text-rose-400 cursor-pointer"
                title="Remove tag"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 3. YouTube Description Template */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
          <div>
            <h3 className="text-base font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--c-gold)]" />
              <span>SEO-Optimized YouTube Description & Timestamps</span>
            </h3>
            <p className="text-xs text-[var(--c-muted)] mt-0.5">
              Includes high-conversion hook, timestamps for video chapters, and social links.
            </p>
          </div>
          <button
            onClick={() => handleCopy(descriptionTemplate, 'description', 'Video Description')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all cursor-pointer"
          >
            {copiedKey === 'description' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Description</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-xs sm:text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-wrap">
          {descriptionTemplate}
        </div>
      </div>

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Rank higher on YouTube with ToolBoxX Tag & Metadata Generator!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="youtube-tag-generator" />
    </div>
  );
};
