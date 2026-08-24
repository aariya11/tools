import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Crop,
  Sliders,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  FileArchive,
  Eye,
  Maximize,
  ZoomIn,
  Move,
  Info,
  Trash2,
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

export type PlatformCategory = 'all' | 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'twitter' | 'pinterest' | 'tiktok';
export type ResizeFitMode = 'cover' | 'contain-blur' | 'contain-solid' | 'fit';

export interface SocialPreset {
  id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'twitter' | 'pinterest' | 'tiktok';
  platformName: string;
  name: string;
  width: number;
  height: number;
  ratioLabel: string;
  description: string;
  icon: string;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  // Instagram
  { id: 'ig-square', platform: 'instagram', platformName: 'Instagram', name: 'Square Post', width: 1080, height: 1080, ratioLabel: '1:1', description: 'Standard feed photo & carousel', icon: '📸' },
  { id: 'ig-portrait', platform: 'instagram', platformName: 'Instagram', name: 'Portrait Post', width: 1080, height: 1350, ratioLabel: '4:5', description: 'Maximizes vertical screen real estate', icon: '📸' },
  { id: 'ig-landscape', platform: 'instagram', platformName: 'Instagram', name: 'Landscape Post', width: 1080, height: 566, ratioLabel: '1.91:1', description: 'Wide horizontal feed photo', icon: '📸' },
  { id: 'ig-story', platform: 'instagram', platformName: 'Instagram', name: 'Story / Reel', width: 1080, height: 1920, ratioLabel: '9:16', description: 'Fullscreen vertical story or Reel', icon: '📱' },
  { id: 'ig-profile', platform: 'instagram', platformName: 'Instagram', name: 'Profile Avatar', width: 320, height: 320, ratioLabel: '1:1', description: 'Circular profile photo', icon: '👤' },

  // Facebook
  { id: 'fb-post', platform: 'facebook', platformName: 'Facebook', name: 'Feed Post Image', width: 1200, height: 630, ratioLabel: '1.91:1', description: 'Standard timeline image link preview', icon: '📘' },
  { id: 'fb-story', platform: 'facebook', platformName: 'Facebook', name: 'Story', width: 1080, height: 1920, ratioLabel: '9:16', description: 'Vertical fullscreen Facebook story', icon: '📱' },
  { id: 'fb-cover', platform: 'facebook', platformName: 'Facebook', name: 'Page Cover Banner', width: 820, height: 312, ratioLabel: '2.63:1', description: 'Desktop & mobile page header', icon: '🖼️' },
  { id: 'fb-profile', platform: 'facebook', platformName: 'Facebook', name: 'Profile Photo', width: 170, height: 170, ratioLabel: '1:1', description: 'Facebook avatar icon', icon: '👤' },
  { id: 'fb-event', platform: 'facebook', platformName: 'Facebook', name: 'Event Banner', width: 1920, height: 1005, ratioLabel: '1.91:1', description: 'Event cover banner', icon: '🎉' },

  // YouTube
  { id: 'yt-thumb', platform: 'youtube', platformName: 'YouTube', name: 'Video Thumbnail', width: 1280, height: 720, ratioLabel: '16:9', description: 'Standard high-CTR video thumbnail', icon: '▶️' },
  { id: 'yt-banner', platform: 'youtube', platformName: 'YouTube', name: 'Channel Banner', width: 2560, height: 1440, ratioLabel: '16:9', description: 'Top channel art for TV, desktop & mobile', icon: '📺' },
  { id: 'yt-shorts', platform: 'youtube', platformName: 'YouTube', name: 'Shorts Video Cover', width: 1080, height: 1920, ratioLabel: '9:16', description: 'Vertical YouTube Shorts frame', icon: '📱' },
  { id: 'yt-avatar', platform: 'youtube', platformName: 'YouTube', name: 'Channel Avatar', width: 800, height: 800, ratioLabel: '1:1', description: 'Channel profile icon', icon: '👤' },

  // LinkedIn
  { id: 'li-post', platform: 'linkedin', platformName: 'LinkedIn', name: 'Feed Post Image', width: 1200, height: 627, ratioLabel: '1.91:1', description: 'Standard LinkedIn update & link post', icon: '💼' },
  { id: 'li-banner', platform: 'linkedin', platformName: 'LinkedIn', name: 'Personal Banner', width: 1584, height: 396, ratioLabel: '4:1', description: 'Profile background header image', icon: '🏢' },
  { id: 'li-company', platform: 'linkedin', platformName: 'LinkedIn', name: 'Company Cover', width: 1128, height: 191, ratioLabel: '5.9:1', description: 'Organization page top banner', icon: '🌐' },
  { id: 'li-profile', platform: 'linkedin', platformName: 'LinkedIn', name: 'Profile Avatar', width: 400, height: 400, ratioLabel: '1:1', description: 'Professional headshot photo', icon: '👤' },

  // X / Twitter
  { id: 'tw-post', platform: 'twitter', platformName: 'X (Twitter)', name: 'Post Image', width: 1600, height: 900, ratioLabel: '16:9', description: 'Single feed photo or card', icon: '🐦' },
  { id: 'tw-header', platform: 'twitter', platformName: 'X (Twitter)', name: 'Header Banner', width: 1500, height: 500, ratioLabel: '3:1', description: 'Top account header banner', icon: '🖼️' },
  { id: 'tw-profile', platform: 'twitter', platformName: 'X (Twitter)', name: 'Profile Avatar', width: 400, height: 400, ratioLabel: '1:1', description: 'Square avatar photo', icon: '👤' },

  // Pinterest
  { id: 'pin-standard', platform: 'pinterest', platformName: 'Pinterest', name: 'Standard Pin', width: 1000, height: 1500, ratioLabel: '2:3', description: 'Optimal 2:3 vertical pin format', icon: '📌' },
  { id: 'pin-square', platform: 'pinterest', platformName: 'Pinterest', name: 'Square Pin', width: 1000, height: 1000, ratioLabel: '1:1', description: 'Square product showcase pin', icon: '📌' },
  { id: 'pin-board', platform: 'pinterest', platformName: 'Pinterest', name: 'Board Cover', width: 600, height: 600, ratioLabel: '1:1', description: 'Pinterest board thumbnail', icon: '📁' },

  // TikTok
  { id: 'tt-story', platform: 'tiktok', platformName: 'TikTok', name: 'Video / Story', width: 1080, height: 1920, ratioLabel: '9:16', description: '9:16 fullscreen vertical screen', icon: '🎵' },
  { id: 'tt-profile', platform: 'tiktok', platformName: 'TikTok', name: 'Profile Photo', width: 200, height: 200, ratioLabel: '1:1', description: 'TikTok account avatar', icon: '👤' },
];

export const SocialMediaResizer: React.FC = () => {
  // Uploaded Image State
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('image');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);

  // Filter & Preset Selection
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ig-square');
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set(['ig-square', 'tw-post', 'yt-thumb', 'li-post']));

  // Resize Settings
  const [fitMode, setFitMode] = useState<ResizeFitMode>('contain-blur');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100% - 250%
  const [panX, setPanX] = useState<number>(0); // -50% to +50%
  const [panY, setPanY] = useState<number>(0); // -50% to +50%
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(92); // 70 - 100%
  const [solidBgColor, setSolidBgColor] = useState<string>('#11110F');
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const activePreset = SOCIAL_PRESETS.find((p) => p.id === selectedPresetId) || SOCIAL_PRESETS[0];

  // Filter presets by active tab
  const filteredPresets = SOCIAL_PRESETS.filter(
    (p) => activeCategory === 'all' || p.platform === activeCategory
  );

  // Handle Image File Upload
  const handleFileSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setImageFileName(file.name.replace(/\.[^/.]+$/, ''));
    setOriginalFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setOriginalWidth(img.naturalWidth);
        setOriginalHeight(img.naturalHeight);
        setZoomLevel(100);
        setPanX(0);
        setPanY(0);
        showToast({
          type: 'success',
          title: 'Image Loaded!',
          message: `${img.naturalWidth}×${img.naturalHeight}px • Ready to resize.`,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw Resized Image onto any canvas
  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement, preset: SocialPreset, img: HTMLImageElement) => {
      const { width: targetW, height: targetH } = preset;
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      if (fitMode === 'contain-blur') {
        // Draw blurred background to fill letterbox
        ctx.save();
        ctx.filter = 'blur(28px) brightness(0.65)';
        // Draw stretched overscaled background
        ctx.drawImage(img, -targetW * 0.1, -targetH * 0.1, targetW * 1.2, targetH * 1.2);
        ctx.restore();

        // Dark overlay on background for contrast
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, targetW, targetH);

        // Draw crisp contained image in center with subtle shadow
        const scale = Math.min(targetW / imgW, targetH / imgH) * (zoomLevel / 100);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (targetW - drawW) / 2 + (panX / 100) * targetW;
        const drawY = (targetH - drawH) / 2 + (panY / 100) * targetH;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 24;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else if (fitMode === 'contain-solid') {
        // Solid background color
        ctx.fillStyle = solidBgColor;
        ctx.fillRect(0, 0, targetW, targetH);

        const scale = Math.min(targetW / imgW, targetH / imgH) * (zoomLevel / 100);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (targetW - drawW) / 2 + (panX / 100) * targetW;
        const drawY = (targetH - drawH) / 2 + (panY / 100) * targetH;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else if (fitMode === 'cover') {
        // Smart crop / cover to fill full area
        const scale = Math.max(targetW / imgW, targetH / imgH) * (zoomLevel / 100);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (targetW - drawW) / 2 + (panX / 100) * targetW;
        const drawY = (targetH - drawH) / 2 + (panY / 100) * targetH;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Stretch / Fit
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
    },
    [fitMode, zoomLevel, panX, panY, solidBgColor]
  );

  // Update Live Preview Canvas
  useEffect(() => {
    if (!sourceImage || !previewCanvasRef.current) return;
    drawToCanvas(previewCanvasRef.current, activePreset, sourceImage);
  }, [sourceImage, activePreset, drawToCanvas]);

  // Download Single Active Resized Image
  const handleDownloadSingle = () => {
    if (!sourceImage) {
      showToast({ type: 'info', title: 'Upload Image First', message: 'Please drop an image to resize.' });
      return;
    }

    const offscreen = document.createElement('canvas');
    drawToCanvas(offscreen, activePreset, sourceImage);

    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    offscreen.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, `${imageFileName}-${activePreset.id}-${activePreset.width}x${activePreset.height}.${ext}`);
        showToast({
          type: 'success',
          title: 'Resized Image Downloaded!',
          message: `${activePreset.name} (${activePreset.width}×${activePreset.height}px)`,
        });
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      },
      exportFormat,
      exportQuality / 100
    );
  };

  // Toggle Batch Selection Item
  const toggleBatchItem = (id: string) => {
    const next = new Set(batchSelectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setBatchSelectedIds(next);
  };

  // Select / Deselect All
  const toggleSelectAll = () => {
    if (batchSelectedIds.size === SOCIAL_PRESETS.length) {
      setBatchSelectedIds(new Set());
    } else {
      setBatchSelectedIds(new Set(SOCIAL_PRESETS.map((p) => p.id)));
    }
  };

  // Batch Export All Selected to ZIP
  const handleBatchZipDownload = async () => {
    if (!sourceImage) {
      showToast({ type: 'info', title: 'Upload Image First', message: 'Please drop an image to resize.' });
      return;
    }
    if (batchSelectedIds.size === 0) {
      showToast({ type: 'error', title: 'No Formats Selected', message: 'Check at least one target platform.' });
      return;
    }

    setIsProcessingBatch(true);
    try {
      const zip = new JSZip();
      const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
      const selectedList = SOCIAL_PRESETS.filter((p) => batchSelectedIds.has(p.id));

      for (const preset of selectedList) {
        const offscreen = document.createElement('canvas');
        drawToCanvas(offscreen, preset, sourceImage);

        const blob = await new Promise<Blob | null>((resolve) => {
          offscreen.toBlob((b) => resolve(b), exportFormat, exportQuality / 100);
        });

        if (blob) {
          const folderName = preset.platformName.replace(/\s+/g, '_');
          const fileName = `${folderName}/${imageFileName}_${preset.id}_${preset.width}x${preset.height}.${ext}`;
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${imageFileName}-social-media-pack.zip`);

      showToast({
        type: 'success',
        title: 'Batch Pack Created!',
        message: `Saved ${selectedList.length} resized images in a ZIP archive.`,
      });
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.8 } });
    } catch (err) {
      showToast({ type: 'error', title: 'ZIP Generation Failed', message: 'An error occurred during batch resizing.' });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header Controls Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Platform Dimension Studio</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Social Media Image Resizer
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Resize, crop, and optimize graphics for Instagram, Facebook, YouTube, LinkedIn, X, Pinterest & TikTok.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sourceImage && (
              <button
                onClick={() => {
                  setSourceImage(null);
                  setOriginalWidth(0);
                  setOriginalHeight(0);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
            <button
              onClick={handleDownloadSingle}
              disabled={!sourceImage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {activePreset.width}×{activePreset.height}</span>
            </button>
            <button
              onClick={handleBatchZipDownload}
              disabled={!sourceImage || isProcessingBatch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <FileArchive className="w-4 h-4 text-[var(--c-gold)]" />
              <span>{isProcessingBatch ? 'Zipping...' : `Download ${batchSelectedIds.size} as ZIP`}</span>
            </button>
          </div>
        </div>

        {/* Upload Zone if no image loaded */}
        {!sourceImage && (
          <FileUploader
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            label="Drop your photo or banner here"
            description="Supports PNG, JPG, JPEG, and WebP. Processed 100% locally in your browser."
            allowedFormatsText="JPG, PNG, WebP"
            onFilesSelected={handleFileSelect}
          />
        )}

        {/* Stats Overview */}
        {sourceImage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Original Dimensions"
              value={`${originalWidth} × ${originalHeight}`}
              subValue={`Aspect Ratio ${(originalWidth / originalHeight).toFixed(2)}:1`}
            />
            <StatCard
              label="Target Preset"
              value={`${activePreset.width} × ${activePreset.height}`}
              subValue={`${activePreset.platformName} (${activePreset.ratioLabel})`}
              badge="Active"
              badgeType="success"
            />
            <StatCard
              label="Source File Size"
              value={formatFileSize(originalFileSize)}
              subValue={imageFileName}
            />
            <StatCard
              label="Batch Queue"
              value={`${batchSelectedIds.size} Presets`}
              subValue="Ready for 1-click ZIP export"
            />
          </div>
        )}
      </div>

      {/* Main Resizer Workspace (When Image is Loaded) */}
      {sourceImage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Live Interactive Canvas Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[var(--c-border)] text-xs text-[var(--c-muted)]">
                <span className="flex items-center gap-1.5 font-semibold text-[var(--c-text)]">
                  <span>{activePreset.icon}</span>
                  <span>{activePreset.platformName} – {activePreset.name}</span>
                </span>
                <span className="font-mono text-[var(--c-gold)]">
                  {activePreset.width} × {activePreset.height}px ({activePreset.ratioLabel})
                </span>
              </div>

              {/* Canvas Frame */}
              <div className="w-full flex items-center justify-center p-2">
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '520px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
                  }}
                />
              </div>

              <div className="w-full mt-4 pt-3 border-t border-[var(--c-border)] flex items-center justify-between text-xs text-[var(--c-muted)]">
                <span>{activePreset.description}</span>
                <span className="text-[var(--c-gold)] font-medium">Mode: {fitMode}</span>
              </div>
            </div>

            {/* Adjustments Bar (Pan & Zoom) */}
            <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  <span>Position & Scale Tuning</span>
                </span>
                <button
                  onClick={() => {
                    setZoomLevel(100);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Position</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--c-muted)]">
                    <span>Zoom Scale</span>
                    <span className="font-mono text-[var(--c-gold)]">{zoomLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={250}
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-full py-1 cursor-pointer"
                  />
                </div>

                {/* Pan X */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--c-muted)]">
                    <span>Horizontal Offset (Pan X)</span>
                    <span className="font-mono text-[var(--c-gold)]">{panX}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={panX}
                    onChange={(e) => setPanX(Number(e.target.value))}
                    className="w-full py-1 cursor-pointer"
                  />
                </div>

                {/* Pan Y */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--c-muted)]">
                    <span>Vertical Offset (Pan Y)</span>
                    <span className="font-mono text-[var(--c-gold)]">{panY}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={panY}
                    onChange={(e) => setPanY(Number(e.target.value))}
                    className="w-full py-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dimension Presets & Format Settings */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fit Mode Selector */}
            <div className="p-5 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
                Resize Fit Behavior
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'contain-blur', label: 'Contain + Glass Blur', desc: 'No cutoff, blurred side bars' },
                  { id: 'cover', label: 'Cover / Crop Fill', desc: 'Fills target, crops excess' },
                  { id: 'contain-solid', label: 'Contain + Solid BG', desc: 'Solid dark padding' },
                  { id: 'fit', label: 'Stretch / Force Fit', desc: 'Stretches to exact bounds' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFitMode(m.id as ResizeFitMode)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fitMode === m.id
                        ? 'border-[var(--c-gold)] bg-[var(--c-card)] shadow-xs ring-1 ring-[var(--c-gold)]/40'
                        : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)]'
                    }`}
                  >
                    <div className="font-bold text-[var(--c-text)]">{m.label}</div>
                    <div className="text-[10px] text-[var(--c-subtle)] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>

              {fitMode === 'contain-solid' && (
                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs font-semibold text-[var(--c-muted)]">Background Color:</label>
                  <input
                    type="color"
                    value={solidBgColor}
                    onChange={(e) => setSolidBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--c-border)] cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-[var(--c-muted)]">{solidBgColor}</span>
                </div>
              )}
            </div>

            {/* Platform Presets Directory */}
            <div className="p-5 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
                  Social Dimension Presets
                </h3>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-[var(--c-gold)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {batchSelectedIds.size === SOCIAL_PRESETS.length ? 'Deselect All' : 'Select All for ZIP'}
                </button>
              </div>

              {/* Platform Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'instagram', label: 'IG' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'twitter', label: 'X' },
                  { id: 'facebook', label: 'FB' },
                  { id: 'pinterest', label: 'Pinterest' },
                  { id: 'tiktok', label: 'TikTok' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as PlatformCategory)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-[var(--c-gold)] text-[var(--c-bg)]'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {filteredPresets.map((p) => {
                  const isActive = selectedPresetId === p.id;
                  const isChecked = batchSelectedIds.has(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isActive
                          ? 'border-[var(--c-gold)] bg-[var(--c-card)] shadow-xs'
                          : 'border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBatchItem(p.id);
                          }}
                          className="text-[var(--c-gold)] p-0.5 cursor-pointer"
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-[var(--c-subtle)]" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
                            <span>{p.icon}</span>
                            <span>{p.platformName} – {p.name}</span>
                          </div>
                          <div className="text-[11px] text-[var(--c-subtle)] font-mono">
                            {p.width} × {p.height}px ({p.ratioLabel})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPresetId(p.id);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold cursor-pointer ${
                          isActive
                            ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)]'
                            : 'border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                        }`}
                      >
                        {isActive ? 'Previewing' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Format Options */}
            <div className="p-5 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">
                Export File Format & Compression
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/png', label: 'PNG (Lossless)' },
                  { id: 'image/jpeg', label: 'JPG (Optimized)' },
                  { id: 'image/webp', label: 'WebP (Ultra)' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id as any)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      exportFormat === fmt.id
                        ? 'border-[var(--c-gold)] bg-[var(--c-card)] text-[var(--c-text)] ring-1 ring-[var(--c-gold)]/40'
                        : 'border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Resize photos for any social media platform in seconds with ToolBoxX!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="social-media-resizer" />
    </div>
  );
};
