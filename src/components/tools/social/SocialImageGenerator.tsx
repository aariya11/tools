import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  RotateCcw,
  Shield,
  Zap,
  CheckCircle2,
  Share2,
  Upload,
  Trash2,
  Eye,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob, readFileAsDataURL } from '../../../utils/fileUtils';

export type AspectRatioPreset = 'ig-square' | 'ig-story' | 'fb-post' | 'li-post' | 'pinterest' | 'twitter';
export type ColorThemeId = 'obsidian' | 'cyber' | 'emerald' | 'amethyst' | 'crimson' | 'carbon';
export type CardLayoutId = 'features' | 'metric' | 'comparison' | 'quote';

interface AspectRatioConfig {
  id: AspectRatioPreset;
  name: string;
  platform: string;
  width: number;
  height: number;
  ratioLabel: string;
  icon: string;
}

const ASPECT_RATIOS: AspectRatioConfig[] = [
  { id: 'ig-square', name: 'Instagram Square', platform: 'Instagram Feed', width: 1080, height: 1080, ratioLabel: '1:1', icon: '📸' },
  { id: 'ig-story', name: 'Story / Reel / TikTok', platform: 'Stories & Shorts', width: 1080, height: 1920, ratioLabel: '9:16', icon: '📱' },
  { id: 'twitter', name: 'X / Twitter Post', platform: 'X / Twitter', width: 1600, height: 900, ratioLabel: '16:9', icon: '🐦' },
  { id: 'li-post', name: 'LinkedIn Feed Post', platform: 'LinkedIn', width: 1200, height: 627, ratioLabel: '1.91:1', icon: '💼' },
  { id: 'fb-post', name: 'Facebook Post', platform: 'Facebook', width: 1200, height: 630, ratioLabel: '1.91:1', icon: '📘' },
  { id: 'pinterest', name: 'Pinterest Pin', platform: 'Pinterest', width: 1000, height: 1500, ratioLabel: '2:3', icon: '📌' },
];

interface ThemeConfig {
  id: ColorThemeId;
  name: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  accent: string;
  accentGlow: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

const THEMES: Record<ColorThemeId, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Gold (Signature)',
    bgStart: '#0C0B0A',
    bgEnd: '#161411',
    cardBg: 'rgba(27, 26, 23, 0.75)',
    accent: '#B79B70',
    accentGlow: 'rgba(183, 155, 112, 0.25)',
    textColor: '#F5F1E8',
    mutedColor: '#B8B2A7',
    borderColor: 'rgba(183, 155, 112, 0.35)',
  },
  cyber: {
    id: 'cyber',
    name: 'Midnight Cyber',
    bgStart: '#080C14',
    bgEnd: '#101726',
    cardBg: 'rgba(15, 23, 42, 0.8)',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    textColor: '#F8FAFC',
    mutedColor: '#94A3B8',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Dynasty',
    bgStart: '#06120D',
    bgEnd: '#0D2118',
    cardBg: 'rgba(6, 30, 20, 0.8)',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    textColor: '#ECFDF5',
    mutedColor: '#A7F3D0',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Amethyst',
    bgStart: '#0F0817',
    bgEnd: '#1F102F',
    cardBg: 'rgba(30, 15, 45, 0.8)',
    accent: '#C084FC',
    accentGlow: 'rgba(192, 132, 252, 0.3)',
    textColor: '#FAF5FF',
    mutedColor: '#D8B4FE',
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Luxe',
    bgStart: '#14070A',
    bgEnd: '#240F15',
    cardBg: 'rgba(36, 15, 21, 0.8)',
    accent: '#FB7185',
    accentGlow: 'rgba(251, 113, 133, 0.3)',
    textColor: '#FFF1F2',
    mutedColor: '#FECDD3',
    borderColor: 'rgba(251, 113, 133, 0.4)',
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon Minimal',
    bgStart: '#0F0F10',
    bgEnd: '#1A1A1D',
    cardBg: 'rgba(26, 26, 29, 0.8)',
    accent: '#E4E4E7',
    accentGlow: 'rgba(228, 228, 231, 0.2)',
    textColor: '#FFFFFF',
    mutedColor: '#A1A1AA',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
};

const TEMPLATE_PRESETS = [
  {
    name: 'PDF Suite Spotlight',
    badge: '100% Client-Side Suite',
    title: 'Free, Private Online PDF Tools',
    subheading: 'Compress, merge, split, and convert documents locally in your browser. Zero server uploads.',
    bullets: ['Up to 90% lossless file size reduction', '100% client-side data privacy guarantee', 'Unlimited files with zero wait times', 'No credit card or registration required'],
    cta: 'TRY NOW FOR FREE',
    watermark: 'toolboxx.dev • @ToolBoxX',
  },
  {
    name: 'Image AI Studio',
    badge: 'Next-Gen Visual AI',
    title: 'Instant Background Remover & Upscaler',
    subheading: 'Turn low-res images into crystal-clear 4K visual assets in 1 click.',
    bullets: ['Pixel-perfect AI cutout edge detection', '4x super-resolution upscaling algorithm', 'Lossless transparent PNG export', 'Free forever with no watermarks'],
    cta: 'EXPLORE IMAGE TOOLS',
    watermark: 'toolboxx.dev • @ToolBoxX',
  },
  {
    name: 'Developer Utilities',
    badge: 'Built for Engineers',
    title: 'Instant Developer Utility Suite',
    subheading: 'Format JSON, decode JWT tokens, generate hashes, and test regex in milliseconds.',
    bullets: ['Real-time JSON syntax error validator', 'Instant Base64 file encoder & decoder', 'Zero data telemetry or tracking', 'Blazing-fast client-side execution'],
    cta: 'OPEN DEV TOOLS',
    watermark: 'toolboxx.dev • @ToolBoxX',
  },
  {
    name: 'ATS Resume Builder',
    badge: 'Career Accelerator',
    title: 'ATS-Proof Modern Resume Builder',
    subheading: 'Create clean, recruiter-approved resumes designed to pass ATS screening algorithms.',
    bullets: ['100% ATS score optimized typography', 'Pre-written action verbs & bullet phrases', 'Instant clean PDF document export', 'Zero subscription paywalls'],
    cta: 'BUILD RESUME FREE',
    watermark: 'toolboxx.dev • @ToolBoxX',
  },
];

export const SocialImageGenerator: React.FC = () => {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioPreset>('ig-square');
  const [selectedTheme, setSelectedTheme] = useState<ColorThemeId>('obsidian');
  const [layoutMode, setLayoutMode] = useState<CardLayoutId>('features');

  // Content Fields
  const [badgeText, setBadgeText] = useState<string>('⚡ 100% Client-Side Suite');
  const [titleText, setTitleText] = useState<string>('Free, Private Online Tools');
  const [subheadingText, setSubheadingText] = useState<string>('Process PDFs, images, and files locally in your browser with zero cloud uploads.');
  const [bullet1, setBullet1] = useState<string>('100% Client-Side Privacy: Zero Server Storage');
  const [bullet2, setBullet2] = useState<string>('Blazing Fast Processing via WebAssembly');
  const [bullet3, setBullet3] = useState<string>('Unlimited Free Access: No Sign-Up Needed');
  const [bullet4, setBullet4] = useState<string>('High-Resolution Export in Lossless Quality');
  const [ctaText, setCtaText] = useState<string>('TRY NOW FOR FREE');
  const [watermarkText, setWatermarkText] = useState<string>('toolboxx.dev • @ToolBoxX');

  // Metric fields (for metric layout)
  const [metricBig, setMetricBig] = useState<string>('100%');
  const [metricLabel, setMetricLabel] = useState<string>('Client-Side Data Privacy');

  // Comparison fields (for comparison layout)
  const [compLeftTitle, setCompLeftTitle] = useState<string>('The Cloud Way ❌');
  const [compLeftPoints, setCompLeftPoints] = useState<string>('Files uploaded to unknown servers\n$20/mo subscriptions\nStrict 5MB file caps\nSlow cloud queues');
  const [compRightTitle, setCompRightTitle] = useState<string>('ToolBoxX Way ⚡');
  const [compRightPoints, setCompRightPoints] = useState<string>('100% local browser memory\nCompletely free forever\nZero arbitrary size limits\nInstant offline execution');

  // Quote fields (for quote layout)
  const [quoteText, setQuoteText] = useState<string>('"The fastest way to edit files is not sending them over the internet at all."');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('ToolBoxX Philosophy');

  // Custom styling controls
  const [showPattern, setShowPattern] = useState<boolean>(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(100); // 80 - 130%
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const activeRatioConfig = ASPECT_RATIOS.find((r) => r.id === selectedRatio) || ASPECT_RATIOS[0];
  const activeThemeConfig = THEMES[selectedTheme];

  // Load preset template
  const applyPreset = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
    setBadgeText(preset.badge);
    setTitleText(preset.title);
    setSubheadingText(preset.subheading);
    setBullet1(preset.bullets[0] || '');
    setBullet2(preset.bullets[1] || '');
    setBullet3(preset.bullets[2] || '');
    setBullet4(preset.bullets[3] || '');
    setCtaText(preset.cta);
    setWatermarkText(preset.watermark);
    showToast({ type: 'info', title: 'Preset Applied', message: `Loaded "${preset.name}" template.` });
  };

  // Canvas drawing routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = activeRatioConfig;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = activeThemeConfig;
    const scale = fontSizeScale / 100;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Radial Glow Effects
    const radialGlow = ctx.createRadialGradient(width * 0.5, height * 0.35, 100, width * 0.5, height * 0.35, width * 0.6);
    radialGlow.addColorStop(0, theme.accentGlow);
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // Top-left subtle glow
    const tlGlow = ctx.createRadialGradient(0, 0, 50, 0, 0, width * 0.5);
    tlGlow.addColorStop(0, theme.accentGlow);
    tlGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tlGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Optional Geometric Dot Grid Pattern
    if (showPattern) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      const dotSpacing = Math.max(36, Math.floor(width / 30));
      for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 4. Subtle Outer Border & Corner Accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    const margin = Math.floor(width * 0.05);
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Corner Gold brackets
    const cornerSize = Math.floor(width * 0.04);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;

    // Top-Left Corner
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();

    // Top-Right Corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();

    // Dynamic padding & layout sizing
    const contentX = Math.floor(width * 0.08);
    const contentWidth = width - contentX * 2;
    let currentY = Math.floor(height * 0.09);

    // 5. Header: Badge Pill + Logo
    if (badgeText.trim()) {
      ctx.save();
      const badgeFontSize = Math.max(16, Math.floor(width * 0.024 * scale));
      ctx.font = `bold ${badgeFontSize}px "Plus Jakarta Sans", Inter, sans-serif`;
      const badgeMetrics = ctx.measureText(badgeText.toUpperCase());
      const badgePadX = Math.floor(width * 0.024);
      const badgePadY = Math.floor(height * 0.012);
      const badgeW = badgeMetrics.width + badgePadX * 2;
      const badgeH = badgeFontSize + badgePadY * 2;

      // Badge background pill
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      roundRect(ctx, contentX, currentY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.stroke();

      // Badge text
      ctx.fillStyle = theme.accent;
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), contentX + badgePadX, currentY + badgeH / 2 + 1);
      ctx.restore();

      currentY += badgeH + Math.floor(height * 0.03);
    }

    // 6. Main Headline Title
    ctx.save();
    const titleFontSize = Math.max(32, Math.floor(width * 0.054 * scale));
    ctx.font = `bold ${titleFontSize}px "Plus Jakarta Sans", Georgia, serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textBaseline = 'top';

    const titleLines = wrapText(ctx, titleText, contentWidth);
    const titleLineHeight = titleFontSize * 1.25;
    for (const line of titleLines) {
      ctx.fillText(line, contentX, currentY);
      currentY += titleLineHeight;
    }
    ctx.restore();

    currentY += Math.floor(height * 0.015);

    // 7. Subheading
    if (subheadingText.trim()) {
      ctx.save();
      const subFontSize = Math.max(18, Math.floor(width * 0.027 * scale));
      ctx.font = `normal ${subFontSize}px "Plus Jakarta Sans", Inter, sans-serif`;
      ctx.fillStyle = theme.mutedColor;
      ctx.textBaseline = 'top';

      const subLines = wrapText(ctx, subheadingText, contentWidth);
      const subLineHeight = subFontSize * 1.45;
      for (const line of subLines) {
        ctx.fillText(line, contentX, currentY);
        currentY += subLineHeight;
      }
      ctx.restore();
      currentY += Math.floor(height * 0.03);
    }

    // 8. LAYOUT-SPECIFIC BODY SECTIONS
    if (layoutMode === 'features') {
      // Feature Glass Card Container
      const bullets = [bullet1, bullet2, bullet3, bullet4].filter((b) => b.trim().length > 0);
      if (bullets.length > 0) {
        const cardPad = Math.floor(width * 0.04);
        const bulletFontSize = Math.max(16, Math.floor(width * 0.026 * scale));
        const bulletLineH = bulletFontSize * 1.7;
        const cardH = bullets.length * bulletLineH + cardPad * 2;

        ctx.save();
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 1.5;
        roundRect(ctx, contentX, currentY, contentWidth, cardH, 20);
        ctx.fill();
        ctx.stroke();

        let bY = currentY + cardPad;
        ctx.font = `500 ${bulletFontSize}px "Plus Jakarta Sans", Inter, sans-serif`;
        ctx.textBaseline = 'top';

        for (const bullet of bullets) {
          // Checkmark icon circle
          const iconR = Math.max(10, Math.floor(bulletFontSize * 0.55));
          const iconX = contentX + cardPad + iconR;
          const iconY = bY + bulletFontSize * 0.45;

          ctx.beginPath();
          ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
          ctx.fillStyle = theme.accentGlow;
          ctx.fill();
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Checkmark mark
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(iconX - iconR * 0.4, iconY);
          ctx.lineTo(iconX - iconR * 0.1, iconY + iconR * 0.35);
          ctx.lineTo(iconX + iconR * 0.45, iconY - iconR * 0.35);
          ctx.stroke();

          // Bullet text
          ctx.fillStyle = theme.textColor;
          ctx.fillText(bullet, iconX + iconR + Math.floor(width * 0.02), bY);
          bY += bulletLineH;
        }
        ctx.restore();
        currentY += cardH + Math.floor(height * 0.035);
      }
    } else if (layoutMode === 'metric') {
      // Big Stat / Metric Container
      const metricCardH = Math.floor(height * 0.24);
      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      roundRect(ctx, contentX, currentY, contentWidth, metricCardH, 24);
      ctx.fill();
      ctx.stroke();

      const bigFontSize = Math.max(48, Math.floor(width * 0.11 * scale));
      ctx.font = `bold ${bigFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = theme.accent;
      ctx.textBaseline = 'top';
      ctx.fillText(metricBig, contentX + Math.floor(width * 0.05), currentY + Math.floor(height * 0.025));

      const labelFontSize = Math.max(18, Math.floor(width * 0.032 * scale));
      ctx.font = `bold ${labelFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = theme.textColor;
      ctx.fillText(metricLabel, contentX + Math.floor(width * 0.05), currentY + bigFontSize + Math.floor(height * 0.04));
      ctx.restore();

      currentY += metricCardH + Math.floor(height * 0.035);
    } else if (layoutMode === 'comparison') {
      // Two-column side-by-side comparison
      const colW = (contentWidth - Math.floor(width * 0.03)) / 2;
      const compCardH = Math.floor(height * 0.28);
      const col1X = contentX;
      const col2X = contentX + colW + Math.floor(width * 0.03);

      // Left Column (Old Way)
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, col1X, currentY, colW, compCardH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FCA5A5';
      const colTitleSize = Math.max(16, Math.floor(width * 0.026 * scale));
      ctx.font = `bold ${colTitleSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(compLeftTitle, col1X + 16, currentY + 18);

      ctx.font = `normal ${Math.max(14, Math.floor(width * 0.02 * scale))}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#E2E8F0';
      const leftItems = compLeftPoints.split('\n').filter(Boolean);
      let leftY = currentY + 48;
      for (const item of leftItems) {
        ctx.fillText(`• ${item}`, col1X + 16, leftY);
        leftY += 24;
      }
      ctx.restore();

      // Right Column (ToolBoxX Way)
      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      roundRect(ctx, col2X, currentY, colW, compCardH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.font = `bold ${colTitleSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(compRightTitle, col2X + 16, currentY + 18);

      ctx.font = `normal ${Math.max(14, Math.floor(width * 0.02 * scale))}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = theme.textColor;
      const rightItems = compRightPoints.split('\n').filter(Boolean);
      let rightY = currentY + 48;
      for (const item of rightItems) {
        ctx.fillText(`✓ ${item}`, col2X + 16, rightY);
        rightY += 24;
      }
      ctx.restore();

      currentY += compCardH + Math.floor(height * 0.035);
    } else if (layoutMode === 'quote') {
      // Quote Card
      const quoteCardH = Math.floor(height * 0.24);
      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      roundRect(ctx, contentX, currentY, contentWidth, quoteCardH, 20);
      ctx.fill();
      ctx.stroke();

      const quoteFontSize = Math.max(18, Math.floor(width * 0.032 * scale));
      ctx.font = `italic ${quoteFontSize}px Georgia, serif`;
      ctx.fillStyle = theme.textColor;
      const quoteLines = wrapText(ctx, quoteText, contentWidth - 40);
      let qY = currentY + 28;
      for (const line of quoteLines) {
        ctx.fillText(line, contentX + 20, qY);
        qY += quoteFontSize * 1.35;
      }

      ctx.font = `bold ${Math.max(14, Math.floor(width * 0.022 * scale))}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = theme.accent;
      ctx.fillText(`— ${quoteAuthor}`, contentX + 20, qY + 12);
      ctx.restore();

      currentY += quoteCardH + Math.floor(height * 0.035);
    }

    // 9. Bottom Footer Bar (CTA Badge + Brand Watermark)
    const footerY = height - Math.floor(height * 0.08);

    // CTA Button
    if (ctaText.trim()) {
      ctx.save();
      const ctaFontSize = Math.max(15, Math.floor(width * 0.023 * scale));
      ctx.font = `bold ${ctaFontSize}px "Plus Jakarta Sans", sans-serif`;
      const ctaMetrics = ctx.measureText(ctaText.toUpperCase());
      const ctaPadX = Math.floor(width * 0.03);
      const ctaPadY = Math.floor(height * 0.012);
      const ctaW = ctaMetrics.width + ctaPadX * 2;
      const ctaH = ctaFontSize + ctaPadY * 2;

      ctx.fillStyle = theme.accent;
      roundRect(ctx, contentX, footerY - ctaH / 2, ctaW, ctaH, 12);
      ctx.fill();

      ctx.fillStyle = '#0C0B0A';
      ctx.textBaseline = 'middle';
      ctx.fillText(ctaText.toUpperCase(), contentX + ctaPadX, footerY);
      ctx.restore();
    }

    // Brand Watermark on the Right
    if (watermarkText.trim()) {
      ctx.save();
      const waterFontSize = Math.max(14, Math.floor(width * 0.022 * scale));
      ctx.font = `600 ${waterFontSize}px "Plus Jakarta Sans", Inter, sans-serif`;
      ctx.fillStyle = theme.mutedColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText, width - contentX, footerY);
      ctx.restore();
    }
  }, [
    activeRatioConfig,
    activeThemeConfig,
    layoutMode,
    badgeText,
    titleText,
    subheadingText,
    bullet1,
    bullet2,
    bullet3,
    bullet4,
    ctaText,
    watermarkText,
    metricBig,
    metricLabel,
    compLeftTitle,
    compLeftPoints,
    compRightTitle,
    compRightPoints,
    quoteText,
    quoteAuthor,
    showPattern,
    fontSizeScale,
  ]);

  // Re-draw when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // High-Resolution PNG Export
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `toolboxx-${selectedRatio}-${Date.now()}.png`);
      showToast({ type: 'success', title: 'Image Downloaded!', message: `Saved high-res ${activeRatioConfig.width}×${activeRatioConfig.height} PNG.` });
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
    }, 'image/png');
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        // @ts-ignore
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        showToast({ type: 'success', title: 'Image Copied to Clipboard!', message: 'Paste directly into Figma, Twitter, or Discord.' });
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setCopiedImage(false), 2500);
      }, 'image/png');
    } catch {
      showToast({ type: 'error', title: 'Clipboard Error', message: 'Your browser prevented direct image copying. Please use the Download button.' });
    }
  };

  // Helper: Canvas Rounded Rectangle
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Helper: Text Wrapping
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Header Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vector-Sharp Canvas Engine</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Social Image Generator
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Create branded, dark-luxury announcement cards and feature highlights for 6 standard social dimensions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyImage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[var(--c-gold)]" />}
              <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--c-accent)] text-[#11110F] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG ({activeRatioConfig.width}×{activeRatioConfig.height})</span>
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector Bar */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-3">
            Select Social Platform & Aspect Ratio:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ASPECT_RATIOS.map((ratio) => {
              const isSelected = selectedRatio === ratio.id;
              return (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedRatio(ratio.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-[var(--c-gold)] bg-[var(--c-card)] shadow-md ring-1 ring-[var(--c-gold)]/40'
                      : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{ratio.icon}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)]">
                      {ratio.ratioLabel}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--c-text)] truncate">{ratio.name}</div>
                    <div className="text-[10px] text-[var(--c-subtle)] font-mono">
                      {ratio.width} × {ratio.height}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme & Layout Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Color Theme */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Color Palette Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as ColorThemeId)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Card Layout Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Card Content Layout
            </label>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as CardLayoutId)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="features">Feature Bullets Showcase</option>
              <option value="metric">Big Metric / Stat Highlight</option>
              <option value="comparison">Side-by-Side Comparison</option>
              <option value="quote">Quote / Testimonial Card</option>
            </select>
          </div>

          {/* Typography Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              <span>Text Scale</span>
              <span className="font-mono text-[var(--c-gold)]">{fontSizeScale}%</span>
            </div>
            <input
              type="range"
              min={80}
              max={130}
              value={fontSizeScale}
              onChange={(e) => setFontSizeScale(Number(e.target.value))}
              className="w-full py-2 cursor-pointer"
            />
          </div>

          {/* Fast Preset Templates */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Quick Templates
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {TEMPLATE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-[11px] font-medium text-[var(--c-muted)] hover:text-[var(--c-text)] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Live Studio View (Side-by-side on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Live Canvas Preview Container */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[var(--c-border)] text-xs text-[var(--c-muted)]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Eye className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>Live Rendering Preview</span>
              </span>
              <span className="font-mono text-[var(--c-gold)]">
                {activeRatioConfig.width} × {activeRatioConfig.height}px ({activeRatioConfig.ratioLabel})
              </span>
            </div>

            {/* Responsive Canvas Frame */}
            <div className="w-full flex items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '560px',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--c-muted)] px-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPattern}
                onChange={(e) => setShowPattern(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--c-gold)] cursor-pointer"
              />
              <span>Render Geometric Dot Grid</span>
            </label>
            <span>Auto-scaled for display • Exports in full 1080p+ native resolution</span>
          </div>
        </div>

        {/* Right Side: Content Customizer Accordions / Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-5">
            <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2 pb-3 border-b border-[var(--c-border)]">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Card Content Customizer</span>
            </h3>

            {/* Common Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Top Badge Pill</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. ⚡ 100% Client-Side Suite"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Main Headline</label>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="e.g. Free, Private Online Tools"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Subheading / Description</label>
                <textarea
                  rows={2}
                  value={subheadingText}
                  onChange={(e) => setSubheadingText(e.target.value)}
                  placeholder="Short supporting explanation..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] resize-none"
                />
              </div>
            </div>

            {/* Layout Specific Fields */}
            {layoutMode === 'features' && (
              <div className="space-y-2.5 pt-3 border-t border-[var(--c-border)]">
                <label className="text-xs font-bold text-[var(--c-gold)] block">Feature Bullets</label>
                <input
                  type="text"
                  value={bullet1}
                  onChange={(e) => setBullet1(e.target.value)}
                  placeholder="Feature 1"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
                <input
                  type="text"
                  value={bullet2}
                  onChange={(e) => setBullet2(e.target.value)}
                  placeholder="Feature 2"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
                <input
                  type="text"
                  value={bullet3}
                  onChange={(e) => setBullet3(e.target.value)}
                  placeholder="Feature 3"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
                <input
                  type="text"
                  value={bullet4}
                  onChange={(e) => setBullet4(e.target.value)}
                  placeholder="Feature 4 (Optional)"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
              </div>
            )}

            {layoutMode === 'metric' && (
              <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
                <div>
                  <label className="text-xs font-bold text-[var(--c-gold)] block mb-1">Big Stat Number</label>
                  <input
                    type="text"
                    value={metricBig}
                    onChange={(e) => setMetricBig(e.target.value)}
                    placeholder="e.g. 100% or 10X"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-gold)] block mb-1">Metric Subtitle</label>
                  <input
                    type="text"
                    value={metricLabel}
                    onChange={(e) => setMetricLabel(e.target.value)}
                    placeholder="e.g. Client-Side Privacy Guarantee"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)]"
                  />
                </div>
              </div>
            )}

            {layoutMode === 'comparison' && (
              <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
                <div>
                  <label className="text-xs font-bold text-rose-400 block mb-1">Left Column Title & Points</label>
                  <input
                    type="text"
                    value={compLeftTitle}
                    onChange={(e) => setCompLeftTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] mb-1.5"
                  />
                  <textarea
                    rows={3}
                    value={compLeftPoints}
                    onChange={(e) => setCompLeftPoints(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-400 block mb-1">Right Column Title & Points</label>
                  <input
                    type="text"
                    value={compRightTitle}
                    onChange={(e) => setCompRightTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] mb-1.5"
                  />
                  <textarea
                    rows={3}
                    value={compRightPoints}
                    onChange={(e) => setCompRightPoints(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] resize-none"
                  />
                </div>
              </div>
            )}

            {layoutMode === 'quote' && (
              <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
                <div>
                  <label className="text-xs font-bold text-[var(--c-gold)] block mb-1">Quote Text</label>
                  <textarea
                    rows={3}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-gold)] block mb-1">Author / Attribution</label>
                  <input
                    type="text"
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)]"
                  />
                </div>
              </div>
            )}

            {/* Bottom Bar Fields */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--c-border)]">
              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">CTA Badge</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="TRY NOW FREE"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Watermark / URL</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="toolboxx.dev"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Create high-converting social media visual cards with ToolBoxX!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="social-image-generator" />
    </div>
  );
};
