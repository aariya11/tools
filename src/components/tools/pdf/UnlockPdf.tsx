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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password (optional if you want to try without first)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter document password"
              />
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="-ml-1 mr-2 h-5 w-5 text-white" />
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
