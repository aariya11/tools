import React, { useState } from 'react';
import { Unlock, File, RefreshCw, Key } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const UnlockPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setIsDone(false);
    setPassword('');
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const options: any = { ignoreEncryption: true };
      if (password) options.password = password;

      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), options);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `unlocked_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF unlocked and downloaded!' });
      setIsDone(true);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to unlock. Password might be incorrect or missing.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to unlock"
        description="Remove password protection from PDF files"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {!isDone && (
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
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
              Password (optional if you want to try without first)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-[var(--c-subtle)]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-[var(--c-border)] rounded-xl leading-5 bg-[var(--c-card)] text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--c-gold)] text-sm"
                placeholder="Enter document password"
              />
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-[var(--c-bg)] bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="-ml-1 mr-2 h-5 w-5" />
                Unlock PDF
              </>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="unlock-pdf" onReset={handleReset} />}
    </div>
  );
};
