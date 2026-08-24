import React, { useState } from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
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

export const RemovePages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: number; url: string; remove: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    
    try {
      const rendered = await renderPdfToJpg(selectedFile, 1.0);
      setPages(rendered.map(p => ({ id: p.pageNumber, url: p.dataUrl, remove: false })));
    } catch (err) {
      showToast({ type: 'error', title: 'Error reading PDF', message: 'Could not render PDF pages.' });
      setFile(null);
    }
  };

  const togglePage = (index: number) => {
    const updated = [...pages];
    updated[index].remove = !updated[index].remove;
    setPages(updated);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const originalPdf = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      
      const pagesToKeep = pages.map((p, i) => !p.remove ? i : -1).filter(i => i !== -1);
      
      if (pagesToKeep.length === 0) {
        showToast({ type: 'error', title: 'Cannot save empty PDF', message: 'You must keep at least one page.' });
        setIsProcessing(false);
        return;
      }
      
      const copiedPages = await newPdf.copyPages(originalPdf, pagesToKeep);
      copiedPages.forEach(p => newPdf.addPage(p));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `trimmed_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'Pages removed successfully!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Processing Failed', message: 'Failed to remove pages.' });
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
        label="Drop PDF here to remove pages"
        description="Select specific pages to delete from your document"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const pagesToKeep = pages.filter(p => !p.remove).length;
  const pagesToRemove = pages.length - pagesToKeep;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} icon={<FileText size={20} />} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
        <StatCard 
          label="Keeping Pages" 
          value={`${pagesToKeep} of ${pages.length}`} 
          subValue={pagesToRemove > 0 ? `${pagesToRemove} to remove` : ''} 
          icon={<Trash2 size={20} />} 
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
      </div>
      
      <div className="flex justify-between items-center bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)]">
        <p className="text-sm text-[var(--c-muted)]">
          Click pages to mark them for removal (highlighted in red)
        </p>
        <button
          onClick={handleProcess}
          disabled={isProcessing || pagesToKeep === 0 || pages.length === 0}
          className="px-6 py-2.5 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold rounded-xl hover:bg-[var(--c-gold)] disabled:opacity-50 transition flex items-center cursor-pointer shadow-md"
        >
          {isProcessing ? 'Processing...' : <><Download size={18} className="mr-2" /> Download PDF</>}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((page, index) => (
          <div 
            key={page.id} 
            onClick={() => togglePage(index)}
            className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col p-1
              ${page.remove ? 'border-rose-500 bg-rose-500/10' : 'border-[var(--c-border)] hover:border-[var(--c-gold)] bg-[var(--c-card)]'}
            `}
          >
            <span className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-md z-10 font-bold
              ${page.remove ? 'bg-rose-500' : 'bg-black/70'}`}
            >
              {page.id}
            </span>
            {page.remove && (
              <div className="absolute inset-0 bg-rose-500/20 z-0 flex items-center justify-center pointer-events-none">
                <Trash2 size={48} className="text-rose-500 opacity-70" />
              </div>
            )}
            <div className="w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden bg-white rounded-lg relative z-0">
              <img 
                src={page.url} 
                alt={`Page ${page.id}`} 
                className={`max-w-full max-h-full object-contain ${page.remove ? 'opacity-30 grayscale' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      <PostCompletionRecommendations currentToolId="remove-pages" onReset={handleReset} />
    </div>
  );
};
