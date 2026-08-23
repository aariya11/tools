import React, { useState, useEffect } from 'react';
import { Download, Sliders, RefreshCw, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { compressImage } from '../../../utils/imageUtils';
import { formatFileSize, calculateSavings, downloadBlob } from '../../../utils/fileUtils';

export const ImageCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(75);
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [targetFormat, setTargetFormat] = useState<'original' | 'image/jpeg' | 'image/webp' | 'image/png'>('original');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedResult, setCompressedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState<'split' | 'original' | 'compressed'>('split');

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setOriginalDataUrl(url);
  };

  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const format =
          targetFormat === 'original'
            ? file.type === 'image/png'
              ? 'image/png'
              : 'image/jpeg'
            : targetFormat;

        const result = await compressImage(file, {
          quality: quality / 100,
          maxWidth: maxDimension === 0 ? undefined : maxDimension,
          maxHeight: maxDimension === 0 ? undefined : maxDimension,
          format: format as any,
        });

        if (isMounted) {
          setCompressedResult(result);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setIsProcessing(false);
          showToast({
            type: 'error',
            title: 'Compression Error',
            message: err.message || 'Failed to compress image.',
          });
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [file, quality, maxDimension, targetFormat]);

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const ext =
      targetFormat === 'image/webp'
        ? 'webp'
        : targetFormat === 'image/png'
        ? 'png'
        : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-compressed.${ext}`;

    downloadBlob(compressedResult.blob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Image Downloaded',
      message: `Saved as ${filename} (${formatFileSize(compressedResult.compressedSize)})`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setOriginalDataUrl('');
    setCompressedResult(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop your image here to compress"
        description="Supports JPG, PNG, and WebP up to 50MB. 100% processed locally on your device."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const savings = compressedResult
    ? calculateSavings(compressedResult.originalSize, compressedResult.compressedSize)
    : { savedBytes: 0, percentage: 0, isReduced: true };

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      {compressedResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Original Size"
            value={formatFileSize(compressedResult.originalSize)}
            className="bg-slate-50 dark:bg-slate-800/40"
          />
          <StatCard
            label="Compressed Size"
            value={formatFileSize(compressedResult.compressedSize)}
            badge={isProcessing ? 'Optimizing...' : `${savings.percentage}% Saved`}
            badgeType={savings.percentage > 0 ? 'success' : 'neutral'}
            className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
          />
          <StatCard
            label="Storage Saved"
            value={formatFileSize(savings.savedBytes)}
            className="bg-slate-50 dark:bg-slate-800/40"
          />
          <StatCard
            label="Resolution"
            value={`${compressedResult.width} × ${compressedResult.height}`}
            className="bg-slate-50 dark:bg-slate-800/40"
          />
        </div>
      )}

      {/* Controls & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Compression Controls */}
        <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quality:
              </label>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Smaller Size (5%)</span>
              <span>Balanced (75%)</span>
              <span>Best Quality (95%)</span>
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Output Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Auto (JPG)', val: 'image/jpeg' },
                { label: 'WebP', val: 'image/webp' },
                { label: 'PNG', val: 'image/png' },
              ].map((fmt) => (
                <button
                  key={fmt.val}
                  type="button"
                  onClick={() => setTargetFormat(fmt.val as any)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    targetFormat === fmt.val || (targetFormat === 'original' && fmt.val === 'image/jpeg')
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Dimension */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Max Dimension:
            </label>
            <select
              value={maxDimension}
              onChange={(e) => setMaxDimension(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">Original Dimensions (No scale down)</option>
              <option value="3840">4K Ultra HD (3840px max)</option>
              <option value="2560">2K QHD (2560px max)</option>
              <option value="1920">Full HD (1920px max - Recommended)</option>
              <option value="1280">HD (1280px max)</option>
              <option value="800">Web Banner (800px max)</option>
            </select>
          </div>

          {/* Download Button CTA */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleDownload}
              disabled={!compressedResult || isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Compressing...' : 'Download Compressed Image'}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Comparison & Preview */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              Live Preview
            </span>

            {/* Preview Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPreviewMode('split')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewMode === 'split'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setPreviewMode('original')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewMode === 'original'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setPreviewMode('compressed')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewMode === 'compressed'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Compressed
              </button>
            </div>
          </div>

          {/* Preview Canvas Container */}
          <div className="flex-1 min-h-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/50 p-4 flex items-center justify-center overflow-hidden">
            {previewMode === 'split' && compressedResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 mb-2">
                    Original ({formatFileSize(compressedResult.originalSize)})
                  </span>
                  <img
                    src={originalDataUrl}
                    alt="Original Preview"
                    className="max-h-64 object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Compressed ({formatFileSize(compressedResult.compressedSize)})
                  </span>
                  <img
                    src={compressedResult.dataUrl}
                    alt="Compressed Preview"
                    className="max-h-64 object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            {previewMode === 'original' && (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={originalDataUrl}
                  alt="Original Preview"
                  className="max-h-[360px] object-contain rounded-xl shadow-md"
                />
              </div>
            )}

            {previewMode === 'compressed' && compressedResult && (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={compressedResult.dataUrl}
                  alt="Compressed Preview"
                  className="max-h-[360px] object-contain rounded-xl shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Completion Recommended Tools */}
      <PostCompletionRecommendations
        currentToolId="image-compressor"
        onReset={handleReset}
      />
    </div>
  );
};
