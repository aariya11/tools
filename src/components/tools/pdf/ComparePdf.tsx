import React, { useState, useEffect } from 'react';
import { SplitSquareHorizontal } from 'lucide-react';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { renderPdfToJpg } from '../../../utils/pdfUtils';

export const ComparePdf: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [img1, setImg1] = useState<string | null>(null);
  const [img2, setImg2] = useState<string | null>(null);
  const [diffImg, setDiffImg] = useState<string | null>(null);
  const [diffPercent, setDiffPercent] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const processCompare = async () => {
    if (!file1 || !file2) return;
    setIsProcessing(true);
    try {
      const jpgs1 = await renderPdfToJpg(file1, 1.0);
      const jpgs2 = await renderPdfToJpg(file2, 1.0);
      
      if (!jpgs1 || !jpgs2 || !jpgs1.length || !jpgs2.length) throw new Error('Render failed');
      
      setImg1(jpgs1[0].dataUrl);
      setImg2(jpgs2[0].dataUrl);

      // Load images to canvas to compare pixels
      const image1 = new Image();
      const image2 = new Image();
      
      await Promise.all([
        new Promise(resolve => { image1.onload = resolve; image1.src = jpgs1[0].dataUrl; }),
        new Promise(resolve => { image2.onload = resolve; image2.src = jpgs2[0].dataUrl; })
      ]);

      const width = Math.max(image1.width, image2.width);
      const height = Math.max(image1.height, image2.height);

      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const diffCanvas = document.createElement('canvas');
      
      canvas1.width = width; canvas1.height = height;
      canvas2.width = width; canvas2.height = height;
      diffCanvas.width = width; diffCanvas.height = height;

      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');
      const diffCtx = diffCanvas.getContext('2d');

      if (!ctx1 || !ctx2 || !diffCtx) return;

      ctx1.drawImage(image1, 0, 0);
      ctx2.drawImage(image2, 0, 0);

      const data1 = ctx1.getImageData(0, 0, width, height).data;
      const data2 = ctx2.getImageData(0, 0, width, height).data;
      const diffData = diffCtx.createImageData(width, height);

      let changedPixels = 0;
      for (let i = 0; i < data1.length; i += 4) {
        if (Math.abs(data1[i] - data2[i]) > 10 || 
            Math.abs(data1[i+1] - data2[i+1]) > 10 || 
            Math.abs(data1[i+2] - data2[i+2]) > 10) {
          // Changed pixel - mark red
          diffData.data[i] = 255;
          diffData.data[i+1] = 0;
          diffData.data[i+2] = 0;
          diffData.data[i+3] = 255;
          changedPixels++;
        } else {
          // Unchanged - faded greyscale of image1
          const avg = (data1[i] + data1[i+1] + data1[i+2]) / 3;
          diffData.data[i] = avg;
          diffData.data[i+1] = avg;
          diffData.data[i+2] = avg;
          diffData.data[i+3] = 50; // low opacity
        }
      }

      diffCtx.putImageData(diffData, 0, 0);
      setDiffImg(diffCanvas.toDataURL());
      setDiffPercent((changedPixels / (width * height)) * 100);

    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to compare PDFs.' });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file1 && file2) {
      processCompare();
    }
  }, [file1, file2]);

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setImg1(null);
    setImg2(null);
    setDiffImg(null);
  };

  if (!file1 || !file2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-bold mb-4 text-[var(--c-text)]">Original PDF</h3>
          <FileUploader
            accept="application/pdf"
            allowedFormatsText="PDF"
            label="Drop Original PDF here"
            description="Select the base version"
            onFilesSelected={(f) => setFile1(f[0])}
          />
        </div>
        <div>
          <h3 className="text-base font-bold mb-4 text-[var(--c-text)]">Modified PDF</h3>
          <FileUploader
            accept="application/pdf"
            allowedFormatsText="PDF"
            label="Drop Modified PDF here"
            description="Select the updated version"
            onFilesSelected={(f) => setFile2(f[0])}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isProcessing ? (
        <div className="py-20 text-center text-[var(--c-subtle)]">Analyzing differences...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Visual Difference" value={`${diffPercent.toFixed(2)}%`} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
            <StatCard label="Original Size" value={(file1.size / 1024 / 1024).toFixed(2) + ' MB'} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
            <StatCard label="Modified Size" value={(file2.size / 1024 / 1024).toFixed(2) + ' MB'} className="bg-[var(--c-surface)] border-[var(--c-border)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[var(--c-border)] rounded-2xl bg-[var(--c-surface)] p-3">
              <h4 className="text-center font-semibold mb-2 text-[var(--c-muted)] text-sm">Original</h4>
              {img1 && <img src={img1} alt="Original" className="w-full h-auto shadow rounded-lg border border-[var(--c-border)]" />}
            </div>
            <div className="border border-[var(--c-border)] rounded-2xl bg-[var(--c-surface)] p-3">
              <h4 className="text-center font-semibold mb-2 text-[var(--c-gold)] flex justify-center items-center gap-2 text-sm">
                <SplitSquareHorizontal size={16} /> Difference Overlay
              </h4>
              {diffImg && <img src={diffImg} alt="Diff" className="w-full h-auto shadow rounded-lg border border-[var(--c-border)]" />}
            </div>
            <div className="border border-[var(--c-border)] rounded-2xl bg-[var(--c-surface)] p-3">
              <h4 className="text-center font-semibold mb-2 text-[var(--c-muted)] text-sm">Modified</h4>
              {img2 && <img src={img2} alt="Modified" className="w-full h-auto shadow rounded-lg border border-[var(--c-border)]" />}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end items-center">
        <button onClick={handleReset} className="px-5 py-2.5 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold hover:bg-[var(--c-gold)] rounded-xl transition cursor-pointer shadow-md text-sm">Compare New Files</button>
      </div>
      
      <PostCompletionRecommendations currentToolId="compare-pdf" onReset={handleReset} />
    </div>
  );
};
