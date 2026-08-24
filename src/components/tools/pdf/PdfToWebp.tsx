import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  Archive,
  Eye,
  Sliders,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface RenderedWebpPage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
}

export const PdfToWebp: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [renderedPages, setRenderedPages] = useState<RenderedWebpPage[]>([]);

  // Quality & Scale Settings
  const [quality, setQuality] = useState<number>(85); // 10% to 100%
  const [scaleDpi, setScaleDpi] = useState<number>(1.5); // 1.0x, 1.5x, 2.0x
  const [backgroundMode, setBackgroundMode] = useState<'white' | 'transparent'>('white');

  // Selection & Modal
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewModalPage, setPreviewModalPage] = useState<RenderedWebpPage | null>(null);

  const startRenderPipeline = async (
    selectedFile: File,
    qVal: number,
    scale: number,
    bg: 'white' | 'transparent'
  ) => {
    setIsRendering(true);
    setRenderedPages([]);
    setSelectedPages(new Set());

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total });

      const pagesList: RenderedWebpPage[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress({ current: i, total });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        if (bg === 'white') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        await (page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        } as any) as any).promise;

        const webpQualityRatio = Math.max(0.1, Math.min(1.0, qVal / 100));
        const dataUrl = canvas.toDataURL('image/webp', webpQualityRatio);
        const blob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b || new Blob()), 'image/webp', webpQualityRatio)
        );

        pagesList.push({
          pageNumber: i,
          dataUrl,
          blob,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: blob.size,
        });
      }

      setRenderedPages(pagesList);
      setSelectedPages(new Set(pagesList.map((p) => p.pageNumber)));

      confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } });
      showToast({
        type: 'success',
        title: 'PDF Converted to WebP',
        message: `Rendered ${pagesList.length} pages into lightweight WebP format.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Rendering Error',
        message: err.message || 'Failed to render PDF pages into WebP.',
      });
    } finally {
      setIsRendering(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    startRenderPipeline(selected, quality, scaleDpi, backgroundMode);
  };

  const handleReRender = () => {
    if (!file) return;
    startRenderPipeline(file, quality, scaleDpi, backgroundMode);
  };

  const totalWebpBytes = useMemo(() => {
    return renderedPages.reduce((acc, p) => acc + p.sizeBytes, 0);
  }, [renderedPages]);

  const toggleSelectPage = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPages(new Set(renderedPages.map((p) => p.pageNumber)));
  };

  const handleDeselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleDownloadSingle = (page: RenderedWebpPage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadBlob(page.blob, `${baseName}_page_${page.pageNumber}.webp`);
  };

  const handleDownloadZip = async (onlySelected: boolean = false) => {
    if (!file || renderedPages.length === 0) return;

    const targetPages = onlySelected
      ? renderedPages.filter((p) => selectedPages.has(p.pageNumber))
      : renderedPages;

    if (targetPages.length === 0) {
      showToast({
        type: 'info',
        title: 'No Pages Selected',
        message: 'Please select at least one page to download.',
      });
      return;
    }

    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');

    targetPages.forEach((p) => {
      zip.file(`${baseName}_page_${p.pageNumber}.webp`, p.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `${baseName}_all_pages_webp.zip`);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'ZIP Downloaded',
      message: `Saved ${targetPages.length} WebP images into archive.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setRenderedPages([]);
    setSelectedPages(new Set());
    setPreviewModalPage(null);
    setProgress({ current: 0, total: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to convert to Modern WebP"
        description="Render PDF pages to ultra-lightweight WebP graphics with custom compression slider and batch ZIP export."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Document Name"
          value={file.name}
          subValue={formatFileSize(file.size)}
          icon={<FileText className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="WebP Quality"
          value={`${quality}%`}
          subValue={`${scaleDpi}x Resolution`}
          icon={<Zap className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total WebP Size"
          value={isRendering ? '...' : formatFileSize(totalWebpBytes)}
          badge={totalWebpBytes > 0 ? 'Optimized' : undefined}
          badgeType="success"
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Pages Rendered"
          value={isRendering ? `${progress.current}/${progress.total}` : `${renderedPages.length} Pages`}
          badge={renderedPages.length > 0 ? 'Ready' : undefined}
          badgeType="success"
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Controls & Quality Sliders */}
      <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
            <h3 className="text-sm font-semibold text-[var(--c-text)]">WebP Compression & Settings</h3>
          </div>

          <button
            onClick={handleReRender}
            disabled={isRendering}
            className="py-1.5 px-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-[var(--c-gold)] text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-apply Compression
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--c-muted)]">
              <span className="font-medium text-[var(--c-text)]">WebP Compression Quality</span>
              <span className="font-mono text-[var(--c-gold)] font-bold">{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--c-subtle)]">
              <span>Smaller file</span>
              <span>Balanced (85%)</span>
              <span>Max Quality</span>
            </div>
          </div>

          {/* Scale Resolution */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--c-text)]">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1x (Fast)', val: 1.0 },
                { label: '1.5x (HD)', val: 1.5 },
                { label: '2x (Ultra)', val: 2.0 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setScaleDpi(item.val)}
                  className={`py-2 text-center rounded-xl text-xs font-medium border transition ${
                    scaleDpi === item.val
                      ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold'
                      : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--c-text)]">
              Background Color
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBackgroundMode('white')}
                className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition ${
                  backgroundMode === 'white'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold'
                    : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setBackgroundMode('transparent')}
                className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition ${
                  backgroundMode === 'transparent'
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)] font-bold'
                    : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                Transparent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gallery */}
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c-text)]">
            <Eye className="w-4 h-4 text-[var(--c-gold)]" />
            <span>WebP Page Gallery ({renderedPages.length} Pages)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="py-1.5 px-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs font-medium transition"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="py-1.5 px-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs font-medium transition"
            >
              Clear
            </button>

            {renderedPages.length > 0 && (
              <button
                onClick={() => handleDownloadZip(false)}
                className="py-1.5 px-4 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1.5 transition"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Download All (ZIP)</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isRendering && (
          <div className="p-12 text-center bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] space-y-4">
            <div className="w-10 h-10 border-3 border-[var(--c-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-[var(--c-text)]">Encoding PDF Pages to WebP...</h4>
              <p className="text-xs text-[var(--c-muted)] mt-1">
                Processing page {progress.current} of {progress.total}
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!isRendering && renderedPages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderedPages.map((page) => {
              const isSelected = selectedPages.has(page.pageNumber);
              return (
                <div
                  key={page.pageNumber}
                  className={`rounded-2xl border bg-[var(--c-card)] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                    isSelected ? 'border-[var(--c-gold)] ring-1 ring-[var(--c-gold)]' : 'border-[var(--c-border)]'
                  }`}
                >
                  <div className="p-3 bg-[var(--c-surface)] border-b border-[var(--c-border)] flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectPage(page.pageNumber)}
                        className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                      />
                      <span className="font-semibold text-[var(--c-text)]">Page {page.pageNumber}</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {formatFileSize(page.sizeBytes)}
                    </span>
                  </div>

                  <div
                    onClick={() => setPreviewModalPage(page)}
                    className="relative p-4 flex items-center justify-center bg-[var(--c-surface)]/50 min-h-[200px] cursor-pointer group"
                  >
                    <img
                      src={page.dataUrl}
                      alt={`WebP page ${page.pageNumber}`}
                      className="max-h-48 object-contain rounded shadow-sm group-hover:scale-[1.02] transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                      <span className="py-1 px-3 rounded-lg bg-[var(--c-card)]/90 text-[var(--c-text)] text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Preview
                      </span>
                    </div>
                  </div>

                  <div className="p-3 border-t border-[var(--c-border)] space-y-2">
                    <div className="text-[11px] text-[var(--c-muted)] text-center">
                      {page.width} × {page.height} px
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(page)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-black border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download WebP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleReset}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 py-1 px-2"
          >
            <RefreshCw className="w-3 h-3" /> Convert Another PDF
          </button>

          {selectedPages.size > 0 && (
            <button
              onClick={() => handleDownloadZip(true)}
              className="py-2.5 px-5 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 flex items-center gap-1.5 transition"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedPages.size}) as ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewModalPage && (
        <div
          onClick={() => setPreviewModalPage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
              <div className="text-xs font-semibold text-[var(--c-text)]">
                Page {previewModalPage.pageNumber} • {previewModalPage.width} × {previewModalPage.height} px (
                {formatFileSize(previewModalPage.sizeBytes)})
              </div>
              <button
                onClick={() => setPreviewModalPage(null)}
                className="p-1 rounded-lg text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-[var(--c-surface)] rounded-xl overflow-hidden min-h-[300px]">
              <img
                src={previewModalPage.dataUrl}
                alt="Page WebP Full Preview"
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewModalPage(null)}
                className="py-2 px-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadSingle(previewModalPage)}
                className="py-2 px-5 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download WebP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="pdf-to-jpg" onReset={handleReset} />
    </div>
  );
};
