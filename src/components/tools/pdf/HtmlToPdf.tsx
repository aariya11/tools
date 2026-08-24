import React, { useState, useRef } from 'react';
import { Download, Code } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export const HtmlToPdf: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('<h1>Hello PDF</h1>\n<p>This is a sample HTML content.</p>');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = async () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument?.body) return;
    setIsProcessing(true);
    try {
      const body = iframeRef.current.contentDocument.body;
      const canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      const pdfDoc = await PDFDocument.create();
      const jpgImage = await pdfDoc.embedJpg(imgData);
      const page = pdfDoc.addPage([canvas.width, canvas.height]);
      
      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `html-to-pdf.pdf`);
      confetti();
      showToast({ type: 'success', title: 'Success', message: 'PDF generated successfully' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to convert HTML to PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setHtmlContent('<h1>Hello PDF</h1>\n<p>This is a sample HTML content.</p>');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[var(--c-text)]"><Code size={20} className="text-[var(--c-gold)]"/> HTML Input</h3>
          <textarea
            className="w-full h-[400px] p-4 border border-[var(--c-border)] rounded-xl font-mono text-sm resize-none focus:ring-1 focus:ring-[var(--c-gold)] outline-none bg-[var(--c-surface)] text-[var(--c-text)]"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste your HTML here..."
          />
        </div>
        
        <div>
          <h3 className="text-base font-bold mb-4 text-[var(--c-text)]">Live Rendered Preview</h3>
          <div className="border border-[var(--c-border)] rounded-xl bg-white h-[400px] overflow-hidden shadow-inner">
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              srcDoc={htmlContent}
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleReset} className="px-4 py-2 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer">Reset Default</button>
        <button onClick={handleApply} disabled={isProcessing} className="px-6 py-2.5 bg-[var(--c-accent)] text-[var(--c-bg)] font-bold rounded-xl flex items-center gap-2 hover:bg-[var(--c-gold)] transition cursor-pointer shadow-md">
          <Download size={18} /> {isProcessing ? 'Converting...' : 'Convert HTML to PDF'}
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="html-to-pdf" onReset={handleReset} />
    </div>
  );
};
