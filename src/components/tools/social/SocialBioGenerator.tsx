import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Type,
  Smile,
  Shield,
  Zap,
  CheckCircle2,
  Share2,
  User,
  AtSign,
  ExternalLink,
  ChevronDown,
  Info,
  BadgeCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';

export type BioPlatform = 'instagram' | 'twitter' | 'tiktok' | 'linkedin';
export type BioVibe = 'minimalist' | 'professional' | 'creative' | 'founder' | 'tech' | 'punchy';
export type FontStyle = 'normal' | 'bold_sans' | 'bold_serif' | 'italic_sans' | 'italic_serif' | 'mono' | 'double_struck' | 'small_caps' | 'gothic';

// Unicode transformation maps
const FONT_TRANSFORMS: Record<FontStyle, { name: string; convert: (text: string) => string }> = {
  normal: { name: 'Standard Sans', convert: (t) => t },
  bold_sans: {
    name: '𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀',
    convert: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48);
        return c;
      }),
  },
  bold_serif: {
    name: '𝐁𝐨𝐥𝐝 𝐒𝐞𝐫𝐢𝐟',
    convert: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d400 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d41a + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ce + code - 48);
        return c;
      }),
  },
  italic_sans: {
    name: '𝘐𝘵𝘢𝘭𝘪𝘤 𝘚𝘢𝘯𝘴',
    convert: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d608 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d622 + code - 97);
        return c;
      }),
  },
  italic_serif: {
    name: '𝐼𝑡𝑎𝑙𝑖𝑐 𝑆𝑒𝑟𝑖𝑓',
    convert: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d434 + code - 65);
        if (code >= 97 && code <= 122) {
          if (c === 'h') return 'ℎ';
          return String.fromCodePoint(0x1d44e + code - 97);
        }
        return c;
      }),
  },
  mono: {
    name: '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎',
    convert: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d670 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d68a + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7f6 + code - 48);
        return c;
      }),
  },
  double_struck: {
    name: '𝔻𝕠𝕦𝕓𝕝𝕖-𝕊𝕥𝕣𝕦𝕔𝕜',
    convert: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          if (['C', 'H', 'N', 'P', 'Q', 'R', 'Z'].includes(c)) {
            const map: Record<string, string> = { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' };
            return map[c] || c;
          }
          return String.fromCodePoint(0x1d538 + code - 65);
        }
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d552 + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7d8 + code - 48);
        return c;
      }),
  },
  small_caps: {
    name: 'ꜱᴍᴀʟʟ ᴄᴀᴘꜱ',
    convert: (text) => {
      const map: Record<string, string> = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
        n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
      };
      return text.toLowerCase().split('').map((char) => map[char] || char).join('');
    },
  },
  gothic: {
    name: '𝕲𝖔𝖙𝖍𝖎𝖈',
    convert: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d56c + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d586 + code - 97);
        return c;
      }),
  },
};

export const SocialBioGenerator: React.FC = () => {
  // Bio Profile Inputs
  const [name, setName] = useState<string>('Alex Rivera');
  const [handle, setHandle] = useState<string>('alexrivera');
  const [role, setRole] = useState<string>('Full-Stack Engineer & Creator');
  const [niche, setNiche] = useState<string>('Web Tools, Privacy & High-Performance UI');
  const [achievement, setAchievement] = useState<string>('Building ToolBoxX • 100K+ monthly users');
  const [cta, setCta] = useState<string>('Explore free browser tools 👇');
  const [websiteUrl, setWebsiteUrl] = useState<string>('toolboxx.dev');

  // Generator Options
  const [platform, setPlatform] = useState<BioPlatform>('instagram');
  const [vibe, setVibe] = useState<BioVibe>('founder');
  const [selectedFont, setSelectedFont] = useState<FontStyle>('normal');
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);

  // Editable Bio Text Override
  const [customBioText, setCustomBioText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Platform Character Limits
  const platformLimits: Record<BioPlatform, number> = {
    instagram: 150,
    twitter: 160,
    tiktok: 80,
    linkedin: 220, // Headline limit
  };

  // Generate Base Bio per Platform & Vibe
  const generatedBio = useMemo(() => {
    const e = includeEmojis;
    const n = name.trim();
    const r = role.trim();
    const ni = niche.trim();
    const ach = achievement.trim();
    const call = cta.trim();

    if (platform === 'instagram') {
      switch (vibe) {
        case 'minimalist':
          return `${r}\n${ni}\n${ach}\n${call}`;
        case 'professional':
          return `${r} @ ${ach}\n${e ? '💼' : ''} Specializing in ${ni}\n${e ? '🔗' : ''} ${call}`;
        case 'creative':
          return `${e ? '✨' : ''} Crafting digital magic with ${r}\n${e ? '🚀' : ''} ${ach}\n${e ? '👇' : ''} ${call}`;
        case 'founder':
          return `${e ? '🛠️' : ''} Founder & ${r}\n${e ? '⚡' : ''} ${ach}\n${e ? '🔒' : ''} 100% Client-Side Privacy\n${call}`;
        case 'tech':
          return `${e ? '💻' : ''} ${r}\n${e ? '⚡' : ''} ${ni}\n${e ? '📦' : ''} ${ach}\n${e ? '👉' : ''} ${call}`;
        case 'punchy':
          return `${e ? '🔥' : ''} ${r}\n${e ? '⚡' : ''} ${ach}\n${e ? '👇' : ''} ${call}`;
      }
    } else if (platform === 'twitter') {
      switch (vibe) {
        case 'minimalist':
          return `${r}. ${ni}. ${ach}. ${call} ${websiteUrl}`;
        case 'founder':
          return `Building ${ach} ${e ? '🚀' : ''} | ${r} passionate about ${ni}. 100% free & client-side. ${call}`;
        case 'tech':
          return `${r} 💻 | Coding in TS, React & Wasm | ${ach} | Free web tools: ${websiteUrl}`;
        case 'creative':
          return `Design + Code ${e ? '✨' : ''} | ${r} | ${ach} | ${call}`;
        case 'professional':
          return `${r} specializing in ${ni}. ${ach}. Inquiries: DM. ${websiteUrl}`;
        case 'punchy':
          return `${r} ⚡ Building fast, private browser utilities at ${websiteUrl}. ${ach}.`;
      }
    } else if (platform === 'tiktok') {
      switch (vibe) {
        case 'minimalist':
          return `${r} • ${ach}`;
        case 'founder':
          return `${e ? '🛠️' : ''} Building ${ach} • Free tools 👇`;
        case 'tech':
          return `${e ? '💻' : ''} Tech hacks & free tools • ${call}`;
        case 'punchy':
          return `${e ? '⚡' : ''} Free web utilities you didn't know existed 👇`;
        default:
          return `${r} • ${call}`;
      }
    } else {
      // LinkedIn Headline
      switch (vibe) {
        case 'professional':
          return `${r} | Specializing in ${ni} | ${ach}`;
        case 'founder':
          return `Founder @ ToolBoxX | ${r} | Creating 100% Client-Side Privacy-First Web Utilities`;
        case 'tech':
          return `${r} | TypeScript, React & WebAssembly | Building High-Performance Web Software`;
        case 'creative':
          return `${r} & Visual Systems Designer | Crafting Next-Gen Creator Utilities`;
        default:
          return `${r} • ${ni} • ${ach}`;
      }
    }
  }, [platform, vibe, name, role, niche, achievement, cta, websiteUrl, includeEmojis]);

  // Active bio with font transformer applied
  const finalBioText = useMemo(() => {
    const baseText = customBioText || generatedBio;
    if (selectedFont === 'normal') return baseText;
    return FONT_TRANSFORMS[selectedFont].convert(baseText);
  }, [customBioText, generatedBio, selectedFont]);

  // Copy standard bio
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalBioText);
      setCopiedKey('standard');
      showToast({ type: 'success', title: 'Bio Copied!', message: 'Ready to paste into your social profile.' });
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy manually.' });
    }
  };

  // Copy Instagram formatted with zero-width line breaks (\u200B)
  const handleCopyInstagramFormatted = async () => {
    try {
      // Replace simple newlines with zero-width space + newline to prevent IG collapsing
      const formatted = finalBioText.replace(/\n/g, '\n\u200B');
      await navigator.clipboard.writeText(formatted);
      setCopiedKey('ig_formatted');
      showToast({
        type: 'success',
        title: 'IG Formatted Copied!',
        message: 'Includes zero-width line breakers to preserve Instagram formatting.',
      });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy manually.' });
    }
  };

  const limit = platformLimits[platform];
  const charLength = finalBioText.length;
  const isOverLimit = charLength > limit;

  return (
    <div className="w-full space-y-8">
      {/* Header Settings Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aesthetic Social Identity Studio</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Social Bio Generator
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Create high-converting, aesthetic profile bios for Instagram, Twitter/X, TikTok & LinkedIn with Unicode styling.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[#11110F] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedKey === 'standard' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'standard' ? 'Bio Copied!' : 'Copy Bio'}</span>
            </button>
            {platform === 'instagram' && (
              <button
                onClick={handleCopyInstagramFormatted}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
                title="Copies with zero-width line breakers (\u200B)"
              >
                {copiedKey === 'ig_formatted' ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />}
                <span>Copy for IG (Preserve Spacing)</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setCustomBioText('');
              }}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Username Handle (@)
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[@\s]/g, ''))}
              placeholder="e.g. alexrivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Profession / Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setCustomBioText('');
              }}
              placeholder="e.g. Full-Stack Engineer & Creator"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Key Achievement / Proof
            </label>
            <input
              type="text"
              value={achievement}
              onChange={(e) => {
                setAchievement(e.target.value);
                setCustomBioText('');
              }}
              placeholder="e.g. Building ToolBoxX • 100K+ users"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>
        </div>

        {/* Secondary Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Niche / Specialization
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => {
                setNiche(e.target.value);
                setCustomBioText('');
              }}
              placeholder="e.g. Web Tools & Privacy"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Call to Action
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => {
                setCta(e.target.value);
                setCustomBioText('');
              }}
              placeholder="e.g. Explore free browser tools 👇"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-1">
              Website / Link
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="toolboxx.dev"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
            />
          </div>
        </div>

        {/* Style & Vibe Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[var(--c-border)]">
          {/* Target Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Target Platform
            </label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value as BioPlatform);
                setCustomBioText('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="instagram">Instagram (150 chars max)</option>
              <option value="twitter">X / Twitter (160 chars max)</option>
              <option value="tiktok">TikTok (80 chars max)</option>
              <option value="linkedin">LinkedIn Headline (220 chars)</option>
            </select>
          </div>

          {/* Bio Vibe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Vibe / Tone Style
            </label>
            <select
              value={vibe}
              onChange={(e) => {
                setVibe(e.target.value as BioVibe);
                setCustomBioText('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="founder">Founder & Builder 🚀</option>
              <option value="tech">Tech Hacker / Developer 💻</option>
              <option value="minimalist">Minimalist & Clean 🌿</option>
              <option value="professional">Executive & Professional 💼</option>
              <option value="creative">Creative & Aesthetic ✨</option>
              <option value="punchy">Punchy & Direct ⚡</option>
            </select>
          </div>

          {/* Unicode Aesthetic Font Changer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Aesthetic Unicode Font
            </label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value as FontStyle)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              {Object.entries(FONT_TRANSFORMS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-6 pt-1 text-xs text-[var(--c-muted)]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeEmojis}
              onChange={(e) => {
                setIncludeEmojis(e.target.checked);
                setCustomBioText('');
              }}
              className="w-4 h-4 rounded accent-[var(--c-gold)] cursor-pointer"
            />
            <span>Include Emoji Bullets</span>
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Platform"
          value={platform.toUpperCase()}
          badge="Live"
          badgeType="success"
        />
        <StatCard
          label="Character Count"
          value={`${charLength} / ${limit}`}
          subValue={isOverLimit ? '⚠️ Exceeds platform limit' : 'Fits platform limit'}
        />
        <StatCard
          label="Aesthetic Font"
          value={FONT_TRANSFORMS[selectedFont].name.split(' ')[0]}
          subValue="Unicode transformed"
        />
        <StatCard
          label="Line Break Safety"
          value="Preserved"
          subValue="Zero-width formatting"
        />
      </div>

      {/* Main Studio View: Live Profile Mockups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Realistic Profile Card Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)] text-xs text-[var(--c-muted)]">
              <span className="font-bold uppercase tracking-wider text-[var(--c-gold)]">
                Live {platform.toUpperCase()} Mockup
              </span>
              <span className="font-mono">@{handle || 'username'}</span>
            </div>

            {/* 1. Instagram Profile Mockup */}
            {platform === 'instagram' && (
              <div className="p-6 rounded-2xl bg-[#000000] border border-zinc-800 text-white space-y-5 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-2xl font-bold text-amber-300">
                      {name.charAt(0) || 'A'}
                    </div>
                  </div>

                  <div className="flex-1 flex justify-around text-center">
                    <div>
                      <div className="font-bold text-base">42</div>
                      <div className="text-[11px] text-zinc-400">posts</div>
                    </div>
                    <div>
                      <div className="font-bold text-base">14.8K</div>
                      <div className="text-[11px] text-zinc-400">followers</div>
                    </div>
                    <div>
                      <div className="font-bold text-base">380</div>
                      <div className="text-[11px] text-zinc-400">following</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center gap-1">
                    <span>{name || 'Your Name'}</span>
                    <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400 text-black" />
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">@{handle || 'username'}</div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed pt-1.5 font-sans">
                    {finalBioText}
                  </div>
                  {websiteUrl && (
                    <div className="pt-2 flex items-center gap-1 text-xs text-sky-400 font-semibold hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{websiteUrl}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="py-1.5 text-center text-xs font-bold rounded-lg bg-zinc-800 text-white">
                    Following
                  </div>
                  <div className="py-1.5 text-center text-xs font-bold rounded-lg bg-zinc-800 text-white">
                    Message
                  </div>
                </div>
              </div>
            )}

            {/* 2. Twitter / X Profile Mockup */}
            {platform === 'twitter' && (
              <div className="p-6 rounded-2xl bg-[#000000] border border-zinc-800 text-white space-y-4 shadow-inner">
                {/* Header Banner */}
                <div className="h-24 rounded-xl bg-gradient-to-r from-amber-600 via-purple-700 to-sky-600 relative mb-10">
                  <div className="w-18 h-18 rounded-full bg-zinc-900 border-4 border-black absolute -bottom-9 left-4 flex items-center justify-center text-xl font-bold text-amber-300">
                    {name.charAt(0) || 'A'}
                  </div>
                  <div className="absolute right-3 -bottom-8 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold">
                    Follow
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="font-bold text-base flex items-center gap-1">
                      <span>{name || 'Your Name'}</span>
                      <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400 text-black" />
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">@{handle || 'username'}</div>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {finalBioText}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                    <div>
                      <strong className="text-white">412</strong> Following
                    </div>
                    <div>
                      <strong className="text-white">18.5K</strong> Followers
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TikTok Profile Mockup */}
            {platform === 'tiktok' && (
              <div className="p-6 rounded-2xl bg-[#121212] border border-zinc-800 text-white space-y-5 shadow-inner text-center">
                <div className="w-20 h-20 rounded-full mx-auto bg-zinc-800 border-2 border-pink-500 flex items-center justify-center text-2xl font-bold text-pink-400">
                  {name.charAt(0) || 'A'}
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-base">@{handle || 'username'}</div>
                  <div className="text-xs text-zinc-400">{name || 'Your Name'}</div>
                </div>

                <div className="flex justify-around max-w-xs mx-auto text-center border-y border-zinc-800 py-2.5">
                  <div>
                    <div className="font-bold text-sm">380</div>
                    <div className="text-[10px] text-zinc-400">Following</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm">49.2K</div>
                    <div className="text-[10px] text-zinc-400">Followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm">820K</div>
                    <div className="text-[10px] text-zinc-400">Likes</div>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {finalBioText}
                </p>
              </div>
            )}

            {/* 4. LinkedIn Profile Mockup */}
            {platform === 'linkedin' && (
              <div className="p-6 rounded-2xl bg-[#1B1F23] border border-zinc-700 text-white space-y-4 shadow-inner">
                <div className="h-20 rounded-xl bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative mb-8">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-blue-500 absolute -bottom-8 left-4 flex items-center justify-center text-xl font-bold text-blue-300">
                    {name.charAt(0) || 'A'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold text-base flex items-center gap-1.5">
                    <span>{name || 'Your Name'}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">(He/Him)</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">
                    {finalBioText}
                  </p>
                  <div className="text-[11px] text-blue-400 pt-1">
                    500+ connections • Contact info
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Editable Bio Area & Unicode Quick Bar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--c-text)] flex items-center gap-2">
                <Type className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Editable Output Text Area</span>
              </h3>
              <div className="text-xs font-mono">
                <span className={isOverLimit ? 'text-rose-400 font-bold' : 'text-[var(--c-gold)]'}>
                  {charLength}
                </span>
                <span className="text-[var(--c-subtle)]"> / {limit} chars</span>
              </div>
            </div>

            <textarea
              rows={6}
              value={customBioText || finalBioText}
              onChange={(e) => setCustomBioText(e.target.value)}
              className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] resize-none leading-relaxed font-sans"
              placeholder="Your custom generated bio will appear here..."
            />

            {/* Unicode Quick Font Chips */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-2">
                1-Click Font Styling:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(FONT_TRANSFORMS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setSelectedFont(k as FontStyle)}
                    className={`p-2 rounded-xl border text-xs font-medium truncate transition-all cursor-pointer ${
                      selectedFont === k
                        ? 'border-[var(--c-gold)] bg-[var(--c-card)] text-[var(--c-text)] shadow-xs ring-1 ring-[var(--c-gold)]/40'
                        : 'border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setCustomBioText('');
                  setSelectedFont('normal');
                }}
                className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Generated Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Create high-converting social media bios with ToolBoxX Bio Studio!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="social-bio-generator" />
    </div>
  );
};
