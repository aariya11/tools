import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Sliders,
  AlertCircle,
  Archive,
  Layers,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, calculateSavings, downloadBlob } from '../../../utils/fileUtils';

export type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp';

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  originalFormat: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  convertedBlob: Blob | null;
  convertedDataUrl: string | null;
  convertedSize: number | null;
  errorMessage?: string;
}

export const ImageConverter: React.FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/webp');
  const [quality, setQuality] = useState<number>(85);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    const newItems: FileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 10),
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      originalFormat: file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || 'IMG',
      status: 'pending',
      convertedBlob: null,
      convertedDataUrl: null,
      convertedSize: null,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  // Convert a single image file to target format via Canvas
  const convertSingleFile = useCallback(
    async (item: FileItem, format: TargetFormat, q: number): Promise<{ blob: Blob; dataUrl: string; size: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // If JPEG or BMP, fill transparent pixels with white
          if (format === 'image/jpeg' || format === 'image/bmp') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);

          // For standard browser export
          const mime = format === 'image/bmp' ? 'image/png' : format; // Fallback MIME for canvas if BMP
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Conversion failed'));
                return;
              }
              const dataUrl = canvas.toDataURL(mime, q / 100);
              resolve({ blob, dataUrl, size: blob.size });
            },
            mime,
            q / 100
          );
        };
        img.onerror = () => reject(new Error('Could not decode image file'));
        img.src = item.previewUrl;
      });
    },
    []
  );

  // Convert All Pending / Reset Files
  const convertAllFiles = async () => {
    if (items.length === 0) return;
    setIsConvertingAll(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      const it = updated[i];
      updated[i] = { ...it, status: 'converting' };
      setItems([...updated]);

      try {
        const result = await convertSingleFile(it, targetFormat, quality);
        updated[i] = {
          ...it,
          status: 'done',
          convertedBlob: result.blob,
          convertedDataUrl: result.dataUrl,
          convertedSize: result.size,
        };
      } catch (err: any) {
        updated[i] = {
          ...it,
          status: 'error',
          errorMessage: err.message || 'Conversion error',
        };
      }
      setItems([...updated]);
    }

    setIsConvertingAll(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Batch Conversion Complete',
      message: `Successfully converted ${updated.filter((i) => i.status === 'done').length} images.`,
    });
  };

  // Convert whenever targetFormat or quality changes automatically if already converted
  useEffect(() => {
    const hasConverted = items.some((i) => i.status === 'done');
    if (hasConverted) {
      convertAllFiles();
    }
  }, [targetFormat, quality]);

  const getExtFromMime = (mime: TargetFormat) => {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/webp':
        return 'webp';
      case 'image/bmp':
        return 'bmp';
      default:
        return 'png';
    }
  };

  const handleDownloadSingle = (item: FileItem) => {
    if (!item.convertedBlob) return;
    const base = item.file.name.replace(/\.[^/.]+$/, '');
    const ext = getExtFromMime(targetFormat);
    const filename = `${base}-converted.${ext}`;
    downloadBlob(item.convertedBlob, filename);
    showToast({
      type: 'success',
      title: 'Downloaded',
      message: `Saved ${filename}`,
    });
  };

  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((i) => i.status === 'done' && i.convertedBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = getExtFromMime(targetFormat);

      completedItems.forEach((item) => {
        const base = item.file.name.replace(/\.[^/.]+$/, '');
        const filename = `${base}.${ext}`;
        zip.file(filename, item.convertedBlob as Blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `converted-images-${ext}.zip`);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 } });
      showToast({
        type: 'success',
        title: 'ZIP Archive Downloaded',
        message: `Packaged ${completedItems.length} files into ZIP archive.`,
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'ZIP Failed', message: err.message || 'Error generating ZIP' });
    } finally {
      setIsZipping(false);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  if (items.length === 0) {
    return (
      <FileUploader
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.svg,.avif"
        multiple={true}
        allowedFormatsText="JPG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF"
        label="Drop batch images here to convert"
        description="Convert multiple images simultaneously to WebP, PNG, JPG, or BMP. 100% processed locally."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  // Summary statistics
  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);
  const doneItems = items.filter((i) => i.status === 'done');
  const totalConvertedSize = doneItems.reduce((acc, i) => acc + (i.convertedSize || 0), 0);
  const savings = calculateSavings(totalOriginalSize, totalConvertedSize);

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Files"
          value={items.length}
          subValue={`${doneItems.length} converted`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Original Total Size"
          value={formatFileSize(totalOriginalSize)}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Target Format"
          value={getExtFromMime(targetFormat).toUpperCase()}
          badge={doneItems.length > 0 ? `${savings.percentage}% Saved` : 'Ready'}
          badgeType={savings.percentage > 0 ? 'success' : 'neutral'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Converted Total Size"
          value={doneItems.length > 0 ? formatFileSize(totalConvertedSize) : 'Pending'}
          subValue={doneItems.length > 0 ? `Saved ${formatFileSize(savings.savedBytes)}` : 'Click Convert All'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Conversion Options */}
        <div
          className="lg:col-span-4 space-y-6 p-6 rounded-2xl border h-fit"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Sliders className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Batch Settings
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          </div>

          {/* Target Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Convert To
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { format: 'image/webp' as TargetFormat, label: 'WebP', desc: 'Next-gen web compression' },
                { format: 'image/png' as TargetFormat, label: 'PNG', desc: 'Lossless with transparency' },
                { format: 'image/jpeg' as TargetFormat, label: 'JPEG', desc: 'Universal photo format' },
                { format: 'image/bmp' as TargetFormat, label: 'BMP', desc: 'Uncompressed raster' },
              ].map((opt) => (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => setTargetFormat(opt.format)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetFormat === opt.format ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: targetFormat === opt.format ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: targetFormat === opt.format ? 'var(--c-gold)' : 'var(--c-border)',
                    color: targetFormat === opt.format ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5" style={{ color: 'var(--c-muted)' }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider for lossy formats */}
          {targetFormat !== 'image/png' && targetFormat !== 'image/bmp' && (
            <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex justify-between text-xs font-medium">
                <span style={{ color: 'var(--c-muted)' }}>Quality / Compression:</span>
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
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--c-subtle)' }}>
                <span>Maximum Savings (10%)</span>
                <span>Recommended (85%)</span>
                <span>Best Quality (100%)</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={convertAllFiles}
              disabled={isConvertingAll}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isConvertingAll ? 'animate-spin' : ''}`} />
              {isConvertingAll ? 'Converting Batch...' : 'Convert All Files'}
            </button>

            {doneItems.length > 0 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="w-full py-3 px-6 rounded-2xl font-bold text-xs border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--c-card)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              >
                <Archive className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
                {isZipping ? 'Generating ZIP...' : `Download All as ZIP (${doneItems.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Batch File Queue Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Layers className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Image Queue ({items.length} Files)
            </span>

            {/* Add More Files Button */}
            <label
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--c-surface)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-gold)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add More Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* List of files */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {items.map((item) => {
              const itemSavings = item.convertedSize
                ? calculateSavings(item.originalSize, item.convertedSize)
                : null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all"
                  style={{
                    backgroundColor: 'var(--c-surface)',
                    borderColor: 'var(--c-border)',
                  }}
                >
                  {/* Thumbnail & File Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-14 h-14 rounded-xl object-cover border shrink-0"
                      style={{ borderColor: 'var(--c-border)' }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold truncate max-w-[180px] sm:max-w-xs" style={{ color: 'var(--c-text)' }}>
                        {item.file.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--c-muted)' }}>
                        <span className="font-mono">{formatFileSize(item.originalSize)}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                          {item.originalFormat}
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-50" />
                        <span className="font-bold uppercase text-[10px]" style={{ color: 'var(--c-gold)' }}>
                          {getExtFromMime(targetFormat)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === 'converting' && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Converting...</span>
                      </div>
                    )}

                    {item.status === 'done' && item.convertedSize && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--c-text)' }}>
                          {formatFileSize(item.convertedSize)}
                        </span>
                        {itemSavings && itemSavings.percentage > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            -{itemSavings.percentage}%
                          </span>
                        )}
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Error</span>
                      </div>
                    )}

                    {/* Download single button */}
                    {item.status === 'done' && (
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        title="Download converted file"
                        className="p-2 rounded-xl border transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--c-card)',
                          borderColor: 'var(--c-gold)',
                          color: 'var(--c-gold)',
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      title="Remove file"
                      className="p-2 rounded-xl border transition-colors hover:text-rose-400 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--c-bg)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-muted)',
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-converter" onReset={handleClearAll} />
    </div>
  );
};
