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
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="WebP Size"
          value={convertedResult ? formatFileSize(convertedResult.blob.size) : 'Optimizing...'}
          badge={savings.percentage > 0 ? `${savings.percentage}% Smaller` : undefined}
          badgeType="success"
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
        <StatCard
          label="Resolution"
          value={convertedResult ? `${convertedResult.width} × ${convertedResult.height}` : '...'}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quality Settings */}
        <div className="lg:col-span-5 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              WebP Quality
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quality Level:
              </label>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
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
              className="w-full cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Maximum Compression (10%)</span>
              <span>Web Optimal (85%)</span>
              <span>Near Lossless (100%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Alpha Transparency Preserved
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Transparent backgrounds in your PNG file will be seamlessly retained in the WebP output.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={!convertedResult || isConverting}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Download className="w-5 h-5" />
            {isConverting ? 'Processing...' : 'Download WebP Image'}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            WebP Live Output Preview
          </span>
          <div className="flex-1 min-h-[350px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/50 p-6 flex items-center justify-center overflow-hidden">
            {convertedResult ? (
              <img
                src={convertedResult.dataUrl}
                alt="WebP converted preview"
                className="max-h-[300px] max-w-full object-contain rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-800"
              />
            ) : (
              <div className="text-slate-400 text-sm">Processing WebP output...</div>
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
