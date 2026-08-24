import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  FileText,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

type Alignment = 'left' | 'center' | 'right';
type PageNumFormat = 'Page X of Y' | 'Page X' | 'X / Y' | 'X';
type FontOption = 'Helvetica' | 'Helvetica-Bold' | 'Helvetica-Oblique';
type DateFormatOption = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'MMM DD, YYYY';

export const PdfHeaderFooter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Header Configuration
  const [headerEnabled, setHeaderEnabled] = useState<boolean>(true);
  const [headerText, setHeaderText] = useState<string>('Confidential Document');
  const [headerAlign, setHeaderAlign] = useState<Alignment>('left');

  // Footer Configuration
  const [footerEnabled, setFooterEnabled] = useState<boolean>(true);
  const [footerText, setFooterText] = useState<string>('ToolBoxX Document Suite');
  const [footerAlign, setFooterAlign] = useState<Alignment>('left');

  // Dynamic Page Numbering
  const [pageNumberEnabled, setPageNumberEnabled] = useState<boolean>(true);
  const [pageNumberPosition, setPageNumberPosition] = useState<'header' | 'footer'>('footer');
  const [pageNumberAlign, setPageNumberAlign] = useState<Alignment>('right');
  const [pageNumberFormat, setPageNumberFormat] = useState<PageNumFormat>('Page X of Y');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);

  // Date Stamp
  const [dateStampEnabled, setDateStampEnabled] = useState<boolean>(false);
  const [dateStampPosition, setDateStampPosition] = useState<'header' | 'footer'>('header');
  const [dateStampAlign, setDateStampAlign] = useState<Alignment>('right');
  const [dateFormat, setDateFormat] = useState<DateFormatOption>('YYYY-MM-DD');

  // Typography & Layout
  const [fontSize, setFontSize] = useState<number>(10);
  const [fontFamily, setFontFamily] = useState<FontOption>('Helvetica');
  const [margin, setMargin] = useState<number>(36); // Points (0.5 inch = 36 pt)
  const [textColor, setTextColor] = useState<string>('dark'); // 'black' | 'dark' | 'gray'

  // Canvas ref for live preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfJsDocRef = useRef<any>(null);

  const getFormattedDate = useCallback((): string => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY':
        return `${mm}/${dd}/${yyyy}`;
      case 'MMM DD, YYYY':
        return `${monthNames[now.getMonth()]} ${dd}, ${yyyy}`;
      case 'YYYY-MM-DD':
      default:
        return `${yyyy}-${mm}-${dd}`;
    }
  }, [dateFormat]);

  const formatPageString = useCallback(
    (pageNum: number, total: number): string => {
      switch (pageNumberFormat) {
        case 'Page X':
          return `Page ${pageNum}`;
        case 'X / Y':
          return `${pageNum} / ${total}`;
        case 'X':
          return `${pageNum}`;
        case 'Page X of Y':
        default:
          return `Page ${pageNum} of ${total}`;
      }
    },
    [pageNumberFormat]
  );

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setPreviewPage(1);
    setIsPreviewLoading(true);

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      pdfJsDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      showToast({
        type: 'success',
        title: 'PDF Loaded',
        message: `Successfully loaded ${pdf.numPages} pages.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: err.message || 'Failed to parse PDF document.',
      });
      setFile(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Render Preview Page on Canvas
  const renderPreview = useCallback(async () => {
    if (!pdfJsDocRef.current || !canvasRef.current) return;
    setIsPreviewLoading(true);

    try {
      const page = await pdfJsDocRef.current.getPage(previewPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 1.2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await (page.render({
        canvasContext: context,
        viewport,
        canvas,
      } as any) as any).promise;

      // Now draw preview overlay annotations for Header / Footer
      const isCoverSkipped = skipFirstPage && previewPage === 1;
      if (!isCoverSkipped) {
        const scale = 1.2;
        const scaleMargin = margin * scale;
        const scaleFontSize = fontSize * scale;

        context.font = `${scaleFontSize}px sans-serif`;
        context.fillStyle = textColor === 'black' ? '#000000' : textColor === 'dark' ? '#333333' : '#666666';

        // Calculate Header items
        if (headerEnabled && headerText.trim()) {
          const text = headerText;
          const textWidth = context.measureText(text).width;
          let x = scaleMargin;
          if (headerAlign === 'center') x = (canvas.width - textWidth) / 2;
          if (headerAlign === 'right') x = canvas.width - scaleMargin - textWidth;
          context.fillText(text, x, scaleMargin + scaleFontSize);
        }

        // Header Date Stamp
        if (dateStampEnabled && dateStampPosition === 'header') {
          const dText = getFormattedDate();
          const dWidth = context.measureText(dText).width;
          let x = scaleMargin;
          if (dateStampAlign === 'center') x = (canvas.width - dWidth) / 2;
          if (dateStampAlign === 'right') x = canvas.width - scaleMargin - dWidth;
          context.fillText(dText, x, scaleMargin + scaleFontSize);
        }

        // Header Page Number
        if (pageNumberEnabled && pageNumberPosition === 'header') {
          const actualPageNum = startNumber + previewPage - 1;
          const pText = formatPageString(actualPageNum, totalPages);
          const pWidth = context.measureText(pText).width;
          let x = scaleMargin;
          if (pageNumberAlign === 'center') x = (canvas.width - pWidth) / 2;
          if (pageNumberAlign === 'right') x = canvas.width - scaleMargin - pWidth;
          context.fillText(pText, x, scaleMargin + scaleFontSize);
        }

        // Footer items
        if (footerEnabled && footerText.trim()) {
          const text = footerText;
          const textWidth = context.measureText(text).width;
          let x = scaleMargin;
          if (footerAlign === 'center') x = (canvas.width - textWidth) / 2;
          if (footerAlign === 'right') x = canvas.width - scaleMargin - textWidth;
          context.fillText(text, x, canvas.height - scaleMargin);
        }

        // Footer Date Stamp
        if (dateStampEnabled && dateStampPosition === 'footer') {
          const dText = getFormattedDate();
          const dWidth = context.measureText(dText).width;
          let x = scaleMargin;
          if (dateStampAlign === 'center') x = (canvas.width - dWidth) / 2;
          if (dateStampAlign === 'right') x = canvas.width - scaleMargin - dWidth;
          context.fillText(dText, x, canvas.height - scaleMargin);
        }

        // Footer Page Number
        if (pageNumberEnabled && pageNumberPosition === 'footer') {
          const actualPageNum = startNumber + previewPage - 1;
          const pText = formatPageString(actualPageNum, totalPages);
          const pWidth = context.measureText(pText).width;
          let x = scaleMargin;
          if (pageNumberAlign === 'center') x = (canvas.width - pWidth) / 2;
          if (pageNumberAlign === 'right') x = canvas.width - scaleMargin - pWidth;
          context.fillText(pText, x, canvas.height - scaleMargin);
        }
      }
    } catch (err) {
      console.error('Preview render error:', err);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [
    previewPage,
    headerEnabled,
    headerText,
    headerAlign,
    footerEnabled,
    footerText,
    footerAlign,
    pageNumberEnabled,
    pageNumberPosition,
    pageNumberAlign,
    pageNumberFormat,
    startNumber,
    skipFirstPage,
    dateStampEnabled,
    dateStampPosition,
    dateStampAlign,
    dateFormat,
    fontSize,
    margin,
    textColor,
    totalPages,
    formatPageString,
    getFormattedDate,
  ]);

  useEffect(() => {
    if (file && totalPages > 0) {
      renderPreview();
    }
  }, [file, totalPages, renderPreview]);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });

      // Embed Font
      let font;
      if (fontFamily === 'Helvetica-Bold') {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      } else if (fontFamily === 'Helvetica-Oblique') {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // Color mapping
      let color = rgb(0, 0, 0);
      if (textColor === 'dark') color = rgb(0.2, 0.2, 0.2);
      if (textColor === 'gray') color = rgb(0.45, 0.45, 0.45);

      const pages = pdfDoc.getPages();
      const count = pages.length;
      const formattedDate = getFormattedDate();

      pages.forEach((page, index) => {
        if (skipFirstPage && index === 0) return;

        const { width, height } = page.getSize();
        const actualPageNum = startNumber + index;
        const pageStr = formatPageString(actualPageNum, count);

        // Helper to draw text at position
        const drawItem = (text: string, position: 'header' | 'footer', align: Alignment) => {
          if (!text || !text.trim()) return;
          const textWidth = font.widthOfTextAtSize(text, fontSize);

          let x = margin;
          if (align === 'center') x = (width - textWidth) / 2;
          if (align === 'right') x = width - margin - textWidth;

          let y = margin;
          if (position === 'header') {
            y = height - margin - fontSize;
          }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color,
          });
        };

        // 1. Header Text
        if (headerEnabled && headerText.trim()) {
          drawItem(headerText, 'header', headerAlign);
        }

        // 2. Footer Text
        if (footerEnabled && footerText.trim()) {
          drawItem(footerText, 'footer', footerAlign);
        }

        // 3. Page Number
        if (pageNumberEnabled) {
          drawItem(pageStr, pageNumberPosition, pageNumberAlign);
        }

        // 4. Date Stamp
        if (dateStampEnabled) {
          drawItem(formattedDate, dateStampPosition, dateStampAlign);
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `header_footer_${file.name}`);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({
        type: 'success',
        title: 'Success!',
        message: 'Headers, footers, and page numbers added successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Processing Failed',
        message: err.message || 'Could not process PDF headers and footers.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setPreviewPage(1);
    pdfJsDocRef.current = null;
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to add Headers & Footers"
        description="Add customized headers, footers, dynamic page numbering, and date stamps to every page."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          badge={skipFirstPage ? 'First Page Skipped' : 'All Pages'}
          badgeType={skipFirstPage ? 'warning' : 'success'}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Layout Status"
          value="Configured"
          subValue={`${fontSize}pt • ${margin}pt Margin`}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace: 2-Column (Controls Left, Live Preview Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--c-gold)]" />
                <h3 className="text-sm font-semibold text-[var(--c-text)]">Header Settings</h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--c-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={headerEnabled}
                  onChange={(e) => setHeaderEnabled(e.target.checked)}
                  className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                />
                <span>Enable Header</span>
              </label>
            </div>

            {headerEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Header Text
                  </label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. Project Whitepaper / Confidential"
                    className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Header Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderAlign('left')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        headerAlign === 'left'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" /> Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderAlign('center')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        headerAlign === 'center'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" /> Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderAlign('right')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        headerAlign === 'right'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" /> Right
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Card */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--c-gold)]" />
                <h3 className="text-sm font-semibold text-[var(--c-text)]">Footer Settings</h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--c-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerEnabled}
                  onChange={(e) => setFooterEnabled(e.target.checked)}
                  className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                />
                <span>Enable Footer</span>
              </label>
            </div>

            {footerEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g. Copyright © 2026 Company Inc."
                    className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Footer Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFooterAlign('left')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        footerAlign === 'left'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" /> Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setFooterAlign('center')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        footerAlign === 'center'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" /> Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setFooterAlign('right')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                        footerAlign === 'right'
                          ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                          : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" /> Right
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Page Numbering */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[var(--c-gold)]" />
                <h3 className="text-sm font-semibold text-[var(--c-text)]">Dynamic Page Numbering</h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--c-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageNumberEnabled}
                  onChange={(e) => setPageNumberEnabled(e.target.checked)}
                  className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                />
                <span>Include Page Numbers</span>
              </label>
            </div>

            {pageNumberEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Numbering Format
                  </label>
                  <select
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value as PageNumFormat)}
                    className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                  >
                    <option value="Page X of Y">Page X of Y (Page 1 of 10)</option>
                    <option value="Page X">Page X (Page 1)</option>
                    <option value="X / Y">X / Y (1 / 10)</option>
                    <option value="X">X (1, 2, 3...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Location & Alignment
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={pageNumberPosition}
                      onChange={(e) => setPageNumberPosition(e.target.value as 'header' | 'footer')}
                      className="w-1/2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-2 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                    >
                      <option value="footer">Footer</option>
                      <option value="header">Header</option>
                    </select>
                    <select
                      value={pageNumberAlign}
                      onChange={(e) => setPageNumberAlign(e.target.value as Alignment)}
                      className="w-1/2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-2 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                    >
                      <option value="right">Right</option>
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs text-[var(--c-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipFirstPage}
                      onChange={(e) => setSkipFirstPage(e.target.checked)}
                      className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                    />
                    <span>Skip Cover / First Page</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Date Stamp & Typography Settings */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--c-gold)]" />
                <h3 className="text-sm font-semibold text-[var(--c-text)]">Date Stamp & Typography</h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--c-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={dateStampEnabled}
                  onChange={(e) => setDateStampEnabled(e.target.checked)}
                  className="rounded border-[var(--c-border)] text-[var(--c-gold)] focus:ring-[var(--c-gold)]"
                />
                <span>Include Date Stamp</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {dateStampEnabled && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value as DateFormatOption)}
                      className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                      Date Position & Align
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={dateStampPosition}
                        onChange={(e) => setDateStampPosition(e.target.value as 'header' | 'footer')}
                        className="w-1/2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-2 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                      >
                        <option value="header">Header</option>
                        <option value="footer">Footer</option>
                      </select>
                      <select
                        value={dateStampAlign}
                        onChange={(e) => setDateStampAlign(e.target.value as Alignment)}
                        className="w-1/2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-2 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                      >
                        <option value="right">Right</option>
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontOption)}
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                >
                  <option value="Helvetica">Helvetica (Standard)</option>
                  <option value="Helvetica-Bold">Helvetica Bold</option>
                  <option value="Helvetica-Oblique">Helvetica Oblique (Italic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Text Color Tone
                </label>
                <select
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                >
                  <option value="dark">Charcoal Gray (Standard)</option>
                  <option value="black">Deep Black</option>
                  <option value="gray">Muted Light Gray</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--c-muted)] mb-1">
                  <span>Font Size</span>
                  <span>{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--c-muted)] mb-1">
                  <span>Margin from Edge</span>
                  <span>{margin} pt</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="72"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[var(--c-border)]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c-text)]">
                <Eye className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Live Page Preview</span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    disabled={previewPage <= 1}
                    className="p-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] disabled:opacity-40 hover:border-[var(--c-border-hover)]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[var(--c-muted)]">
                    {previewPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                    disabled={previewPage >= totalPages}
                    className="p-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] disabled:opacity-40 hover:border-[var(--c-border-hover)]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Container */}
            <div className="relative w-full flex items-center justify-center p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] min-h-[380px] overflow-hidden">
              {isPreviewLoading && (
                <div className="absolute inset-0 bg-[var(--c-card)]/70 backdrop-blur-xs flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-3 border-[var(--c-gold)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="max-h-[460px] w-auto max-w-full object-contain rounded shadow-lg border border-[var(--c-border)]"
              />
            </div>

            <p className="text-[11px] text-[var(--c-subtle)] text-center mt-3">
              Preview updates live with your custom header, footer, numbering, and margins.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reset / Change PDF
            </button>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex-2 py-3 px-6 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <Download className="w-4 h-4" />
                  <span>Apply & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="add-page-numbers" onReset={handleReset} />
    </div>
  );
};
