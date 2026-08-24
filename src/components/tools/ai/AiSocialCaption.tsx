import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Copy,
  Download,
  Trash2,
  Check,
  MessageCircle,
  Hash,
  Smile,
  Heart,
  MessageSquare,
  Repeat,
  Send,
  Bookmark,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

export type SocialPlatform = 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'threads';
export type SocialTone = 'educational' | 'storytelling' | 'promotional' | 'humorous' | 'inspirational' | 'discussion';

// SVG Icons for Social Platforms
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const ThreadsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
    <path d="M12 9a3 3 0 1 0 3 3v-1a2 2 0 0 0-2-2h-1" />
  </svg>
);

interface PlatformMeta {
  id: SocialPlatform;
  name: string;
  charLimit: number;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  desc: string;
}

const PLATFORMS: PlatformMeta[] = [
  { id: 'instagram', name: 'Instagram', charLimit: 2200, icon: InstagramIcon, accentColor: '#E1306C', desc: 'Visual hooks, formatting & hashtags' },
  { id: 'linkedin', name: 'LinkedIn', charLimit: 3000, icon: LinkedinIcon, accentColor: '#0A66C2', desc: 'Professional thought leadership & spacing' },
  { id: 'twitter', name: 'X / Twitter', charLimit: 280, icon: TwitterIcon, accentColor: '#1DA1F2', desc: 'Punchy 280-char hooks & viral threads' },
  { id: 'facebook', name: 'Facebook', charLimit: 5000, icon: FacebookIcon, accentColor: '#1877F2', desc: 'Community storytelling & discussions' },
  { id: 'threads', name: 'Threads', charLimit: 500, icon: ThreadsIcon, accentColor: '#E8DFCF', desc: 'Casual, witty & conversational' },
];

const TONES: { id: SocialTone; label: string; emoji: string }[] = [
  { id: 'educational', label: 'Educational / Value', emoji: '💡' },
  { id: 'storytelling', label: 'Storytelling / Behind-the-Scenes', emoji: '📖' },
  { id: 'promotional', label: 'Product Launch / Promo', emoji: '🚀' },
  { id: 'humorous', label: 'Relatable / Humorous', emoji: '😂' },
  { id: 'inspirational', label: 'Inspirational / Growth', emoji: '🔥' },
  { id: 'discussion', label: 'Question / Debate Sparker', emoji: '💬' },
];

export const AiSocialCaption: React.FC = () => {
  const [concept, setConcept] = useState<string>(
    'Launching a brand new collection of free in-browser developer utilities with 100% privacy and zero server storage.'
  );
  const [platform, setPlatform] = useState<SocialPlatform>('linkedin');
  const [tone, setTone] = useState<SocialTone>('educational');
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [variations, setVariations] = useState<string[]>([
    `Most web utilities upload your confidential files to remote servers.\n\nWe built ToolBoxX to change that permanently.\n\nHere is how modern browser-native computing unlocks 100% data privacy:\n\n1. Zero Server Uploads: Every compression, conversion, and PDF operation executes in local browser memory via WebAssembly.\n2. Instant Execution: No queue times or cloud processing lag.\n3. Complete Transparency: No user registration, tracking cookies, or file retention.\n\nBuilding tools that respect user privacy shouldn't be the exception—it should be the default standard.\n\nWhat features do you value most in your daily developer toolchain?\n\n#SoftwareEngineering #WebDevelopment #CyberSecurity #TechInnovation #PrivacyFirst`,
    `Stop uploading private company documents to random converter websites.\n\nHere's why:\n\nAlmost every online converter silently retains your files in cloud databases for training or logging.\n\nToolBoxX executes 100% on the client side using WebAssembly and Canvas APIs. Your data never touches a server.\n\nSpeed + Privacy + Zero cost.\n\nTry it out: link in comments.\n\n#DeveloperTools #Productivity #Privacy #OpenSource #Tech`,
    `3 reasons why client-side processing is the future of digital utilities:\n\n• Blazing Fast: Zero network upload latency\n• 100% Private: Files never leave your local device\n• Free & Unlimited: No expensive server compute costs\n\nExperience the next generation of privacy-first developer tools today!\n\n#WebDev #TypeScript #CloudComputing #SaaS #Security`,
  ]);

  const [hashtags, setHashtags] = useState<string[]>([
    '#DeveloperTools',
    '#WebDevelopment',
    '#PrivacyFirst',
    '#TypeScript',
    '#SoftwareEngineering',
    '#TechInnovation',
    '#Productivity',
    '#CyberSecurity',
    '#OpenSource',
  ]);

  const currentPlatformMeta = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];
  const activeCaption = variations[activeVariationIndex] || '';
  const captionStats = calculateTextStats(activeCaption);

  const isOverLimit = activeCaption.length > currentPlatformMeta.charLimit;
  const progressPercent = Math.min(100, Math.round((activeCaption.length / currentPlatformMeta.charLimit) * 100));

  // Client-Side Social Copy Synthesizer
  const generateOfflineCaptions = (
    topicStr: string,
    plat: SocialPlatform,
    _currTone: SocialTone,
    emojis: boolean,
    tags: boolean
  ) => {
    const raw = topicStr.trim() || 'Modern developer utilities and productivity tools';
    const e = emojis;

    const baseHashtags = [
      '#Tech',
      '#Innovation',
      '#Productivity',
      '#DeveloperTools',
      '#WebDev',
      '#SoftwareEngineering',
      '#PrivacyFirst',
      '#Coding',
    ];

    let v1 = '';
    let v2 = '';
    let v3 = '';

    if (plat === 'twitter') {
      v1 = `${e ? '🚀 ' : ''}${raw}\n\nHere is why this changes the game:\n• 100% local processing\n• Instant zero-latency speed\n• No sign-up required\n\n${tags ? '#BuildInPublic #Tech' : ''}`;
      v2 = `Stop settling for slow, bloated tools.\n\n${raw}\n\n${e ? '👇 ' : ''}Check it out and let me know your thoughts!`;
      v3 = `Unpopular opinion: Privacy-first software should be the default, not a luxury.\n\n${raw}\n\n${tags ? '#WebDev #Tech' : ''}`;
    } else if (plat === 'linkedin') {
      v1 = `${raw}\n\nIn modern organizations, speed and security are non-negotiable. Here are 3 key takeaways:\n\n1. Enhanced Efficiency: Streamlining repetitive tasks saves engineering hours every week.\n2. Data Privacy: Keeping processing local eliminates compliance risk.\n3. Modern Architecture: Leveraging browser capabilities delivers desktop-grade speed.\n\nHow is your team approaching digital productivity this quarter?\n\n${tags ? '#SoftwareEngineering #TechLeadership #Productivity #Innovation #WebDevelopment' : ''}`;
      v2 = `${e ? '💡 ' : ''}Behind every high-performing team is a frictionless toolchain.\n\n${raw}\n\nKey advantages:\n• Zero setup friction\n• Exceptional reliability\n• Built for scale\n\nWhat tools are essential in your daily stack?\n\n${tags ? '#Leadership #Developers #Technology #FutureOfWork' : ''}`;
      v3 = `Most digital utilities come with hidden trade-offs.\n\nWe decided to build a better alternative:\n\n${raw}\n\nDrop a comment if you'd like early access!\n\n${tags ? '#SaaS #ProductLaunch #Innovation' : ''}`;
    } else if (plat === 'instagram') {
      v1 = `${e ? '✨ ' : ''}${raw}\n.\n.\n${e ? '🔥 ' : ''}Everything you need in one place, engineered for maximum speed and simplicity.\n.\n${e ? '👉 ' : ''}Link in bio to explore!\n.\n.\n${tags ? '#tech #coding #developer #productivity #webdesign #software #innovation' : ''}`;
      v2 = `${e ? '🚀 ' : ''}Transform your workflow with modern privacy-first tools.\n\n${raw}\n\n${e ? '👇 ' : ''}Save this post for later and share with a friend!\n\n${tags ? '#technology #programming #developerlife #techtools' : ''}`;
      v3 = `${e ? '⚡ ' : ''}Quick tip for creators & developers:\n\n${raw}\n\nDouble tap if you agree! ${e ? '❤️' : ''}\n\n${tags ? '#devcommunity #creators #techlifestyle' : ''}`;
    } else if (plat === 'threads') {
      v1 = `${raw}\n\nThoughts on this? ${e ? '👇' : ''}`;
      v2 = `Quick reminder: The best tools are the ones that get out of your way.\n\n${raw}`;
      v3 = `${e ? '🧵 ' : ''}A quick thread on why this matters:\n\n${raw}\n\nWhat do you think?`;
    } else {
      // Facebook
      v1 = `Excited to announce: ${raw}\n\nWe built this to help teams save time and stay secure. Check out the link below and let us know your feedback in the comments!\n\n${tags ? '#Technology #Productivity #Innovation' : ''}`;
      v2 = `Are you tired of slow, clunky tools? We have got you covered:\n\n${raw}\n\nShare this with someone who needs to see it!`;
      v3 = `A quick update on our latest project:\n\n${raw}\n\nThank you for all the incredible support!`;
    }

    return {
      variations: [v1.trim(), v2.trim(), v3.trim()],
      hashtags: baseHashtags,
    };
  };

  const handleGenerate = async () => {
    if (!concept.trim()) {
      showToast({ type: 'error', title: 'Concept Required', message: 'Please enter your post concept.' });
      return;
    }

    setIsGenerating(true);

    try {
      if (hasGeminiApiKey()) {
        const systemInstruction = `You are a viral social media ghostwriter and growth copywriter.
Generate 3 distinct, high-engagement post captions specifically formatted for ${currentPlatformMeta.name} with a ${tone} tone.
Adhere strictly to platform conventions (character limits, spacing, hook strength, emojis: ${includeEmojis ? 'YES' : 'NO'}, hashtags: ${includeHashtags ? 'YES' : 'NO'}).
Separate the 3 variations using the exact delimiter: '---CAPTION---'.
Do not include meta-commentary or preamble.`;

        const prompt = `Post Concept: ${concept}
Platform: ${currentPlatformMeta.name} (Max ${currentPlatformMeta.charLimit} chars)
Tone: ${tone}
Include Emojis: ${includeEmojis}
Include Hashtags: ${includeHashtags}`;

        const geminiOutput = await callGeminiApi({
          prompt,
          systemInstruction,
          temperature: 0.7,
        });

        const splitResults = geminiOutput
          .split(/---CAPTION---/i)
          .map((v) => v.trim())
          .filter(Boolean);

        if (splitResults.length > 0) {
          setVariations(splitResults);
          setActiveVariationIndex(0);
          showToast({ type: 'success', title: 'Social Captions Ready', message: `Crafted 3 ${currentPlatformMeta.name} captions via Gemini AI.` });
        } else {
          setVariations([geminiOutput]);
          setActiveVariationIndex(0);
        }
      } else {
        const result = generateOfflineCaptions(concept, platform, tone, includeEmojis, includeHashtags);
        setVariations(result.variations);
        setHashtags(result.hashtags);
        setActiveVariationIndex(0);
        showToast({ type: 'success', title: 'Captions Generated', message: `Tailored for ${currentPlatformMeta.name} offline.` });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Generation Error', message: err.message || 'Falling back to offline templates.' });
      const result = generateOfflineCaptions(concept, platform, tone, includeEmojis, includeHashtags);
      setVariations(result.variations);
      setHashtags(result.hashtags);
      setActiveVariationIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = () => {
    if (!activeCaption) return;
    navigator.clipboard.writeText(activeCaption);
    showToast({ type: 'success', title: 'Copied Caption', message: 'Ready to paste into your social app!' });
  };

  const handleAppendHashtag = (tag: string) => {
    if (activeCaption.includes(tag)) return;
    const updated = `${activeCaption}\n\n${tag}`.trim();
    const newVars = [...variations];
    newVars[activeVariationIndex] = updated;
    setVariations(newVars);
    showToast({ type: 'info', title: 'Hashtag Added', message: `Added ${tag}` });
  };

  const handleDownload = () => {
    if (!activeCaption) return;
    const blob = new Blob([activeCaption], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `toolboxx_${platform}_caption.txt`);
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved caption text file.' });
  };

  const handleClear = () => {
    setConcept('');
    setVariations([]);
  };

  const IconComponent = currentPlatformMeta.icon;

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Platform Selector Strip */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
          Select Target Social Network
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PLATFORMS.map((plat) => {
            const Icon = plat.icon;
            const isSelected = platform === plat.id;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => {
                  setPlatform(plat.id);
                  if (concept && variations.length > 0) {
                    setTimeout(handleGenerate, 50);
                  }
                }}
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
                  <span className="text-[10px] font-mono" style={{ color: 'var(--c-muted)' }}>
                    Max {plat.charLimit}
                  </span>
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

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Concept Configuration */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} />
                Post Concept & Settings
              </span>

              {concept && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Concept Text Area */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                What do you want to talk about?
              </label>
              <textarea
                rows={5}
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Share your raw thoughts, product launch, lesson learned, milestone, or announcement..."
                className="w-full p-3.5 rounded-2xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                Goal & Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tone === t.id ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: tone === t.id ? 'var(--c-card)' : 'var(--c-bg)',
                      borderColor: tone === t.id ? 'var(--c-gold)' : 'var(--c-border)',
                      color: tone === t.id ? 'var(--c-gold)' : 'var(--c-text)',
                    }}
                  >
                    <span>{t.emoji}</span>
                    <span className="truncate">{t.label.split('/')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: 'var(--c-text)' }}>
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Include Emojis</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: 'var(--c-text)' }}>
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Include Hashtags</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !concept.trim()}
            className="w-full py-3 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer mt-4"
            style={{
              backgroundColor: 'var(--c-gold)',
              color: 'var(--c-bg)',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Tailoring Viral Social Copy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate {currentPlatformMeta.name} Captions
              </>
            )}
          </button>
        </div>

        {/* Right Column: Platform UI Mockup Preview */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="space-y-3">
            {/* Header with Variation Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                  <IconComponent className="w-4 h-4" />
                  {currentPlatformMeta.name} Live Mockup
                </span>
              </div>

              {activeCaption && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyCaption}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Copy Caption"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Download as text file"
                  >
                    <Download className="w-3.5 h-3.5" /> .TXT
                  </button>
                </div>
              )}
            </div>

            {/* Variation Selection Pills */}
            {variations.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--c-muted)' }}>
                  Variation:
                </span>
                {variations.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveVariationIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeVariationIndex === idx ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeVariationIndex === idx ? 'var(--c-card)' : 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: activeVariationIndex === idx ? 'var(--c-gold)' : 'var(--c-text)',
                    }}
                  >
                    Option {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Authentic Platform Mockup Card */}
            <div
              className="p-4 sm:p-5 rounded-2xl border space-y-3.5 max-h-[380px] overflow-y-auto"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
              }}
            >
              {/* Profile Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border"
                    style={{
                      backgroundColor: 'var(--c-card)',
                      borderColor: 'var(--c-border)',
                      color: 'var(--c-gold)',
                    }}
                  >
                    TB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>
                        ToolBoxX
                      </span>
                      {platform === 'twitter' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                      <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                        {platform === 'twitter' ? '@toolboxx_app' : '• 1st'}
                      </span>
                    </div>
                    <span className="text-[10px] line-clamp-1" style={{ color: 'var(--c-muted)' }}>
                      Developer & Creator Utilities • Just now
                    </span>
                  </div>
                </div>

                <MoreHorizontal className="w-4 h-4 opacity-50" />
              </div>

              {/* Caption Text Area / Render */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--c-text)' }}>
                {activeCaption || 'Your generated social copy will appear here formatted with hooks and line breaks.'}
              </div>

              {/* Social Action Footer Bar */}
              <div className="pt-3 border-t flex items-center justify-between opacity-70 text-xs" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer transition-colors">
                    <Heart className="w-3.5 h-3.5" /> 142
                  </span>
                  <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> 28
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer transition-colors">
                    <Repeat className="w-3.5 h-3.5" /> 19
                  </span>
                </div>
                <Bookmark className="w-3.5 h-3.5 hover:text-amber-400 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Hashtag Suggestions Cloud */}
            {hashtags.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--c-muted)' }}>
                  <Hash className="w-3 h-3" /> Quick Hashtag Add:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {hashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAppendHashtag(tag)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono border hover:opacity-100 opacity-75 transition-all cursor-pointer"
                      style={{
                        backgroundColor: 'var(--c-bg)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-gold)',
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Character Progress Bar */}
          <div className="pt-2 border-t space-y-1.5 text-xs" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
            <div className="flex items-center justify-between">
              <span className={isOverLimit ? 'text-rose-400 font-bold' : ''}>
                {activeCaption.length} / {currentPlatformMeta.charLimit} characters ({captionStats.words} words)
              </span>
              <span className={isOverLimit ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {isOverLimit ? `Exceeds by ${activeCaption.length - currentPlatformMeta.charLimit}` : `${currentPlatformMeta.charLimit - activeCaption.length} remaining`}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit ? 'bg-rose-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-social-caption" onReset={handleClear} />
    </div>
  );
};
