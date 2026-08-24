import React, { useState, useEffect } from 'react';
import { Download, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { convertImage } from '../../../utils/imageUtils';
import { formatFileSize, calculateSavings, downloadBlob } from '../../../utils/fileUtils';

export const PngToWebp: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(85);
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
  };

  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    setIsConverting(true);

    const timer = setTimeout(async () => {
      try {
        const result = await convertImage(file, 'image/webp', quality / 100);
        if (isMounted) {
          setConvertedResult(result);
          setIsConverting(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setIsConverting(false);
          showToast({
            type: 'error',
            title: 'Conversion Failed',
            message: err.message || 'Could not convert image to WebP.',
          });
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [file, quality]);

  const handleDownload = () => {
    if (!convertedResult || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.webp`;

    downloadBlob(convertedResult.blob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'WebP Downloaded',
      message: `Saved ${filename} (${formatFileSize(convertedResult.blob.size)})`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setConvertedResult(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/png"
        allowedFormatsText="PNG"
        label="Drop your PNG image here"
        description="Convert PNG graphics to high-efficiency next-gen WebP format with alpha transparency support."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const savings = convertedResult
    ? calculateSavings(file.size, convertedResult.blob.size)
    : { savedBytes: 0, percentage: 0, isReduced: true };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Original PNG Size"
          value={formatFileSize(file.size)}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="WebP Size"
          value={convertedResult ? formatFileSize(convertedResult.blob.size) : 'Optimizing...'}
          badge={savings.percentage > 0 ? `${savings.percentage}% Smaller` : undefined}
          badgeType="success"
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Resolution"
          value={convertedResult ? `${convertedResult.width} × ${convertedResult.height}` : '...'}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quality Settings */}
        <div className="lg:col-span-5 space-y-6 bg-[var(--c-surface)] p-6 rounded-2xl border border-[var(--c-border)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
            <h3 className="font-bold text-base text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              WebP Quality
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-[var(--c-text)]">
                Quality Level:
              </label>
              <span className="font-bold text-[var(--c-gold)]">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full cursor-pointer h-2 bg-[var(--c-card)] rounded-lg appearance-none accent-[var(--c-gold)]"
            />
            <div className="flex justify-between text-[11px] text-[var(--c-subtle)]">
              <span>Maximum Compression (10%)</span>
              <span>Web Optimal (85%)</span>
              <span>Near Lossless (100%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs text-[var(--c-text)] space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-[var(--c-gold)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--c-gold)]" />
              Alpha Transparency Preserved
            </p>
            <p className="text-[var(--c-muted)]">
              Transparent backgrounds in your PNG file will be seamlessly retained in the WebP output.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={!convertedResult || isConverting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            {isConverting ? 'Processing...' : 'Download WebP Image'}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <span className="text-sm font-semibold text-[var(--c-text)]">
            WebP Live Output Preview
          </span>
          <div className="flex-1 min-h-[350px] rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 flex items-center justify-center overflow-hidden">
            {convertedResult ? (
              <img
                src={convertedResult.dataUrl}
                alt="WebP converted preview"
                className="max-h-[300px] max-w-full object-contain rounded-xl shadow-lg border border-[var(--c-border)]"
              />
            ) : (
              <div className="text-[var(--c-subtle)] text-sm">Processing WebP output...</div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="png-to-webp"
        onReset={handleReset}
      />
    </div>
  );
};
