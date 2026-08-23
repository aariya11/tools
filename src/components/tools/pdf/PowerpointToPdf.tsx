import React, { useState } from 'react';
import { Presentation, Download, Loader2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

export const PowerpointToPdf: React.FC = () => {
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
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      const zip = await JSZip.loadAsync(arrayBuffer);
      const pdfDoc = await PDFDocument.create();
      
      // Attempt to find slide XML files
      const slidesPath = 'ppt/slides/';
      const slideFiles = Object.keys(zip.files).filter(name => name.startsWith(slidesPath) && name.endsWith('.xml'));
      
      if (slideFiles.length === 0) {
        throw new Error('No slides found in the presentation.');
      }

      // Sort slide files correctly (slide1.xml, slide2.xml, ...)
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        return numA - numB;
      });

      for (const slideFile of slideFiles) {
        const slideXmlStr = await zip.files[slideFile].async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXmlStr, "text/xml");
        
        // Extract basic text
        const texts = Array.from(xmlDoc.getElementsByTagName('a:t')).map(node => node.textContent || '');
        
        // Add a basic PDF page
        const page = pdfDoc.addPage([960, 540]); // standard 16:9 
        const { height } = page.getSize();
        
        let yOffset = height - 50;
        
        for (const text of texts) {
          if (text.trim() && yOffset > 50) {
            try {
              page.drawText(text, {
                x: 50,
                y: yOffset,
                size: 14,
                color: rgb(0, 0, 0),
              });
              yOffset -= 20;
            } catch(e) {
               // Ignore drawText errors due to unsupported characters etc.
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setResultBlob(pdfBlob);
      setIsComplete(true);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'PowerPoint converted to basic PDF successfully!' });

    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Conversion Failed', message: 'Failed to convert PowerPoint file.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(resultBlob, `${originalName}_converted.pdf`);
    }
  };

  if (!file) {
    return (
      <FileUploader
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        allowedFormatsText="PPTX"
        label="Drop PowerPoint file here to convert to PDF"
        description="Select a .pptx file for basic client-side conversion."
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

      <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
        {!isComplete ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
              <Presentation className="w-8 h-8" />
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg max-w-md w-full flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Important Note:</p>
                <p>This is a basic client-side conversion. Complex animations, charts, and custom fonts may not render perfectly in the output PDF.</p>
              </div>
            </div>

            <button
              onClick={processFile}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Convert to PDF</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
              <Presentation className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Conversion Complete!</h3>
              <p className="text-slate-600 dark:text-slate-400">Your PDF is ready for download.</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="powerpoint-to-pdf" onReset={handleReset} />
    </div>
  );
};
