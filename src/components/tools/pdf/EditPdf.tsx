import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Square,
  Circle,
  Download,
  RotateCcw,
  Eraser,
  Stamp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export interface PdfAnnotation {
  id: string;
  pageIndex: number;
  type: 'text' | 'whiteout' | 'rect' | 'circle' | 'stamp';
  x: number;
  y: number;
  text?: string;
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
  fontSize?: number;
  color: string;
  bgColor?: string; // For whiteout / text background fill
  width?: number;
  height?: number;
  isBold?: boolean;
}

export const EditPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Active Tool & Properties
  const [activeTool, setActiveTool] = useState<'text' | 'whiteout' | 'rect' | 'circle' | 'stamp'>('text');
  const [textInput, setTextInput] = useState('Edit text here');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [color, setColor] = useState('#000000');
  const [useTextBg, setUseTextBg] = useState(true); // Whiteout behind text by default for text replacement
  const [stampText, setStampText] = useState('APPROVED');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setCurrentPageIndex(0);

    try {
      const rendered = await renderPdfToJpg(selectedFile, 1.5);
      setPageThumbnails(rendered.map(p => ({ pageNumber: p.pageNumber, dataUrl: p.dataUrl })));
      if (rendered.length > 0) {
        const img = new Image();
        img.onload = () => {
          setPdfDimensions({ width: img.width, height: img.height });
        };
        img.src = rendered[0].dataUrl;
      }
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to render PDF pages.' });
    }
  };

  // Switch page
  const handlePageChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= pageThumbnails.length) return;
    setCurrentPageIndex(newIndex);
    setSelectedAnnotationId(null);

    const img = new Image();
    img.onload = () => {
      setPdfDimensions({ width: img.width, height: img.height });
    };
    img.src = pageThumbnails[newIndex].dataUrl;
  };

  // Add Annotation on Canvas Click
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || pdfDimensions.width === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = pdfDimensions.width / rect.width;
    const scaleY = pdfDimensions.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked on an existing annotation on this page
    const pageAnns = annotations.filter(a => a.pageIndex === currentPageIndex);
    const clickedAnn = pageAnns.find(a => {
      const w = a.width || (a.type === 'text' ? (a.text?.length || 5) * (a.fontSize || 18) * 0.6 : 80);
      const h = a.height || (a.fontSize || 24);
      return clickX >= a.x && clickX <= a.x + w && clickY >= a.y && clickY <= a.y + h;
    });

    if (clickedAnn) {
      setSelectedAnnotationId(clickedAnn.id);
      setIsDragging(true);
      setDragOffset({ x: clickX - clickedAnn.x, y: clickY - clickedAnn.y });
      if (clickedAnn.text) setTextInput(clickedAnn.text);
      if (clickedAnn.fontSize) setFontSize(clickedAnn.fontSize);
      if (clickedAnn.color) setColor(clickedAnn.color);
      return;
    }

    // Otherwise create a new annotation at this spot
    const newId = `ann-${Date.now()}`;
    let newAnn: PdfAnnotation = {
      id: newId,
      pageIndex: currentPageIndex,
      type: activeTool,
      x: Math.round(clickX),
      y: Math.round(clickY),
      color,
    };

    if (activeTool === 'text') {
      newAnn = {
        ...newAnn,
        text: textInput,
        fontSize,
        fontFamily,
        bgColor: useTextBg ? '#ffffff' : undefined,
      };
    } else if (activeTool === 'whiteout') {
      newAnn = {
        ...newAnn,
        width: 140,
        height: 35,
        color: '#ffffff',
        bgColor: '#ffffff',
      };
    } else if (activeTool === 'rect') {
      newAnn = {
        ...newAnn,
        width: 150,
        height: 80,
      };
    } else if (activeTool === 'circle') {
      newAnn = {
        ...newAnn,
        width: 50,
        height: 50,
      };
    } else if (activeTool === 'stamp') {
      newAnn = {
        ...newAnn,
        text: stampText,
        fontSize: 22,
        color: '#dc2626',
        width: 160,
        height: 45,
      };
    }

    setAnnotations([...annotations, newAnn]);
    setSelectedAnnotationId(newId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedAnnotationId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = pdfDimensions.width / rect.width;
    const scaleY = pdfDimensions.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setAnnotations(prev =>
      prev.map(a => {
        if (a.id === selectedAnnotationId) {
          return {
            ...a,
            x: Math.max(0, Math.round(mouseX - dragOffset.x)),
            y: Math.max(0, Math.round(mouseY - dragOffset.y)),
          };
        }
        return a;
      })
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Update Selected Annotation Text in Real-Time
  const handleSelectedTextChange = (val: string) => {
    setTextInput(val);
    if (selectedAnnotationId) {
      setAnnotations(prev =>
        prev.map(a => (a.id === selectedAnnotationId ? { ...a, text: val } : a))
      );
    }
  };

  const handleSelectedFontSizeChange = (sz: number) => {
    setFontSize(sz);
    if (selectedAnnotationId) {
      setAnnotations(prev =>
        prev.map(a => (a.id === selectedAnnotationId ? { ...a, fontSize: sz } : a))
      );
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  // Render Page + Annotations onto Interactive Canvas
  useEffect(() => {
    if (pageThumbnails.length === 0 || !canvasRef.current) return;
    const currentThumb = pageThumbnails[currentPageIndex];
    if (!currentThumb) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw all annotations for the current page
      const pageAnns = annotations.filter(a => a.pageIndex === currentPageIndex);

      pageAnns.forEach(ann => {
        const isSelected = ann.id === selectedAnnotationId;

        if (ann.type === 'text') {
          const text = ann.text || '';
          const sz = ann.fontSize || 18;
          ctx.font = `${sz}px ${ann.fontFamily === 'TimesRoman' ? 'Times New Roman' : ann.fontFamily === 'Courier' ? 'Courier New' : 'Arial'}`;

          const textWidth = ctx.measureText(text).width;
          const pad = 4;

          // If whiteout / background is enabled
          if (ann.bgColor) {
            ctx.fillStyle = ann.bgColor;
            ctx.fillRect(ann.x - pad, ann.y - pad, textWidth + (pad * 2), sz + (pad * 2));
          }

          // Draw Text
          ctx.fillStyle = ann.color;
          ctx.fillText(text, ann.x, ann.y + sz - 2);

          // Selection border
          if (isSelected) {
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(ann.x - pad - 2, ann.y - pad - 2, textWidth + (pad * 2) + 4, sz + (pad * 2) + 4);
            ctx.setLineDash([]);
          }
        } else if (ann.type === 'whiteout') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ann.x, ann.y, ann.width || 140, ann.height || 35);

          if (isSelected) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(ann.x, ann.y, ann.width || 140, ann.height || 35);
          }
        } else if (ann.type === 'rect') {
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(ann.x, ann.y, ann.width || 150, ann.height || 80);
        } else if (ann.type === 'circle') {
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ann.x + (ann.width || 50) / 2, ann.y + (ann.height || 50) / 2, (ann.width || 50) / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ann.type === 'stamp') {
          ctx.save();
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = 3;
          ctx.fillStyle = ann.color;
          ctx.font = `bold ${ann.fontSize || 22}px Arial`;

          const boxW = ann.width || 160;
          const boxH = ann.height || 45;
          ctx.strokeRect(ann.x, ann.y, boxW, boxH);
          ctx.fillText(ann.text || 'APPROVED', ann.x + 12, ann.y + 30);
          ctx.restore();
        }
      });
    };
    img.src = currentThumb.dataUrl;
  }, [pageThumbnails, currentPageIndex, annotations, selectedAnnotationId]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Export to PDF with all edits embedded
  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

      const pages = pdfDoc.getPages();

      for (const ann of annotations) {
        if (ann.pageIndex >= pages.length) continue;
        const page = pages[ann.pageIndex];
        const { height } = page.getSize();
        const c = hexToRgb(ann.color);

        // Convert canvas Y to PDF coordinate Y (PDF origins are bottom-left)
        const pdfY = height - ann.y;

        if (ann.type === 'text') {
          const sz = ann.fontSize || 18;
          const text = ann.text || '';
          let font = helveticaFont;
          if (ann.fontFamily === 'TimesRoman') font = timesFont;
          else if (ann.fontFamily === 'Courier') font = courierFont;

          const textWidth = font.widthOfTextAtSize(text, sz);

          // Draw whiteout background box if enabled
          if (ann.bgColor) {
            const bgC = hexToRgb(ann.bgColor);
            page.drawRectangle({
              x: ann.x - 3,
              y: pdfY - sz - 4,
              width: textWidth + 6,
              height: sz + 8,
              color: rgb(bgC.r, bgC.g, bgC.b),
            });
          }

          // Draw text
          page.drawText(text, {
            x: ann.x,
            y: pdfY - sz,
            size: sz,
            font,
            color: rgb(c.r, c.g, c.b),
          });
        } else if (ann.type === 'whiteout') {
          page.drawRectangle({
            x: ann.x,
            y: pdfY - (ann.height || 35),
            width: ann.width || 140,
            height: ann.height || 35,
            color: rgb(1, 1, 1),
          });
        } else if (ann.type === 'rect') {
          page.drawRectangle({
            x: ann.x,
            y: pdfY - (ann.height || 80),
            width: ann.width || 150,
            height: ann.height || 80,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: 2,
          });
        } else if (ann.type === 'circle') {
          page.drawCircle({
            x: ann.x + (ann.width || 50) / 2,
            y: pdfY - (ann.height || 50) / 2,
            size: (ann.width || 50) / 2,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: 2,
          });
        } else if (ann.type === 'stamp') {
          const boxW = ann.width || 160;
          const boxH = ann.height || 45;
          page.drawRectangle({
            x: ann.x,
            y: pdfY - boxH,
            width: boxW,
            height: boxH,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: 2,
          });
          page.drawText(ann.text || 'APPROVED', {
            x: ann.x + 10,
            y: pdfY - boxH + 12,
            size: ann.fontSize || 22,
            font: helveticaFont,
            color: rgb(c.r, c.g, c.b),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `edited-${file.name}`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'PDF Saved', message: 'All text edits & annotations applied successfully!' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save edited PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageThumbnails([]);
    setAnnotations([]);
    setSelectedAnnotationId(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to edit text & content"
        description="Add, replace, white-out, and edit text on any page with customizable fonts, colors, and stamps."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const currentPageAnnotations = annotations.filter(a => a.pageIndex === currentPageIndex);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTool('text')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'text'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Add / Replace Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('whiteout')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'whiteout'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Whiteout Eraser</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('rect')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'rect'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Rectangle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('circle')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'circle'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Circle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('stamp')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'stamp'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Stamp</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnnotations(annotations.filter(a => a.pageIndex !== currentPageIndex))}
            className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1"
            title="Clear edits on current page"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Page</span>
          </button>

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:opacity-50 text-white dark:text-zinc-900 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isProcessing ? 'Saving...' : 'Apply & Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* Property Options Bar */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
        {activeTool === 'text' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Text input */}
            <div className="sm:col-span-5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Text Content
              </label>
              <input
                type="text"
                value={textInput}
                onChange={e => handleSelectedTextChange(e.target.value)}
                placeholder="Type text to place on PDF..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Font Family */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Font
              </label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="Helvetica">Helvetica / Arial</option>
                <option value="TimesRoman">Times New Roman</option>
                <option value="Courier">Courier Monospace</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Size: {fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="48"
                value={fontSize}
                onChange={e => handleSelectedFontSizeChange(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-white"
              />
            </div>

            {/* Color */}
            <div className="sm:col-span-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>

            {/* Whiteout Background Toggle */}
            <div className="sm:col-span-2 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={useTextBg}
                  onChange={e => setUseTextBg(e.target.checked)}
                  className="rounded accent-zinc-900 dark:accent-white"
                />
                <span>Whiteout Fill (Cover text)</span>
              </label>
            </div>
          </div>
        )}

        {activeTool === 'stamp' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Stamp Text:</span>
            {['APPROVED', 'CONFIDENTIAL', 'DRAFT', 'VOID', 'PAID'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStampText(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  stampText === s
                    ? 'bg-red-600 text-white border-transparent'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas Workspace with Multi-Page Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Canvas Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Page Pagination Controls */}
          {pageThumbnails.length > 1 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handlePageChange(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Page
              </button>

              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Page {currentPageIndex + 1} of {pageThumbnails.length}
              </span>

              <button
                onClick={() => handlePageChange(currentPageIndex + 1)}
                disabled={currentPageIndex === pageThumbnails.length - 1}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
              >
                Next Page <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Interactive Canvas Container */}
          <div className="p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-auto max-h-[700px]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="shadow-2xl rounded-lg max-w-full cursor-crosshair select-none bg-white"
            />
          </div>

          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
            💡 Click anywhere on the PDF page to place your text or element. Drag elements to reposition.
          </p>
        </div>

        {/* Right Sidebar: Active Layers / Annotations */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Page {currentPageIndex + 1} Layers
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                {currentPageAnnotations.length}
              </span>
            </div>

            {currentPageAnnotations.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No edits on this page yet. Click on the document to add text.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {currentPageAnnotations.map((ann) => {
                  const isSelected = ann.id === selectedAnnotationId;
                  return (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedAnnotationId(ann.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold capitalize truncate">
                          {ann.type === 'text' ? ann.text || 'Text Box' : ann.type}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          x: {ann.x}, y: {ann.y}
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteAnnotation(ann.id);
                        }}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="edit-pdf" onReset={handleReset} />
    </div>
  );
};
