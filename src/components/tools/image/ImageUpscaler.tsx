import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Columns
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

type UpscaleFactor = 2 | 4;
type ViewMode = 'split-slider' | 'side-by-side' | 'upscaled' | 'original';

export const ImageUpscaler: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Settings
  const [scaleFactor, setScaleFactor] = useState<UpscaleFactor>(2);
  const [sharpness, setSharpness] = useState<number>(45); // 0 - 100%
  const [noiseReduction, setNoiseReduction] = useState<number>(30); // 0 - 100%
  const [enhanceDetails, setEnhanceDetails] = useState<boolean>(true);

  // Status & output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [upscaledDataUrl, setUpscaledDataUrl] = useState<string>('');
  const [upscaledBlob, setUpscaledBlob] = useState<Blob | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split-slider');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setUpscaledDataUrl('');
    setUpscaledBlob(null);
    setZoomLevel(1);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // High-Resolution Super-Sampling & Unsharp Mask Enhancement Pipeline
  const runUpscaling = useCallback(async () => {
    if (!imageSrc || !originalDimensions.width) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });

      const srcW = originalDimensions.width;
      const srcH = originalDimensions.height;
      const targetW = srcW * scaleFactor;
      const targetH = srcH * scaleFactor;

      let curCanvas = document.createElement('canvas');
      curCanvas.width = srcW;
      curCanvas.height = srcH;
      let curCtx = curCanvas.getContext('2d')!;
      curCtx.drawImage(img, 0, 0);

      const steps = scaleFactor === 4 ? [2, 4] : [2];

      for (const step of steps) {
        const nextW = srcW * step;
        const nextH = srcH * step;
        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = nextW;
        nextCanvas.height = nextH;
        const nextCtx = nextCanvas.getContext('2d')!;

        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.drawImage(curCanvas, 0, 0, nextW, nextH);

        curCanvas = nextCanvas;
        curCtx = nextCtx;
      }

      if (sharpness > 0 || noiseReduction > 0 || enhanceDetails) {
        const imgData = curCtx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const copy = new Uint8ClampedArray(data);

        const sharpAmount = (sharpness / 100) * 1.6;
        const noiseFactor = noiseReduction / 100;

        for (let y = 1; y < targetH - 1; y++) {
          const rowOffset = y * targetW * 4;
          const upOffset = (y - 1) * targetW * 4;
          const downOffset = (y + 1) * targetW * 4;

          for (let x = 1; x < targetW - 1; x++) {
            const idx = rowOffset + x * 4;
            const leftIdx = rowOffset + (x - 1) * 4;
            const rightIdx = rowOffset + (x + 1) * 4;
            const topIdx = upOffset + x * 4;
            const bottomIdx = downOffset + x * 4;

            for (let c = 0; c < 3; c++) {
              const currentVal = copy[idx + c];
              const neighborAvg = (copy[topIdx + c] + copy[bottomIdx + c] + copy[leftIdx + c] + copy[rightIdx + c]) * 0.25;

              const diff = currentVal - neighborAvg;

              let effectiveDiff = diff;
              if (noiseFactor > 0 && Math.abs(diff) < 15 * noiseFactor) {
                effectiveDiff = diff * (1 - noiseFactor);
              }

              let newVal = currentVal + effectiveDiff * sharpAmount;

              if (enhanceDetails) {
                const norm = (newVal - 128) / 128;
                newVal += norm * 6;
              }

              data[idx + c] = Math.max(0, Math.min(255, newVal));
            }
          }
        }

        curCtx.putImageData(imgData, 0, 0);
      }

      curCanvas.toBlob((blob) => {
        if (blob) {
          setUpscaledBlob(blob);
          setUpscaledDataUrl(curCanvas.toDataURL('image/png'));
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (err: any) {
      setIsProcessing(false);
      showToast({ type: 'error', title: 'Upscaling Error', message: err.message || 'Failed to upscale image' });
    }
  }, [imageSrc, originalDimensions, scaleFactor, sharpness, noiseReduction, enhanceDetails]);

  useEffect(() => {
    if (!originalDimensions.width) return;
    const timer = setTimeout(() => {
      runUpscaling();
    }, 120);
    return () => clearTimeout(timer);
  }, [runUpscaling, originalDimensions]);

  const handleSliderPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingSlider.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSliderPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSlider.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleSliderPointerUp = (e: React.PointerEvent) => {
    if (isDraggingSlider.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingSlider.current = false;
    }
  };

  const handleDownload = () => {
    if (!upscaledBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-${scaleFactor}x-upscaled.png`;

    downloadBlob(upscaledBlob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'High-Res Image Downloaded',
      message: `Saved as ${filename} (${originalDimensions.width * scaleFactor}×${originalDimensions.height * scaleFactor}px, ${formatFileSize(upscaledBlob.size)})`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setUpscaledDataUrl('');
    setUpscaledBlob(null);
    setOriginalDimensions({ width: 0, height: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop your image here to upscale"
        description="Super-sample images to 2x or 4x high resolution with unsharp mask clarity. Processed locally in your browser."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const targetWidth = originalDimensions.width * scaleFactor;
  const targetHeight = originalDimensions.height * scaleFactor;
  const originalMegapixels = ((originalDimensions.width * originalDimensions.height) / 1000000).toFixed(2);
  const targetMegapixels = ((targetWidth * targetHeight) / 1000000).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Original Resolution"
          value={`${originalDimensions.width} × ${originalDimensions.height}`}
          subValue={`${originalMegapixels} Megapixels`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Upscaled Resolution"
          value={`${targetWidth} × ${targetHeight}`}
          badge={`${scaleFactor}× Super-Sampling`}
          badgeType="success"
          subValue={`${targetMegapixels} Megapixels (${scaleFactor * scaleFactor}x pixels)`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Sharpness Boost"
          value={`${sharpness}%`}
          subValue="Unsharp Mask Filter"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Status"
          value={isProcessing ? 'Enhancing...' : 'Ready'}
          badge={isProcessing ? 'Processing' : '100% Crisp'}
          badgeType={isProcessing ? 'warning' : 'success'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings */}
        <div
          className="lg:col-span-4 space-y-6 p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Upscale Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Scale Factor Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Upscale Resolution
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { factor: 2 as UpscaleFactor, label: '2× Ultra HD', desc: 'Double resolution (4x pixel density)' },
                { factor: 4 as UpscaleFactor, label: '4× Super-Res', desc: 'Quadruple resolution (16x pixel density)' },
              ].map((opt) => (
                <button
                  key={opt.factor}
                  type="button"
                  onClick={() => setScaleFactor(opt.factor)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    scaleFactor === opt.factor ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: scaleFactor === opt.factor ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: scaleFactor === opt.factor ? 'var(--c-gold)' : 'var(--c-border)',
                    color: scaleFactor === opt.factor ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[11px] opacity-75 mt-0.5" style={{ color: 'var(--c-muted)' }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sharpness Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span style={{ color: 'var(--c-muted)' }}>Unsharp Mask Edge Sharpness:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sharpness}
              onChange={(e) => setSharpness(Number(e.target.value))}
              className="w-full cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--c-subtle)' }}>
              <span>Soft (0%)</span>
              <span>Balanced (45%)</span>
              <span>High Clarity (100%)</span>
            </div>
          </div>

          {/* Noise Suppression */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span style={{ color: 'var(--c-muted)' }}>Artifact & Noise Suppression:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--c-gold)' }}>{noiseReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={noiseReduction}
              onChange={(e) => setNoiseReduction(Number(e.target.value))}
              className="w-full cursor-pointer h-2 rounded-lg"
            />
          </div>

          {/* Micro Contrast & Vibrance Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enhanceDetails}
                onChange={(e) => setEnhanceDetails(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0"
              />
              <span className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>
                Enhance Fine Micro-Details & Contrast
              </span>
            </label>
          </div>

          {/* Download CTA Button */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownload}
              disabled={isProcessing || !upscaledBlob}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Upscaling Image...' : `Download ${scaleFactor}× Upscaled Image`}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Before/After Comparison */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex bg-[var(--c-surface)] p-1 rounded-xl text-xs font-semibold border" style={{ borderColor: 'var(--c-border)' }}>
              <button
                type="button"
                onClick={() => setViewMode('split-slider')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'split-slider' ? 'shadow-xs' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'split-slider' ? 'var(--c-card)' : 'transparent',
                  color: viewMode === 'split-slider' ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'side-by-side' ? 'shadow-xs' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'side-by-side' ? 'var(--c-card)' : 'transparent',
                  color: viewMode === 'side-by-side' ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                Side by Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('upscaled')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'upscaled' ? 'shadow-xs' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'upscaled' ? 'var(--c-card)' : 'transparent',
                  color: viewMode === 'upscaled' ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                Upscaled Only
              </button>
            </div>

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
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
                className="p-1.5 rounded-lg border text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Viewport */}
          <div
            ref={containerRef}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            className="flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative select-none"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            {isProcessing && (
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 rounded-2xl"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>
                    Generating {scaleFactor}× Super-Sampled Image...
                  </span>
                </div>
              </div>
            )}

            {/* Split Slider View */}
            {viewMode === 'split-slider' && upscaledDataUrl && (
              <div
                className="relative max-h-[500px] max-w-full overflow-hidden rounded-xl shadow-lg inline-block transition-transform duration-75"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Background: Upscaled Sharp Image */}
                <img
                  src={upscaledDataUrl}
                  alt="Upscaled View"
                  className="max-h-[480px] max-w-full block object-contain"
                  draggable={false}
                />

                {/* Foreground Clipped: Original Image */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={imageSrc}
                    alt="Original View"
                    className="max-h-[480px] max-w-none block object-contain"
                    style={{
                      width: containerRef.current?.querySelector('img')?.clientWidth || '100%',
                      height: containerRef.current?.querySelector('img')?.clientHeight || '100%',
                    }}
                    draggable={false}
                  />
                </div>

                {/* Draggable Divider Line & Handle */}
                <div
                  onPointerDown={handleSliderPointerDown}
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-black shadow-lg flex items-center justify-center -translate-x-1/2">
                    <Columns className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold bg-black/75 text-white pointer-events-none">
                  Original ({originalDimensions.width}×{originalDimensions.height})
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/90 text-black pointer-events-none">
                  {scaleFactor}× Upscaled ({targetWidth}×{targetHeight})
                </div>
              </div>
            )}

            {/* Side by Side View */}
            {viewMode === 'side-by-side' && upscaledDataUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                  <span className="text-xs font-semibold mb-2" style={{ color: 'var(--c-muted)' }}>
                    Original ({originalDimensions.width} × {originalDimensions.height} px)
                  </span>
                  <img src={imageSrc} alt="Original" className="max-h-72 object-contain rounded-lg shadow-sm" />
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-gold)' }}>
                  <span className="text-xs font-semibold mb-2" style={{ color: 'var(--c-gold)' }}>
                    {scaleFactor}× Upscaled ({targetWidth} × {targetHeight} px)
                  </span>
                  <img src={upscaledDataUrl} alt="Upscaled" className="max-h-72 object-contain rounded-lg shadow-sm" />
                </div>
              </div>
            )}

            {/* Upscaled Only View */}
            {viewMode === 'upscaled' && upscaledDataUrl && (
              <div
                className="flex items-center justify-center transition-transform duration-75"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img src={upscaledDataUrl} alt="Upscaled Result" className="max-h-[480px] object-contain rounded-xl shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-upscaler" onReset={handleReset} />
    </div>
  );
};
