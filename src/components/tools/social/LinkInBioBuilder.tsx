import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  ExternalLink,
  Smartphone,
  Eye,
  Globe,
  FileText,
  Image as ImageIcon,
  Code2,
  Mail,
  ShoppingBag,
  Music,
  ShieldCheck,
  Rocket,
  Share2,
  Layers,
  Palette,
  BadgeCheck,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob, readFileAsDataURL } from '../../../utils/fileUtils';

export type BioThemeId = 'obsidian' | 'cyber' | 'emerald' | 'amethyst' | 'matte' | 'sunset';
export type LinkIconId = 'globe' | 'sparkles' | 'file' | 'image' | 'code' | 'github' | 'youtube' | 'instagram' | 'twitter' | 'mail' | 'shop' | 'music' | 'shield' | 'rocket';

export interface BioLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: LinkIconId;
  badge?: string;
  style: 'glass' | 'glow' | 'shimmer' | 'solid';
  isActive: boolean;
}

export interface SocialFooterLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  email?: string;
}

interface ThemeSpec {
  id: BioThemeId;
  name: string;
  bgGrad: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentGlow: string;
  textPrimary: string;
  textMuted: string;
}

const THEMES: Record<BioThemeId, ThemeSpec> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Gold (Signature)',
    bgGrad: 'linear-gradient(180deg, #0E0D0B 0%, #171512 100%)',
    cardBg: 'rgba(27, 26, 23, 0.85)',
    cardBorder: 'rgba(183, 155, 112, 0.3)',
    accent: '#B79B70',
    accentGlow: 'rgba(183, 155, 112, 0.25)',
    textPrimary: '#F5F1E8',
    textMuted: '#B8B2A7',
  },
  cyber: {
    id: 'cyber',
    name: 'Midnight Cyber',
    bgGrad: 'linear-gradient(180deg, #090D16 0%, #111A2E 100%)',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    cardBorder: 'rgba(56, 189, 248, 0.35)',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Dynasty',
    bgGrad: 'linear-gradient(180deg, #06140E 0%, #0E241B 100%)',
    cardBg: 'rgba(6, 30, 20, 0.85)',
    cardBorder: 'rgba(16, 185, 129, 0.35)',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    textPrimary: '#ECFDF5',
    textMuted: '#A7F3D0',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Velvet',
    bgGrad: 'linear-gradient(180deg, #10081C 0%, #201138 100%)',
    cardBg: 'rgba(30, 15, 45, 0.85)',
    cardBorder: 'rgba(192, 132, 252, 0.35)',
    accent: '#C084FC',
    accentGlow: 'rgba(192, 132, 252, 0.25)',
    textPrimary: '#FAF5FF',
    textMuted: '#D8B4FE',
  },
  matte: {
    id: 'matte',
    name: 'Matte Charcoal',
    bgGrad: 'linear-gradient(180deg, #121214 0%, #1A1A1E 100%)',
    cardBg: 'rgba(26, 26, 30, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    accent: '#FFFFFF',
    accentGlow: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#FFFFFF',
    textMuted: '#A1A1AA',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber',
    bgGrad: 'linear-gradient(180deg, #160D08 0%, #26170E 100%)',
    cardBg: 'rgba(38, 23, 14, 0.85)',
    cardBorder: 'rgba(245, 158, 11, 0.35)',
    accent: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    textPrimary: '#FFFBEB',
    textMuted: '#FDE68A',
  },
};

const INITIAL_LINKS: BioLink[] = [
  {
    id: 'link-1',
    title: 'ToolBoxX — Free Browser Utilities',
    subtitle: '100% Client-Side PDF, Image & Dev Tools',
    url: 'https://toolboxx.dev',
    icon: 'sparkles',
    badge: 'POPULAR',
    style: 'glow',
    isActive: true,
  },
  {
    id: 'link-2',
    title: 'Free PDF Compressor & Merger',
    subtitle: 'Zero cloud uploads • Compress huge files locally',
    url: 'https://toolboxx.dev/pdf-compressor',
    icon: 'file',
    badge: 'FREE',
    style: 'glass',
    isActive: true,
  },
  {
    id: 'link-3',
    title: 'AI Background Remover',
    subtitle: 'Instant transparent PNG cutouts in 1 click',
    url: 'https://toolboxx.dev/background-remover',
    icon: 'image',
    badge: 'NEW',
    style: 'shimmer',
    isActive: true,
  },
  {
    id: 'link-4',
    title: 'ATS Resume Builder Pro',
    subtitle: 'Pass recruiter screening algorithms for free',
    url: 'https://toolboxx.dev/resume-builder',
    icon: 'rocket',
    style: 'glass',
    isActive: true,
  },
];

export const LinkInBioBuilder: React.FC = () => {
  // Profile Information
  const [displayName, setDisplayName] = useState<string>('ToolBoxX Utilities');
  const [username, setUsername] = useState<string>('toolboxx');
  const [bioText, setBioText] = useState<string>('100% Client-Side Free Online Utilities for Creators, Developers & Teams. Zero cloud uploads.');
  const [locationBadge, setLocationBadge] = useState<string>('🌍 100% Client-Side & Private');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Links List
  const [links, setLinks] = useState<BioLink[]>(INITIAL_LINKS);
  const [selectedTheme, setSelectedTheme] = useState<BioThemeId>('obsidian');

  // Social Links
  const [socials, setSocials] = useState<SocialFooterLinks>({
    twitter: 'https://twitter.com/toolboxx',
    github: 'https://github.com/toolboxx',
    youtube: 'https://youtube.com/@toolboxx',
    email: 'hello@toolboxx.dev',
  });

  // Active Link Editing Modal
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  const activeTheme = THEMES[selectedTheme];

  // Add New Link
  const handleAddLink = () => {
    const newLink: BioLink = {
      id: `link-${Date.now()}`,
      title: 'New Featured Link',
      subtitle: 'Short description of this destination',
      url: 'https://toolboxx.dev',
      icon: 'globe',
      style: 'glass',
      isActive: true,
    };
    setLinks([...links, newLink]);
    showToast({ type: 'success', title: 'Link Added', message: 'Configured a new link card.' });
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
    showToast({ type: 'info', title: 'Link Removed', message: 'Removed link card.' });
  };

  // Reorder Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...links];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setLinks(next);
  };

  // Reorder Down
  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const next = [...links];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setLinks(next);
  };

  // Handle Avatar Image Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const dataUrl = await readFileAsDataURL(e.target.files[0]);
      setAvatarUrl(dataUrl);
      showToast({ type: 'success', title: 'Avatar Uploaded', message: 'Custom profile photo applied.' });
    }
  };

  // Icon Component Mapper
  const renderIcon = (iconId: LinkIconId, className = 'w-4 h-4') => {
    switch (iconId) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'file':
        return <FileText className={className} />;
      case 'image':
        return <ImageIcon className={className} />;
      case 'code':
        return <Code2 className={className} />;
      case 'github':
        return <Code2 className={className} />;
      case 'youtube':
        return <ExternalLink className={className} />;
      case 'instagram':
        return <Share2 className={className} />;
      case 'twitter':
        return <Share2 className={className} />;
      case 'mail':
        return <Mail className={className} />;
      case 'shop':
        return <ShoppingBag className={className} />;
      case 'music':
        return <Music className={className} />;
      case 'shield':
        return <ShieldCheck className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  // Generate Standalone index.html Code
  const generatedHtml = useMemo(() => {
    const t = activeTheme;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} (@${username}) | Links</title>
  <meta name="description" content="${bioText}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      min-height: 100vh;
      background: ${t.bgGrad};
      color: ${t.textPrimary};
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 16px 64px 16px;
      line-height: 1.5;
    }
    .container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: ${t.accent};
      color: #0E0D0B;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px ${t.accentGlow};
      border: 3px solid ${t.cardBorder};
      object-fit: cover;
    }
    .name-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .handle {
      font-size: 14px;
      color: ${t.textMuted};
      font-family: monospace;
      margin-top: 2px;
      margin-bottom: 8px;
    }
    .location-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: ${t.cardBg};
      border: 1px solid ${t.cardBorder};
      font-size: 12px;
      font-weight: 600;
      color: ${t.accent};
      margin-bottom: 16px;
    }
    .bio {
      font-size: 14px;
      color: ${t.textMuted};
      margin-bottom: 32px;
      max-width: 400px;
      line-height: 1.6;
    }
    .links-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 36px;
    }
    .link-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 16px 20px;
      border-radius: 20px;
      background: ${t.cardBg};
      border: 1px solid ${t.cardBorder};
      color: ${t.textPrimary};
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    }
    .link-card:hover {
      transform: translateY(-2px);
      border-color: ${t.accent};
      box-shadow: 0 10px 25px ${t.accentGlow};
    }
    .link-info {
      text-align: left;
      flex: 1;
    }
    .link-title {
      font-size: 15px;
      font-weight: 700;
    }
    .link-subtitle {
      font-size: 12px;
      color: ${t.textMuted};
      margin-top: 2px;
    }
    .badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      background: ${t.accent};
      color: #0E0D0B;
      margin-left: 8px;
      letter-spacing: 0.05em;
    }
    .social-footer {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }
    .social-btn {
      color: ${t.textMuted};
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 12px;
      background: ${t.cardBg};
      border: 1px solid ${t.cardBorder};
      transition: all 0.2s;
    }
    .social-btn:hover {
      color: ${t.accent};
      border-color: ${t.accent};
    }
    .branding {
      margin-top: 48px;
      font-size: 11px;
      color: ${t.textMuted};
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    ${avatarUrl ? `<img class="avatar" src="${avatarUrl}" alt="${displayName}" />` : `<div class="avatar">${displayName.charAt(0)}</div>`}
    
    <div class="name-badge">
      <span>${displayName}</span>
      ${isVerified ? `<span>✓</span>` : ''}
    </div>
    
    <div class="handle">@${username}</div>
    
    ${locationBadge ? `<div class="location-pill">${locationBadge}</div>` : ''}
    
    <div class="bio">${bioText}</div>
    
    <div class="links-list">
      ${links
        .filter((l) => l.isActive)
        .map(
          (l) => `<a class="link-card" href="${l.url}" target="_blank" rel="noopener noreferrer">
        <div class="link-info">
          <div class="link-title">${l.title} ${l.badge ? `<span class="badge">${l.badge}</span>` : ''}</div>
          ${l.subtitle ? `<div class="link-subtitle">${l.subtitle}</div>` : ''}
        </div>
        <div style="font-size: 18px; color: ${t.accent};">➔</div>
      </a>`
        )
        .join('\n      ')}
    </div>

    <div class="social-footer">
      ${socials.twitter ? `<a class="social-btn" href="${socials.twitter}" target="_blank">Twitter</a>` : ''}
      ${socials.github ? `<a class="social-btn" href="${socials.github}" target="_blank">GitHub</a>` : ''}
      ${socials.youtube ? `<a class="social-btn" href="${socials.youtube}" target="_blank">YouTube</a>` : ''}
      ${socials.email ? `<a class="social-btn" href="mailto:${socials.email}">Email</a>` : ''}
    </div>

    <div class="branding">Powered by ToolBoxX • 100% Private Client-Side Tools</div>
  </div>
</body>
</html>`;
  }, [displayName, username, bioText, locationBadge, isVerified, avatarUrl, links, socials, activeTheme]);

  // Download Standalone index.html
  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, 'index.html');
    showToast({ type: 'success', title: 'index.html Downloaded!', message: 'Ready to host on GitHub Pages, Netlify, or Vercel.' });
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
  };

  // Copy HTML
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopiedHtml(true);
      showToast({ type: 'success', title: 'HTML Copied to Clipboard!', message: 'Paste into index.html or website builder.' });
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please download the file instead.' });
    }
  };

  // Preview in New Tab via Blob URL
  const handlePreviewNewTab = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header Controls Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Standalone Bio Landing Page Builder</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Link in Bio Builder
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Design a dark luxury mobile link-in-bio page, preview in real time, and download a standalone <code>index.html</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePreviewNewTab}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Live Test Tab</span>
            </button>
            <button
              onClick={handleCopyHtml}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedHtml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHtml ? 'HTML Copied' : 'Copy HTML'}</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download index.html</span>
            </button>
          </div>
        </div>

        {/* Theme Palette Bar */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-3">
            Select Luxury Dark Theme:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.values(THEMES).map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[var(--c-gold)] bg-[var(--c-card)] shadow-md ring-1 ring-[var(--c-gold)]/40'
                      : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-black/40"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span className="text-xs font-bold text-[var(--c-text)] truncate">{theme.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-[10px] text-[var(--c-subtle)] truncate">{theme.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Link Cards"
          value={`${links.length} Buttons`}
          subValue="Unlimited supported"
        />
        <StatCard
          label="Theme Styling"
          value={activeTheme.name.split(' ')[0]}
          subValue="Luxury Dark Gradient"
          badge="Live"
          badgeType="success"
        />
        <StatCard
          label="Export Format"
          value="index.html"
          subValue="Standalone • Zero dependencies"
        />
        <StatCard
          label="Hosting Ready"
          value="100% Free"
          subValue="GitHub Pages / Netlify / Vercel"
        />
      </div>

      {/* Main Builder Grid: Editor on Left, Live Smartphone Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile & Link Editors */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Details Box */}
          <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--c-text)] flex items-center gap-2 pb-3 border-b border-[var(--c-border)]">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Username Handle (@)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[@\s]/g, ''))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Bio Tagline</label>
              <textarea
                rows={2}
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Top Highlight Pill</label>
                <input
                  type="text"
                  value={locationBadge}
                  onChange={(e) => setLocationBadge(e.target.value)}
                  placeholder="e.g. 🌍 100% Client-Side"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--c-text)]">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--c-gold)]"
                  />
                  <span>Show Verified Badge (✓)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Links Management Box */}
          <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--c-text)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Custom Link Cards ({links.length})</span>
              </h3>
              <button
                onClick={handleAddLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-bold shadow-sm hover:bg-[var(--c-text)] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {links.map((link, idx) => (
                <div
                  key={link.id}
                  className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="p-2 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)]">
                        {renderIcon(link.icon)}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLinks(links.map((l) => (l.id === link.id ? { ...l, title: val } : l)));
                          }}
                          className="w-full bg-transparent font-bold text-xs sm:text-sm text-[var(--c-text)] focus:underline"
                          placeholder="Button Title"
                        />
                        <input
                          type="text"
                          value={link.subtitle || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLinks(links.map((l) => (l.id === link.id ? { ...l, subtitle: val } : l)));
                          }}
                          className="w-full bg-transparent text-[11px] text-[var(--c-muted)] focus:underline"
                          placeholder="Optional Subtitle"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] hover:text-[var(--c-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === links.length - 1}
                        className="p-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] hover:text-[var(--c-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--c-border)]">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLinks(links.map((l) => (l.id === link.id ? { ...l, url: val } : l)));
                      }}
                      placeholder="Destination URL (https://...)"
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text)]"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.badge || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLinks(links.map((l) => (l.id === link.id ? { ...l, badge: val } : l)));
                        }}
                        placeholder="Badge (e.g. HOT, FREE)"
                        className="w-1/2 px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-gold)] font-mono uppercase"
                      />

                      <select
                        value={link.icon}
                        onChange={(e) => {
                          const val = e.target.value as LinkIconId;
                          setLinks(links.map((l) => (l.id === link.id ? { ...l, icon: val } : l)));
                        }}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-muted)]"
                      >
                        <option value="sparkles">✨ Sparkles</option>
                        <option value="globe">🌐 Web</option>
                        <option value="file">📄 File/PDF</option>
                        <option value="image">🖼️ Image</option>
                        <option value="code">💻 Code</option>
                        <option value="rocket">🚀 Rocket</option>
                        <option value="shop">🛍️ Store</option>
                        <option value="music">🎵 Music</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Interactive Smartphone Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center sticky top-8">
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-gold)] flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Live Smartphone Preview</span>
            </span>
          </div>

          {/* Smartphone Bezel */}
          <div
            className="w-full max-w-[360px] h-[720px] rounded-[48px] p-3 border-4 border-[#2A2824] bg-[#0A0A09] shadow-2xl relative overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Dynamic Island / Camera Notch */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto mb-2 shrink-0 z-20 border border-zinc-800" />

            {/* Smartphone Scrollable Screen Content */}
            <div
              className="flex-1 rounded-[36px] overflow-y-auto px-5 py-6 text-center flex flex-col items-center justify-start space-y-4"
              style={{
                background: activeTheme.bgGrad,
                color: activeTheme.textPrimary,
              }}
            >
              {/* Profile Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0 border-2"
                style={{
                  backgroundColor: activeTheme.accent,
                  color: '#0E0D0B',
                  borderColor: activeTheme.cardBorder,
                }}
              >
                {displayName.charAt(0)}
              </div>

              {/* Profile Name & Badge */}
              <div className="space-y-0.5">
                <div className="font-extrabold text-lg flex items-center justify-center gap-1 leading-tight">
                  <span>{displayName}</span>
                  {isVerified && <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400 text-black" />}
                </div>
                <div className="text-xs font-mono" style={{ color: activeTheme.textMuted }}>
                  @{username}
                </div>
              </div>

              {/* Location Tag */}
              {locationBadge && (
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    backgroundColor: activeTheme.cardBg,
                    borderColor: activeTheme.cardBorder,
                    color: activeTheme.accent,
                  }}
                >
                  {locationBadge}
                </div>
              )}

              {/* Bio Description */}
              <p
                className="text-xs leading-relaxed max-w-xs"
                style={{ color: activeTheme.textMuted }}
              >
                {bioText}
              </p>

              {/* Links List */}
              <div className="w-full space-y-2.5 pt-2">
                {links
                  .filter((l) => l.isActive)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-transform hover:scale-[1.02] shadow-sm block"
                      style={{
                        backgroundColor: activeTheme.cardBg,
                        borderColor: activeTheme.cardBorder,
                        color: activeTheme.textPrimary,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span style={{ color: activeTheme.accent }}>{renderIcon(link.icon, 'w-4 h-4')}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span className="truncate">{link.title}</span>
                            {link.badge && (
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                                style={{
                                  backgroundColor: activeTheme.accent,
                                  color: '#0E0D0B',
                                }}
                              >
                                {link.badge}
                              </span>
                            )}
                          </div>
                          {link.subtitle && (
                            <div className="text-[10px] truncate" style={{ color: activeTheme.textMuted }}>
                              {link.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold" style={{ color: activeTheme.accent }}>
                        ➔
                      </span>
                    </a>
                  ))}
              </div>

              {/* Social Footer Bar */}
              <div className="pt-4 flex items-center justify-center gap-3 text-xs">
                {socials.twitter && <Share2 className="w-4 h-4 cursor-pointer" style={{ color: activeTheme.textMuted }} />}
                {socials.github && <Code2 className="w-4 h-4 cursor-pointer" style={{ color: activeTheme.textMuted }} />}
                {socials.youtube && <ExternalLink className="w-4 h-4 cursor-pointer" style={{ color: activeTheme.textMuted }} />}
                {socials.email && <Mail className="w-4 h-4 cursor-pointer" style={{ color: activeTheme.textMuted }} />}
              </div>

              <div className="text-[9px] pt-4 opacity-50" style={{ color: activeTheme.textMuted }}>
                Powered by ToolBoxX
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Build stunning Link-in-Bio pages for free with ToolBoxX!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="link-in-bio-builder" />
    </div>
  );
};
