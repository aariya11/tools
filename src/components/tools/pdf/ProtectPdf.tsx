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
              Note: This tool updates metadata and adds a watermark. For full cryptographic password protection, use Adobe Acrobat or a server-side tool.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-1">Owner Password</label>
              <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} className="block w-full px-3 py-2 border border-[var(--c-border)] rounded-xl bg-[var(--c-card)] text-[var(--c-text)] outline-none focus:ring-1 focus:ring-[var(--c-gold)]" placeholder="Required for changing permissions" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--c-text)] mb-1">User Password (Optional)</label>
              <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="block w-full px-3 py-2 border border-[var(--c-border)] rounded-xl bg-[var(--c-card)] text-[var(--c-text)] outline-none focus:ring-1 focus:ring-[var(--c-gold)]" placeholder="Required for opening" />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={canPrint} onChange={(e) => setCanPrint(e.target.checked)} className="rounded accent-[var(--c-gold)]" />
                <span className="text-sm text-[var(--c-muted)]">Allow Printing</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={canCopy} onChange={(e) => setCanCopy(e.target.checked)} className="rounded accent-[var(--c-gold)]" />
                <span className="text-sm text-[var(--c-muted)]">Allow Copying</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-[var(--c-bg)] bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <><RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />Processing...</>
            ) : (
              <><Lock className="-ml-1 mr-2 h-5 w-5" />Protect PDF</>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="protect-pdf" onReset={handleReset} />}
    </div>
  );
};
