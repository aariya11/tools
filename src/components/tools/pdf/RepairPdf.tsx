import React, { useState } from 'react';
import { Hammer, File, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const RepairPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [stats, setStats] = useState({ originalSize: 0, repairedSize: 0 });

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsDone(false);
    setStats({ originalSize: 0, repairedSize: 0 });
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { 
        ignoreEncryption: true,
      });
      
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
      
      setStats({
        originalSize: file.size,
        repairedSize: pdfBytes.length
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `repaired_${file.name}`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast({ type: 'success', title: 'Success', message: 'PDF repaired successfully!' });
      setIsDone(true);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to repair PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to repair"
        description="Fix structural issues in corrupted PDF files"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {isDone ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label="Original Size"
            value={formatFileSize(stats.originalSize)}
            badge="Before"
          />
          <StatCard
            label="Repaired Size"
            value={formatFileSize(stats.repairedSize)}
            badge="After"
            badgeType="success"
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Repairing...
              </>
            ) : (
              <>
                <Hammer className="-ml-1 mr-2 h-5 w-5 text-white" />
                Repair PDF
              </>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="repair-pdf" onReset={handleReset} />}
    </div>
  );
};
