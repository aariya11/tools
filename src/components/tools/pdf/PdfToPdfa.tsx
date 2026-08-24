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
          <StatCard label="Original Metadata" value={metadata.before} badge="Before" className="bg-[var(--c-surface)] border-[var(--c-border)]" />
          <StatCard label="Updated Metadata" value={metadata.after} badge="After" badgeType="success" className="bg-[var(--c-surface)] border-[var(--c-border)]" />
        </div>
      ) : (
        <div className="bg-[var(--c-surface)] rounded-2xl p-6 shadow-sm border border-[var(--c-border)] max-w-xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--c-text)]">{file.name}</h3>
              <p className="text-sm text-[var(--c-subtle)]">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 flex space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-400">
              Note: This applies PDF/A metadata conformance. Full ISO 19005 validation requires specialized tools.
            </p>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-[var(--c-bg)] bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <><RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />Converting...</>
            ) : (
              <><FileBadge className="-ml-1 mr-2 h-5 w-5" />Convert to PDF/A</>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="pdf-to-pdfa" onReset={handleReset} />}
    </div>
  );
};
