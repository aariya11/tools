import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  RotateCcw,
  Video,
  Sliders,
  Share2,
  Tv,
  Clock,
  Zap,
  Volume2,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export type ShortPlatform = 'tiktok' | 'reels' | 'shorts';
export type VideoDuration = '15s' | '30s' | '60s';
export type CreatorVibe = 'hacker' | 'problemsolver' | 'moneysaver' | 'aesthetic' | 'founder';

interface VideoScene {
  timecode: string;
  stage: string;
  visual: string;
  textOverlay: string;
  voiceover: string;
  sfx: string;
}

interface ScriptOutput {
  hooks: { title: string; score: number; type: string; text: string }[];
  scenes: VideoScene[];
  audioVibe: string;
  captionPreset: string;
  pacingNote: string;
}

const PRESET_TOPICS = [
  { id: 'pdf-compressor', name: 'PDF Compressor', desc: 'Compress huge PDFs by 90% without server uploads' },
  { id: 'background-remover', name: 'AI Background Remover', desc: 'Cut out photo backgrounds with AI in 1 click' },
  { id: 'image-upscaler', name: '4K Image Upscaler', desc: 'Upscale blurry photos to 4K clarity for free' },
  { id: 'json-formatter', name: 'JSON Formatter & Validator', desc: 'Format and validate messy API payloads instantly' },
  { id: 'resume-builder', name: 'ATS Resume Builder', desc: 'Beat recruitment ATS bots with clean semantic formatting' },
  { id: 'qr-generator', name: 'Branded QR Code Studio', desc: 'Create permanent vector QR codes with logo embedding' },
  { id: 'privacy-suite', name: '100% Client-Side Privacy Suite', desc: 'How to process sensitive client files with zero cloud uploads' },
];

export const ShortVideoScriptGenerator: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('pdf-compressor');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [platform, setPlatform] = useState<ShortPlatform>('tiktok');
  const [duration, setDuration] = useState<VideoDuration>('30s');
  const [vibe, setVibe] = useState<CreatorVibe>('hacker');
  const [activeHookIndex, setActiveHookIndex] = useState<number>(0);

  // Copied indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Teleprompter State
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isPrompterPlaying, setIsPrompterPlaying] = useState<boolean>(false);
  const [prompterSpeed, setPrompterSpeed] = useState<number>(2); // 1-5
  const [prompterFontSize, setPrompterFontSize] = useState<number>(32); // 24-48px
  const [prompterMirrored, setPrompterMirrored] = useState<boolean>(false);
  const prompterContentRef = useRef<HTMLDivElement>(null);

  const currentTopic = useMemo(() => {
    if (isCustom) {
      return {
        id: 'custom',
        name: customTopic.trim() || 'Custom Tech Tool',
        desc: 'Instant browser-side productivity utility with zero cloud uploads',
      };
    }
    return PRESET_TOPICS.find((t) => t.id === selectedTopicId) || PRESET_TOPICS[0];
  }, [isCustom, customTopic, selectedTopicId]);

  // Script Generator Engine
  const scriptData = useMemo<ScriptOutput>(() => {
    const topic = currentTopic.name;

    // 3 High-Retention Hooks
    const hooks = [
      {
        title: 'Curiosity Gap Hook',
        score: 98,
        type: 'High Virality',
        text: `Stop scrolling if you still pay for software to do ${topic.toLowerCase()}. Here is the secret website nobody tells you about.`,
      },
      {
        title: 'Pain Point / Warning Hook',
        score: 95,
        type: 'High Retention',
        text: `If you are uploading sensitive client documents to random converter websites, STOP! Watch this instead.`,
      },
      {
        title: 'Money-Saver / Anti-Adobe Hook',
        score: 93,
        type: 'High Shares',
        text: `Big software companies hate this one free website that replaces their entire $30/month subscription.`,
      },
    ];

    const chosenHook = hooks[activeHookIndex % hooks.length].text;

    // Scene Generation based on duration
    let scenes: VideoScene[] = [];

    if (duration === '15s') {
      scenes = [
        {
          timecode: '0:00 - 0:03',
          stage: 'Hook (0-3s)',
          visual: 'Fast zoom-in on face or screen, pointing finger aggressively at screen.',
          textOverlay: `🚨 STOP DOING THIS!`,
          voiceover: chosenHook,
          sfx: '[WHOOSH] + [RECORD SCRATCH]',
        },
        {
          timecode: '0:03 - 0:11',
          stage: 'Demo (3-11s)',
          visual: `Screen capture: Drag file into ToolBoxX ${topic}. Instantly processed with zero loading bar.`,
          textOverlay: `⚡ 100% PRIVATE • ZERO UPLOADS`,
          voiceover: `Go to ToolBoxX. It runs 100% in your browser. Drag your file in, and it finishes in literally 2 seconds without sending your data anywhere.`,
          sfx: '[MOUSE CLICK] + [ENERGY POP]',
        },
        {
          timecode: '0:11 - 0:15',
          stage: 'CTA (11-15s)',
          visual: 'Show homepage URL in huge bold letters with sparkle emoji.',
          textOverlay: `🔗 Link in bio: toolboxx.dev`,
          voiceover: `Save this video and try it free at toolboxx.dev!`,
          sfx: '[CASH REGISTER DING]',
        },
      ];
    } else if (duration === '30s') {
      scenes = [
        {
          timecode: '0:00 - 0:03',
          stage: 'Hook (0-3s)',
          visual: 'Creator looks shocked into camera holding up a file or phone.',
          textOverlay: `🚨 SECRET TOOL ALERT`,
          voiceover: chosenHook,
          sfx: '[BOOM EFFECT] + [WHOOSH]',
        },
        {
          timecode: '0:03 - 0:09',
          stage: 'The Pain (3-9s)',
          visual: 'Show traditional website with "Upgrade to Pro to download" paywall or slow queue.',
          textOverlay: `❌ The Old Way: Paywalls & Slow Clouds`,
          voiceover: `Most websites force you to upload private files to their servers, make you wait in line, and then demand your credit card.`,
          sfx: '[ERROR BUZZER]',
        },
        {
          timecode: '0:09 - 0:21',
          stage: 'The ToolBoxX Solution (9-21s)',
          visual: `Smooth screen recording of ToolBoxX ${topic}. Show drag and drop, live before/after result in crisp 4K.`,
          textOverlay: `✅ 100% CLIENT-SIDE • NO SIGNUP`,
          voiceover: `Instead, go to ToolBoxX. It uses WebAssembly directly in your browser. Your files NEVER leave your computer, there are no file size limits, and it is completely free.`,
          sfx: '[SPARKLE DING] + [KEYBOARD CLICKS]',
        },
        {
          timecode: '0:21 - 0:26',
          stage: 'The Result (21-26s)',
          visual: 'Highlight the completed file download and clean UI with zero ads.',
          textOverlay: `⚡ Instant High-Quality Download`,
          voiceover: `Look at the output: perfect quality, saved in 2 seconds flat, and 100% private.`,
          sfx: '[WHOOSH SUCCESS]',
        },
        {
          timecode: '0:26 - 0:30',
          stage: 'Call to Action (26-30s)',
          visual: 'Creator points to the bottom bookmark button, then flashes URL.',
          textOverlay: `🔖 Bookmark & Check Link in Bio`,
          voiceover: `Bookmark this video before you forget, and check the link in my bio to use it free!`,
          sfx: '[SUBSCRIBE CHIME]',
        },
      ];
    } else {
      // 60s Deep Dive
      scenes = [
        {
          timecode: '0:00 - 0:05',
          stage: 'Viral Hook (0-5s)',
          visual: 'Fast paced B-roll montage of common file headaches, followed by creator speaking directly to camera.',
          textOverlay: `🤯 The Productivity Trick Nobody Talks About`,
          voiceover: chosenHook,
          sfx: '[BASS DROP] + [WHOOSH]',
        },
        {
          timecode: '0:05 - 0:15',
          stage: 'The Real Problem (5-15s)',
          visual: 'Show privacy policy snippet of random converter site selling user data, then red alert box.',
          textOverlay: `⚠️ Where do your files actually go?`,
          voiceover: `When you upload financial PDFs, resumes, or client photos to random converter sites, you are giving away your data to third-party cloud servers. That is a massive security risk.`,
          sfx: '[HEARTBEAT TENSION] + [GLITCH SFX]',
        },
        {
          timecode: '0:15 - 0:32',
          stage: 'Step-by-Step Walkthrough (15-32s)',
          visual: `Step 1: Open ToolBoxX ${topic}. Step 2: Drop file. Step 3: Watch instant browser processing.`,
          textOverlay: `⚡ Step 1: Drop File • Step 2: Instant Process`,
          voiceover: `Here is the better way: open ToolBoxX. Because everything is engineered with client-side WebAssembly, your CPU processes the file locally without sending a single byte over the web.`,
          sfx: '[KEYBOARD CLICKS] + [CHIME]',
        },
        {
          timecode: '0:32 - 0:48',
          stage: 'Pro Tips & Unique Features (32-48s)',
          visual: 'Show advanced feature toggles, batch processing, and offline capability.',
          textOverlay: `🔥 PRO TIP: Works Even Offline!`,
          voiceover: `Pro tip: you can even disconnect your Wi-Fi, and it still works flawlessly! Plus, there are no file size limits, no daily counters, and no registration required.`,
          sfx: '[POWER UP WHOOSH]',
        },
        {
          timecode: '0:48 - 1:00',
          stage: 'Payoff & CTA (48-60s)',
          visual: 'Creator smiling, pointing to follow button and bookmarking icon.',
          textOverlay: `🚀 toolboxx.dev • Follow for more!`,
          voiceover: `If you want to save hours every week and keep your files private, save this video and visit toolboxx.dev. Follow for more daily tech hacks!`,
          sfx: '[FINAL TRIUMPHANT CHIME]',
        },
      ];
    }

    return {
      hooks,
      scenes,
      audioVibe: platform === 'tiktok' ? 'Upbeat lo-fi hip hop / Phonk beat (128 BPM)' : 'Energetic ambient tech synth (120 BPM)',
      captionPreset: 'Bold yellow and white sans-serif with subtle drop shadow and spring bounce animation.',
      pacingNote: 'Keep cuts under 2.5 seconds. Use zoom-ins on key punchlines for 90%+ retention.',
    };
  }, [currentTopic, duration, platform, activeHookIndex]);

  // Full voiceover text string
  const fullVoiceoverText = useMemo(() => {
    return scriptData.scenes.map((s) => s.voiceover).join('\n\n');
  }, [scriptData]);

  // Teleprompter Scrolling Logic
  useEffect(() => {
    let animationFrameId: number;
    if (isTeleprompterOpen && isPrompterPlaying && prompterContentRef.current) {
      const container = prompterContentRef.current;
      const scrollStep = () => {
        container.scrollTop += prompterSpeed * 0.75;
        if (container.scrollTop < container.scrollHeight - container.clientHeight) {
          animationFrameId = requestAnimationFrame(scrollStep);
        } else {
          setIsPrompterPlaying(false);
        }
      };
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTeleprompterOpen, isPrompterPlaying, prompterSpeed]);

  // Copy helper
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast({ type: 'success', title: 'Copied to Clipboard!', message: 'Script ready to record or paste.' });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy manually.' });
    }
  };

  // Download Full Production Package
  const handleDownloadScript = () => {
    const fullDoc = `# Short Video Script: ${currentTopic.name}
Platform: ${platform.toUpperCase()} | Target Duration: ${duration}

## 🎯 VIRAL HOOKS
${scriptData.hooks.map((h, i) => `${i + 1}. [${h.type} - Score ${h.score}/100] ${h.text}`).join('\n')}

---

## 🎬 SCENE-BY-SCENE PRODUCTION TIMELINE
${scriptData.scenes
  .map(
    (s, i) => `### Scene ${i + 1}: ${s.stage} (${s.timecode})
- 🎥 Visual / B-Roll: ${s.visual}
- 📝 Text On-Screen: ${s.textOverlay}
- 🎙️ Voiceover: "${s.voiceover}"
- 🔊 Sound FX Cue: ${s.sfx}
`
  )
  .join('\n')}

---

## 🎧 AUDIO & CAPTIONS RECOMMENDATIONS
- Music Tempo: ${scriptData.audioVibe}
- Subtitle Preset: ${scriptData.captionPreset}
- Retention Strategy: ${scriptData.pacingNote}
`;

    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${currentTopic.name.toLowerCase().replace(/\s+/g, '-')}-${duration}-script.md`);
    showToast({ type: 'success', title: 'Script Exported!', message: 'Saved full production breakdown.' });
  };

  const totalWords = fullVoiceoverText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round(totalWords / 2.5);

  return (
    <div className="w-full space-y-8">
      {/* Header Settings Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>High-Retention Script Studio</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Short Video Script Generator
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Generate 15s, 30s & 60s viral video scripts for TikTok, Reels & Shorts with shot lists and teleprompter mode.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsTeleprompterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-gold)] text-[#11110F] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Teleprompter</span>
            </button>
            <button
              onClick={() => handleCopy(fullVoiceoverText, 'voiceover')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedKey === 'voiceover' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'voiceover' ? 'Copied VO' : 'Copy Voiceover Only'}</span>
            </button>
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool / Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Tool / Topic
            </label>
            <select
              value={isCustom ? 'custom' : selectedTopicId}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedTopicId(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <optgroup label="ToolBoxX Utilities">
                {PRESET_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Custom">
                <option value="custom">+ Custom Topic</option>
              </optgroup>
            </select>
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Target Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ShortPlatform)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="tiktok">TikTok (Fast cuts & casual hook)</option>
              <option value="reels">Instagram Reels (Aesthetic & polished)</option>
              <option value="shorts">YouTube Shorts (Search intent & clarity)</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Video Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as VideoDuration)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="15s">15s – Ultra-Fast Teaser ⚡</option>
              <option value="30s">30s – Viral Retention Sweet Spot 🚀</option>
              <option value="60s">60s – Step-by-Step Deep Dive 🎓</option>
            </select>
          </div>

          {/* Creator Vibe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Creator Archetype
            </label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value as CreatorVibe)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="hacker">Secret Website Hacker 💻</option>
              <option value="moneysaver">Money-Saving Rebel 💸</option>
              <option value="problemsolver">Direct Problem Solver 🛠️</option>
              <option value="aesthetic">Calm Minimalist ASMR 🌿</option>
              <option value="founder">Indie Builder Story 🚀</option>
            </select>
          </div>
        </div>

        {/* Custom Topic Input */}
        {isCustom && (
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-1.5 animate-in fade-in">
            <label className="text-xs font-bold text-[var(--c-text)]">Custom Topic / Workflow</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. How to convert CSV to JSON in 3 seconds offline"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm text-[var(--c-text)]"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Target Duration"
          value={duration}
          subValue={`Est. ${estimatedSeconds}s spoken pace`}
          badge="Retention Optimized"
          badgeType="success"
        />
        <StatCard
          label="Word Count"
          value={`${totalWords} Words`}
          subValue="~130-150 words per minute"
        />
        <StatCard
          label="Scene Breakdown"
          value={`${scriptData.scenes.length} Scenes`}
          subValue="Structured timeline"
        />
        <StatCard
          label="Hook Variations"
          value="3 Ready"
          subValue="95%+ Virality score"
        />
      </div>

      {/* 3 Viral Hook Alternatives */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--c-gold)] flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Tested Viral Hook Variations (Select to update timeline)</span>
          </h3>
          <span className="text-xs text-[var(--c-muted)]">Click any hook to activate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scriptData.hooks.map((h, idx) => {
            const isSelected = activeHookIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveHookIndex(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[var(--c-gold)] bg-[var(--c-card)] shadow-md ring-1 ring-[var(--c-gold)]/40'
                    : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--c-text)]">{h.title}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {h.score}% Score
                    </span>
                  </div>
                  <p className="text-xs text-[var(--c-muted)] leading-relaxed font-sans">
                    "{h.text}"
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--c-border)] text-[var(--c-subtle)]">
                  <span>{h.type}</span>
                  <span className="text-[var(--c-gold)] font-semibold">{isSelected ? '✓ Active Hook' : 'Click to Use'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Scene-by-Scene Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]">
          <div>
            <h3 className="text-lg font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
              <Video className="w-5 h-5 text-[var(--c-gold)]" />
              <span>Scene-by-Scene Visual & Voiceover Timeline</span>
            </h3>
            <p className="text-xs text-[var(--c-muted)] mt-0.5">
              Includes camera action cues, on-screen text overlays, voiceover audio, and sound effects.
            </p>
          </div>
          <button
            onClick={() => handleCopy(fullVoiceoverText, 'all_scenes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-all active:scale-95 cursor-pointer"
          >
            {copiedKey === 'all_scenes' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'all_scenes' ? 'Copied' : 'Copy All Voiceover'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {scriptData.scenes.map((scene, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--c-border)]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-mono font-bold text-[var(--c-gold)] flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="text-sm font-bold text-[var(--c-text)]">{scene.stage}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)]">
                    {scene.timecode}
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 self-start sm:self-auto">
                  {scene.sfx}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Visual Directions */}
                <div className="p-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1.5">
                  <span className="font-bold text-[var(--c-gold)] uppercase tracking-wider block">
                    🎥 Visual / B-Roll Cue:
                  </span>
                  <p className="text-[var(--c-muted)] leading-relaxed">{scene.visual}</p>
                  <div className="mt-2 pt-2 border-t border-[var(--c-border)] text-[var(--c-text)]">
                    <span className="text-[var(--c-subtle)]">On-Screen Overlay: </span>
                    <strong className="text-sky-400 font-mono">"{scene.textOverlay}"</strong>
                  </div>
                </div>

                {/* Voiceover Script */}
                <div className="p-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                      🎙️ Spoken Voiceover:
                    </span>
                    <button
                      onClick={() => handleCopy(scene.voiceover, `scene_${idx}`)}
                      className="text-[11px] text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `scene_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-sm font-sans text-[var(--c-text)] leading-relaxed">
                    "{scene.voiceover}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audio & Caption Advice Footnote */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--c-border)] text-xs text-[var(--c-muted)]">
          <div className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
            <strong className="text-[var(--c-text)] block mb-0.5">🎧 Audio Vibe:</strong>
            <span>{scriptData.audioVibe}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
            <strong className="text-[var(--c-text)] block mb-0.5">📝 Caption Preset:</strong>
            <span>{scriptData.captionPreset}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
            <strong className="text-[var(--c-text)] block mb-0.5">⚡ Retention Tactic:</strong>
            <span>{scriptData.pacingNote}</span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN TELEPROMPTER MODAL */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A09]/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in">
          {/* Prompter Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-amber-400 font-serif">ToolBoxX Teleprompter</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {currentTopic.name} • {duration}
              </span>
            </div>

            {/* Prompter Controls */}
            <div className="flex items-center gap-4">
              {/* Play / Pause */}
              <button
                onClick={() => setIsPrompterPlaying(!isPrompterPlaying)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPrompterPlaying
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {isPrompterPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPrompterPlaying ? 'Pause Scroll' : 'Start Scroll'}</span>
              </button>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Speed:</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={prompterSpeed}
                  onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                  className="w-20 cursor-pointer"
                />
                <span className="font-mono text-amber-400">{prompterSpeed}x</span>
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Size:</span>
                <input
                  type="range"
                  min={24}
                  max={52}
                  value={prompterFontSize}
                  onChange={(e) => setPrompterFontSize(Number(e.target.value))}
                  className="w-20 cursor-pointer"
                />
              </div>

              {/* Mirror Mode */}
              <button
                onClick={() => setPrompterMirrored(!prompterMirrored)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                  prompterMirrored
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                Flip Mirror
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setIsTeleprompterOpen(false);
                  setIsPrompterPlaying(false);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer"
              >
                Exit Prompter
              </button>
            </div>
          </div>

          {/* Prompter Scrolling Text Area */}
          <div
            ref={prompterContentRef}
            className={`flex-1 overflow-y-auto py-24 px-8 max-w-4xl mx-auto w-full text-center space-y-12 transition-transform ${
              prompterMirrored ? 'scale-x-[-1]' : ''
            }`}
            style={{ fontSize: `${prompterFontSize}px`, lineHeight: 1.6 }}
          >
            {scriptData.scenes.map((s, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  — Scene {idx + 1}: {s.stage} ({s.timecode}) —
                </div>
                <div className="text-zinc-100 font-bold tracking-tight">
                  {s.voiceover}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Write viral TikTok and Reels scripts with ToolBoxX Short Video Generator!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="short-video-script-generator" />
    </div>
  );
};
