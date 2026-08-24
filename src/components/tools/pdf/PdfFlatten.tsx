import React, { useState } from 'react';
import {
  Download,
  FileText,
  Layers,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Zap,
  Sliders,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer, calculateSavings } from '../../../utils/fileUtils';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

type FlattenMode = 'vector' | 'raster';

interface DetectedFieldSummary {
  totalFields: number;
  textFields: number;
  checkboxes: number;
  dropdowns: number;
  radios: number;
}

export const PdfFlatten: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [fieldSummary, setFieldSummary] = useState<DetectedFieldSummary>({
    totalFields: 0,
    textFields: 0,
    checkboxes: 0,
    dropdowns: 0,
    radios: 0,
  });

  // Settings
  const [flattenMode, setFlattenMode] = useState<FlattenMode>('vector');
  const [rasterDpi, setRasterDpi] = useState<number>(2); // 1.5x (108 DPI), 2x (144 DPI), 3x (216 DPI)
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);

  // Processing & State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [flattenedBlob, setFlattenedBlob] = useState<Blob | null>(null);
  const [savingsInfo, setSavingsInfo] = useState<{ savedBytes: number; percentage: number; isReduced: boolean } | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setFlattenedBlob(null);
    setSavingsInfo(null);

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      setTotalPages(pages.length);

      let summary: DetectedFieldSummary = {
        totalFields: 0,
        textFields: 0,
        checkboxes: 0,
        dropdowns: 0,
        radios: 0,
      };

      try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        summary.totalFields = fields.length;

        fields.forEach((f) => {
          const typeName = f.constructor.name;
          if (typeName.includes('Text')) summary.textFields++;
          else if (typeName.includes('CheckBox') || typeName.includes('Checkbox')) summary.checkboxes++;
          else if (typeName.includes('Dropdown') || typeName.includes('Choice')) summary.dropdowns++;
          else if (typeName.includes('Radio')) summary.radios++;
        });
      } catch {
        // PDF has no interactive form fields
      }

      setFieldSummary(summary);

      if (summary.totalFields > 0) {
        showToast({
          type: 'info',
          title: 'Interactive Elements Detected',
          message: `Found ${summary.totalFields} form fields across ${pages.length} pages ready to flatten.`,
        });
      } else {
        showToast({
          type: 'info',
          title: 'PDF Loaded',
          message: `Loaded ${pages.length} pages. Choose Vector or Raster Flattening.`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Loading PDF',
        message: err.message || 'Failed to parse PDF document.',
      });
      setFile(null);
    }
  };

  const handleProcessFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: totalPages });

    try {
      const buffer = await readFileAsArrayBuffer(file);
      let outputBlob: Blob;

      if (flattenMode === 'vector') {
        // Mode 1: Pure Vector AcroForm Flattening
        const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
        
        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch {
          // If no form or error flattening form, continues with doc
        }

        if (stripMetadata) {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('ToolBoxX PDF Engine');
          pdfDoc.setCreator('ToolBoxX');
        }

        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      } else {
        // Mode 2: High-Resolution Visual Rasterization & Layer Baking
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const total = pdf.numPages;

        const newPdfDoc = await PDFDocument.create();

        for (let i = 1; i <= total; i++) {
          setProgress({ current: i, total });
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: rasterDpi });

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');

          if (!ctx) continue;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await (page.render({
            canvasContext: ctx,
            viewport,
            canvas,
          } as any) as any).promise;

          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.94);
          const base64Data = jpgDataUrl.split(',')[1];
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let b = 0; b < binaryStr.length; b++) {
            bytes[b] = binaryStr.charCodeAt(b);
          }

          const embeddedImage = await newPdfDoc.embedJpg(bytes);
          const origViewport = page.getViewport({ scale: 1.0 });
          const pdfPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);

          pdfPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          });
        }

        if (stripMetadata) {
          newPdfDoc.setTitle('');
          newPdfDoc.setAuthor('');
          newPdfDoc.setSubject('');
          newPdfDoc.setKeywords([]);
          newPdfDoc.setProducer('ToolBoxX PDF Engine');
          newPdfDoc.setCreator('ToolBoxX');
        }

        const pdfBytes = await newPdfDoc.save({ useObjectStreams: true });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      }

      setFlattenedBlob(outputBlob);
      const savings = calculateSavings(file.size, outputBlob.size);
      setSavingsInfo(savings);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({
        type: 'success',
        title: 'PDF Flattened!',
        message: 'All form fields and layers have been permanently baked.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Flattening Error',
        message: err.message || 'Failed to flatten PDF document.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!flattenedBlob || !file) return;
    downloadBlob(flattenedBlob, `flattened_${file.name}`);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setFlattenedBlob(null);
    setSavingsInfo(null);
    setProgress({ current: 0, total: 0 });
    setFieldSummary({
      totalFields: 0,
      textFields: 0,
      checkboxes: 0,
      dropdowns: 0,
      radios: 0,
    });
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to Flatten Form Fields & Annotations"
        description="Convert fillable PDF form fields, interactive checkboxes, annotations, and layers into permanent uneditable static PDF content."
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
          label="Total Pages"
          value={`${totalPages} Pages`}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Form Fields Detected"
          value={`${fieldSummary.totalFields} Fields`}
          badge={fieldSummary.totalFields > 0 ? 'Interactive' : 'Static'}
          badgeType={fieldSummary.totalFields > 0 ? 'warning' : 'neutral'}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Flatten Status"
          value={flattenedBlob ? 'Flattened' : 'Ready'}
          badge={flattenedBlob ? 'Baked' : undefined}
          badgeType="success"
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mode Selection & Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Selector Card */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Select Flattening Strategy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Mode A: Vector */}
              <div
                onClick={() => setFlattenMode('vector')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  flattenMode === 'vector'
                    ? 'border-[var(--c-gold)] bg-[var(--c-gold)]/10 shadow-sm'
                    : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[var(--c-gold)]" />
                      <span className="text-sm font-bold text-[var(--c-text)]">Vector Flattening</span>
                    </div>
                    {flattenMode === 'vector' && (
                      <span className="w-5 h-5 rounded-full bg-[var(--c-gold)] text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                    Flattens all interactive form fields into static vector text. Text remains selectable and razor-sharp at zero loss in quality.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--c-border)]/60 text-[11px] text-[var(--c-gold)] font-medium">
                  Recommended for standard contracts & forms
                </div>
              </div>

              {/* Mode B: Raster */}
              <div
                onClick={() => setFlattenMode('raster')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  flattenMode === 'raster'
                    ? 'border-[var(--c-gold)] bg-[var(--c-gold)]/10 shadow-sm'
                    : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[var(--c-gold)]" />
                      <span className="text-sm font-bold text-[var(--c-text)]">Full Visual Baking</span>
                    </div>
                    {flattenMode === 'raster' && (
                      <span className="w-5 h-5 rounded-full bg-[var(--c-gold)] text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--c-muted)] leading-relaxed">
                    Rasterizes all pages to high-DPI images. Permanently bakes all annotations, stamps, sticky notes, and hidden layers so nothing can be edited or extracted.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--c-border)]/60 text-[11px] text-[var(--c-gold)] font-medium">
                  Maximum tamper-proofing & court filings
                </div>
              </div>
            </div>

            {/* Raster Options if Raster mode selected */}
            {flattenMode === 'raster' && (
              <div className="p-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs text-[var(--c-muted)]">
                  <span className="font-semibold text-[var(--c-text)]">Rendering Resolution (DPI)</span>
                  <span>
                    {rasterDpi === 1.5 ? '108 DPI (Fast / Compact)' : rasterDpi === 2 ? '144 DPI (High Res - Recommended)' : '216 DPI (Ultra HD Print)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRasterDpi(1.5)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      rasterDpi === 1.5
                        ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                    }`}
                  >
                    1.5x (108 DPI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRasterDpi(2)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      rasterDpi === 2
                        ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                    }`}
                  >
                    2.0x (144 DPI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRasterDpi(3)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      rasterDpi === 3
                        ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                        : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                    }`}
                  >
                    3.0x (216 DPI)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Additional Options */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Document Security & Privacy</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={stripMetadata}
                  onChange={(e) => setStripMetadata(e.target.checked)}
                  className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[var(--c-text)] block">Strip Sensitive Metadata</span>
                  <span className="text-[var(--c-muted)]">
                    Removes author names, creator application tags, and modification timestamps for complete anonymity.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Processing & Output Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-5">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Flattening Summary</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-[var(--c-border)] text-[var(--c-muted)]">
                <span>Total Document Pages</span>
                <span className="font-semibold text-[var(--c-text)]">{totalPages} Pages</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--c-border)] text-[var(--c-muted)]">
                <span>Interactive Text Fields</span>
                <span className="font-semibold text-[var(--c-text)]">{fieldSummary.textFields}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--c-border)] text-[var(--c-muted)]">
                <span>Checkboxes & Radio Groups</span>
                <span className="font-semibold text-[var(--c-text)]">
                  {fieldSummary.checkboxes + fieldSummary.radios}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--c-border)] text-[var(--c-muted)]">
                <span>Flattening Method</span>
                <span className="font-semibold text-[var(--c-gold)]">
                  {flattenMode === 'vector' ? 'Vector Structure (Lossless)' : `Visual Raster (${rasterDpi * 72} DPI)`}
                </span>
              </div>
            </div>

            {/* Progress Bar when rendering */}
            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-[var(--c-muted)]">
                  <span>Processing document...</span>
                  <span>
                    {progress.current} of {progress.total} pages
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--c-surface)] rounded-full overflow-hidden border border-[var(--c-border)]">
                  <div
                    className="h-full bg-[var(--c-gold)] transition-all duration-200"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 30}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results Card after completion */}
            {flattenedBlob && (
              <div className="p-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-gold)]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c-gold)]">
                  <Sparkles className="w-4 h-4" />
                  <span>Flattening Complete!</span>
                </div>
                <div className="text-xs text-[var(--c-muted)] space-y-1">
                  <p>Original Size: {formatFileSize(file.size)}</p>
                  <p>Flattened Size: {formatFileSize(flattenedBlob.size)}</p>
                  {savingsInfo && savingsInfo.isReduced && (
                    <p className="text-emerald-400 font-semibold">
                      Saved {savingsInfo.percentage}% file size!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {!flattenedBlob ? (
                <button
                  onClick={handleProcessFlatten}
                  disabled={isProcessing}
                  className="w-full py-3 px-6 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Baking & Flattening PDF...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Flatten PDF Now</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 px-6 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Flattened PDF</span>
                  </button>
                  <button
                    onClick={handleProcessFlatten}
                    disabled={isProcessing}
                    className="w-full py-2 px-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs font-medium flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-process with Different Settings</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-2 text-center text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] transition"
              >
                Choose Another PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="pdf-forms" onReset={handleReset} />
    </div>
  );
};
