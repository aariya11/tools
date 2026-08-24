import React, { useState } from 'react';
import { FileType, Download, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { renderPdfToJpg } from '../../../utils/pdfUtils';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') { 
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl; 
}

export const PdfToWord: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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
    setResultBlob(null);
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      
      const images = await renderPdfToJpg(file, 2.0);
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const sections = [];

      for (let i = 0; i < images.length; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        
        const imgBuffer = await images[i].blob.arrayBuffer();

        sections.push({
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  type: 'jpg',
                  data: imgBuffer,
                  transformation: { width: 600, height: 800 },
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: textItems.substring(0, 500) + (textItems.length > 500 ? '...' : ''), // Include some searchable text invisibly or at bottom
                  size: 1, // tiny text
                  color: "FFFFFF" // white text to be invisible
                })
              ]
            })
          ],
        });
      }

      const doc = new Document({ sections });
      const docxBuffer = await Packer.toBlob(doc);
      
      setResultBlob(docxBuffer);
      setIsComplete(true);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PDF converted to Word successfully!' });

    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Conversion Failed', message: 'Failed to convert PDF to Word.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(resultBlob, `${originalName}_converted.docx`);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to convert to Word"
        description="Select a PDF file to convert to a Word document."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} />
        <StatCard label="File Size" value={formatFileSize(file.size)} />
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)]">
        {!isComplete ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-[var(--c-card)] text-[var(--c-gold)] border border-[var(--c-border)] rounded-full">
              <FileType className="w-8 h-8" />
            </div>
            <p className="text-center text-[var(--c-muted)]">Convert <strong>{file.name}</strong> to Word document.</p>
            <button
              onClick={processFile}
              disabled={isProcessing}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Convert to Word</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-[var(--c-card)] text-emerald-400 border border-[var(--c-border)] rounded-full flex items-center justify-center">
              <FileType className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[var(--c-text)] mb-2">Conversion Complete!</h3>
              <p className="text-[var(--c-muted)]">Your Word document is ready.</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3.5 bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download DOCX</span>
            </button>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="pdf-to-word" onReset={handleReset} />
    </div>
  );
};
