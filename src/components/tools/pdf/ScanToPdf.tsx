import React, { useState, useRef, useEffect } from 'react';
import { Download, Camera, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { imagesToPdf } from '../../../utils/pdfUtils';
import { downloadBlob } from '../../../utils/fileUtils';

export const ScanToPdf: React.FC = () => {
  const [capturedImages, setCapturedImages] = useState<{dataUrl: string, width: number, height: number}[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        showToast({ type: 'error', title: 'Camera Error', message: 'Could not access camera.' });
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImages([...capturedImages, { dataUrl, width: canvas.width, height: canvas.height }]);
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  const handleApply = async () => {
    if (capturedImages.length === 0) return;
    setIsProcessing(true);
    try {
      const items: { file: File; dataUrl: string; width: number; height: number }[] = [];
      for (let i = 0; i < capturedImages.length; i++) {
        const item = capturedImages[i];
        const res = await fetch(item.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `scan-${i + 1}.jpg`, { type: 'image/jpeg' });
        items.push({ file, dataUrl: item.dataUrl, width: item.width, height: item.height });
      }

      const pdfBytes = await imagesToPdf(items, { orientation: 'auto', margin: 0 });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `scanned-document.pdf`);
      confetti();
      showToast({ type: 'success', title: 'Success', message: 'PDF generated successfully' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create PDF from scan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCapturedImages([]);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Live Camera</h3>
          <div className="rounded-2xl overflow-hidden bg-black aspect-[3/4] relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={handleCapture}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black p-4 rounded-full shadow-xl hover:bg-slate-200"
            >
              <Camera size={24} />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Captured Pages ({capturedImages.length})</h3>
          <div className="grid grid-cols-2 gap-4 auto-rows-max max-h-[600px] overflow-y-auto p-2">
            {capturedImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border shadow-sm">
                <img src={img.dataUrl} alt={`Page ${idx+1}`} className="w-full aspect-[3/4] object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Page {idx + 1}
                </div>
              </div>
            ))}
            {capturedImages.length === 0 && (
              <div className="col-span-2 text-center text-slate-500 py-12 bg-slate-50 rounded-xl dark:bg-slate-800/40">
                No pages captured yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleReset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Reset</button>
        <button 
          onClick={handleApply} 
          disabled={isProcessing || capturedImages.length === 0} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download size={18} /> Generate PDF
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="scan-to-pdf" onReset={handleReset} />
    </div>
  );
};
