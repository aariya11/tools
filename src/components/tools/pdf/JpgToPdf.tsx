import React, { useState } from 'react';
import { Download, ArrowUp, ArrowDown, Trash2, FileText, CheckCircle2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { imagesToPdf } from '../../../utils/pdfUtils';
import { loadImage } from '../../../utils/imageUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

interface ImageItem {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

export const JpgToPdf: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(20);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = [];
    for (const f of files) {
      try {
        const img = await loadImage(f);
        const dataUrl = URL.createObjectURL(f);
        newItems.push({
          file: f,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch (err) {
        // skip unreadable
      }
    }
    setImages((prev) => [...prev, ...newItems]);
    setPdfBytes(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPdfBytes(null);
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const bytes = await imagesToPdf(images, { orientation, margin });
      setPdfBytes(bytes);
      setIsConverting(false);

      showToast({
        type: 'success',
        title: 'PDF Created',
        message: `Converted ${images.length} images into a PDF document (${formatFileSize(bytes.byteLength)}).`,
      });
    } catch (err: any) {
      setIsConverting(false);
      showToast({
        type: 'error',
        title: 'Conversion Error',
        message: err.message || 'Failed to create PDF.',
      });
    }
  };

  const handleDownload = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, 'toolboxx_converted_document.pdf');

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'PDF Downloaded',
      message: 'Saved document to your device.',
    });
  };

  const handleReset = () => {
    setImages([]);
    setPdfBytes(null);
  };

  const totalImageSize = images.reduce((acc, img) => acc + img.file.size, 0);

  return (
    <div className="space-y-8">
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple={true}
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop images here to convert to PDF"
        description="Select single or multiple photos to combine into an organized PDF document."
        onFilesSelected={handleFilesSelected}
      />

      {images.length > 0 && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Selected Images"
              value={`${images.length} Photos`}
              className="bg-[var(--c-surface)] border-[var(--c-border)]"
            />
            <StatCard
              label="Total Image Size"
              value={formatFileSize(totalImageSize)}
              className="bg-[var(--c-surface)] border-[var(--c-border)]"
            />
            <StatCard
              label="PDF Output"
              value={pdfBytes ? formatFileSize(pdfBytes.byteLength) : 'Ready to convert'}
              badge={pdfBytes ? 'Ready' : undefined}
              badgeType="success"
              className="bg-[var(--c-surface)] border-[var(--c-border)]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Layout Settings & Convert Button */}
            <div className="lg:col-span-4 space-y-6 bg-[var(--c-surface)] p-6 rounded-2xl border border-[var(--c-border)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
                <h3 className="font-bold text-base text-[var(--c-text)] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
                  PDF Page Layout
                </h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              {/* Page Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--c-subtle)] block">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto-Fit' },
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'landscape', label: 'Landscape' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOrientation(o.id as any)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        orientation === o.id
                          ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] shadow-xs'
                          : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Margins */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--c-subtle)] block">
                  Page Margin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'None (0px)' },
                    { val: 20, label: 'Small (20px)' },
                    { val: 40, label: 'Large (40px)' },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setMargin(m.val)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        margin === m.val
                          ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] shadow-xs'
                          : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convert / Download CTA */}
              <div className="pt-4 border-t border-[var(--c-border)]">
                {!pdfBytes ? (
                  <button
                    onClick={handleConvertToPdf}
                    disabled={isConverting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    {isConverting ? 'Generating PDF...' : `Convert ${images.length} Images to PDF`}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>PDF Document Ready!</span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Images List */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-sm font-semibold text-[var(--c-text)]">
                Image Sequence ({images.length})
              </span>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {images.map((item, idx) => (
                  <div
                    key={`${item.file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={item.dataUrl}
                        alt="Thumbnail"
                        className="w-10 h-10 object-cover rounded-lg border border-[var(--c-border)] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--c-text)] truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] text-[var(--c-subtle)]">
                          {item.width} × {item.height}px • {formatFileSize(item.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-[var(--c-muted)] hover:text-[var(--c-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === images.length - 1}
                        className="p-1.5 rounded-lg text-[var(--c-muted)] hover:text-[var(--c-text)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="jpg-to-pdf"
        onReset={handleReset}
      />
    </div>
  );
};
