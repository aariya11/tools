import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Archive,
  Eye,
  RefreshCw,
  X,
  Layers,
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

interface ExtractedImage {
  id: string;
  pageNumber: number;
  type: 'embedded' | 'render';
  format: 'png' | 'jpg';
  width: number;
  height: number;
  dataUrl: string;
  blob: Blob;
  sizeBytes: number;
}

export const PdfExtractImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [images, setImages] = useState<ExtractedImage[]>([]);

  // Filtering & Selection
  const [filterType, setFilterType] = useState<'all' | 'embedded' | 'render'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewModalImage, setPreviewModalImage] = useState<ExtractedImage | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setImages([]);
    setSelectedIds(new Set());
    setIsExtracting(true);

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });

      const extractedList: ExtractedImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i, total: totalPages });
        const page = await pdf.getPage(i);

        // 1. Scan and Extract Embedded Image Assets from Operators
        try {
          const ops = await page.getOperatorList();
          const imgObjNames: string[] = [];

          for (let opIdx = 0; opIdx < ops.fnArray.length; opIdx++) {
            const fn = ops.fnArray[opIdx];
            if (
              fn === pdfjsLib.OPS.paintImageXObject ||
              fn === pdfjsLib.OPS.paintInlineImageXObject ||
              fn === pdfjsLib.OPS.paintImageMaskXObject
            ) {
              const args = ops.argsArray[opIdx];
              if (args && args[0]) {
                imgObjNames.push(args[0]);
              }
            }
          }

          // Process unique image objects found on page
          const uniqueNames = Array.from(new Set(imgObjNames));
          for (let uIdx = 0; uIdx < uniqueNames.length; uIdx++) {
            const name = uniqueNames[uIdx];
            try {
              const imgObj = await new Promise<any>((resolve) => {
                page.objs.get(name, (obj: any) => resolve(obj));
              });

              if (imgObj && (imgObj.data || imgObj.bitmap)) {
                const width = imgObj.width || 400;
                const height = imgObj.height || 300;

                const c = document.createElement('canvas');
                c.width = width;
                c.height = height;
                const ctx = c.getContext('2d');

                if (ctx) {
                  if (imgObj.bitmap) {
                    ctx.drawImage(imgObj.bitmap, 0, 0, width, height);
                  } else if (imgObj.data) {
                    const imgData = ctx.createImageData(width, height);
                    const srcData = imgObj.data;
                    const totalPixels = width * height;

                    if (srcData.length === totalPixels * 4) {
                      imgData.data.set(srcData);
                    } else if (srcData.length === totalPixels * 3) {
                      // RGB to RGBA
                      for (let p = 0, s = 0; p < imgData.data.length; p += 4, s += 3) {
                        imgData.data[p] = srcData[s];
                        imgData.data[p + 1] = srcData[s + 1];
                        imgData.data[p + 2] = srcData[s + 2];
                        imgData.data[p + 3] = 255;
                      }
                    } else if (srcData.length === totalPixels) {
                      // Grayscale to RGBA
                      for (let p = 0, s = 0; p < imgData.data.length; p += 4, s += 1) {
                        const v = srcData[s];
                        imgData.data[p] = v;
                        imgData.data[p + 1] = v;
                        imgData.data[p + 2] = v;
                        imgData.data[p + 3] = 255;
                      }
                    }
                    ctx.putImageData(imgData, 0, 0);
                  }

                  const dataUrl = c.toDataURL('image/png');
                  const blob: Blob = await new Promise((res) =>
                    c.toBlob((b) => res(b || new Blob()), 'image/png')
                  );

                  extractedList.push({
                    id: `embedded_p${i}_${uIdx + 1}`,
                    pageNumber: i,
                    type: 'embedded',
                    format: 'png',
                    width,
                    height,
                    dataUrl,
                    blob,
                    sizeBytes: blob.size,
                  });
                }
              }
            } catch (err) {
              console.warn(`Failed extracting object ${name} on page ${i}:`, err);
            }
          }
        } catch (opErr) {
          console.warn(`Operator error on page ${i}:`, opErr);
        }

        // 2. High-Res Visual Render Snapshot for every page (2x / 144 DPI)
        try {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            await (page.render({
              canvasContext: ctx,
              viewport,
              canvas,
            } as any) as any).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
            const blob: Blob = await new Promise((res) =>
              canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.94)
            );

            extractedList.push({
              id: `render_page_${i}`,
              pageNumber: i,
              type: 'render',
              format: 'jpg',
              width: canvas.width,
              height: canvas.height,
              dataUrl,
              blob,
              sizeBytes: blob.size,
            });
          }
        } catch (renderErr) {
          console.warn(`Render error on page ${i}:`, renderErr);
        }
      }

      setImages(extractedList);
      // Select all by default
      setSelectedIds(new Set(extractedList.map((img) => img.id)));

      confetti({ particleCount: 90, spread: 60, origin: { y: 0.7 } });
      showToast({
        type: 'success',
        title: 'Extraction Complete',
        message: `Extracted ${extractedList.length} total image assets across ${totalPages} pages.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Extraction Error',
        message: err.message || 'Failed to extract images from PDF.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredImages = images.filter((img) => {
    if (filterType === 'embedded') return img.type === 'embedded';
    if (filterType === 'render') return img.type === 'render';
    return true;
  });

  const toggleSelectImage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredImages.map((img) => img.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDownloadSingle = (image: ExtractedImage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const filename = `${baseName}_p${image.pageNumber}_${image.type}_${image.width}x${image.height}.${image.format}`;
    downloadBlob(image.blob, filename);
  };

  const handleDownloadZip = async (onlySelected: boolean = false) => {
    if (!file || images.length === 0) return;

    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');
    const targetImages = onlySelected
      ? images.filter((img) => selectedIds.has(img.id))
      : filteredImages;

    if (targetImages.length === 0) {
      showToast({
        type: 'info',
        title: 'No Images Selected',
        message: 'Please select at least one image to download.',
      });
      return;
    }

    targetImages.forEach((img, idx) => {
      const filename = `${baseName}_p${img.pageNumber}_${img.type}_${idx + 1}.${img.format}`;
      zip.file(filename, img.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `${baseName}_extracted_images.zip`);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'ZIP Downloaded',
      message: `Saved ${targetImages.length} images into archive.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setImages([]);
    setSelectedIds(new Set());
    setPreviewModalImage(null);
    setProgress({ current: 0, total: 0 });
  };

  const embeddedCount = images.filter((i) => i.type === 'embedded').length;
  const renderCount = images.filter((i) => i.type === 'render').length;

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to Extract Images"
        description="Extract embedded photos, graphics, vector diagrams, and high-resolution page renders from your PDF into a gallery or ZIP."
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
          label="Embedded Assets"
          value={isExtracting ? '...' : `${embeddedCount} Assets`}
          icon={<ImageIcon className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="High-Res Page Renders"
          value={isExtracting ? '...' : `${renderCount} Pages`}
          icon={<Layers className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Images"
          value={isExtracting ? `${progress.current}/${progress.total}` : `${images.length} Ready`}
          badge={images.length > 0 ? 'Extracted' : undefined}
          badgeType="success"
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="space-y-6">
        {/* Gallery Filter & Action Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)]">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition border ${
                filterType === 'all'
                  ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              All Images ({images.length})
            </button>

            <button
              onClick={() => setFilterType('embedded')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition border ${
                filterType === 'embedded'
                  ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              Embedded Assets ({embeddedCount})
            </button>

            <button
              onClick={() => setFilterType('render')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition border ${
                filterType === 'render'
                  ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              Page Renders ({renderCount})
            </button>
          </div>

          {/* Bulk Download Actions */}
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

            {images.length > 0 && (
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

        {/* Loading Progress State */}
        {isExtracting && (
          <div className="p-12 text-center bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] space-y-4">
            <div className="w-10 h-10 border-3 border-[var(--c-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-[var(--c-text)]">Extracting Images from PDF...</h4>
              <p className="text-xs text-[var(--c-muted)] mt-1">
                Scanning page {progress.current} of {progress.total}
              </p>
            </div>
          </div>
        )}

        {/* Image Grid */}
        {!isExtracting && filteredImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((img) => {
              const isSelected = selectedIds.has(img.id);
              return (
                <div
                  key={img.id}
                  className={`rounded-2xl border bg-[var(--c-card)] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                    isSelected ? 'border-[var(--c-gold)] ring-1 ring-[var(--c-gold)]' : 'border-[var(--c-border)]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3 bg-[var(--c-surface)] border-b border-[var(--c-border)] flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectImage(img.id)}
                        className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                      />
                      <span className="font-semibold text-[var(--c-text)]">Page {img.pageNumber}</span>
                    </label>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                        img.type === 'embedded'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {img.type === 'embedded' ? 'Asset' : 'Render'}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => setPreviewModalImage(img)}
                    className="relative p-4 flex items-center justify-center bg-[var(--c-surface)]/50 min-h-[190px] cursor-pointer group"
                  >
                    <img
                      src={img.dataUrl}
                      alt={`Extracted asset from page ${img.pageNumber}`}
                      className="max-h-44 object-contain rounded shadow-sm group-hover:scale-[1.02] transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                      <span className="py-1 px-3 rounded-lg bg-[var(--c-card)]/90 text-[var(--c-text)] text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Preview
                      </span>
                    </div>
                  </div>

                  {/* Card Details & Download Button */}
                  <div className="p-3 border-t border-[var(--c-border)] space-y-2">
                    <div className="flex justify-between text-[11px] text-[var(--c-muted)]">
                      <span>
                        {img.width} × {img.height} px
                      </span>
                      <span>{formatFileSize(img.sizeBytes)}</span>
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(img)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-black border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {img.format.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isExtracting && filteredImages.length === 0 && (
          <div className="p-12 text-center bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] text-[var(--c-muted)]">
            No images match the selected filter.
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleReset}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 py-1 px-2"
          >
            <RefreshCw className="w-3 h-3" /> Process Another PDF
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={() => handleDownloadZip(true)}
              className="py-2.5 px-5 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 flex items-center gap-1.5 transition"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedIds.size}) as ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
              <div className="text-xs font-semibold text-[var(--c-text)]">
                Page {previewModalImage.pageNumber} • {previewModalImage.width} × {previewModalImage.height} px (
                {formatFileSize(previewModalImage.sizeBytes)})
              </div>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-lg text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-[var(--c-surface)] rounded-xl overflow-hidden min-h-[300px]">
              <img
                src={previewModalImage.dataUrl}
                alt="Full preview"
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewModalImage(null)}
                className="py-2 px-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadSingle(previewModalImage)}
                className="py-2 px-5 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Image
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
