import React, { useState, useRef, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg, imagesToPdf } from '../../../utils/pdfUtils';
import { downloadBlob } from '../../../utils/fileUtils';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface RedactionArea {
  pageNumber: number; // 0-indexed
  x: number;
  y: number;
  width: number;
  height: number;
}

export const RedactPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [activePageIdx, setActivePageIdx] = useState<number | null>(null);
  const [redactions, setRedactions] = useState<RedactionArea[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const rendered = await renderPdfToJpg(files[0], 1.0);
        setThumbnails(rendered.map(p => p.dataUrl));
        if (rendered.length > 0) setActivePageIdx(0);
      } catch (err) {
        showToast({ type: 'error', title: 'Error', message: 'Failed to process PDF pages.' });
      }
    }
  };

  const drawCanvas = () => {
    if (activePageIdx === null || !thumbnails[activePageIdx] || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw stored redactions
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      redactions.forEach(r => {
        if (r.pageNumber === activePageIdx) {
          ctx.fillRect(r.x, r.y, r.width, r.height);
        }
      });

      // Draw current drawing
      if (isDrawing) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // preview color
        ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
      }
    };
    img.src = thumbnails[activePageIdx];
  };

  useEffect(() => {
    drawCanvas();
  }, [activePageIdx, thumbnails, redactions, isDrawing, currentX, currentY]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || activePageIdx === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    setStartX((e.clientX - rect.left) * scaleX);
    setStartY((e.clientY - rect.top) * scaleY);
    setCurrentX((e.clientX - rect.left) * scaleX);
    setCurrentY((e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    setCurrentX((e.clientX - rect.left) * scaleX);
    setCurrentY((e.clientY - rect.top) * scaleY);
  };

  const handleMouseUp = () => {
    if (!isDrawing || activePageIdx === null) return;
    setIsDrawing(false);
    
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    if (width > 5 && height > 5) {
      setRedactions([...redactions, {
        pageNumber: activePageIdx,
        x, y, width, height
      }]);
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Create offscreen canvas to flatten and redact
      const flattenedImages: { file: File, dataUrl: string, width: number, height: number }[] = [];
      const hrPages = await renderPdfToJpg(file, 2.0);
      
      for (let i = 0; i < hrPages.length; i++) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = hrPages[i].dataUrl;
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Apply redactions for this page
        const pageRedactions = redactions.filter(r => r.pageNumber === i);
        ctx.fillStyle = '#000000';
        pageRedactions.forEach(r => {
           const scaleRatio = canvas.width / (canvasRef.current?.width || canvas.width/2);
           ctx.fillRect(r.x * scaleRatio, r.y * scaleRatio, r.width * scaleRatio, r.height * scaleRatio);
        });
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const blob = await (await fetch(dataUrl)).blob();
        const imgFile = new File([blob], `page-${i + 1}.jpg`, { type: 'image/jpeg' });

        flattenedImages.push({
          file: imgFile,
          dataUrl,
          width: canvas.width,
          height: canvas.height
        });
      }
      
      // Convert images to PDF
      const pdfBytes = await imagesToPdf(flattenedImages, { orientation: 'auto', margin: 0 });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `redacted-${file.name}`);
      confetti();
      showToast({ type: 'success', title: 'Success', message: 'PDF redacted successfully' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to redact PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setThumbnails([]);
    setActivePageIdx(null);
    setRedactions([]);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to redact"
        description="Permanently remove sensitive information by blacking it out."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-4 overflow-x-auto p-4 bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)]">
        {thumbnails.map((url, idx) => (
          <div 
            key={idx} 
            className={`cursor-pointer border-2 rounded-xl p-1 shrink-0 transition ${activePageIdx === idx ? 'border-[var(--c-gold)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
            onClick={() => setActivePageIdx(idx)}
          >
            <img src={url} alt={`Page ${idx + 1}`} className="h-32 object-contain bg-white rounded-lg" />
            <p className={`text-center text-xs mt-1 font-semibold ${activePageIdx === idx ? 'text-[var(--c-gold)]' : 'text-[var(--c-subtle)]'}`}>Page {idx + 1}</p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--c-border)] rounded-2xl overflow-auto bg-[var(--c-surface)] p-4 flex justify-center cursor-crosshair">
        <canvas 
          ref={canvasRef} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="shadow-lg max-w-full bg-white rounded-lg" 
          style={{ maxHeight: '600px', objectFit: 'contain' }} 
        />
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleReset} className="px-4 py-2 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer">Change File</button>
        <button onClick={handleApply} disabled={isProcessing} className="px-6 py-2.5 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold rounded-xl flex items-center gap-2 hover:bg-[var(--c-gold)] transition shadow-md cursor-pointer">
          <Crosshair size={18} /> Apply Redaction & Download
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="redact-pdf" onReset={handleReset} />
    </div>
  );
};
