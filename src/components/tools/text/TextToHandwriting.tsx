import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  Type,
  Palette,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export type HandwritingFont = 
  | 'caveat'
  | 'shadows'
  | 'indie'
  | 'dancing'
  | 'kalam'
  | 'architect'
  | 'sacramento';

export type PaperType = 
  | 'lined'
  | 'grid'
  | 'parchment'
  | 'legal'
  | 'plain';

export interface FontOption {
  id: HandwritingFont;
  name: string;
  fontFamily: string;
  sample: string;
}

export const HANDWRITING_FONTS: FontOption[] = [
  { id: 'caveat', name: 'Natural Notes (Caveat)', fontFamily: '"Caveat", cursive, sans-serif', sample: 'Natural handwriting style' },
  { id: 'indie', name: 'Casual Print (Indie Flower)', fontFamily: '"Indie Flower", cursive, sans-serif', sample: 'Casual neat print' },
  { id: 'dancing', name: 'Elegant Cursive (Dancing Script)', fontFamily: '"Dancing Script", cursive, sans-serif', sample: 'Elegant cursive flow' },
  { id: 'kalam', name: 'Ballpoint Pen (Kalam)', fontFamily: '"Kalam", cursive, sans-serif', sample: 'Ballpoint pen script' },
  { id: 'shadows', name: 'Quick Doodle (Shadows Into Light)', fontFamily: '"Shadows Into Light", cursive, sans-serif', sample: 'Quick study notes' },
  { id: 'sacramento', name: 'Calligraphy (Sacramento)', fontFamily: '"Sacramento", cursive, sans-serif', sample: 'Classic fountain calligraphy' },
  { id: 'architect', name: 'Architect Draft (Architects Daughter)', fontFamily: '"Architects Daughter", cursive, sans-serif', sample: 'Clean architect notes' },
];

export const TextToHandwriting: React.FC = () => {
  const [text, setText] = useState<string>(
    `Dear Reader,\n\nThis is realistic handwritten text generated directly in your browser. You can type notes, school assignments, letters, or study summaries and convert them into authentic handwritten pages on lined notebook or vintage parchment paper.\n\nAll conversion happens 100% privately on your device. Enjoy creating!`
  );

  const [selectedFont, setSelectedFont] = useState<HandwritingFont>('caveat');
  const [paperType, setPaperType] = useState<PaperType>('lined');
  const [inkColor, setInkColor] = useState<string>('#1e3a8a'); // Classic blue ink
  const [fontSize, setFontSize] = useState<number>(24);
  const [lineHeight, setLineHeight] = useState<number>(36);
  const marginPadding = 45;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Load Google Web Fonts dynamically
  useEffect(() => {
    const linkId = 'toolboxx-handwriting-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;600;700&family=Dancing+Script:wght@500;700&family=Indie+Flower&family=Kalam:wght@400;700&family=Sacramento&family=Shadows+Into+Light&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Render Realistic Handwritten Page on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard A4 Canvas Dimensions (at high DPI: 1240 x 1754 px)
    const width = 1240;
    const height = 1754;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Paper Background
    if (paperType === 'plain') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else if (paperType === 'parchment') {
      ctx.fillStyle = '#fbf7ee';
      ctx.fillRect(0, 0, width, height);
      // Add subtle vintage texture noise
      ctx.fillStyle = 'rgba(180, 150, 100, 0.04)';
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 2, 2);
      }
    } else if (paperType === 'legal') {
      ctx.fillStyle = '#fef9c3'; // Warm legal pad yellow
      ctx.fillRect(0, 0, width, height);
      // Red margin line
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(140, 0);
      ctx.lineTo(140, height);
      ctx.stroke();

      // Horizontal blue rules
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.lineWidth = 1.5;
      const topMargin = 120;
      for (let y = topMargin; y < height - 60; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (paperType === 'grid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else {
      // Default: 'lined' notebook paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Red vertical margin rule
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(140, 0);
      ctx.lineTo(140, height);
      ctx.stroke();

      // Horizontal blue notebook rules
      ctx.strokeStyle = 'rgba(191, 219, 254, 0.75)';
      ctx.lineWidth = 1.5;
      const topMargin = 130;
      for (let y = topMargin; y < height - 60; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 2. Configure Handwritten Typography
    const activeFont = HANDWRITING_FONTS.find(f => f.id === selectedFont) || HANDWRITING_FONTS[0];
    ctx.font = `${fontSize * 1.5}px ${activeFont.fontFamily}`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'alphabetic';

    // 3. Word Wrap & Render Handwritten Text
    const leftMargin = paperType === 'lined' || paperType === 'legal' ? 160 : marginPadding * 2;
    const rightMargin = width - (marginPadding * 2);
    const maxTextWidth = rightMargin - leftMargin;

    const startY = paperType === 'lined' || paperType === 'legal' ? 125 : 120;
    let currentY = startY;

    const paragraphs = text.split('\n');

    paragraphs.forEach(paragraph => {
      if (paragraph.trim() === '') {
        currentY += lineHeight;
        return;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxTextWidth && currentLine) {
          // Draw line with slight organic slant/offset for realism
          ctx.fillText(currentLine, leftMargin, currentY);
          currentY += lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        ctx.fillText(currentLine, leftMargin, currentY);
        currentY += lineHeight;
      }
    });

    setPreviewDataUrl(canvas.toDataURL('image/png'));
  }, [text, selectedFont, paperType, inkColor, fontSize, lineHeight, marginPadding]);

  // Download high-resolution PNG
  const handleDownloadPng = () => {
    if (!previewDataUrl) return;
    const byteString = atob(previewDataUrl.split(',')[1]);
    const mimeString = previewDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    downloadBlob(blob, 'handwritten-page.png');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    showToast({ type: 'success', title: 'Downloaded PNG', message: 'Saved high-res handwritten page image.' });
  };

  // Export directly as PDF Document
  const handleDownloadPdf = async () => {
    if (!previewDataUrl) return;
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 points

      const pngBytes = await fetch(previewDataUrl).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngBytes);

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: 595.28,
        height: 841.89,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'handwritten-document.pdf');

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Downloaded PDF', message: 'Saved authentic handwritten PDF document.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to generate PDF.' });
    }
  };

  const INK_COLORS = [
    { label: 'Classic Blue', hex: '#1e3a8a' },
    { label: 'Gel Pen Black', hex: '#0f172a' },
    { label: 'Royal Navy', hex: '#0369a1' },
    { label: 'Grading Red', hex: '#dc2626' },
    { label: 'Purple Gel', hex: '#7e22ce' },
    { label: 'Graphite Pencil', hex: '#475569' },
  ];

  return (
    <div className="space-y-8">
      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Text & Styling Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Text Input Area */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                Text to Convert
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {text.split(/\s+/).filter(Boolean).length} Words
              </span>
            </div>

            <textarea
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type text to convert into realistic handwriting..."
              className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm leading-relaxed font-sans focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          {/* Handwriting Font Picker */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-zinc-500" />
              Handwriting Style
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HANDWRITING_FONTS.map(f => {
                const isSelected = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFont(f.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
                      {f.name}
                    </div>
                    <div
                      className="text-lg text-zinc-700 dark:text-zinc-300 truncate"
                      style={{ fontFamily: f.fontFamily }}
                    >
                      {f.sample}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Style & Ink Color */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-500" />
              Paper & Ink Settings
            </h4>

            <div className="space-y-4">
              {/* Paper Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Paper Texture & Background
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'lined', label: 'Notebook' },
                      { id: 'legal', label: 'Legal Pad' },
                      { id: 'grid', label: 'Grid / Graph' },
                      { id: 'parchment', label: 'Vintage' },
                      { id: 'plain', label: 'Plain White' },
                    ] as const
                  ).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaperType(p.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        paperType === p.id
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Color Swatches */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Ink Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {INK_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setInkColor(c.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        inkColor === c.hex
                          ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Line Spacing: {lineHeight}px
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="52"
                    value={lineHeight}
                    onChange={e => setLineHeight(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Realistic Paper Preview & Export */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-zinc-500" />
              Live Handwritten Page Preview
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              High Resolution A4
            </span>
          </div>

          {/* Paper Canvas Preview */}
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white max-h-[580px] overflow-y-auto">
            <canvas ref={canvasRef} className="w-full object-contain block" />
          </div>

          {/* Action Download Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleDownloadPng}
              disabled={!previewDataUrl}
              className="py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:opacity-50 text-white dark:text-zinc-900 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              Download Image (PNG)
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!previewDataUrl}
              className="py-3.5 px-4 rounded-2xl border-2 border-zinc-900 dark:border-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-900 dark:text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              Download PDF Document
            </button>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="text-to-handwriting" />
    </div>
  );
};
