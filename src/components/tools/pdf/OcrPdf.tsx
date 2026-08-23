import React, { useState } from 'react';
import { ScanSearch, Download, Copy, RefreshCw, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const OcrPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(0);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setExtractedText('');
    setProgress('');
  };

  const handleOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setExtractedText('');
    setProgress('Rendering PDF pages...');

    try {
      const pages = await renderPdfToJpg(file, 2.0, (current, total) => {
        setProgress(`Rendering page ${current} of ${total}...`);
      });
      setPageCount(pages.length);

      // Dynamically import Tesseract.js only when needed (heavy ~2-4MB WASM)
      setProgress('Loading OCR engine (first load may take a moment)...');
      const Tesseract = await import('tesseract.js');

      let fullText = '';

      for (let i = 0; i < pages.length; i++) {
        setProgress(`Recognizing text on page ${i + 1} of ${pages.length}...`);

        const result = await Tesseract.recognize(pages[i].dataUrl, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round((m.progress || 0) * 100);
              setProgress(`Page ${i + 1}/${pages.length}: ${pct}% recognized`);
            }
          },
        });

        if (result.data.text.trim()) {
          fullText += `--- Page ${i + 1} ---\n${result.data.text.trim()}\n\n`;
        }
      }

      setExtractedText(fullText.trim() || 'No text could be recognized from this PDF. The document may contain non-text content or very low quality scans.');
      setIsProcessing(false);
      setProgress('');

      showToast({
        type: 'success',
        title: 'OCR Complete',
        message: `Extracted text from ${pages.length} pages.`,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setProgress('');
      showToast({
        type: 'error',
        title: 'OCR Failed',
        message: err.message || 'Failed to process the PDF for text recognition.',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied!', message: 'Extracted text copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const filename = `${file.name.replace(/\.pdf$/i, '')}_ocr_text.txt`;
    downloadBlob(blob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Text File Downloaded',
      message: `Saved ${filename}`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setProgress('');
    setPageCount(0);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop a scanned PDF here for OCR"
        description="Extract text from scanned documents, photos, or image-based PDFs using browser-based optical character recognition."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Document"
          value={file.name}
          subValue={formatFileSize(file.size)}
          className="bg-slate-50 dark:bg-slate-800/40 truncate"
        />
        <StatCard
          label="Pages Scanned"
          value={pageCount > 0 ? `${pageCount} Pages` : 'Pending'}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Extracted Text"
          value={extractedText ? `${extractedText.split(/\s+/).length} words` : 'Pending'}
          badge={extractedText ? 'Ready' : undefined}
          badgeType="success"
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
      </div>

      {/* Main workspace */}
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change File
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!extractedText ? (
              <button
                onClick={handleOcr}
                disabled={isProcessing}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-98"
              >
                <ScanSearch className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Recognize Text (OCR)'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" /> Download .txt
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {isProcessing && progress && (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{progress}</p>
            <p className="text-xs text-slate-400 mt-1">OCR engine runs entirely in your browser. No data is uploaded.</p>
          </div>
        )}

        {/* Extracted text output */}
        {extractedText && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Extracted Text
            </h4>
            <textarea
              readOnly
              value={extractedText}
              rows={16}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm leading-relaxed font-mono resize-y"
            />
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="ocr-pdf" onReset={handleReset} />
    </div>
  );
};
