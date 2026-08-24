import React, { useState } from 'react';
import { RotateCw, Download, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { PDFDocument, degrees } from 'pdf-lib';

export const RotatePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: number; url: string; rotation: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalRotation, setGlobalRotation] = useState(0);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    
    try {
      const rendered = await renderPdfToJpg(selectedFile, 1.0);
      setPages(rendered.map((p) => ({ id: p.pageNumber, url: p.dataUrl, rotation: 0 })));
    } catch (err) {
      showToast({ type: 'error', title: 'Error reading PDF', message: 'Could not render PDF pages.' });
      setFile(null);
    }
  };

  const handleRotatePage = (index: number) => {
    const updated = [...pages];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setPages(updated);
  };

  const handleRotateAll = () => {
    const newGlobalRotation = (globalRotation + 90) % 360;
    setGlobalRotation(newGlobalRotation);
    setPages(pages.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      
      const pdfPages = pdfDoc.getPages();
      pages.forEach((p, index) => {
        if (p.rotation !== 0) {
          const currentRotation = pdfPages[index].getRotation().angle;
          pdfPages[index].setRotation(degrees(currentRotation + p.rotation));
        }
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `rotated_${file.name}`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast({ type: 'success', title: 'Success', message: 'PDF rotated and downloaded!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Processing Failed', message: 'Failed to rotate PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setGlobalRotation(0);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to rotate pages"
        description="Rotate individual pages or the entire document"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} icon={<FileText size={20} />} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
        <StatCard label="Total Pages" value={pages.length.toString()} icon={<FileText size={20} />} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
      </div>
      
      <div className="flex justify-between items-center bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)]">
        <button 
          onClick={handleRotateAll}
          className="px-4 py-2 bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border)] rounded-xl hover:border-[var(--c-gold)] transition flex items-center cursor-pointer text-sm font-semibold"
        >
          <RotateCw size={18} className="mr-2 text-[var(--c-gold)]" />
          Rotate All Pages
        </button>
        <button
          onClick={handleProcess}
          disabled={isProcessing || pages.length === 0}
          className="px-6 py-2.5 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold rounded-xl hover:bg-[var(--c-gold)] disabled:opacity-50 transition flex items-center cursor-pointer shadow-md"
        >
          {isProcessing ? 'Processing...' : <><Download size={18} className="mr-2" /> Download PDF</>}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((page, index) => (
          <div key={page.id} className="relative group rounded-xl overflow-hidden border border-[var(--c-border)] bg-[var(--c-card)] flex flex-col items-center p-2">
            <span className="absolute top-2 left-2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs px-2 py-1 rounded-md z-10 font-bold">{page.id}</span>
            <div className="w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden bg-white rounded-lg">
              <img 
                src={page.url} 
                alt={`Page ${page.id}`} 
                style={{ transform: `rotate(${page.rotation}deg)` }}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
              />
            </div>
            <button
              onClick={() => handleRotatePage(index)}
              className="mt-2 w-full flex items-center justify-center py-1.5 bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RotateCw size={14} className="mr-1" />
              Rotate 90°
            </button>
          </div>
        ))}
      </div>

      <PostCompletionRecommendations currentToolId="rotate-pdf" onReset={handleReset} />
    </div>
  );
};
