import React, { useState } from 'react';
import { Table, Download, Loader2, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const ExcelToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        setWorkbook(wb);
        setSelectedSheets(wb.SheetNames);
      } catch (error) {
        console.error(error);
        showToast({ type: 'error', title: 'Error', message: 'Failed to read Excel file.' });
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setWorkbook(null);
    setSelectedSheets([]);
    setIsProcessing(false);
    setIsComplete(false);
    setResultBlob(null);
  };

  const toggleSheet = (sheetName: string) => {
    setSelectedSheets(prev => 
      prev.includes(sheetName) ? prev.filter(s => s !== sheetName) : [...prev, sheetName]
    );
  };

  const processFile = async () => {
    if (!workbook || selectedSheets.length === 0) {
      showToast({ type: 'error', title: 'Invalid Selection', message: 'Please select at least one sheet.' });
      return;
    }

    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.create();

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '794px'; 
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#000000';
      container.style.padding = '20px';
      
      const style = document.createElement('style');
      style.innerHTML = `
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ccc; padding: 4px; font-size: 12px; }
      `;
      container.appendChild(style);
      document.body.appendChild(container);

      for (const sheetName of selectedSheets) {
        const sheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(sheet);
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<h3>${sheetName}</h3>` + html;
        container.appendChild(wrapper);

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(wrapper, { scale: 2 });
        container.removeChild(wrapper);

        const imgBytes = await new Promise<Uint8Array>(resolve => {
          canvas.toBlob(async blob => {
            if (blob) {
              const buf = await blob.arrayBuffer();
              resolve(new Uint8Array(buf));
            } else {
              resolve(new Uint8Array());
            }
          }, 'image/jpeg', 0.95);
        });

        if (imgBytes.length > 0) {
          const image = await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([canvas.width / 2, canvas.height / 2]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: canvas.width / 2,
            height: canvas.height / 2
          });
        }
      }

      document.body.removeChild(container);

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setResultBlob(pdfBlob);
      setIsComplete(true);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'Excel converted to PDF successfully!' });

    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Conversion Failed', message: 'Failed to convert Excel to PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(resultBlob, `${originalName}_converted.pdf`);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        allowedFormatsText="XLSX, XLS"
        label="Drop Excel file here to convert to PDF"
        description="Select an Excel file to convert securely on your device."
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

      <div className="p-8 bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)]">
        {!isComplete ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] rounded-full">
              <Table className="w-8 h-8" />
            </div>
            
            <div className="w-full max-w-md">
              <h4 className="font-medium text-[var(--c-text)] mb-3">Select sheets to include:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {workbook?.SheetNames.map(sheetName => (
                  <button
                    key={sheetName}
                    onClick={() => toggleSheet(sheetName)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedSheets.includes(sheetName)
                        ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] font-bold'
                        : 'bg-[var(--c-card)] text-[var(--c-text)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                    }`}
                  >
                    <span className="text-sm font-medium">{sheetName}</span>
                    {selectedSheets.includes(sheetName) && (
                      <CheckSquare className="w-5 h-5 text-[var(--c-bg)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing || selectedSheets.length === 0}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Convert to PDF</span>
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
              <p className="text-[var(--c-muted)]">Your PDF is ready for download.</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="excel-to-pdf" onReset={handleReset} />
    </div>
  );
};
