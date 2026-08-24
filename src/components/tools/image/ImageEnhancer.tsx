import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sliders,
  Download,
  RefreshCw,
  Eye,
  RotateCcw,
  Sun,
  Contrast,
  Droplets,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  warmth: number;
  exposure: number;
  highlights: number;
  shadows: number;
  vignette: number;
  sepia: number;
  grayscale: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  warmth: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  sepia: 0,
  grayscale: 0,
};

interface Preset {
  id: string;
  name: string;
  badge?: string;
  adjustments: Adjustments;
}

const PRESETS: Preset[] = [
  { id: 'original', name: 'Original', adjustments: { ...DEFAULT_ADJUSTMENTS } },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    badge: 'Popular',
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 20, saturation: 35, warmth: 10, sharpness: 25 },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    badge: 'Film',
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 25, warmth: 15, shadows: -15, vignette: 25, sharpness: 20 },
  },
  {
    id: 'vintage',
    name: 'Vintage 70s',
    adjustments: { ...DEFAULT_ADJUSTMENTS, sepia: 35, contrast: -10, warmth: 25, vignette: 30, saturation: -10 },
  },
  {
    id: 'bw-contrast',
    name: 'B&W Dynamic',
    adjustments: { ...DEFAULT_ADJUSTMENTS, grayscale: 100, contrast: 40, sharpness: 20, brightness: 5 },
  },
  {
    id: 'hdr',
    name: 'Dramatic HDR',
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 30, sharpness: 45, saturation: 20, highlights: -20, shadows: 25 },
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    adjustments: { ...DEFAULT_ADJUSTMENTS, warmth: 55, saturation: 25, exposure: 10, contrast: 15 },
  },
  {
    id: 'nordic',
    name: 'Cool Nordic',
    adjustments: { ...DEFAULT_ADJUSTMENTS, warmth: -40, contrast: 15, saturation: -15, sharpness: 20 },
  },
  {
    id: 'noir',
    name: 'Film Noir',
    adjustments: { ...DEFAULT_ADJUSTMENTS, grayscale: 100, contrast: 65, shadows: -30, vignette: 50 },
  },
];

export const ImageEnhancer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [activePreset, setActivePreset] = useState<string>('original');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(92);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setActivePreset('original');
    setZoomLevel(1);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      sourceImageRef.current = img;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply Adjustments onto Canvas in Real-Time
  const renderCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, currentAdjustments: Adjustments) => {
      const img = sourceImageRef.current;
      if (!img) return;

      const { width, height } = img;
      targetCanvas.width = width;
      targetCanvas.height = height;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      // Base CSS filters on context
      const bVal = 100 + currentAdjustments.brightness;
      const cVal = 100 + currentAdjustments.contrast;
      const sVal = 100 + currentAdjustments.saturation;
      const sepVal = currentAdjustments.sepia;
      const grayVal = currentAdjustments.grayscale;

      ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%) sepia(${sepVal}%) grayscale(${grayVal}%)`;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.filter = 'none';

      const needsPixelPass =
        currentAdjustments.warmth !== 0 ||
        currentAdjustments.exposure !== 0 ||
        currentAdjustments.highlights !== 0 ||
        currentAdjustments.shadows !== 0 ||
        currentAdjustments.sharpness > 0 ||
        currentAdjustments.vignette > 0;

      if (needsPixelPass) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const copy = new Uint8ClampedArray(data);

        const expMult = Math.pow(2, currentAdjustments.exposure / 50);
        const warmR = (currentAdjustments.warmth / 100) * 25;
        const warmB = -(currentAdjustments.warmth / 100) * 25;
        const hlFactor = currentAdjustments.highlights / 100;
        const shFactor = currentAdjustments.shadows / 100;

        const sharpK = (currentAdjustments.sharpness / 100) * 0.4;
        const cx = width / 2;
        const cy = height / 2;
        const maxRadius = Math.sqrt(cx * cx + cy * cy);
        const vigIntensity = currentAdjustments.vignette / 100;

        for (let y = 0; y < height; y++) {
          const rowOffset = y * width * 4;
          const dy = y - cy;

          for (let x = 0; x < width; x++) {
            const idx = rowOffset + x * 4;
            const dx = x - cx;

            // Exposure & Warmth
            let r = data[idx] * expMult + warmR;
            let g = data[idx + 1] * expMult;
            let b = data[idx + 2] * expMult + warmB;

            // Highlights & Shadows
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 128 && hlFactor !== 0) {
              const highlightWeight = (lum - 128) / 127;
              r += highlightWeight * hlFactor * 30;
              g += highlightWeight * hlFactor * 30;
              b += highlightWeight * hlFactor * 30;
            } else if (lum <= 128 && shFactor !== 0) {
              const shadowWeight = (128 - lum) / 128;
              r += shadowWeight * shFactor * 30;
              g += shadowWeight * shFactor * 30;
              b += shadowWeight * shFactor * 30;
            }

            // Sharpness pass
            if (sharpK > 0 && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
              const leftIdx = idx - 4;
              const rightIdx = idx + 4;
              const topIdx = idx - width * 4;
              const botIdx = idx + width * 4;

              const rLap = copy[idx] * 5 - (copy[leftIdx] + copy[rightIdx] + copy[topIdx] + copy[botIdx]);
              const gLap = copy[idx + 1] * 5 - (copy[leftIdx + 1] + copy[rightIdx + 1] + copy[topIdx + 1] + copy[botIdx + 1]);
              const bLap = copy[idx + 2] * 5 - (copy[leftIdx + 2] + copy[rightIdx + 2] + copy[topIdx + 2] + copy[botIdx + 2]);

              r = r * (1 - sharpK) + rLap * sharpK;
              g = g * (1 - sharpK) + gLap * sharpK;
              b = b * (1 - sharpK) + bLap * sharpK;
            }

            // Vignette shading
            if (vigIntensity > 0) {
              const dist = Math.sqrt(dx * dx + dy * dy) / maxRadius;
              const vFactor = Math.max(0, 1 - Math.pow(dist, 1.8) * vigIntensity * 0.9);
              r *= vFactor;
              g *= vFactor;
              b *= vFactor;
            }

            data[idx] = Math.max(0, Math.min(255, r));
            data[idx + 1] = Math.max(0, Math.min(255, g));
            data[idx + 2] = Math.max(0, Math.min(255, b));
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
    },
    []
  );

  useEffect(() => {
    if (!canvasRef.current || !sourceImageRef.current) return;
    const effAdjustments = isComparing ? DEFAULT_ADJUSTMENTS : adjustments;
    renderCanvas(canvasRef.current, effAdjustments);
  }, [adjustments, isComparing, naturalSize, renderCanvas]);

  const handlePresetSelect = (preset: Preset) => {
    setActivePreset(preset.id);
    setAdjustments({ ...preset.adjustments });
  };

  const updateAdjustment = (key: keyof Adjustments, value: number) => {
    setActivePreset('custom');
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetAll = () => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setActivePreset('original');
    showToast({ type: 'info', title: 'Reset', message: 'All adjustments restored to default.' });
  };

  const handleDownload = async () => {
    if (!sourceImageRef.current || !file) return;
    setIsProcessing(true);

    try {
      const exportCanvas = document.createElement('canvas');
      renderCanvas(exportCanvas, adjustments);

      exportCanvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (!blob) {
            showToast({ type: 'error', title: 'Export Failed', message: 'Could not export enhanced image.' });
            return;
          }

          const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const filename = `${baseName}-enhanced.${ext}`;

          downloadBlob(blob, filename);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
          showToast({
            type: 'success',
            title: 'Enhanced Image Downloaded',
            message: `Saved as ${filename} (${naturalSize.width}×${naturalSize.height}px, ${formatFileSize(blob.size)})`,
          });
        },
        outputFormat,
        outputFormat === 'image/png' ? undefined : quality / 100
      );
    } catch (err: any) {
      setIsProcessing(false);
      showToast({ type: 'error', title: 'Export Error', message: err.message || 'Failed to export image' });
    }
  };

  const handleResetFile = () => {
    setFile(null);
    setImageSrc('');
    setNaturalSize({ width: 0, height: 0 });
    sourceImageRef.current = null;
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop your image here to enhance"
        description="Fine-tune lighting, colors, sharpness, and warmth with real-time browser rendering."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const isAdjusted = Object.keys(adjustments).some(
    (k) => adjustments[k as keyof Adjustments] !== DEFAULT_ADJUSTMENTS[k as keyof Adjustments]
  );

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Resolution"
          value={`${naturalSize.width} × ${naturalSize.height}`}
          subValue="pixels"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Active Preset"
          value={PRESETS.find((p) => p.id === activePreset)?.name || 'Custom'}
          badge={isAdjusted ? 'Enhanced' : 'Untouched'}
          badgeType={isAdjusted ? 'success' : 'neutral'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Sharpness"
          value={`${adjustments.sharpness}%`}
          subValue="High-pass filter"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Source Size"
          value={formatFileSize(file.size)}
          subValue={file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders & Controls */}
        <div
          className="lg:col-span-4 space-y-5 p-6 rounded-2xl border max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Sliders className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Enhance Controls
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetAll}
                disabled={!isAdjusted}
                className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer disabled:opacity-40"
                style={{ color: 'var(--c-gold)' }}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={handleResetFile}
                className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
                style={{ color: 'var(--c-muted)' }}
              >
                <RefreshCw className="w-3 h-3" /> Change File
              </button>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Style Presets
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer truncate ${
                      isActive ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--c-card)' : 'var(--c-bg)',
                      borderColor: isActive ? 'var(--c-gold)' : 'var(--c-border)',
                      color: isActive ? 'var(--c-gold)' : 'var(--c-text)',
                    }}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lighting Sliders */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Sun className="w-3.5 h-3.5" /> Lighting & Exposure
            </span>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Brightness:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => updateAdjustment('brightness', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Contrast:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => updateAdjustment('contrast', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Exposure:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.exposure}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.exposure}
                onChange={(e) => updateAdjustment('exposure', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Highlights Recovery:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.highlights}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.highlights}
                onChange={(e) => updateAdjustment('highlights', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Shadows */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Shadows Boost:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.shadows}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.shadows}
                onChange={(e) => updateAdjustment('shadows', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Color & Tone Sliders */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Droplets className="w-3.5 h-3.5" /> Color & Vibrance
            </span>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Saturation:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => updateAdjustment('saturation', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Warmth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Warmth / Temperature:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>
                  {adjustments.warmth > 0 ? `+${adjustments.warmth} Warm` : adjustments.warmth < 0 ? `${adjustments.warmth} Cool` : '0 Neutral'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.warmth}
                onChange={(e) => updateAdjustment('warmth', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Sepia */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Sepia Tone:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sepia}
                onChange={(e) => updateAdjustment('sepia', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Grayscale */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Grayscale:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.grayscale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.grayscale}
                onChange={(e) => updateAdjustment('grayscale', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Detail & Effects */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Zap className="w-3.5 h-3.5" /> Detail & Vignette
            </span>

            {/* Sharpness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Clarity / Sharpness:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.sharpness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => updateAdjustment('sharpness', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Vignette:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{adjustments.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.vignette}
                onChange={(e) => updateAdjustment('vignette', Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Export Format & Quality */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'JPEG', val: 'image/jpeg' },
                { label: 'PNG', val: 'image/png' },
                { label: 'WebP', val: 'image/webp' },
              ].map((fmt) => (
                <button
                  key={fmt.val}
                  type="button"
                  onClick={() => setOutputFormat(fmt.val as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    outputFormat === fmt.val ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: outputFormat === fmt.val ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: outputFormat === fmt.val ? 'var(--c-gold)' : 'var(--c-border)',
                    color: outputFormat === fmt.val ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {outputFormat !== 'image/png' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--c-muted)' }}>Export Quality:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Download CTA Button */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Processing Export...' : 'Download Enhanced Image'}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Preview Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Eye className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Live Filter Preview
            </span>

            <div className="flex items-center gap-3">
              {/* Hold to Compare Original Button */}
              <button
                type="button"
                onMouseDown={() => setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onTouchStart={() => setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                  isComparing ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: isComparing ? 'var(--c-card)' : 'var(--c-surface)',
                  borderColor: isComparing ? 'var(--c-gold)' : 'var(--c-border)',
                  color: isComparing ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                <Contrast className="w-3.5 h-3.5" />
                {isComparing ? 'Showing Original' : 'Hold to View Original'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg border text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono px-1" style={{ color: 'var(--c-subtle)' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg border text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Viewport */}
          <div
            className="flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            {isComparing && (
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold shadow-md z-20"
                style={{ backgroundColor: 'var(--c-card)', color: 'var(--c-gold)', border: '1px solid var(--c-gold)' }}
              >
                Original (Untouched)
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="max-h-[500px] max-w-full block rounded-lg shadow-lg object-contain transition-transform duration-75"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-enhancer" onReset={handleResetFile} />
    </div>
  );
};
