import React, { useState } from 'react';
import { Table, Download, Loader2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') { 
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl; 
}

export const PdfToExcel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setResultBlob(null);
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const wb = XLSX.utils.book_new();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group items by approximate Y position (rows)
        const items = textContent.items as any[];
        const rows: { [y: number]: any[] } = {};
        
        items.forEach(item => {
          const y = Math.round(item.transform[5] / 10) * 10; // group by 10 units
          if (!rows[y]) rows[y] = [];
          rows[y].push(item);
        });

        const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a); // top to bottom
        const sheetData: string[][] = [];

        sortedYs.forEach(y => {
          const rowItems = rows[y].sort((a, b) => a.transform[4] - b.transform[4]); // sort by X (columns)
          // Simplified row creation, joining closely spaced items
          const rowData = rowItems.map(item => item.str);
          sheetData.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
      }

      const xlsxBytes = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const xlsxBlob = new Blob([xlsxBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setResultBlob(xlsxBlob);
      setIsComplete(true);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF converted to Excel successfully!' });

    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Conversion Failed', message: 'Failed to convert PDF to Excel.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(resultBlob, `${originalName}_converted.xlsx`);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to convert to Excel"
        description="Select a PDF file with tabular data."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} />
        <StatCard label="File Size" value={formatFileSize(file.size)} />
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)]">
        {!isComplete ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] rounded-full">
              <Table className="w-8 h-8" />
            </div>
            
            <div className="p-4 bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)] rounded-xl max-w-md w-full flex items-start space-x-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--c-gold)]" />
              <div className="text-sm">
                <p>Best results with PDFs containing clear tabular data. Complex layouts may require manual adjustment after conversion.</p>
              </div>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Convert to Excel</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-[var(--c-card)] text-emerald-400 border border-[var(--c-border)] rounded-full flex items-center justify-center">
              <Table className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[var(--c-text)] mb-2">Conversion Complete!</h3>
              <p className="text-[var(--c-muted)]">Your Excel file is ready.</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download XLSX</span>
            </button>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="pdf-to-excel" onReset={handleReset} />
    </div>
  );
};
