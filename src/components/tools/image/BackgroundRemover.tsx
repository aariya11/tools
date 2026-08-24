import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Download,
  Pipette,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type RemovalMode = 'color-key' | 'luminance';
type PreviewBg = 'checkerboard' | 'white' | 'dark' | 'magenta' | 'custom';

export const BackgroundRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Processing settings
  const [mode, setMode] = useState<RemovalMode>('color-key');
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState<number>(30); // 0 - 100
  const [feather, setFeather] = useState<number>(10); // 0 - 50
  const [spillSuppression, setSpillSuppression] = useState<number>(20); // 0 - 100
  const [luminanceThreshold, setLuminanceThreshold] = useState<number>(200); // 0 - 255
  const [invertMask, setInvertMask] = useState<boolean>(false);

  // UI state
  const [isPipetteActive, setIsPipetteActive] = useState<boolean>(false);
  const [previewBg, setPreviewBg] = useState<PreviewBg>('checkerboard');
  const [customBgColor, setCustomBgColor] = useState<string>('#3B82F6');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setIsPipetteActive(false);
    setZoomLevel(1);
  };

  // Load image and initialize canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        originalCanvasRef.current = canvas;

        // Auto-sample top-left corner pixel as initial target color
        const pixelData = ctx.getImageData(0, 0, 1, 1).data;
        setTargetColor({ r: pixelData[0], g: pixelData[1], b: pixelData[2] });
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Main Background Removal Processing Algorithm
  const processRemoval = useCallback(() => {
    if (!originalCanvasRef.current || !originalDimensions.width) return;
    setIsProcessing(true);

    const origCanvas = originalCanvasRef.current;
    const { width, height } = originalDimensions;

    const origCtx = origCanvas.getContext('2d');
    if (!origCtx) return;

    const imgData = origCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outCtx = outputCanvas.getContext('2d');
    if (!outCtx) return;

    const outImgData = outCtx.createImageData(width, height);
    const outData = outImgData.data;

    const targetR = targetColor.r;
    const targetG = targetColor.g;
    const targetB = targetColor.b;

    // Normalization scale for tolerance: Euclidean distance max ~ 441.67
    const maxDist = 441.67;
    const tolDist = (tolerance / 100) * maxDist;
    const featherDist = (feather / 100) * maxDist;
    const spillFactor = spillSuppression / 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) {
        outData[i] = 0;
        outData[i + 1] = 0;
        outData[i + 2] = 0;
        outData[i + 3] = 0;
        continue;
      }

      if (mode === 'color-key') {
        // Euclidean RGB distance
        const dr = r - targetR;
        const dg = g - targetG;
        const db = b - targetB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        let alphaFactor = 1;
        if (dist <= tolDist) {
          alphaFactor = 0;
        } else if (dist < tolDist + featherDist && featherDist > 0) {
          // Smooth Hermite / Linear interpolation for soft anti-aliased edge
          const t = (dist - tolDist) / featherDist;
          alphaFactor = t * t * (3 - 2 * t);
        } else {
          alphaFactor = 1;
        }

        if (invertMask) {
          alphaFactor = 1 - alphaFactor;
        }

        // Color spill suppression on semi-transparent transition borders
        let finalR = r;
        let finalG = g;
        let finalB = b;

        if (spillFactor > 0 && alphaFactor < 1 && alphaFactor > 0) {
          finalR = Math.round(r * (1 - spillFactor) + (targetR > 128 ? 0 : 255) * spillFactor * 0.2);
          finalG = Math.round(g * (1 - spillFactor) + (targetG > 128 ? 0 : 255) * spillFactor * 0.2);
          finalB = Math.round(b * (1 - spillFactor) + (targetB > 128 ? 0 : 255) * spillFactor * 0.2);
        }

        outData[i] = finalR;
        outData[i + 1] = finalG;
        outData[i + 2] = finalB;
        outData[i + 3] = Math.round(a * alphaFactor);
      } else {
        // Luminance Thresholding
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        let alphaFactor = 1;

        const softBand = feather * 1.5;
        if (invertMask) {
          // Keep light, remove dark
          if (lum < luminanceThreshold - softBand) {
            alphaFactor = 0;
          } else if (lum <= luminanceThreshold + softBand && softBand > 0) {
            alphaFactor = (lum - (luminanceThreshold - softBand)) / (2 * softBand);
          } else {
            alphaFactor = 1;
          }
        } else {
          // Remove light, keep dark
          if (lum > luminanceThreshold + softBand) {
            alphaFactor = 0;
          } else if (lum >= luminanceThreshold - softBand && softBand > 0) {
            alphaFactor = 1 - (lum - (luminanceThreshold - softBand)) / (2 * softBand);
          } else {
            alphaFactor = 1;
          }
        }

        outData[i] = r;
        outData[i + 1] = g;
        outData[i + 2] = b;
        outData[i + 3] = Math.round(a * Math.max(0, Math.min(1, alphaFactor)));
      }
    }

    outCtx.putImageData(outImgData, 0, 0);

    // Generate output blob and data URL
    outputCanvas.toBlob((blob) => {
      if (blob) {
        setProcessedBlob(blob);
        setPreviewDataUrl(outputCanvas.toDataURL('image/png'));
      }
      setIsProcessing(false);
    }, 'image/png');
  }, [originalDimensions, mode, targetColor, tolerance, feather, spillSuppression, luminanceThreshold, invertMask]);

  // Trigger processing with slight debounce
  useEffect(() => {
    if (!originalCanvasRef.current) return;
    const timer = setTimeout(() => {
      processRemoval();
    }, 80);
    return () => clearTimeout(timer);
  }, [processRemoval]);

  // Handle color sampling directly from preview canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPipetteActive || !originalCanvasRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * originalDimensions.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * originalDimensions.height);

    const origCtx = originalCanvasRef.current.getContext('2d');
    if (!origCtx) return;

    const pixel = origCtx.getImageData(
      Math.max(0, Math.min(originalDimensions.width - 1, x)),
      Math.max(0, Math.min(originalDimensions.height - 1, y)),
      1,
      1
    ).data;

    setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setIsPipetteActive(false);
    showToast({
      type: 'info',
      title: 'Target Color Selected',
      message: `Sampled RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
    });
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-no-bg.png`;

    downloadBlob(processedBlob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Transparent PNG Downloaded',
      message: `Saved as ${filename} with alpha transparency.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setProcessedBlob(null);
    setPreviewDataUrl('');
    setOriginalDimensions({ width: 0, height: 0 });
    originalCanvasRef.current = null;
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/png,image/jpeg,image/webp,image/jpg"
        allowedFormatsText="PNG, JPG, WebP"
        label="Drop your image here to remove background"
        description="Extract transparent cutouts with smooth alpha edge feathering. 100% private in-browser processing."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const targetHex = `#${((1 << 24) + (targetColor.r << 16) + (targetColor.g << 8) + targetColor.b).toString(16).slice(1)}`;

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Image Dimensions"
          value={`${originalDimensions.width} × ${originalDimensions.height}`}
          subValue="pixels"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Removal Mode"
          value={mode === 'color-key' ? 'Color Keying' : 'Luminance'}
          badge={mode === 'color-key' ? `${tolerance}% Tol` : `${luminanceThreshold} Lum`}
          badgeType="success"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Edge Feathering"
          value={`${feather} px`}
          subValue="Smooth anti-aliased alpha"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Output Format"
          value="PNG 32-bit"
          subValue="Full Alpha Transparency"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings Panel */}
        <div
          className="lg:col-span-4 space-y-6 p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Scissors className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Removal Controls
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Keying Algorithm
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('color-key')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mode === 'color-key' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: mode === 'color-key' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: mode === 'color-key' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: mode === 'color-key' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                Color Key / Chroma
              </button>
              <button
                type="button"
                onClick={() => setMode('luminance')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mode === 'luminance' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: mode === 'luminance' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: mode === 'luminance' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: mode === 'luminance' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                High Contrast / Ink
              </button>
            </div>
          </div>

          {/* Color Keying Specific Controls */}
          {mode === 'color-key' ? (
            <div className="space-y-4">
              {/* Target Color Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                    Background Color to Remove
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPipetteActive((p) => !p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPipetteActive ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: isPipetteActive ? 'var(--c-gold)' : 'var(--c-bg)',
                      borderColor: 'var(--c-gold)',
                      color: isPipetteActive ? 'var(--c-bg)' : 'var(--c-gold)',
                    }}
                  >
                    <Pipette className="w-3.5 h-3.5" />
                    {isPipetteActive ? 'Click Image to Pick' : 'Eyedropper'}
                  </button>
                </div>

                {/* Color Preset Palette Swatches */}
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="w-9 h-9 rounded-xl border shadow-inner flex items-center justify-center shrink-0"
                    style={{ backgroundColor: targetHex, borderColor: 'var(--c-border)' }}
                    title={`Current: ${targetHex}`}
                  />

                  <div className="grid grid-cols-4 gap-1.5 flex-1">
                    {[
                      { name: 'White', r: 255, g: 255, b: 255, bg: '#FFFFFF' },
                      { name: 'Black', r: 0, g: 0, b: 0, bg: '#000000' },
                      { name: 'Green', r: 0, g: 255, b: 0, bg: '#00FF00' },
                      { name: 'Blue', r: 0, g: 100, b: 255, bg: '#0064FF' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setTargetColor({ r: preset.r, g: preset.g, b: preset.b })}
                        className="h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.r + preset.g + preset.b > 380 ? '#000000' : '#FFFFFF',
                          borderColor: 'var(--c-border)',
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tolerance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Color Tolerance:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--c-subtle)' }}>
                  <span>Strict Match (0%)</span>
                  <span>Balanced (30%)</span>
                  <span>Aggressive (100%)</span>
                </div>
              </div>

              {/* Feathering / Edge Softness Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Edge Feathering / Softness:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{feather} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>

              {/* Color Spill Suppression */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Edge Spill Suppression:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{spillSuppression}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={spillSuppression}
                  onChange={(e) => setSpillSuppression(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            </div>
          ) : (
            /* Luminance Controls */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Luminance Cutoff:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{luminanceThreshold} / 255</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={luminanceThreshold}
                  onChange={(e) => setLuminanceThreshold(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--c-subtle)' }}>
                  <span>Dark Shadows (0)</span>
                  <span>Midtones (128)</span>
                  <span>Bright Highlights (255)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Edge Softness:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{feather} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Invert Mask Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={invertMask}
                onChange={(e) => setInvertMask(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0"
              />
              <span className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>
                Invert Cutout (Keep Background, Erase Subject)
              </span>
            </label>
          </div>

          {/* Preview Background Selection */}
          <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Preview Background
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'checkerboard', label: 'Grid' },
                { id: 'white', label: 'White' },
                { id: 'dark', label: 'Dark' },
                { id: 'magenta', label: 'Pink' },
                { id: 'custom', label: 'Color' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setPreviewBg(bg.id as PreviewBg)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    previewBg === bg.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: previewBg === bg.id ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: previewBg === bg.id ? 'var(--c-gold)' : 'var(--c-border)',
                    color: previewBg === bg.id ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {previewBg === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono" style={{ color: 'var(--c-muted)' }}>
                  {customBgColor.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Download CTA */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownload}
              disabled={isProcessing || !processedBlob}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Removing Background...' : 'Download Transparent PNG'}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Preview Area */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Eye className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Live Transparent Canvas Preview
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg border text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono" style={{ color: 'var(--c-subtle)' }}>
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

          {/* Interactive Preview Viewport */}
          <div
            className={`flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative ${
              isPipetteActive ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{
              backgroundColor:
                previewBg === 'white'
                  ? '#FFFFFF'
                  : previewBg === 'dark'
                  ? 'var(--c-bg)'
                  : previewBg === 'magenta'
                  ? '#FF00FF'
                  : previewBg === 'custom'
                  ? customBgColor
                  : undefined,
              backgroundImage:
                previewBg === 'checkerboard'
                  ? 'linear-gradient(45deg, rgba(128,128,128,0.15) 25%, transparent 25%), linear-gradient(-45deg, rgba(128,128,128,0.15) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.15) 75%), linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.15) 75%)'
                  : undefined,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              borderColor: 'var(--c-border)',
            }}
          >
            {isPipetteActive && (
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-lg z-20 animate-pulse"
                style={{ backgroundColor: 'var(--c-card)', borderColor: 'var(--c-gold)', color: 'var(--c-gold)' }}
              >
                <Pipette className="w-4 h-4" />
                Click anywhere on the image below to select background color
              </div>
            )}

            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Cutout Preview"
                onClick={handleCanvasClick as any}
                className="max-h-[480px] max-w-full block rounded-lg object-contain shadow-md transition-transform duration-75"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs" style={{ color: 'var(--c-muted)' }}>Computing alpha channel...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="background-remover" onReset={handleReset} />
    </div>
  );
};
