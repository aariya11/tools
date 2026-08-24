import React, { useState } from 'react';
import { Download, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { PDFDocument } from 'pdf-lib';

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const OrganizePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: string; originalIndex: number; url: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    
    try {
      const rendered = await renderPdfToJpg(selectedFile, 1.0);
      setPages(rendered.map((p, idx) => ({ id: `page-${p.pageNumber}`, originalIndex: idx, url: p.dataUrl })));
    } catch (err) {
      showToast({ type: 'error', title: 'Error reading PDF', message: 'Could not render PDF pages.' });
      setFile(null);
    }
  };

  const movePageLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...pages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setPages(updated);
  };

  const movePageRight = (index: number) => {
    if (index === pages.length - 1) return;
    const updated = [...pages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setPages(updated);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const originalPdf = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      
      const orderedIndices = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, orderedIndices);
      
      copiedPages.forEach(p => newPdf.addPage(p));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `organized_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF reorganized successfully!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Processing Failed', message: 'Failed to organize PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to organize"
        description="Reorder pages in your PDF document"
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
        <p className="text-sm text-[var(--c-muted)]">
          Use the arrows to reorder pages
        </p>
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
          <div key={page.id} className="group rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] p-2 flex flex-col">
            <div className="w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden bg-white rounded-lg relative">
              <span className="absolute top-2 left-2 bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs px-2 py-1 rounded-md z-10 font-bold">
                {index + 1}
              </span>
              <img 
                src={page.url} 
                alt={`Page ${index + 1}`} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="flex items-center justify-between mt-2 gap-2">
              <button
                onClick={() => movePageLeft(index)}
                disabled={index === 0}
                className="flex-1 flex justify-center py-1.5 bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] disabled:opacity-30 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => movePageRight(index)}
                disabled={index === pages.length - 1}
                className="flex-1 flex justify-center py-1.5 bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] disabled:opacity-30 rounded-lg transition cursor-pointer"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <PostCompletionRecommendations currentToolId="organize-pdf" onReset={handleReset} />
    </div>
  );
};
