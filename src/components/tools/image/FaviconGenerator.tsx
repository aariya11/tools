import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Monitor,
  Sliders,
  Archive,
  Code2
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface FaviconSizeConfig {
  name: string;
  size: number;
  purpose: string;
  rel?: string;
}

const FAVICON_SIZES: FaviconSizeConfig[] = [
  { name: 'favicon-16x16.png', size: 16, purpose: 'Standard browser tabs', rel: 'icon' },
  { name: 'favicon-32x32.png', size: 32, purpose: 'High-DPI retina browser tabs', rel: 'icon' },
  { name: 'favicon-48x48.png', size: 48, purpose: 'Windows desktop shortcuts', rel: 'icon' },
  { name: 'apple-touch-icon.png', size: 180, purpose: 'Apple iOS Home Screen', rel: 'apple-touch-icon' },
  { name: 'android-chrome-192x192.png', size: 192, purpose: 'Android PWA Home Screen' },
  { name: 'android-chrome-512x512.png', size: 512, purpose: 'PWA Splash Screen & Store' },
];

// Helper to assemble standard multi-resolution ICO file from PNG byte buffers
async function createIcoBlob(pngBuffers: { size: number; buffer: ArrayBuffer }[]): Promise<Blob> {
  const count = pngBuffers.length;
  const headerLength = 6 + count * 16;
  let totalSize = headerLength;

  pngBuffers.forEach((p) => {
    totalSize += p.buffer.byteLength;
  });

  const outBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(outBuffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Image type (1 = ICO)
  view.setUint16(4, count, true); // Number of images

  let currentOffset = headerLength;

  pngBuffers.forEach((p, i) => {
    const entryOffset = 6 + i * 16;
    const w = p.size >= 256 ? 0 : p.size;
    const h = p.size >= 256 ? 0 : p.size;

    view.setUint8(entryOffset, w); // Width
    view.setUint8(entryOffset + 1, h); // Height
    view.setUint8(entryOffset + 2, 0); // Color palette (0 = no palette)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes (1)
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, p.buffer.byteLength, true); // Byte size
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset in file

    // Copy PNG bytes into payload
    new Uint8Array(outBuffer, currentOffset, p.buffer.byteLength).set(new Uint8Array(p.buffer));
    currentOffset += p.buffer.byteLength;
  });

  return new Blob([outBuffer], { type: 'image/x-icon' });
}

export const FaviconGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Branding Customization
  const [appName, setAppName] = useState<string>('My Awesome App');
  const [themeColor, setThemeColor] = useState<string>('#B79B70');
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [paddingPercent, setPaddingPercent] = useState<number>(0); // 0 - 30%
  const [borderRadiusPercent, setBorderRadiusPercent] = useState<number>(0); // 0 - 50%

  // Generated Assets
  const [renderedSizes, setRenderedSizes] = useState<Map<number, { dataUrl: string; blob: Blob }>>(new Map());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  const sourceImgRef = useRef<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      sourceImgRef.current = img;
      generateAllFavicons();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Generate All Resolution PNGs
  const generateAllFavicons = useCallback(async () => {
    const img = sourceImgRef.current;
    if (!img) return;
    setIsGenerating(true);

    const sizeMap = new Map<number, { dataUrl: string; blob: Blob }>();

    for (const config of FAVICON_SIZES) {
      const { size } = config;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Optional Rounded Background Clip & Fill
      if (borderRadiusPercent > 0 || bgColor !== 'transparent') {
        ctx.save();
        const r = (borderRadiusPercent / 100) * (size / 2);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();

        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fill();
        }
        ctx.clip();
      }

      // Calculate Inner Padding
      const pad = Math.round((paddingPercent / 100) * size * 0.5);
      const drawSize = size - pad * 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, pad, pad, drawSize, drawSize);

      if (borderRadiusPercent > 0 || bgColor !== 'transparent') {
        ctx.restore();
      }

      await new Promise<void>((res) => {
        canvas.toBlob((blob) => {
          if (blob) {
            sizeMap.set(size, {
              dataUrl: canvas.toDataURL('image/png'),
              blob,
            });
          }
          res();
        }, 'image/png');
      });
    }

    setRenderedSizes(sizeMap);
    setIsGenerating(false);
  }, [bgColor, paddingPercent, borderRadiusPercent]);

  useEffect(() => {
    if (sourceImgRef.current) {
      const timer = setTimeout(() => generateAllFavicons(), 80);
      return () => clearTimeout(timer);
    }
  }, [generateAllFavicons]);

  // Download Complete ZIP package
  const handleDownloadZip = async () => {
    if (renderedSizes.size === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();

      // 1. Add PNGs to ZIP
      for (const config of FAVICON_SIZES) {
        const item = renderedSizes.get(config.size);
        if (item) {
          zip.file(config.name, item.blob);
        }
      }

      // 2. Generate and Add favicon.ico (16x16 and 32x32 bundle)
      const icoSizes = [16, 32, 48];
      const icoBuffers: { size: number; buffer: ArrayBuffer }[] = [];

      for (const s of icoSizes) {
        const item = renderedSizes.get(s);
        if (item) {
          const buf = await item.blob.arrayBuffer();
          icoBuffers.push({ size: s, buffer: buf });
        }
      }

      if (icoBuffers.length > 0) {
        const icoBlob = await createIcoBlob(icoBuffers);
        zip.file('favicon.ico', icoBlob);
      }

      // 3. Add site.webmanifest
      const manifestJson = {
        name: appName,
        short_name: appName,
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: themeColor,
        background_color: bgColor === 'transparent' ? '#ffffff' : bgColor,
        display: 'standalone',
      };
      zip.file('site.webmanifest', JSON.stringify(manifestJson, null, 2));

      // 4. Add browserconfig.xml
      const browserConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/favicon-48x48.png"/>
            <TileColor>${themeColor}</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
      zip.file('browserconfig.xml', browserConfigXml);

      // Generate and Download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'favicon-package.zip');
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.8 } });
      showToast({
        type: 'success',
        title: 'Favicon Package Downloaded',
        message: 'Complete favicon bundle with ICO, PNGs, manifest, and XML generated.',
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'ZIP Failed', message: err.message || 'Failed to package ZIP' });
    } finally {
      setIsZipping(false);
    }
  };

  const htmlSnippet = `<!-- Favicon & App Icons generated by ToolBoxX -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
    showToast({
      type: 'success',
      title: 'HTML Snippet Copied',
      message: 'Paste inside your <head> tags.',
    });
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setRenderedSizes(new Map());
    sourceImgRef.current = null;
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/jpg"
        allowedFormatsText="PNG, SVG, JPG, WebP"
        label="Drop your logo here to generate favicon package"
        description="Generates complete modern favicon bundle (favicon.ico, apple-touch-icon, Android 192/512, site.webmanifest, HTML code)."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const preview32 = renderedSizes.get(32)?.dataUrl || imageSrc;
  const preview180 = renderedSizes.get(180)?.dataUrl || imageSrc;

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Favicon Package"
          value="8 Files"
          badge="Complete"
          badgeType="success"
          subValue="ICO, PNGs, Manifest & XML"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Apple Touch Icon"
          value="180 × 180"
          subValue="iOS Home Screen"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Android PWA"
          value="512 × 512"
          subValue="Web App Manifest"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Standard ICO"
          value="Multi-Res"
          badge="16/32/48px"
          badgeType="neutral"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings & App Info */}
        <div
          className="lg:col-span-4 space-y-5 p-6 rounded-2xl border max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Sliders className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Favicon Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Change Logo
            </button>
          </div>

          {/* App Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              App / Site Title
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none"
              style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          {/* Theme Color */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Theme Bar Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-8 h-8 rounded border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border focus:outline-none uppercase"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              />
            </div>
          </div>

          {/* Background Styling */}
          <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Background & Fill
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'transparent', label: 'Transparent' },
                { id: '#FFFFFF', label: 'White' },
                { id: '#11110F', label: 'Dark' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBgColor(b.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    bgColor === b.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: bgColor === b.id ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: bgColor === b.id ? 'var(--c-gold)' : 'var(--c-border)',
                    color: bgColor === b.id ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Padding Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Inner Logo Padding:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{paddingPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={paddingPercent}
                onChange={(e) => setPaddingPercent(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Corner Rounding:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>
                  {borderRadiusPercent === 50 ? 'Circle (50%)' : `${borderRadiusPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadiusPercent}
                onChange={(e) => setBorderRadiusPercent(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Download ZIP Package CTA */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownloadZip}
              disabled={isZipping || isGenerating}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Archive className="w-5 h-5" />
              {isZipping ? 'Creating Package...' : 'Download Favicon Bundle (ZIP)'}
            </button>
          </div>
        </div>

        {/* Right Column: Previews (Browser Tab, Smartphone, Google Search) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Mockup 1: Desktop Browser Tab */}
          <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Monitor className="w-3.5 h-3.5" /> Desktop Browser Tab Mockup
            </span>

            <div className="rounded-xl border overflow-hidden shadow-md" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
              {/* Browser Header Bar */}
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ backgroundColor: 'var(--c-card)', borderColor: 'var(--c-border)' }}>
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>

                {/* Active Tab */}
                <div
                  className="px-3 py-1.5 rounded-t-lg border border-b-0 text-xs flex items-center gap-2 max-w-[200px]"
                  style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                >
                  <img src={preview32} alt="Tab Favicon" className="w-4 h-4 rounded-xs shrink-0 object-contain" />
                  <span className="font-semibold truncate">{appName}</span>
                </div>
              </div>

              {/* Address bar */}
              <div className="px-4 py-2 flex items-center gap-2 text-xs" style={{ color: 'var(--c-muted)' }}>
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono">https://yoursite.com</span>
              </div>
            </div>
          </div>

          {/* Mockup 2: Mobile iOS & Android Home Screen Icon */}
          <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Smartphone className="w-3.5 h-3.5" /> Mobile App Home Screen Mockup
            </span>

            <div className="flex items-center justify-around p-4 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
              {/* iOS Icon */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                  <img src={preview180} alt="iOS App Icon" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium truncate max-w-[80px]" style={{ color: 'var(--c-text)' }}>
                  {appName}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Apple Touch (180px)</span>
              </div>

              {/* Android Chrome PWA Icon */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full shadow-xl overflow-hidden border border-white/20 p-2" style={{ backgroundColor: bgColor === 'transparent' ? '#FFFFFF' : bgColor }}>
                  <img src={preview180} alt="Android Icon" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-medium truncate max-w-[80px]" style={{ color: 'var(--c-text)' }}>
                  {appName}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Android PWA (192px)</span>
              </div>
            </div>
          </div>

          {/* HTML Embed Snippet Box */}
          <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
                <Code2 className="w-3.5 h-3.5" /> HTML Header Code Snippet
              </span>
              <button
                type="button"
                onClick={copyHtml}
                className="px-3 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                style={{ backgroundColor: 'var(--c-card)', borderColor: 'var(--c-gold)', color: 'var(--c-gold)' }}
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                {copiedHtml ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <pre
              className="p-4 rounded-xl border text-[11px] font-mono overflow-x-auto leading-relaxed"
              style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            >
              {htmlSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="favicon-generator" onReset={handleReset} />
    </div>
  );
};
