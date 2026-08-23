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
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Code size={20}/> HTML Input</h3>
          <textarea
            className="w-full h-[400px] p-4 border rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste your HTML here..."
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="border rounded-xl bg-white h-[400px] overflow-hidden">
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
        <button onClick={handleReset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Reset</button>
        <button onClick={handleApply} disabled={isProcessing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Download size={18} /> Convert to PDF
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="html-to-pdf" onReset={handleReset} />
    </div>
  );
};
