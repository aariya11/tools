import React, { useState } from 'react';
import { FileBadge, File, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const PdfToPdfa: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [metadata, setMetadata] = useState({ before: '', after: '' });

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setIsDone(false);
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      
      const beforeTitle = pdfDoc.getTitle() || 'None';
      
      pdfDoc.setTitle(beforeTitle !== 'None' ? beforeTitle : file.name);
      pdfDoc.setProducer('ToolBoxX PDF/A Converter');
      pdfDoc.setCreator('ToolBoxX');
      
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      setMetadata({
        before: `Title: ${beforeTitle}`,
        after: `Title: ${pdfDoc.getTitle() || 'None'}`
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `pdfa_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF converted to PDF/A format!' });
      setIsDone(true);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to process PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here for PDF/A"
        description="Optimize metadata for long-term archiving"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {isDone ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Original Metadata" value={metadata.before} badge="Before" />
          <StatCard label="Updated Metadata" value={metadata.after} badge="After" badgeType="success" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/50 flex space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Note: This applies PDF/A metadata conformance. Full ISO 19005 validation requires specialized tools.
            </p>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <><RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />Converting...</>
            ) : (
              <><FileBadge className="-ml-1 mr-2 h-5 w-5 text-white" />Convert to PDF/A</>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="pdf-to-pdfa" onReset={handleReset} />}
    </div>
  );
};
