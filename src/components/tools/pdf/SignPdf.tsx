import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const SignPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const rendered = await renderPdfToJpg(files[0], 1.0);
        setThumbnails(rendered.map(p => p.dataUrl));
      } catch (err) {
        showToast({ type: 'error', title: 'Error', message: 'Failed to process PDF pages.' });
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, [file]);

  const handleApply = async () => {
    if (!file || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      
      const pngImage = await pdfDoc.embedPng(dataUrl);
      const pngDims = pngImage.scale(0.5);
      
      const pages = pdfDoc.getPages();
      if (selectedPage >= pages.length) throw new Error('Invalid page selection');
      const page = pages[selectedPage];
      
      const { width } = page.getSize();
      
      page.drawImage(pngImage, {
        x: width - pngDims.width - 50,
        y: 50,
        width: pngDims.width,
        height: pngDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `signed-${file.name}`);
      confetti();
      showToast({ type: 'success', title: 'Success', message: 'PDF signed successfully' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to sign PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setThumbnails([]);
    setSelectedPage(0);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to sign"
        description="Add a drawn signature to your PDF document."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">1. Select Page</h3>
          <div className="flex gap-4 overflow-x-auto p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            {thumbnails.map((url, idx) => (
              <div 
                key={idx} 
                className={`cursor-pointer border-2 rounded shrink-0 transition ${selectedPage === idx ? 'border-indigo-500' : 'border-transparent'}`}
                onClick={() => setSelectedPage(idx)}
              >
                <img src={url} alt={`Page ${idx + 1}`} className="h-48 object-contain bg-white" />
                <p className="text-center text-sm mt-1">Page {idx + 1}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">2. Draw Signature</h3>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-4">
            <div className="border rounded bg-white w-[300px] h-[150px] mx-auto">
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                className="cursor-crosshair w-full h-full touch-none"
              />
            </div>
            <div className="flex justify-center">
              <button onClick={clearSignature} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">
                <RotateCcw size={16} /> Clear Signature
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleReset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onClick={handleApply} disabled={isProcessing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Download size={18} /> Apply & Save
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="sign-pdf" onReset={handleReset} />
    </div>
  );
};
