import React, { useState } from 'react';
import { Download, RefreshCw, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg, extractPdfPages } from '../../../utils/pdfUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const PdfExtract: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderedPages, setRenderedPages] = useState<{ pageNumber: number; dataUrl: string; blob: Blob }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedBytes, setExtractedBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setRenderedPages([]);
    setSelectedPages([]);
    setExtractedBytes(null);
    setIsRendering(true);

    try {
      const pages = await renderPdfToJpg(selected, 1.0);
      setRenderedPages(pages);
      // Select first page by default
      if (pages.length > 0) {
        setSelectedPages([1]);
      }
      setIsRendering(false);
    } catch (err: any) {
      setIsRendering(false);
      showToast({
        type: 'error',
        title: 'Rendering Failed',
        message: err.message || 'Could not load PDF pages.',
      });
    }
  };

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
    setExtractedBytes(null);
  };

  const selectAll = () => {
    setSelectedPages(renderedPages.map((p) => p.pageNumber));
    setExtractedBytes(null);
  };

  const deselectAll = () => {
    setSelectedPages([]);
    setExtractedBytes(null);
  };

  const invertSelection = () => {
    setSelectedPages(
      renderedPages
        .map((p) => p.pageNumber)
        .filter((p) => !selectedPages.includes(p))
    );
    setExtractedBytes(null);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) {
      showToast({ type: 'info', title: 'Select Pages', message: 'Please select at least 1 page to extract.' });
      return;
    }

    setIsExtracting(true);
    try {
      const bytes = await extractPdfPages(file, selectedPages);
      setExtractedBytes(bytes);
      setIsExtracting(false);

      showToast({
        type: 'success',
        title: 'Pages Extracted',
        message: `Extracted ${selectedPages.length} pages (${formatFileSize(bytes.byteLength)}).`,
      });
    } catch (err: any) {
      setIsExtracting(false);
      showToast({
        type: 'error',
        title: 'Extraction Error',
        message: err.message || 'Failed to extract selected pages.',
      });
    }
  };

  const handleDownload = () => {
    if (!extractedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const filename = `${baseName}_extracted_pages_${selectedPages.join('_')}.pdf`;

    const blob = new Blob([extractedBytes], { type: 'application/pdf' });
    downloadBlob(blob, filename);

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Extracted PDF Saved',
      message: `Downloaded ${filename}`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setRenderedPages([]);
    setSelectedPages([]);
    setExtractedBytes(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to extract pages"
        description="Visually click and select exact pages to compile into a new PDF document."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Document"
          value={file.name}
          subValue={formatFileSize(file.size)}
          className="bg-slate-50 dark:bg-slate-800/40 truncate"
        />
        <StatCard
          label="Total Pages"
          value={`${renderedPages.length} Pages`}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Selected to Extract"
          value={`${selectedPages.length} of ${renderedPages.length}`}
          badge={selectedPages.length > 0 ? 'Selected' : undefined}
          badgeType="success"
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
      </div>

      {/* Main Workspace */}
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-indigo-400"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-indigo-400"
            >
              Deselect All
            </button>
            <button
              onClick={invertSelection}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-indigo-400"
            >
              Invert Selection
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Choose Another PDF
            </button>

            {!extractedBytes ? (
              <button
                onClick={handleExtract}
                disabled={selectedPages.length === 0 || isExtracting}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-98"
              >
                <CheckSquare className="w-4 h-4" />
                {isExtracting ? 'Extracting...' : `Extract (${selectedPages.length}) Pages`}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                Download Extracted PDF
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isRendering && (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Generating interactive page thumbnails...</p>
          </div>
        )}

        {/* Interactive Page Thumbnails */}
        {!isRendering && renderedPages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {renderedPages.map((page) => {
              const isSelected = selectedPages.includes(page.pageNumber);
              return (
                <div
                  key={page.pageNumber}
                  onClick={() => togglePage(page.pageNumber)}
                  className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden p-2 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 text-xs font-bold">
                    <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                      Page {page.pageNumber}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                    )}
                  </div>

                  <div className="my-1.5 flex items-center justify-center min-h-[140px] bg-slate-100 dark:bg-slate-950 rounded-lg p-1">
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="max-h-32 object-contain rounded shadow-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="pdf-extract"
        onReset={handleReset}
      />
    </div>
  );
};
