import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  Type,
  Download,
  Upload,
  ArrowRight,
  Flame,
  Zap,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';
import { showToast } from '../components/common/Toast';
import { getToolById } from '../data/toolsData';

// --- Dimension Cheat Sheet Data ---
const DIMENSION_CHEATSHEET = [
  {
    platform: 'Instagram',
    format: 'Portrait Post',
    aspectRatio: '4:5',
    dimensions: '1080 x 1350 px',
    maxSize: '30 MB',
    fileTypes: 'JPG, PNG, WebP',
    recommended: 'Highest mobile screen real-estate',
  },
  {
    platform: 'Instagram / TikTok',
    format: 'Stories & Reels',
    aspectRatio: '9:16',
    dimensions: '1080 x 1920 px',
    maxSize: '650 MB',
    fileTypes: 'MP4, JPG, PNG',
    recommended: 'Full vertical screen mobile view',
  },
  {
    platform: 'Instagram',
    format: 'Square Post',
    aspectRatio: '1:1',
    dimensions: '1080 x 1080 px',
    maxSize: '30 MB',
    fileTypes: 'JPG, PNG',
    recommended: 'Classic square grid standard',
  },
  {
    platform: 'X / Twitter',
    format: 'Feed Image',
    aspectRatio: '16:9',
    dimensions: '1200 x 675 px',
    maxSize: '5 MB',
    fileTypes: 'JPG, PNG, WebP, GIF',
    recommended: 'Auto-crops on mobile timelines',
  },
  {
    platform: 'LinkedIn',
    format: 'Landscape Post',
    aspectRatio: '1.91:1',
    dimensions: '1200 x 627 px',
    maxSize: '10 MB',
    fileTypes: 'JPG, PNG',
    recommended: 'Best click-through on desktop & mobile feed',
  },
  {
    platform: 'YouTube',
    format: 'Video Thumbnail',
    aspectRatio: '16:9',
    dimensions: '1280 x 720 px',
    maxSize: '2 MB',
    fileTypes: 'JPG, PNG, WebP',
    recommended: 'Strict 2 MB upload threshold',
  },
  {
    platform: 'Pinterest',
    format: 'Standard Pin',
    aspectRatio: '2:3',
    dimensions: '1000 x 1500 px',
    maxSize: '20 MB',
    fileTypes: 'JPG, PNG',
    recommended: 'Optimized vertical discovery',
  },
];

// --- Viral Productivity Hacks ---
const PRODUCTIVITY_HACKS = [
  {
    id: 'hack-1',
    title: 'Bypass 25MB Email Attachment Limits Instantly',
    badge: 'Email & Portals',
    description: 'Compress high-resolution PDF proposals and portfolio decks down by 80% without losing readable text or vector charts before hitting Send.',
    toolPath: '/pdf-compress',
    toolName: 'PDF Compress',
  },
  {
    id: 'hack-2',
    title: 'Extract Text From Whiteboard Photos & Lecture Slides',
    badge: 'Study & Work',
    description: 'Never transcribe quotes or whiteboard notes by hand. Run instant in-browser OCR to copy editable text in seconds.',
    toolPath: '/ocr-pdf',
    toolName: 'Browser OCR',
  },
  {
    id: 'hack-3',
    title: 'Make a Transparent Signature Stamp for PDF Contracts',
    badge: 'Digital Office',
    description: 'Snap a picture of your ink signature on white paper, remove the white background to transparent PNG, and stamp it on legal contracts.',
    toolPath: '/background-remover',
    toolName: 'Background Remover',
  },
  {
    id: 'hack-4',
    title: 'Strip GPS Geotags Before Selling Items Online',
    badge: 'Privacy & Safety',
    description: 'Marketplace photos taken at home can reveal your exact GPS coordinates. Scrub all EXIF metadata in 1 click before publishing.',
    toolPath: '/image-metadata-remover',
    toolName: 'EXIF Metadata Remover',
  },
];

const SPOTLIGHT_TOOL_IDS = [
  'text-to-handwriting',
  'image-metadata-remover',
  'barcode-generator',
  'uuid-generator',
  'jwt-decoder',
  'ai-social-caption',
];

export const SocialHubPage: React.FC = () => {
  const [activeToolTab, setActiveToolTab] = useState<'caption' | 'script' | 'studio' | 'dimensions'>('caption');

  // 1. Caption State
  const [captionPlatform, setCaptionPlatform] = useState<'instagram' | 'tiktok' | 'linkedin' | 'twitter'>('instagram');
  const [captionTone, setCaptionTone] = useState<'viral' | 'professional' | 'humorous' | 'educational' | 'minimal'>('viral');
  const [captionTopic, setCaptionTopic] = useState('Productivity tools that feel like cheating');
  const [captionIncludeEmojis, setCaptionIncludeEmojis] = useState(true);
  const [captionHashtagCount, setCaptionHashtagCount] = useState(5);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [copiedCaptionIdx, setCopiedCaptionIdx] = useState<number | null>(null);

  // 2. Script State
  const [scriptPlatform, setScriptPlatform] = useState<'reels' | 'tiktok' | 'shorts'>('reels');
  const [scriptDuration, setScriptDuration] = useState<'15s' | '30s' | '60s'>('30s');
  const [scriptTopic, setScriptTopic] = useState('3 secret websites for students');
  const [generatedScript, setGeneratedScript] = useState<{
    hook: string;
    body: string[];
    cta: string;
    visualDirection: string;
  } | null>(null);
  const [isScriptCopied, setIsScriptCopied] = useState(false);

  // 3. Studio State
  const [studioImage, setStudioImage] = useState<string | null>(null);
  const [studioRatio, setStudioRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9' | '1.91:1'>('1:1');
  const [studioFit, setStudioFit] = useState<'cover' | 'contain' | 'center'>('contain');
  const [studioBgColor, setStudioBgColor] = useState('#161513');
  const studioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedDimension, setCopiedDimension] = useState<string | null>(null);

  useEffect(() => {
    handleGenerateCaptions();
    handleGenerateScript();
  }, []);

  useEffect(() => {
    if (!studioImage || !studioCanvasRef.current) return;
    const canvas = studioCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let targetW = 1080;
      let targetH = 1080;
      if (studioRatio === '4:5') { targetW = 1080; targetH = 1350; }
      else if (studioRatio === '9:16') { targetW = 1080; targetH = 1920; }
      else if (studioRatio === '16:9') { targetW = 1920; targetH = 1080; }
      else if (studioRatio === '1.91:1') { targetW = 1200; targetH = 627; }

      canvas.width = targetW;
      canvas.height = targetH;
      ctx.fillStyle = studioBgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      if (studioFit === 'contain') {
        const ratio = Math.min(targetW / img.width, targetH / img.height);
        const shiftX = (targetW - img.width * ratio) / 2;
        const shiftY = (targetH - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
      } else if (studioFit === 'cover') {
        const ratio = Math.max(targetW / img.width, targetH / img.height);
        const shiftX = (targetW - img.width * ratio) / 2;
        const shiftY = (targetH - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
      } else {
        const shiftX = (targetW - img.width) / 2;
        const shiftY = (targetH - img.height) / 2;
        ctx.drawImage(img, shiftX, shiftY);
      }
    };
    img.src = studioImage;
  }, [studioImage, studioRatio, studioFit, studioBgColor]);

  const handleGenerateCaptions = () => {
    const topic = captionTopic.trim() || 'Productivity hacks';
    const emojis = captionIncludeEmojis ? '? ?? ?? ?? ?? ??' : '';
    const hashtagsList = ['#productivity', '#techtips', '#lifehacks', '#workflow', '#digitalcreator', '#tools', '#studytips', '#efficiency', '#software', '#trending'].slice(0, captionHashtagCount);
    const tags = hashtagsList.join(' ');

    let variations: string[] = [];
    if (captionTone === 'viral') {
      variations = [
        `Stop scrolling. ${captionIncludeEmojis ? '??' : ''} If you aren't using this workflow for ${topic}, you're doing it the hard way.\n\nHere is the exact step-by-step breakdown you need to save 5+ hours every single week:\n\n1. Stop overcomplicating simple file edits\n2. Use browser-native tools with zero uploads\n3. Automate your daily repetitive tasks\n\n${captionIncludeEmojis ? '??' : ''} Save this post so you don't lose it later.\n\n${tags}`,
        `Nobody is talking about this yet, but ${topic} is about to change everything ${emojis}.\n\nSwipe through or check the link to see how simple it actually is.\n\nDrop a "${captionIncludeEmojis ? '??' : 'TOOL'}" in the comments if you want the direct link!\n\n${tags}`,
        `3 simple rules for mastering ${topic} in 2026:\n\n? Keep it private (no cloud storage risks)\n? Fast client-side execution\n? Zero paywalls or recurring subscriptions\n\nWhich one did you learn today? ??\n\n${tags}`,
      ];
    } else if (captionTone === 'professional') {
      variations = [
        `Optimizing ${topic} is one of the highest leverage investments for modern digital teams.\n\nBy leveraging zero-knowledge browser utilities, organizations can drastically improve turnaround times while maintaining strict data compliance.\n\nKey takeaways:\n- Client-side data integrity\n- Reduced friction in document pipelines\n- Instant browser performance\n\n${tags}`,
        `Efficiency isn't about working longer?it's about removing unnecessary bottlenecks.\n\nHere is a practical perspective on ${topic} that helped streamline our daily operational tasks.\n\n${tags}`,
      ];
    } else {
      variations = [
        `POV: You just discovered the easiest way to handle ${topic} ${captionIncludeEmojis ? '??' : ''}\n\nNo signups. No subscriptions. Just pure speed.\n\nShare this with a friend who desperately needs this.\n\n${tags}`,
        `Here's your friendly reminder that ${topic} doesn't have to be complicated ${captionIncludeEmojis ? '?' : ''}\n\nTap the link in bio to try it yourself 100% free.\n\n${tags}`,
      ];
    }
    setGeneratedCaptions(variations);
    showToast({ type: 'success', title: 'Generated fresh captions!' });
  };

  const handleGenerateScript = () => {
    const topic = scriptTopic.trim() || '3 productivity tools';
    setGeneratedScript({
      hook: `Stop paying for expensive subscriptions for ${topic}. Here is what nobody tells you...`,
      body: [
        '1. Most cloud tools store your confidential files on remote servers without telling you.',
        '2. You can do the exact same compression, PDF edits, and conversions 100% locally in your browser.',
        '3. It takes less than 3 seconds with zero sign-ups or monthly limits.',
      ],
      cta: 'Bookmark this video right now so you have it next time you need it, and tap the link in bio to try it free!',
      visualDirection: '[Fast hook cut] -> [Screen recording showing 1-click drag and drop] -> [Side-by-side speed comparison] -> [Thumbs up / CTA graphic]',
    });
  };

  const handleCopyCaption = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCaptionIdx(idx);
      showToast({ type: 'success', title: 'Caption copied to clipboard!' });
      setTimeout(() => setCopiedCaptionIdx(null), 2000);
    } catch {
      showToast({ type: 'error', title: 'Failed to copy' });
    }
  };

  const handleCopyScript = async () => {
    if (!generatedScript) return;
    const fullScript = `[HOOK (0-3s)]\n${generatedScript.hook}\n\n[VISUAL DIRECTION]\n${generatedScript.visualDirection}\n\n[CORE RETENTION BODY]\n${generatedScript.body.join('\n')}\n\n[CALL TO ACTION]\n${generatedScript.cta}`;
    try {
      await navigator.clipboard.writeText(fullScript);
      setIsScriptCopied(true);
      showToast({ type: 'success', title: 'Video script copied to clipboard!' });
      setTimeout(() => setIsScriptCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Failed to copy script' });
    }
  };

  const handleStudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStudioImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadStudioImage = () => {
    if (!studioCanvasRef.current) return;
    const dataUrl = studioCanvasRef.current.toDataURL('image/png', 0.95);
    const link = document.createElement('a');
    link.download = `toolboxx_social_${studioRatio.replace(':', '_')}.png`;
    link.href = dataUrl;
    link.click();
    showToast({ type: 'success', title: 'Social graphic downloaded!' });
  };

  const handleCopyDimension = async (dimText: string) => {
    try {
      await navigator.clipboard.writeText(dimText);
      setCopiedDimension(dimText);
      showToast({ type: 'success', title: `Copied: ${dimText}` });
      setTimeout(() => setCopiedDimension(null), 2000);
    } catch {}
  };
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="ToolBoxX Social Hub ? Viral Creator Tools, Caption & Script Generator, Aspect Ratios"
        description="Free in-browser creator studio for social media creators: AI caption writer, viral video script generator, aspect ratio canvas formatter, and 2026 platform dimension cheatsheets."
        canonicalPath="/social"
      />

      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>ToolBoxX Social Hub & Creator Studio</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                Scale Your Content <br className="hidden sm:inline" />
                with <span className="text-[var(--c-gold)]">Fast In-Browser</span> Tools.
              </h1>
              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Everything digital creators, marketers, and power users need to write viral hooks, format social graphics, and master platform dimensions. 100% free and private.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  0 Cloud Uploads
                </span>
                <span>?</span>
                <span>Instant Previews</span>
                <span>?</span>
                <span>No Accounts Required</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                  Creator Analytics
                </span>
                <Link
                  to="/social-analytics"
                  className="text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  <span>View Analytics</span>
                </Link>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-[var(--c-text)]">60+</div>
                <div className="text-xs text-[var(--c-muted)]">Free client-side productivity utilities</div>
              </div>
              <SocialShareButtons
                variant="compact"
                title="ToolBoxX Social Hub ? Free In-Browser Creator Tools"
                description="Generate captions, format social dimensions, and optimize graphics locally."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--c-gold)]" />
                <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
                  Social Creator Quick Tools
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                Instant interactive generators and canvas formatters running 100% in your browser.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveToolTab('caption')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                  activeToolTab === 'caption'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:text-[var(--c-text)]'
                }`}
              >
                Caption Generator
              </button>
              <button
                onClick={() => setActiveToolTab('script')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                  activeToolTab === 'script'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:text-[var(--c-text)]'
                }`}
              >
                Video Script Writer
              </button>
              <button
                onClick={() => setActiveToolTab('studio')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                  activeToolTab === 'studio'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:text-[var(--c-text)]'
                }`}
              >
                Social Image Studio
              </button>
              <button
                onClick={() => setActiveToolTab('dimensions')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                  activeToolTab === 'dimensions'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold shadow-md shadow-[var(--c-gold)]/20'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:text-[var(--c-text)]'
                }`}
              >
                2026 Size Guide
              </button>
            </div>
          </div>
          {/* TAB 1 */}
          {activeToolTab === 'caption' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[var(--c-gold)]" />
                  <span>Configure Caption</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Topic</label>
                    <input
                      type="text"
                      value={captionTopic}
                      onChange={(e) => setCaptionTopic(e.target.value)}
                      placeholder="e.g. 5 secret web productivity tools"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)] focus:outline-none focus:border-[var(--c-gold)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['instagram', 'tiktok', 'linkedin', 'twitter'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCaptionPlatform(p)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all ${
                            captionPlatform === p
                              ? 'bg-[var(--c-gold)]/20 border-[var(--c-gold)] text-[var(--c-gold)]'
                              : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-muted)]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['viral', 'professional', 'humorous', 'educational', 'minimal'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCaptionTone(t)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all ${
                            captionTone === t
                              ? 'bg-[var(--c-gold)]/20 border-[var(--c-gold)] text-[var(--c-gold)]'
                              : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-muted)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[var(--c-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={captionIncludeEmojis}
                        onChange={(e) => setCaptionIncludeEmojis(e.target.checked)}
                        className="rounded accent-[var(--c-gold)]"
                      />
                      <span>Emojis</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs text-[var(--c-muted)]">
                      <span>Tags: {captionHashtagCount}</span>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={captionHashtagCount}
                        onChange={(e) => setCaptionHashtagCount(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateCaptions}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--c-gold)] text-black font-bold text-sm hover:brightness-110 transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Captions</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-lg font-bold text-[var(--c-text)]">Generated Variations</h3>
                <div className="space-y-4">
                  {generatedCaptions.map((caption, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-[var(--c-gold)]">Variation #{idx + 1}</span>
                        <button
                          onClick={() => handleCopyCaption(caption, idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                        >
                          {copiedCaptionIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCaptionIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-line font-normal">{caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 */}
          {activeToolTab === 'script' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[var(--c-gold)]" />
                  <span>Script Parameters</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Topic</label>
                    <input
                      type="text"
                      value={scriptTopic}
                      onChange={(e) => setScriptTopic(e.target.value)}
                      placeholder="e.g. 3 secret websites for college students"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)] focus:outline-none focus:border-[var(--c-gold)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['15s', '30s', '60s'] as const).map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setScriptDuration(dur)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                            scriptDuration === dur ? 'bg-[var(--c-gold)]/20 border-[var(--c-gold)] text-[var(--c-gold)]' : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-muted)]'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateScript}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--c-gold)] text-black font-bold text-sm hover:brightness-110 transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Video Script</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--c-text)]">Generated Script</h3>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                  >
                    {isScriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isScriptCopied ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
                {generatedScript && (
                  <div className="p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Hook (0 - 3 Seconds)</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--c-text)] bg-[var(--c-card)] p-3 rounded-xl border border-[var(--c-border)]">"{generatedScript.hook}"</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold uppercase text-[var(--c-subtle)]">Visual Cuts</div>
                      <p className="text-xs text-[var(--c-muted)] italic">{generatedScript.visualDirection}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-[var(--c-gold)]">Core Body</div>
                      <div className="space-y-2">
                        {generatedScript.body.map((b, i) => (
                          <div key={i} className="text-xs sm:text-sm text-[var(--c-muted)] bg-[var(--c-card)] p-2.5 rounded-lg border border-[var(--c-border)]">{b}</div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold uppercase text-emerald-400">Call to Action</div>
                      <p className="text-xs sm:text-sm font-medium text-[var(--c-text)]">"{generatedScript.cta}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3 */}
          {activeToolTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl">
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--c-gold)]" />
                  <span>Canvas Aspect Ratio Controls</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Select Image</label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--c-border)] hover:border-[var(--c-gold)] rounded-2xl bg-[var(--c-surface)] cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-[var(--c-gold)] mb-2" />
                      <span className="text-xs font-semibold text-[var(--c-text)]">Click to upload image</span>
                      <input type="file" accept="image/*" onChange={handleStudioFileUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['1:1', '4:5', '9:16', '16:9', '1.91:1'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setStudioRatio(r)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                            studioRatio === r ? 'bg-[var(--c-gold)]/20 border-[var(--c-gold)] text-[var(--c-gold)]' : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-muted)]'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Scale Fit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['contain', 'cover', 'center'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setStudioFit(f)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all ${
                            studioFit === f ? 'bg-[var(--c-gold)]/20 border-[var(--c-gold)] text-[var(--c-gold)]' : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-muted)]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5">Backdrop Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={studioBgColor}
                        onChange={(e) => setStudioBgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--c-border)] bg-transparent"
                      />
                      <span className="text-xs font-mono text-[var(--c-muted)]">{studioBgColor}</span>
                    </div>
                  </div>
                  {studioImage && (
                    <button
                      onClick={handleDownloadStudioImage}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--c-gold)] text-black font-bold text-sm hover:brightness-110 transition-all shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] min-h-[360px]">
                {studioImage ? (
                  <div className="max-w-full max-h-[440px] overflow-hidden rounded-xl border border-[var(--c-border)] shadow-2xl flex items-center justify-center">
                    <canvas ref={studioCanvasRef} className="max-w-full max-h-[420px] object-contain" />
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-[var(--c-gold)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[var(--c-muted)]">Upload an image to preview formatted aspect ratio canvas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4 */}
          {activeToolTab === 'dimensions' && (
            <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)]">2026 Social Media Dimension Standards</h3>
                  <p className="text-xs text-[var(--c-muted)]">Click any dimension to copy or jump to Image Resizer.</p>
                </div>
                <Link to="/social-media-resizer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-xs hover:brightness-110 transition-all">
                  <span>Open Social Resizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-mono uppercase">
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Ratio</th>
                      <th className="py-3 px-4">Dimensions</th>
                      <th className="py-3 px-4">Max Size</th>
                      <th className="py-3 px-4">Best Use</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--c-border)]/60 text-[var(--c-muted)]">
                    {DIMENSION_CHEATSHEET.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[var(--c-surface)] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[var(--c-text)]">{item.platform} <span className="font-normal text-[var(--c-subtle)]">({item.format})</span></td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-[var(--c-gold)]">{item.aspectRatio}</td>
                        <td className="py-3.5 px-4 font-mono text-[var(--c-text)]">{item.dimensions}</td>
                        <td className="py-3.5 px-4">{item.maxSize}</td>
                        <td className="py-3.5 px-4 text-[var(--c-subtle)]">{item.recommended}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleCopyDimension(item.dimensions)}
                            className="px-2.5 py-1 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-[var(--c-text)] transition-colors cursor-pointer text-[11px]"
                          >
                            {copiedDimension === item.dimensions ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Productivity Hacks Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--c-gold)]" />
            <h2 className="text-2xl font-extrabold text-[var(--c-text)]">Latest Productivity Hacks & Viral Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCTIVITY_HACKS.map((hack) => (
              <div key={hack.id} className="p-6 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] hover:border-[var(--c-gold)]/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">{hack.badge}</span>
                  <h3 className="text-lg font-bold text-[var(--c-text)] leading-snug">{hack.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">{hack.description}</p>
                </div>
                <div className="pt-4 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-[var(--c-subtle)]">Powered by {hack.toolName}</span>
                  <Link to={hack.toolPath} className="font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] flex items-center gap-1 transition-colors">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spotlight Tools Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--c-gold)]" />
              <h2 className="text-2xl font-extrabold text-[var(--c-text)]">Tools You Didn't Know You Needed</h2>
            </div>
            <Link to="/all-tools" className="text-xs font-bold text-[var(--c-gold)] hover:text-[var(--c-text)] flex items-center gap-1 transition-colors">
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPOTLIGHT_TOOL_IDS.map((id) => {
              const tool = getToolById(id);
              if (!tool) return null;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)]/40 hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] font-bold">{tool.category}</span>
                      <span className="text-xs text-[var(--c-subtle)] font-mono">100% Free</span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--c-text)] group-hover:text-[var(--c-accent)] transition-colors">{tool.name}</h4>
                    <p className="text-xs text-[var(--c-muted)] line-clamp-2 leading-relaxed">{tool.shortDescription}</p>
                  </div>
                  <div className="pt-3 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--c-gold)]">
                    <span>Try Tool Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="ToolBoxX Social Hub ? Free In-Browser Social Media Tools"
          description="Viral caption generator, video script writer, and aspect ratio studio for digital creators."
        />
      </div>
    </div>
  );
};
