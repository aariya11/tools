import React, { useState } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const WordToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
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
    setWarnings([]);
    setResultBlob(null);
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setWarnings([]);
      const arrayBuffer = await readFileAsArrayBuffer(file);

      // Convert docx to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.messages.length > 0) {
        setWarnings(result.messages.map(msg => msg.message));
      }

      // Render HTML in a hidden container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '794px'; // A4 width at 96 DPI
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#000000';
      container.style.padding = '40px';
      container.innerHTML = result.value;
      document.body.appendChild(container);

      // Wait a moment for images/fonts to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container, { scale: 2 });
      document.body.removeChild(container);

      // Convert canvas to PDF
      const pdfDoc = await PDFDocument.create();
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

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setResultBlob(pdfBlob);
      setIsComplete(true);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast({ type: 'success', title: 'Success', message: 'Word document converted to PDF successfully!' });

    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Conversion Failed', message: 'Failed to convert Word document.' });
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
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        allowedFormatsText="DOCX"
        label="Drop Word document here to convert to PDF"
        description="Select a .docx file to convert securely on your device."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="File Name"
          value={file.name}
        />
        <StatCard
          label="File Size"
          value={formatFileSize(file.size)}
        />
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
        {!isComplete ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-center text-slate-600 dark:text-slate-300">Ready to convert <strong>{file.name}</strong> to PDF.</p>
            {warnings.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg max-w-md w-full flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Conversion Warnings:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            )}
            <button
              onClick={processFile}
              disabled={isProcessing}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Conversion Complete!</h3>
              <p className="text-slate-600 dark:text-slate-400">Your PDF is ready for download.</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="word-to-pdf" onReset={handleReset} />
    </div>
  );
};
