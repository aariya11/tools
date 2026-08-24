import React, { useState } from 'react';
import { Download, FileText, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const AddPageNumbers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [position, setPosition] = useState('bottom-center');
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState('X');

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      const margin = 30;
      
      pages.forEach((page, index) => {
        const pageNum = startNumber + index;
        let text = `${pageNum}`;
        if (format === 'Page X') text = `Page ${pageNum}`;
        if (format === 'X of N') text = `${pageNum} of ${totalPages}`;
        
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { width, height } = page.getSize();
        
        let x = margin;
        let y = margin;
        
        if (position.includes('top')) y = height - margin - fontSize;
        else y = margin;
        
        if (position.includes('center')) x = width / 2 - textWidth / 2;
        else if (position.includes('right')) x = width - margin - textWidth;
        else x = margin;
        
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `numbered_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'Page numbers added!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Processing Failed', message: 'Could not add page numbers.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to add page numbers"
        description="Customize position, format, and font size"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} icon={<FileText size={20} />} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
        <StatCard label="File Size" value={formatFileSize(file.size)} icon={<FileText size={20} />} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
      </div>
      
      <div className="bg-[var(--c-surface)] p-6 rounded-2xl space-y-4 border border-[var(--c-border)] max-w-xl mx-auto">
        <h3 className="font-semibold flex items-center text-[var(--c-text)]">
          <Settings size={18} className="mr-2 text-[var(--c-gold)]" /> Page Number Settings
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--c-muted)] mb-1">Position</label>
            <select 
              value={position} 
              onChange={e => setPosition(e.target.value)}
              className="w-full bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--c-gold)]"
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--c-muted)] mb-1">Format</label>
            <select 
              value={format} 
              onChange={e => setFormat(e.target.value)}
              className="w-full bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--c-gold)]"
            >
              <option value="X">1, 2, 3...</option>
              <option value="Page X">Page 1, Page 2...</option>
              <option value="X of N">1 of 10, 2 of 10...</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--c-muted)] mb-1">Starting Number</label>
            <input 
              type="number" 
              min="1" 
              value={startNumber} 
              onChange={e => setStartNumber(Number(e.target.value))}
              className="w-full bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border)] rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-[var(--c-gold)]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--c-muted)] mb-1">Font Size ({fontSize}pt)</label>
            <input 
              type="range" 
              min="10" 
              max="24" 
              value={fontSize} 
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-full cursor-pointer accent-[var(--c-gold)]"
            />
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full mt-4 py-3.5 px-6 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold rounded-xl hover:bg-[var(--c-gold)] disabled:opacity-50 transition flex items-center justify-center cursor-pointer shadow-md"
        >
          {isProcessing ? 'Processing...' : <><Download size={18} className="mr-2" /> Download Numbered PDF</>}
        </button>
      </div>

      <PostCompletionRecommendations currentToolId="add-page-numbers" onReset={handleReset} />
    </div>
  );
};
