import React, { useState } from 'react';
import { Download, FileText, Type } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export const AddWatermark: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.2);
  const [angle, setAngle] = useState(-45);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textHeight / 2,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(angle),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `watermarked_${file.name}`);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({ type: 'success', title: 'Success', message: 'Watermark added!' });
    } catch (err) {
      showToast({ type: 'error', title: 'Processing Failed', message: 'Could not add watermark.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF here to add watermark"
        description="Add a customizable text watermark to all pages"
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="File Name" value={file.name} icon={<FileText size={20} />} />
        <StatCard label="File Size" value={formatFileSize(file.size)} icon={<FileText size={20} />} />
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold flex items-center text-slate-800 dark:text-slate-200">
          <Type size={18} className="mr-2" /> Watermark Settings
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Watermark Text</label>
            <input 
              type="text" 
              value={text} 
              onChange={e => setText(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
              placeholder="e.g. CONFIDENTIAL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Font Size ({fontSize}pt)</label>
            <input 
              type="range" min="20" max="120" 
              value={fontSize} 
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Opacity ({Math.round(opacity * 100)}%)</label>
            <input 
              type="range" min="0.05" max="0.5" step="0.01" 
              value={opacity} 
              onChange={e => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Rotation Angle ({angle}°)</label>
            <input 
              type="range" min="-90" max="90" 
              value={angle} 
              onChange={e => setAngle(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !text}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
        >
          {isProcessing ? 'Processing...' : <><Download size={18} className="mr-2" /> Download PDF</>}
        </button>
      </div>

      <PostCompletionRecommendations currentToolId="add-watermark" onReset={handleReset} />
    </div>
  );
};
