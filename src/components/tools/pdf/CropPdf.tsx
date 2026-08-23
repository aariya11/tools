import React, { useState, useEffect } from 'react';
import { Crop, File, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const CropPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const [margins, setMargins] = useState({ top: 36, bottom: 36, left: 36, right: 36 });

  useEffect(() => {
    if (file) {
      loadThumbnail();
    }
  }, [file]);

  const loadThumbnail = async () => {
    try {
      const jpgs = await renderPdfToJpg(file!, 1.0);
      if (jpgs.length > 0) setThumbnail(jpgs[0].dataUrl);
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', title: 'Error', message: 'Failed to load thumbnail' });
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setThumbnail(null);
    setIsDone(false);
    setMargins({ top: 36, bottom: 36, left: 36, right: 36 });
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMargins(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.setCropBox(
          margins.left,
          margins.bottom,
          width - margins.left - margins.right,
          height - margins.top - margins.bottom
        );
      });
      
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `cropped_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF cropped successfully!' });
      setIsDone(true);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to crop PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to crop"
        description="Crop margins of all pages in your PDF"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {!isDone && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Preview */}
            <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-xl p-4 overflow-hidden relative">
              {thumbnail ? (
                <div className="relative">
                  <img src={thumbnail} alt="Preview" className="max-w-full h-auto max-h-[400px] border border-slate-300 dark:border-slate-700 shadow-sm" />
                  <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                      ${Math.min(100, margins.left / 6)}% ${Math.min(100, margins.top / 8)}%,
                      ${Math.min(100, margins.left / 6)}% ${100 - Math.min(100, margins.bottom / 8)}%,
                      ${100 - Math.min(100, margins.right / 6)}% ${100 - Math.min(100, margins.bottom / 8)}%,
                      ${100 - Math.min(100, margins.right / 6)}% ${Math.min(100, margins.top / 8)}%,
                      ${Math.min(100, margins.left / 6)}% ${Math.min(100, margins.top / 8)}%
                    )`
                  }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 w-full">
                  <RefreshCw className="animate-spin h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Margins (pts)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Top</label>
                  <input type="number" name="top" value={margins.top} onChange={handleMarginChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Bottom</label>
                  <input type="number" name="bottom" value={margins.bottom} onChange={handleMarginChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Left</label>
                  <input type="number" name="left" value={margins.left} onChange={handleMarginChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Right</label>
                  <input type="number" name="right" value={margins.right} onChange={handleMarginChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700" />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <><RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />Cropping...</>
            ) : (
              <><Crop className="-ml-1 mr-2 h-5 w-5 text-white" />Crop PDF</>
            )}
          </button>
        </div>
      )}
      
      {isDone && <PostCompletionRecommendations currentToolId="crop-pdf" onReset={handleReset} />}
    </div>
  );
};
