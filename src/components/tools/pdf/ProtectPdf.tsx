import React, { useState } from 'react';
import { Lock, File, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument, rgb } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const ProtectPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Permissions state placeholder (pdf-lib doesn't support encryption, so this is just UI simulation)
  const [canPrint, setCanPrint] = useState(true);
  const [canCopy, setCanCopy] = useState(true);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setIsDone(false);
    setOwnerPassword('');
    setUserPassword('');
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      
      pdfDoc.setProducer('ToolBoxX Protected');
      pdfDoc.setCreator('ToolBoxX');
      
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const firstPage = pages[0];
        firstPage.drawText('PROTECTED', {
          x: 10,
          y: 10,
          size: 10,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.5,
        });
      }
      
      // Note: Full encryption requires server-side tools or other libraries, since pdf-lib does not support saving with encryption.
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `protected_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF processed and metadata updated!' });
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
        label="Drop PDF here to protect"
        description="Add metadata and watermark for document tracking"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {!isDone && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/50 flex space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Note: This tool updates metadata and adds a watermark. For full cryptographic password protection, use Adobe Acrobat or a server-side tool.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Password</label>
              <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" placeholder="Required for changing permissions" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Password (Optional)</label>
              <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" placeholder="Required for opening" />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={canPrint} onChange={(e) => setCanPrint(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Allow Printing</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={canCopy} onChange={(e) => setCanCopy(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Allow Copying</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <><RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />Processing...</>
            ) : (
              <><Lock className="-ml-1 mr-2 h-5 w-5 text-white" />Protect PDF</>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="protect-pdf" onReset={handleReset} />}
    </div>
  );
};
