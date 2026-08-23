import React, { useState, useEffect } from 'react';
import { Download, Maximize2, Lock, Unlock, RefreshCw, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { loadImage, resizeImage } from '../../../utils/imageUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

const PRESETS = [
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Instagram Story / Reel', width: 1080, height: 1920 },
  { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { label: 'Full HD 1080p', width: 1920, height: 1080 },
  { label: 'HD 720p', width: 1280, height: 720 },
  { label: 'Square 500×500', width: 500, height: 500 },
  { label: 'Classic 800×600', width: 800, height: 600 },
];

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [format, setFormat] = useState<string>('image/png');
  
  const [resizedDataUrl, setResizedDataUrl] = useState<string>('');
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    try {
      const img = await loadImage(selected);
      setImgElement(img);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setScalePercentage(100);
      setFormat(selected.type === 'image/jpeg' ? 'image/jpeg' : 'image/png');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: 'Failed to load image.' });
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handlePercentageChange = (pct: number) => {
    setScalePercentage(pct);
    if (originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.round((originalWidth * pct) / 100));
      setHeight(Math.round((originalHeight * pct) / 100));
    }
  };

  const applyPreset = (preset: { width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setLockAspectRatio(false);
  };

  useEffect(() => {
    if (!imgElement || width <= 0 || height <= 0) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const { blob, dataUrl } = await resizeImage(imgElement, width, height, format, 0.92);
        if (isMounted) {
          setResizedBlob(blob);
          setResizedDataUrl(dataUrl);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, width, height, format]);

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_${width}x${height}.${ext}`;

    downloadBlob(resizedBlob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Image Downloaded',
      message: `Resized image saved (${width}×${height}px, ${formatFileSize(resizedBlob.size)})`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setImgElement(null);
    setResizedBlob(null);
    setResizedDataUrl('');
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/*"
        allowedFormatsText="JPG, PNG, WebP, SVG, GIF"
        label="Drop an image here to resize"
        description="Change dimensions, crop to social media templates, and resize with aspect ratio lock."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Original Resolution"
          value={`${originalWidth} × ${originalHeight}`}
          subValue={formatFileSize(file.size)}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Target Resolution"
          value={`${width} × ${height}`}
          badge={`${Math.round((width / (originalWidth || 1)) * 100)}%`}
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
        <StatCard
          label="Estimated File Size"
          value={resizedBlob ? formatFileSize(resizedBlob.size) : 'Calculating...'}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Aspect Ratio"
          value={
            originalWidth > 0
              ? `${(originalWidth / (originalHeight || 1)).toFixed(2)}:1`
              : '1:1'
          }
          className="bg-slate-50 dark:bg-slate-800/40"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Resize Controls */}
        <div className="lg:col-span-5 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Dimensions & Presets
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Width & Height Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Custom Dimensions (Pixels)
              </span>
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  lockAspectRatio
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockAspectRatio ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Percentage Scale Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Scale Percentage:
              </label>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {scalePercentage}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={scalePercentage}
              onChange={(e) => handlePercentageChange(Number(e.target.value))}
              className="w-full cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>25%</span>
              <span>50%</span>
              <span>100% (Original)</span>
              <span>150%</span>
              <span>200%</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Popular Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-xl text-left border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {p.label}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.width} × {p.height}px
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Output Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'PNG', val: 'image/png' },
                { label: 'JPG', val: 'image/jpeg' },
                { label: 'WebP', val: 'image/webp' },
              ].map((fmt) => (
                <button
                  key={fmt.val}
                  type="button"
                  onClick={() => setFormat(fmt.val)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    format === fmt.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download CTA */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleDownload}
              disabled={!resizedBlob || isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Resizing...' : `Download Resized Image (${width}×${height})`}
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-indigo-500" />
              Resized Preview ({width} × {height} px)
            </span>
          </div>

          <div className="flex-1 min-h-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/50 p-6 flex items-center justify-center overflow-hidden">
            {resizedDataUrl ? (
              <img
                src={resizedDataUrl}
                alt="Resized preview"
                className="max-h-[380px] max-w-full object-contain rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-800"
              />
            ) : (
              <div className="text-slate-400 text-sm">Rendering preview...</div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="image-resizer"
        onReset={handleReset}
      />
    </div>
  );
};
