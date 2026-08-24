import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { showToast } from '../../common/Toast';

export const QrCodeScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check if BarcodeDetector is supported
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsScanningCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera scanner loop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanningCamera(true);

      // Detect QR codes in video frame
      if (hasBarcodeDetector) {
        // @ts-expect-error BarcodeDetector is a standard web API
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });

        const scanLoop = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                setScanResult(barcodes[0].rawValue);
                showToast('QR Code detected!', 'success');
                stopCamera();
                return;
              }
            } catch (err) {
              console.error('Scan error:', err);
            }
          }
          animFrameRef.current = requestAnimationFrame(scanLoop);
        };
        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a QR image instead.');
      setIsScanningCamera(false);
    }
  };

  // Image Upload Scanner
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (hasBarcodeDetector) {
        // @ts-expect-error BarcodeDetector
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
        const imageBitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0) {
          setScanResult(barcodes[0].rawValue);
          showToast('QR Code detected successfully!', 'success');
        } else {
          showToast('No QR code found in uploaded image.', 'error');
        }
      } else {
        showToast('Image scanning requires Chrome, Edge or a supported browser.', 'info');
      }
    } catch (err) {
      console.error('Image scan error:', err);
      showToast('Could not parse image.', 'error');
    }
  };

  const handleCopy = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = scanResult?.startsWith('http://') || scanResult?.startsWith('https://');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Scanner Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Camera Scanner Trigger */}
        <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Live Camera Scan</h3>
            <p className="text-xs text-[var(--c-muted)] mt-1">Scan QR codes with your device webcam or phone camera</p>
          </div>
          <button
            onClick={isScanningCamera ? stopCamera : startCamera}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isScanningCamera
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-[var(--c-accent)] text-[var(--c-bg)] hover:bg-[var(--c-gold)]'
            }`}
          >
            {isScanningCamera ? 'Stop Camera' : 'Start Camera Scanner'}
          </button>
        </div>

        {/* Image File Upload Trigger */}
        <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--c-text)]">Upload QR Image</h3>
            <p className="text-xs text-[var(--c-muted)] mt-1">Select an image, screenshot or photo containing a QR code</p>
          </div>
          <label className="block w-full py-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] text-[var(--c-text)] text-xs font-bold transition-all cursor-pointer">
            <span>Browse Image File</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Camera Live Viewport */}
      {isScanningCamera && (
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-video max-w-lg mx-auto border-2 border-[var(--c-gold)] shadow-2xl">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <div className="absolute inset-0 border-2 border-dashed border-[var(--c-gold)]/60 m-12 rounded-2xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] text-[var(--c-text)] font-mono">
            Align QR Code in center
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Result Card */}
      {scanResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-gold)]">
              Scanned QR Content
            </span>
            <button
              onClick={() => setScanResult(null)}
              className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)]"
            >
              Clear
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-sm font-mono break-all text-[var(--c-text)] leading-relaxed">
            {scanResult}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Content'}</span>
            </button>

            {isUrl && (
              <a
                href={scanResult}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] hover:border-[var(--c-border-hover)] text-[var(--c-text)] text-xs font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Open URL Link</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
