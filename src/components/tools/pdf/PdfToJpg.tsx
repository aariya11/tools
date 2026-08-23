import React, { useState } from 'react';
import { Download, RefreshCw, Archive, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const PdfToJpg: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [renderedPages, setRenderedPages] = useState<{ pageNumber: number; dataUrl: string; blob: Blob }[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setRenderedPages([]);
    setIsRendering(true);

    try {
      const pages = await renderPdfToJpg(selected, 1.5, (current, total) => {
        setProgress({ current, total });
      });

      setRenderedPages(pages);
      setIsRendering(false);
      showToast({
        type: 'success',
        title: 'PDF Converted',
        message: `Rendered ${pages.length} pages to high-res JPG.`,
      });
    } catch (err: any) {
      setIsRendering(false);
      showToast({
        type: 'error',
        title: 'Conversion Error',
        message: err.message || 'Failed to render PDF pages.',
      });
    }
  };

  const handleDownloadSingle = (pageNumber: number, blob: Blob) => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadBlob(blob, `${baseName}_page_${pageNumber}.jpg`);
  };

  const handleDownloadAllZip = async () => {
    if (renderedPages.length === 0 || !file) return;

    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');

    renderedPages.forEach((p) => {
      zip.file(`${baseName}_page_${p.pageNumber}.jpg`, p.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `${baseName}_all_pages_jpg.zip`);

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'ZIP Downloaded',
      message: `Saved all ${renderedPages.length} pages.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setRenderedPages([]);
    setProgress({ current: 0, total: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to convert to JPG"
        description="Convert every PDF page into high-resolution JPG images with preview gallery."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="PDF Name"
          value={file.name}
          subValue={formatFileSize(file.size)}
          className="bg-slate-50 dark:bg-slate-800/40 truncate"
        />
        <StatCard
          label="Pages Rendered"
          value={
            isRendering
              ? `${progress.current} of ${progress.total || '...'}`
              : `${renderedPages.length} Pages`
          }
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Status"
          value={isRendering ? 'Rendering...' : 'Ready'}
          badge={renderedPages.length > 0 ? 'High-DPI' : undefined}
          badgeType="success"
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
      </div>

      {/* Main Workspace */}
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Rendered Page Gallery ({renderedPages.length})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Convert Another
            </button>

            {renderedPages.length > 0 && (
              <button
                onClick={handleDownloadAllZip}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
              >
                <Archive className="w-4 h-4" /> Download All (ZIP)
              </button>
            )}
          </div>
        </div>

        {/* Loading Progress State */}
        {isRendering && (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Rendering PDF Pages...
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Processing page {progress.current} of {progress.total}
              </p>
            </div>
          </div>
        )}

        {/* Rendered Thumbnails Grid */}
        {!isRendering && renderedPages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Page {page.pageNumber}</span>
                  <span className="text-[11px] text-slate-400">
                    {formatFileSize(page.blob.size)}
                  </span>
                </div>

                <div className="p-4 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/50 min-h-[220px]">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-56 object-contain rounded-md shadow-sm border border-slate-200/60 dark:border-slate-800"
                  />
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleDownloadSingle(page.pageNumber, page.blob)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JPG
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="pdf-to-jpg"
        onReset={handleReset}
      />
    </div>
  );
};
