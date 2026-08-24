import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  Share2,
  FileText,
  Hash,
  MessageSquare,
  Bookmark,
  Layers,
  Wand2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export type PlatformId = 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'pinterest' | 'reddit';
export type ToneId = 'professional' | 'casual' | 'viral' | 'storyteller' | 'punchy' | 'minimalist';
export type AudienceId = 'developers' | 'freelancers' | 'creators' | 'students' | 'business' | 'general';

interface ToolPreset {
  id: string;
  name: string;
  category: string;
  headline: string;
  problem: string;
  solution: string;
  features: string[];
  keywords: string[];
}

const TOOL_PRESETS: ToolPreset[] = [
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'PDF Tools',
    headline: 'Compress huge PDFs up to 90% in your browser with zero data uploads',
    problem: 'Email file limits reject oversized PDFs, and cloud compression sites steal your private documents.',
    solution: 'ToolBoxX PDF Compressor runs 100% locally in your browser with instant lossless compression.',
    features: ['Up to 90% size reduction', '100% client-side privacy', 'No file size limits', 'Zero registration required'],
    keywords: ['pdfcompressor', 'freepdf', 'compresspdf', 'productivitytools', 'privacymatters', 'webtools'],
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge & Combine',
    category: 'PDF Tools',
    headline: 'Combine unlimited PDF files into one clean document in seconds',
    problem: 'Juggling separate PDF invoices, contracts, and scans wastes hours every week.',
    solution: 'Drag, drop, reorder pages, and merge your PDFs instantly with zero server uploads.',
    features: ['Visual drag-and-drop page reordering', 'Unlimited file merging', 'Lossless document fidelity', 'Runs completely offline'],
    keywords: ['pdfmerge', 'combinepdf', 'officetools', 'workfromhome', 'documentmanagement', 'productivity'],
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    category: 'Image Tools',
    headline: 'Remove image backgrounds instantly with high-precision AI edge detection',
    problem: 'Manually clipping product photos or portraits in Photoshop takes 15+ minutes per photo.',
    solution: 'One-click AI cutout with crisp hair and edge preservation directly on your device.',
    features: ['Instant 1-click cutout', 'Transparent PNG export', 'No credit card or limits', 'Works for products & portraits'],
    keywords: ['backgroundremover', 'photocutout', 'designhacks', 'ecommerce', 'graphicdesign', 'creativetools'],
  },
  {
    id: 'image-upscaler',
    name: 'AI Image Upscaler & Enhancer',
    category: 'Image Tools',
    headline: 'Upscale blurry and low-resolution photos to 4K clarity without artifacts',
    problem: 'Old photos and low-res web graphics look pixelated and unusable in high-res designs.',
    solution: 'Intelligent bicubic & AI super-resolution resampling that reconstructs fine textures.',
    features: ['2x and 4x upscaling', 'Artifact suppression', 'High-DPI print export', '100% free with no watermark'],
    keywords: ['imageupscaler', 'photoenhancer', 'superresolution', 'designertips', 'aiart', 'photorestoration'],
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'Developer Tools',
    headline: 'Format, validate, beautify, and inspect JSON with collapsible tree hierarchy',
    problem: 'Minified API responses and syntax errors break developer workflows.',
    solution: 'Syntax-highlighted, error-pointing JSON beautifier with one-click minify and copy.',
    features: ['Real-time syntax error locator', 'Collapsible tree view', '1-click minify / format', 'Clean TypeScript types generator'],
    keywords: ['jsonformatter', 'webdev', 'developerlife', 'javascript', 'frontenddev', 'codingtools'],
  },
  {
    id: 'resume-builder',
    name: 'ATS Resume Builder',
    category: 'Business Tools',
    headline: 'Create modern, ATS-friendly resumes that pass recruiters screening filters',
    problem: 'Fanciful Canva resumes get rejected by Applicant Tracking Systems (ATS).',
    solution: 'Clean semantic layouts, pre-written bullet point verbs, and instant PDF download.',
    features: ['100% ATS score optimized', 'Pre-written action verbs', 'Live side-by-side preview', 'No subscription paywalls'],
    keywords: ['resumebuilder', 'jobhunt', 'careeradvice', 'techjobs', 'resumetips', 'gethired'],
  },
  {
    id: 'qr-code-generator',
    name: 'Custom QR Code Studio',
    category: 'Generators',
    headline: 'Generate high-resolution QR codes with custom branding, logos, and colors',
    problem: 'Generic black-and-white QR codes expire on scam sites that charge monthly subscriptions.',
    solution: 'Permanent, vector-sharp QR codes with logo embedding, custom palette, and SVG export.',
    features: ['Logo/photo embedding', 'URLs, Wi-Fi, vCard, Email', 'Vector SVG & PNG export', 'Never expires, zero fees'],
    keywords: ['qrcodegenerator', 'branding', 'marketingtips', 'smallbusiness', 'designhacks', 'growthhacking'],
  },
  {
    id: 'base64-tool',
    name: 'Base64 Encoder / Decoder',
    category: 'Developer Tools',
    headline: 'Encode & decode text, images, and binary files to Base64 in milliseconds',
    problem: 'Embedding inline images or decoding auth headers requires clunky terminal commands.',
    solution: 'Drag-and-drop file to Base64 data URI with one-click HTML/CSS snippet generation.',
    features: ['Data URI preview', 'File to Base64 string', 'Reverse decoding', 'Zero upload privacy guarantee'],
    keywords: ['base64', 'devtools', 'webdevelopment', 'codingtips', 'csshacks', 'programming'],
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Studio Pro',
    category: 'Business Tools',
    headline: 'Generate standard UPC, EAN, CODE128, and ISBN barcodes for retail & shipping',
    problem: 'Barcode software is overpriced and requires complex desktop installations.',
    solution: 'Instant standard barcode generation ready for sticker printing and inventory scans.',
    features: ['EAN-13, UPC-A, Code128, ISBN', 'Printable sheet layout', 'High-res vector output', 'Compliant barcode metrics'],
    keywords: ['barcodegenerator', 'retailtools', 'inventory', 'ecommercehacks', 'amazonfba', 'logistics'],
  },
  {
    id: 'image-resizer',
    name: 'Social Media Image Resizer',
    category: 'Image Tools',
    headline: 'Crop & resize photos to exact dimensions for Instagram, YouTube, X, and LinkedIn',
    problem: 'Social platforms cut off key parts of images that are not resized to platform specs.',
    solution: 'One-click presets for all social platforms with aspect ratio lock and lossy compression.',
    features: ['Instagram, X, YouTube, LinkedIn presets', 'Aspect ratio locking', 'High-DPI canvas export', 'Batch image resizing'],
    keywords: ['imageresizer', 'socialmediatips', 'contentcreator', 'instagramgrowth', 'creativesuite', 'socialmediahacks'],
  },
];

interface GeneratedContent {
  instagram: {
    hook: string;
    body: string;
    cta: string;
    hashtags: string[];
  };
  linkedin: {
    hook: string;
    story: string;
    takeaways: string[];
    cta: string;
    hashtags: string[];
  };
  twitter: {
    hook: string;
    tweets: string[];
  };
  facebook: {
    hook: string;
    body: string;
    cta: string;
    question: string;
  };
  pinterest: {
    title: string;
    description: string;
    cta: string;
    hashtags: string[];
  };
  reddit: {
    title: string;
    tldr: string;
    story: string;
    techDetails: string;
    feedbackAsk: string;
  };
}

export const SocialContentGenerator: React.FC = () => {
  const [selectedToolId, setSelectedToolId] = useState<string>('pdf-compressor');
  const [customToolName, setCustomToolName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const [activePlatform, setActivePlatform] = useState<PlatformId>('instagram');
  const [tone, setTone] = useState<ToneId>('viral');
  const [audience, setAudience] = useState<AudienceId>('creators');
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [customUrl, setCustomUrl] = useState<string>('https://toolboxx.dev');
  const [hookVariationIndex, setHookVariationIndex] = useState<number>(0);

  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Current active tool preset
  const currentPreset = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'custom',
        name: customToolName.trim() || 'Custom Utility',
        category: 'Custom Utility',
        headline: customDescription.trim() || 'Free online utility built for speed and privacy',
        problem: 'Traditional software is bloated, expensive, and sells your user data.',
        solution: `${customToolName.trim() || 'This tool'} processes everything directly in your browser with zero latency.`,
        features: ['100% Client-Side Privacy', 'Instant Speed & No Latency', 'No Sign-up or Card Required', 'Unlimited Free Usage'],
        keywords: ['productivity', 'webtools', 'freeutility', 'techtips', 'creativetools', 'devtools'],
      };
    }
    return TOOL_PRESETS.find((t) => t.id === selectedToolId) || TOOL_PRESETS[0];
  }, [selectedToolId, isCustomMode, customToolName, customDescription]);

  // Dynamic Generator Algorithm
  const content = useMemo<GeneratedContent>(() => {
    const p = currentPreset;
    const emoji = includeEmojis;
    const url = customUrl.trim() || 'https://toolboxx.dev';

    // Hook styles by tone & index
    const hooks = [
      `Stop doing this the hard way: How to use ${p.name} in 3 seconds flat ${emoji ? '👇⚡' : ''}`,
      `Most people don't know this browser trick for ${p.name.toLowerCase()} ${emoji ? '🤯' : ''}`,
      `I built a 100% free ${p.name.toLowerCase()} because Adobe/cloud tools were driving me insane ${emoji ? '🛠️' : ''}`,
      `The secret productivity hack your team is missing: ${p.name} ${emoji ? '🚀' : ''}`,
      `Zero server uploads. 100% local privacy. Meet the next-gen ${p.name} ${emoji ? '🔒✨' : ''}`,
    ];
    const currentHook = hooks[hookVariationIndex % hooks.length];

    // Instagram Output
    const igHashtags = [
      ...p.keywords.map((k) => `#${k}`),
      '#toolboxx',
      '#freewebtools',
      '#productivityhacks',
      '#lifehacks',
      '#worksmarter',
      '#techtips',
      '#onlinefree',
      '#privacyfirst',
      '#softwareengineer',
      '#creatorlife',
      '#efficiency',
      '#digitaltools',
    ];

    const instagram = {
      hook: currentHook,
      body: `${emoji ? '🚨' : ''} The Problem: ${p.problem}\n\n${emoji ? '💡' : ''} The Solution: ${p.solution}\n\n${emoji ? '✨' : ''} Why you'll love it:\n${p.features.map((f) => `  ${emoji ? '• ✅' : '•'} ${f}`).join('\n')}\n\n${emoji ? '🔒' : ''} 100% Client-Side: Your files never touch a remote server. Everything is calculated in your browser memory.`,
      cta: `${emoji ? '👉' : ''} Try it completely free at: ${url}\n${emoji ? '💬' : ''} Save this post so you never lose this tool when you need it!`,
      hashtags: igHashtags,
    };

    // LinkedIn Output
    const linkedin = {
      hook: `Most people spend hours wrestling with ${p.name.toLowerCase()} problems.\n\nHere is how to solve it in under 5 seconds with zero server uploads:`,
      story: `Earlier this year, I noticed a huge flaw in modern web software:\n\nEvery time you want to do a simple task like ${p.name.toLowerCase()}, websites force you to upload sensitive files to their cloud, wait in a queue, and pay a $15/month subscription.\n\nWe decided to fix that.\n\n${p.solution}`,
      takeaways: [
        `Zero Cloud Dependency: All processing runs on WebAssembly/Canvas directly inside your browser.`,
        `Absolute Privacy: Financial records, client documents, and images never leave your machine.`,
        `Frictionless Workflow: No credit cards, no logins, no artificial quotas.`,
        `High Performance: Instant client-side execution with zero latency.`,
      ],
      cta: `Try the live tool for yourself: ${url}\n\nWhat tool should we build next? Let me know in the comments below!`,
      hashtags: ['#Productivity', '#WebDevelopment', '#DataPrivacy', '#TechInnovation', '#SoftwareTools'],
    };

    // Twitter / X Output (Thread)
    const twitter = {
      hook: `🧵 1/5 Stop paying $20/month for bloated software.\n\nHere is how to use a 100% free, private ${p.name} directly in your browser: ${emoji ? '👇' : ''}`,
      tweets: [
        `🧵 1/5 Stop paying $20/month for bloated software.\n\nHere is how to use a 100% free, private ${p.name} directly in your browser: ${emoji ? '👇' : ''}`,
        `2/5 The Problem: ${p.problem}\n\nMost websites upload your sensitive files to unknown remote servers. That's a massive security & privacy hazard.`,
        `3/5 The Solution: ${p.name} on ToolBoxX.\n\n${p.solution}\n\nKey advantages:\n${p.features.map((f) => `• ${f}`).join('\n')}`,
        `4/5 Pro Tip: Because it runs client-side using modern web APIs, it works even when your internet connection drops! ⚡`,
        `5/5 Try it right now (100% free, no sign-up):\n🔗 ${url}\n\nBookmark this thread if you found it useful! 🔖`,
      ],
    };

    // Facebook Output
    const facebook = {
      hook: `${emoji ? '🔥' : ''} Useful Tool Alert! If you work with ${p.name.toLowerCase()}, this will save you tons of time.`,
      body: `Ever had issues where ${p.problem.toLowerCase()}?\n\nCheck out this free tool: ${p.name}.\n\n${p.solution}\n\n${emoji ? '✅' : ''} Key Benefits:\n${p.features.map((f) => `• ${f}`).join('\n')}`,
      cta: `Try it out directly at: ${url}`,
      question: `Have you ever had your sensitive files leaked or held hostage by subscription services? Let us know in the comments!`,
    };

    // Pinterest Output
    const pinterest = {
      title: `${p.name} Online – Free, Private & Instant`,
      description: `Learn how to use ${p.name} for free without uploading your files to remote servers. ${p.headline}. Perfect for ${audience}. Follow for daily tech hacks, digital tools, and productivity shortcuts.`,
      cta: `Click to try the free tool now on ToolBoxX!`,
      hashtags: ['#techtools', '#freeproductivity', '#digitalhacks', '#workfromhome', '#computertips', '#freeresources'],
    };

    // Reddit Output
    const reddit = {
      title: `[Show Reddit] I built a 100% client-side ${p.name} so you don't have to upload sensitive files to random servers`,
      tldr: `TL;DR: Built a free ${p.name.toLowerCase()} utility that runs entirely in browser memory (WebAssembly / Canvas / Local APIs). Zero data is stored or transferred. Link: ${url}`,
      story: `Hey everyone!\n\nLike many of you, I got completely fed up with sketchy online converter/utility websites that:\n1. Force you to upload private files to unknown cloud buckets\n2. Slap arbitrary 5MB limits or 3-file-per-day caps\n3. Charge $15/month for basic local operations\n\nSo I built ${p.name} into ToolBoxX as a standalone, free browser utility.`,
      techDetails: `How it works under the hood:\n- Everything is computed on your client machine using modern browser capabilities.\n- Your files literally never make an HTTP POST request with your data.\n- Zero ads, zero trackers, no accounts.`,
      feedbackAsk: `Would love to get the community's feedback, bug reports, or feature requests. What other utilities would you like to see next?`,
    };

    return { instagram, linkedin, twitter, facebook, pinterest, reddit };
  }, [currentPreset, includeEmojis, customUrl, hookVariationIndex, audience]);

  // Copy helper
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast({ type: 'success', title: 'Copied to Clipboard!', message: 'Post content ready to paste.' });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please manually copy the text.' });
    }
  };

  // Copy All Platforms
  const handleCopyAll = async () => {
    const fullMarkdown = `# Social Media Launch Kit: ${currentPreset.name}

## 📸 Instagram
${content.instagram.hook}

${content.instagram.body}

${content.instagram.cta}

${content.instagram.hashtags.join(' ')}

---

## 💼 LinkedIn
${content.linkedin.hook}

${content.linkedin.story}

Key Takeaways:
${content.linkedin.takeaways.map((t) => `• ${t}`).join('\n')}

${content.linkedin.cta}

${content.linkedin.hashtags.join(' ')}

---

## 🐦 X / Twitter Thread
${content.twitter.tweets.join('\n\n---\n\n')}

---

## 📘 Facebook
${content.facebook.hook}

${content.facebook.body}

${content.facebook.cta}

Question: ${content.facebook.question}

---

## 📌 Pinterest
Title: ${content.pinterest.title}
Description: ${content.pinterest.description}
CTA: ${content.pinterest.cta}
Tags: ${content.pinterest.hashtags.join(' ')}

---

## 🔴 Reddit (r/webdev, r/SideProject, r/productivity)
Title: ${content.reddit.title}

${content.reddit.tldr}

${content.reddit.story}

${content.reddit.techDetails}

${content.reddit.feedbackAsk}
`;
    await handleCopy(fullMarkdown, 'all');
  };

  // Download Markdown File
  const handleDownloadMarkdown = () => {
    const fullMarkdown = `# Social Media Kit – ${currentPreset.name}\nGenerated via ToolBoxX Social Hub\n\n` +
      `### INSTAGRAM\n${content.instagram.hook}\n\n${content.instagram.body}\n\n${content.instagram.cta}\n\n${content.instagram.hashtags.join(' ')}\n\n` +
      `### LINKEDIN\n${content.linkedin.hook}\n\n${content.linkedin.story}\n\n${content.linkedin.takeaways.join('\n')}\n\n${content.linkedin.cta}\n\n` +
      `### TWITTER THREAD\n${content.twitter.tweets.join('\n\n---\n\n')}\n\n` +
      `### REDDIT\n${content.reddit.title}\n\n${content.reddit.tldr}\n\n${content.reddit.story}\n\n${content.reddit.techDetails}\n\n${content.reddit.feedbackAsk}`;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${currentPreset.name.toLowerCase().replace(/\s+/g, '-')}-social-kit.md`);
    showToast({ type: 'success', title: 'File Downloaded', message: 'Social kit saved as markdown file.' });
  };

  // Get active text content for stats
  const activeTextSummary = useMemo(() => {
    switch (activePlatform) {
      case 'instagram':
        return `${content.instagram.hook}\n\n${content.instagram.body}\n\n${content.instagram.cta}\n\n${content.instagram.hashtags.join(' ')}`;
      case 'linkedin':
        return `${content.linkedin.hook}\n\n${content.linkedin.story}\n\n${content.linkedin.takeaways.join('\n')}\n\n${content.linkedin.cta}\n\n${content.linkedin.hashtags.join(' ')}`;
      case 'twitter':
        return content.twitter.tweets.join('\n\n');
      case 'facebook':
        return `${content.facebook.hook}\n\n${content.facebook.body}\n\n${content.facebook.cta}\n\n${content.facebook.question}`;
      case 'pinterest':
        return `${content.pinterest.title}\n\n${content.pinterest.description}\n\n${content.pinterest.cta}\n\n${content.pinterest.hashtags.join(' ')}`;
      case 'reddit':
        return `${content.reddit.title}\n\n${content.reddit.tldr}\n\n${content.reddit.story}\n\n${content.reddit.techDetails}\n\n${content.reddit.feedbackAsk}`;
    }
  }, [activePlatform, content]);

  const platformLimits: Record<PlatformId, number> = {
    instagram: 2200,
    linkedin: 3000,
    twitter: 280, // per tweet
    facebook: 5000,
    pinterest: 500,
    reddit: 40000,
  };

  const currentLimit = platformLimits[activePlatform];
  const charCount = activePlatform === 'twitter' ? content.twitter.tweets[0].length : activeTextSummary.length;
  const wordCount = activeTextSummary.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full space-y-8">
      {/* Top Header Controls Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Platform Creator Engine</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Social Content Generator
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Select any ToolBoxX utility or enter a custom topic to generate platform-optimized copy in 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setHookVariationIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              <span>Shuffle Hooks</span>
            </button>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedKey === 'all' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'all' ? 'All Copied!' : 'Copy All Platforms'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer"
              title="Download full kit as Markdown"
            >
              <Download className="w-4 h-4" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Select Tool / Topic
            </label>
            <div className="relative">
              <select
                value={isCustomMode ? 'custom' : selectedToolId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomMode(true);
                  } else {
                    setIsCustomMode(false);
                    setSelectedToolId(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] appearance-none cursor-pointer pr-10"
              >
                <optgroup label="ToolBoxX Built-in Utilities">
                  {TOOL_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Options">
                  <option value="custom">+ Enter Custom Topic / Tool</option>
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--c-muted)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Tone of Voice
            </label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneId)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] appearance-none cursor-pointer pr-10"
              >
                <option value="viral">Viral Growth Hacker 🚀</option>
                <option value="professional">Professional Authority 💼</option>
                <option value="storyteller">Founder Storyteller 📖</option>
                <option value="casual">Casual & Relatable ☕</option>
                <option value="punchy">Direct & Punchy ⚡</option>
                <option value="minimalist">Minimalist / Clean 🌿</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--c-muted)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Target Audience
            </label>
            <div className="relative">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as AudienceId)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] appearance-none cursor-pointer pr-10"
              >
                <option value="creators">Content Creators & Designers</option>
                <option value="developers">Developers & Engineers</option>
                <option value="freelancers">Freelancers & Solopreneurs</option>
                <option value="business">Small Business Owners</option>
                <option value="students">Students & Academics</option>
                <option value="general">General Internet Users</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--c-muted)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Website / Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              CTA Link / Destination URL
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://toolboxx.dev"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] placeholder-[var(--c-subtle)]"
            />
          </div>
        </div>

        {/* Custom Mode Expansion */}
        {isCustomMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] animate-in fade-in">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-text)]">Custom Tool Name</label>
              <input
                type="text"
                value={customToolName}
                onChange={(e) => setCustomToolName(e.target.value)}
                placeholder="e.g. AI Invoice Parser"
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-text)]">Primary Benefit / Tagline</label>
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="e.g. Extract table data from invoice PDFs automatically"
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)]"
              />
            </div>
          </div>
        )}

        {/* Quick Toggles */}
        <div className="flex items-center gap-6 pt-2 text-xs text-[var(--c-muted)]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeEmojis}
              onChange={(e) => setIncludeEmojis(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--c-gold)] cursor-pointer"
            />
            <span>Include Engaging Emojis</span>
          </label>
          <div className="flex items-center gap-1.5 text-[var(--c-subtle)]">
            <Info className="w-3.5 h-3.5" />
            <span>Currently featuring: <strong className="text-[var(--c-gold)]">{currentPreset.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Platform"
          value={activePlatform.toUpperCase()}
          badge="Live"
          badgeType="success"
        />
        <StatCard
          label="Character Count"
          value={`${charCount} / ${currentLimit}`}
          subValue={charCount > currentLimit ? '⚠️ Exceeds limit' : 'Within standard bounds'}
        />
        <StatCard
          label="Word Count"
          value={wordCount}
          subValue="Est. 30s reading time"
        />
        <StatCard
          label="Platform Presets"
          value="6 Ready"
          subValue="1-Click Copy Each"
        />
      </div>

      {/* Main Platform Tabs and Interactive Output Area */}
      <div className="rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl overflow-hidden">
        {/* Platform Selection Tab Bar */}
        <div className="flex items-center overflow-x-auto border-b border-[var(--c-border)] bg-[var(--c-card)] px-3 pt-3 gap-2">
          {(
            [
              { id: 'instagram', label: 'Instagram', icon: '📸', color: 'text-pink-400' },
              { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'text-blue-400' },
              { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: 'text-sky-400' },
              { id: 'facebook', label: 'Facebook', icon: '📘', color: 'text-blue-500' },
              { id: 'pinterest', label: 'Pinterest', icon: '📌', color: 'text-rose-500' },
              { id: 'reddit', label: 'Reddit', icon: '🔴', color: 'text-orange-500' },
            ] as const
          ).map((p) => {
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[var(--c-surface)] text-[var(--c-text)] border-t border-x border-[var(--c-border)] shadow-sm'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]/50'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body per Active Platform */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* 1. INSTAGRAM VIEW */}
          {activePlatform === 'instagram' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>Instagram Post & Reel Caption</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono">
                      Feed / Carousel
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Formatted with high-retention line breaks and 30 targeted hashtags.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `${content.instagram.hook}\n\n${content.instagram.body}\n\n${content.instagram.cta}\n\n${content.instagram.hashtags.join(' ')}`,
                      'instagram'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'instagram' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'instagram' ? 'Copied' : 'Copy IG Post'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-wrap">
                <div className="font-bold text-base text-[var(--c-gold)] mb-3 pb-2 border-b border-[var(--c-border)]">
                  {content.instagram.hook}
                </div>
                <div>{content.instagram.body}</div>
                <div className="mt-4 pt-3 border-t border-[var(--c-border)] font-semibold text-[var(--c-muted)]">
                  {content.instagram.cta}
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--c-border)] text-xs text-sky-400 font-mono flex flex-wrap gap-1.5">
                  {content.instagram.hashtags.map((h, i) => (
                    <span key={i} className="bg-[var(--c-surface)] px-2 py-0.5 rounded-md border border-[var(--c-border)]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. LINKEDIN VIEW */}
          {activePlatform === 'linkedin' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>LinkedIn Thought Leadership Post</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      Executive Angle
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Structured with white-space pacing for the "see more" click trigger.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `${content.linkedin.hook}\n\n${content.linkedin.story}\n\nKey Takeaways:\n${content.linkedin.takeaways.map((t) => `• ${t}`).join('\n')}\n\n${content.linkedin.cta}\n\n${content.linkedin.hashtags.join(' ')}`,
                      'linkedin'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'linkedin' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'linkedin' ? 'Copied' : 'Copy LinkedIn Post'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-sm text-[var(--c-text)] leading-relaxed space-y-4">
                <p className="font-semibold text-[var(--c-gold)] text-base">{content.linkedin.hook}</p>
                <p className="whitespace-pre-wrap">{content.linkedin.story}</p>
                <div className="p-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">Key Takeaways:</span>
                  {content.linkedin.takeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="whitespace-pre-wrap text-[var(--c-muted)]">{content.linkedin.cta}</p>
                <div className="text-xs text-blue-400 font-mono flex flex-wrap gap-2 pt-2 border-t border-[var(--c-border)]">
                  {content.linkedin.hashtags.map((h, i) => (
                    <span key={i}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. TWITTER / X THREAD VIEW */}
          {activePlatform === 'twitter' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>X / Twitter Viral Thread</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                      5 Tweets
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Optimized hook with bookmark prompts and individual tweet counters.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(content.twitter.tweets.join('\n\n---\n\n'), 'twitter_all')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'twitter_all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'twitter_all' ? 'Copied' : 'Copy Full Thread'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {content.twitter.tweets.map((tweet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-mono font-bold text-[var(--c-gold)] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-[var(--c-subtle)] font-mono">
                          {tweet.length} / 280 characters
                        </span>
                      </div>
                      <p className="text-sm text-[var(--c-text)] whitespace-pre-wrap leading-relaxed">
                        {tweet}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(tweet, `tweet_${idx}`)}
                      className="self-end sm:self-start px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-medium text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `tweet_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Tweet</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. FACEBOOK VIEW */}
          {activePlatform === 'facebook' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>Facebook Community Post</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20 font-mono">
                      High Engagement
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Conversational tone with a discussion prompt to trigger comment virality.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `${content.facebook.hook}\n\n${content.facebook.body}\n\n${content.facebook.cta}\n\nQuestion: ${content.facebook.question}`,
                      'facebook'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'facebook' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'facebook' ? 'Copied' : 'Copy Facebook Post'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-sm text-[var(--c-text)] leading-relaxed space-y-4">
                <p className="font-bold text-[var(--c-text)] text-base">{content.facebook.hook}</p>
                <p className="whitespace-pre-wrap">{content.facebook.body}</p>
                <p className="font-semibold text-[var(--c-gold)]">{content.facebook.cta}</p>
                <div className="p-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)]">
                  <strong className="text-[var(--c-text)]">Discussion Starter: </strong>
                  {content.facebook.question}
                </div>
              </div>
            </div>
          )}

          {/* 5. PINTEREST VIEW */}
          {activePlatform === 'pinterest' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>Pinterest Pin Copy & SEO Description</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                      Search Optimized
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Targeted keywords to rank high on Pinterest visual search.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Pin Title: ${content.pinterest.title}\n\nDescription: ${content.pinterest.description}\n\nCTA: ${content.pinterest.cta}\n\nTags: ${content.pinterest.hashtags.join(' ')}`,
                      'pinterest'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'pinterest' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'pinterest' ? 'Copied' : 'Copy Pin Copy'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-sm text-[var(--c-text)] space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
                    Pin Title (100 Chars Max):
                  </span>
                  <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] font-bold text-base text-[var(--c-gold)]">
                    {content.pinterest.title}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
                    Pin Description (500 Chars Max):
                  </span>
                  <div className="p-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-sm leading-relaxed">
                    {content.pinterest.description}
                  </div>
                </div>
                <div className="text-xs text-rose-400 font-mono flex flex-wrap gap-2 pt-2 border-t border-[var(--c-border)]">
                  {content.pinterest.hashtags.map((h, i) => (
                    <span key={i}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. REDDIT VIEW */}
          {activePlatform === 'reddit' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                    <span>Reddit Value Post</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                      r/webdev • r/SideProject • r/productivity
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    Zero spammy sales pitch. Pure transparent technical breakdown & privacy promise.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Post Title: ${content.reddit.title}\n\n${content.reddit.tldr}\n\n${content.reddit.story}\n\n${content.reddit.techDetails}\n\n${content.reddit.feedbackAsk}`,
                      'reddit'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'reddit' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'reddit' ? 'Copied' : 'Copy Reddit Post'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-sans text-sm text-[var(--c-text)] space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
                    Post Title:
                  </span>
                  <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] font-bold text-[var(--c-gold)]">
                    {content.reddit.title}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] font-mono text-xs text-[var(--c-muted)] whitespace-pre-wrap leading-relaxed">
                  {content.reddit.tldr}
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">{content.reddit.story}</div>

                <div className="p-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs leading-relaxed whitespace-pre-wrap">
                  {content.reddit.techDetails}
                </div>

                <div className="italic text-[var(--c-muted)] border-t border-[var(--c-border)] pt-3">
                  {content.reddit.feedbackAsk}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Generate high-converting social media posts with ToolBoxX!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="social-content-generator" />
    </div>
  );
};
