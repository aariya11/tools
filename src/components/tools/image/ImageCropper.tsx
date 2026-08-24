import React, { useState, useRef, useCallback } from 'react';
import {
  Crop,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  RefreshCw,
  Grid,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

interface AspectRatioOption {
  label: string;
  value: number | null; // null = freeform
  iconLabel: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Free', value: null, iconLabel: 'Free' },
  { label: '1:1 Square', value: 1, iconLabel: '1:1' },
  { label: '4:3 Standard', value: 4 / 3, iconLabel: '4:3' },
  { label: '16:9 Widescreen', value: 16 / 9, iconLabel: '16:9' },
  { label: '3:2 Classic', value: 3 / 2, iconLabel: '3:2' },
  { label: '9:16 Story / Reel', value: 9 / 16, iconLabel: '9:16' },
  { label: '2:3 Portrait', value: 2 / 3, iconLabel: '2:3' },
];

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Crop rectangle in normalized image coordinates (0 to naturalWidth, 0 to naturalHeight)
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Canvas and interaction refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; crop: CropRect }>({ x: 0, y: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoomLevel(1);
  };

  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ width: nw, height: nh });

    // Initial crop: 80% centered box
    const initialWidth = Math.round(nw * 0.8);
    const initialHeight = Math.round(nh * 0.8);
    const initialX = Math.round((nw - initialWidth) / 2);
    const initialY = Math.round((nh - initialHeight) / 2);

    setCrop({
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight,
    });
  };

  // Adjust crop box when aspect ratio preset changes
  const handleRatioChange = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (!naturalSize.width || !naturalSize.height) return;

    if (ratio === null) return; // Freeform

    let newWidth = crop.width;
    let newHeight = Math.round(newWidth / ratio);

    if (newHeight > naturalSize.height) {
      newHeight = naturalSize.height;
      newWidth = Math.round(newHeight * ratio);
    }
    if (newWidth > naturalSize.width) {
      newWidth = naturalSize.width;
      newHeight = Math.round(newWidth / ratio);
    }

    let newX = crop.x;
    let newY = crop.y;

    if (newX + newWidth > naturalSize.width) {
      newX = Math.max(0, naturalSize.width - newWidth);
    }
    if (newY + newHeight > naturalSize.height) {
      newY = Math.max(0, naturalSize.height - newHeight);
    }

    setCrop({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  // Handle pointer drag for crop box and resize handles
  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = handle;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !imageRef.current || !naturalSize.width) return;
      e.preventDefault();

      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      const scaleX = naturalSize.width / rect.width;
      const scaleY = naturalSize.height / rect.height;

      const deltaX = (e.clientX - dragStartPos.current.x) * scaleX;
      const deltaY = (e.clientY - dragStartPos.current.y) * scaleY;

      const startCrop = dragStartPos.current.crop;
      const handle = isDraggingRef.current;

      let nextX = startCrop.x;
      let nextY = startCrop.y;
      let nextW = startCrop.width;
      let nextH = startCrop.height;

      const minDimension = 20;

      if (handle === 'move') {
        nextX = Math.max(0, Math.min(naturalSize.width - nextW, startCrop.x + deltaX));
        nextY = Math.max(0, Math.min(naturalSize.height - nextH, startCrop.y + deltaY));
      } else {
        // Resizing
        if (handle.includes('e')) {
          nextW = Math.max(minDimension, Math.min(naturalSize.width - nextX, startCrop.width + deltaX));
        }
        if (handle.includes('s')) {
          nextH = Math.max(minDimension, Math.min(naturalSize.height - nextY, startCrop.height + deltaY));
        }
        if (handle.includes('w')) {
          const maxLeftDelta = startCrop.width - minDimension;
          const clampedDeltaX = Math.min(maxLeftDelta, Math.max(-startCrop.x, deltaX));
          nextX = startCrop.x + clampedDeltaX;
          nextW = startCrop.width - clampedDeltaX;
        }
        if (handle.includes('n')) {
          const maxTopDelta = startCrop.height - minDimension;
          const clampedDeltaY = Math.min(maxTopDelta, Math.max(-startCrop.y, deltaY));
          nextY = startCrop.y + clampedDeltaY;
          nextH = startCrop.height - clampedDeltaY;
        }

        // Apply aspect ratio constraints if locked
        if (selectedRatio !== null) {
          if (handle === 'e' || handle === 'w') {
            nextH = Math.round(nextW / selectedRatio);
            if (nextY + nextH > naturalSize.height) {
              nextH = naturalSize.height - nextY;
              nextW = Math.round(nextH * selectedRatio);
            }
          } else if (handle === 'n' || handle === 's') {
            nextW = Math.round(nextH * selectedRatio);
            if (nextX + nextW > naturalSize.width) {
              nextW = naturalSize.width - nextX;
              nextH = Math.round(nextW / selectedRatio);
            }
          } else {
            // Diagonal corner drag
            nextH = Math.round(nextW / selectedRatio);
            if (nextY + nextH > naturalSize.height) {
              nextH = naturalSize.height - nextY;
              nextW = Math.round(nextH * selectedRatio);
            }
            if (nextX + nextW > naturalSize.width) {
              nextW = naturalSize.width - nextX;
              nextH = Math.round(nextW / selectedRatio);
            }
          }
        }
      }

      setCrop({
        x: Math.round(Math.max(0, nextX)),
        y: Math.round(Math.max(0, nextY)),
        width: Math.round(Math.max(minDimension, nextW)),
        height: Math.round(Math.max(minDimension, nextH)),
      });
    },
    [naturalSize, selectedRatio]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingRef.current = null;
    }
  };

  // Perform Final High-Res Crop and Export
  const handleDownloadCrop = async () => {
    if (!imageRef.current || !file || crop.width <= 0 || crop.height <= 0) return;
    setIsProcessing(true);

    try {
      const sourceImage = new Image();
      sourceImage.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        sourceImage.onload = resolve;
        sourceImage.onerror = reject;
        sourceImage.src = imageSrc;
      });

      // Canvas for full rotation/flip transformations
      const transformCanvas = document.createElement('canvas');
      const rad = (rotation * Math.PI) / 180;
      const is90or270 = Math.abs(rotation % 180) === 90;

      const tWidth = is90or270 ? naturalSize.height : naturalSize.width;
      const tHeight = is90or270 ? naturalSize.width : naturalSize.height;

      transformCanvas.width = tWidth;
      transformCanvas.height = tHeight;
      const tCtx = transformCanvas.getContext('2d');
      if (!tCtx) throw new Error('Could not get transformation canvas context');

      tCtx.translate(tWidth / 2, tHeight / 2);
      tCtx.rotate(rad);
      tCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      tCtx.drawImage(
        sourceImage,
        -naturalSize.width / 2,
        -naturalSize.height / 2,
        naturalSize.width,
        naturalSize.height
      );

      // Now crop from the transformed canvas
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = crop.width;
      cropCanvas.height = crop.height;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) throw new Error('Could not get crop canvas context');

      if (outputFormat === 'image/jpeg') {
        cropCtx.fillStyle = '#FFFFFF';
        cropCtx.fillRect(0, 0, crop.width, crop.height);
      }

      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = 'high';

      cropCtx.drawImage(
        transformCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      cropCanvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (!blob) {
            showToast({ type: 'error', title: 'Export Failed', message: 'Could not generate cropped image.' });
            return;
          }

          const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const filename = `${baseName}-cropped.${ext}`;

          downloadBlob(blob, filename);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
          showToast({
            type: 'success',
            title: 'Image Cropped & Saved',
            message: `Saved as ${filename} (${crop.width}×${crop.height}px, ${formatFileSize(blob.size)})`,
          });
        },
        outputFormat,
        outputFormat === 'image/png' ? undefined : quality / 100
      );
    } catch (err: any) {
      setIsProcessing(false);
      showToast({ type: 'error', title: 'Crop Error', message: err.message || 'Error processing crop' });
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setNaturalSize({ width: 0, height: 0 });
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop your image here to crop"
        description="Supports JPG, PNG, and WebP. 100% processed locally with zero server upload."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  // Calculate percentage coordinates for the visual overlay crop box
  const overlayLeft = naturalSize.width ? (crop.x / naturalSize.width) * 100 : 0;
  const overlayTop = naturalSize.height ? (crop.y / naturalSize.height) * 100 : 0;
  const overlayWidth = naturalSize.width ? (crop.width / naturalSize.width) * 100 : 0;
  const overlayHeight = naturalSize.height ? (crop.height / naturalSize.height) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Original Resolution"
          value={`${naturalSize.width} × ${naturalSize.height}`}
          subValue="pixels"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Cropped Resolution"
          value={`${crop.width} × ${crop.height}`}
          badge={selectedRatio !== null ? `${(crop.width / (crop.height || 1)).toFixed(2)} : 1` : 'Custom'}
          badgeType="success"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Crop Area"
          value={`${naturalSize.width ? Math.round(((crop.width * crop.height) / (naturalSize.width * naturalSize.height)) * 100) : 100}%`}
          subValue="of total image"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Source File Size"
          value={formatFileSize(file.size)}
          subValue={file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Settings */}
        <div
          className="lg:col-span-4 space-y-6 p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Crop className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Crop Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isActive = selectedRatio === ratio.value;
                return (
                  <button
                    key={ratio.label}
                    type="button"
                    onClick={() => handleRatioChange(ratio.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isActive ? 'ring-2 shadow-sm' : 'hover:border-opacity-80'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--c-card)' : 'var(--c-bg)',
                      borderColor: isActive ? 'var(--c-gold)' : 'var(--c-border)',
                      color: isActive ? 'var(--c-gold)' : 'var(--c-text)',
                    }}
                  >
                    <span className="font-bold text-xs">{ratio.iconLabel}</span>
                    <span className="text-[10px] opacity-70 truncate w-full text-center">{ratio.label.split(' ')[1] || ratio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exact Dimension Inputs */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Crop Dimensions (px)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>Width</span>
                <input
                  type="number"
                  min="20"
                  max={naturalSize.width}
                  value={crop.width}
                  onChange={(e) => {
                    const w = Math.max(20, Math.min(naturalSize.width - crop.x, Number(e.target.value) || 20));
                    const h = selectedRatio !== null ? Math.round(w / selectedRatio) : crop.height;
                    setCrop((prev) => ({ ...prev, width: w, height: Math.min(naturalSize.height - prev.y, h) }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border font-mono focus:outline-none"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>
              <div>
                <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>Height</span>
                <input
                  type="number"
                  min="20"
                  max={naturalSize.height}
                  value={crop.height}
                  onChange={(e) => {
                    const h = Math.max(20, Math.min(naturalSize.height - crop.y, Number(e.target.value) || 20));
                    const w = selectedRatio !== null ? Math.round(h * selectedRatio) : crop.width;
                    setCrop((prev) => ({ ...prev, height: h, width: Math.min(naturalSize.width - prev.x, w) }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border font-mono focus:outline-none"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>X Position</span>
                <input
                  type="number"
                  min="0"
                  max={naturalSize.width - crop.width}
                  value={crop.x}
                  onChange={(e) => {
                    const x = Math.max(0, Math.min(naturalSize.width - crop.width, Number(e.target.value) || 0));
                    setCrop((prev) => ({ ...prev, x }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border font-mono focus:outline-none"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>
              <div>
                <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>Y Position</span>
                <input
                  type="number"
                  min="0"
                  max={naturalSize.height - crop.height}
                  value={crop.y}
                  onChange={(e) => {
                    const y = Math.max(0, Math.min(naturalSize.height - crop.height, Number(e.target.value) || 0));
                    setCrop((prev) => ({ ...prev, y }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border font-mono focus:outline-none"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transform Controls: Rotate & Flip */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Transform & Orientation
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                title="Rotate 90° CCW"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="p-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Rotate 90° CW"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Flip Horizontal"
                onClick={() => setFlipH((f) => !f)}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  flipH ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: flipH ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: flipH ? 'var(--c-gold)' : 'var(--c-border)',
                  color: flipH ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Flip Vertical"
                onClick={() => setFlipV((f) => !f)}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  flipV ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: flipV ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: flipV ? 'var(--c-gold)' : 'var(--c-border)',
                  color: flipV ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <FlipVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Export Format & Quality */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'PNG (Lossless)', val: 'image/png' },
                { label: 'JPEG (Photo)', val: 'image/jpeg' },
                { label: 'WebP (Next-Gen)', val: 'image/webp' },
              ].map((fmt) => (
                <button
                  key={fmt.val}
                  type="button"
                  onClick={() => setOutputFormat(fmt.val as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    outputFormat === fmt.val ? 'ring-2 shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: outputFormat === fmt.val ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: outputFormat === fmt.val ? 'var(--c-gold)' : 'var(--c-border)',
                    color: outputFormat === fmt.val ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {fmt.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {outputFormat !== 'image/png' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span style={{ color: 'var(--c-muted)' }}>Output Quality:</span>
                  <span className="font-bold" style={{ color: 'var(--c-gold)' }}>{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Download CTA Button */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownloadCrop}
              disabled={isProcessing || crop.width <= 0}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Processing Crop...' : 'Download Cropped Image'}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Interactive Crop Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Top Bar for Canvas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showGrid ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: showGrid ? 'var(--c-card)' : 'var(--c-surface)',
                  borderColor: showGrid ? 'var(--c-gold)' : 'var(--c-border)',
                  color: showGrid ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                <Grid className="w-3.5 h-3.5" />
                Rule of Thirds Grid
              </button>

              <button
                type="button"
                onClick={() => {
                  setCrop({
                    x: 0,
                    y: 0,
                    width: naturalSize.width,
                    height: naturalSize.height,
                  });
                  setSelectedRatio(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--c-surface)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-muted)',
                }}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Full Image
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg border text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono" style={{ color: 'var(--c-subtle)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="p-1.5 rounded-lg border text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Crop Viewport */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative select-none"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            <div
              className="relative transition-transform duration-75 inline-block"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Main Image */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source for cropping"
                onLoad={onImageLoaded}
                className="max-h-[500px] max-w-full block rounded-lg shadow-md pointer-events-none object-contain"
                draggable={false}
              />

              {/* Dimmed Dark Overlay Outside Crop Area */}
              {naturalSize.width > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.65)`,
                    left: `${overlayLeft}%`,
                    top: `${overlayTop}%`,
                    width: `${overlayWidth}%`,
                    height: `${overlayHeight}%`,
                  }}
                />
              )}

              {/* Interactive Draggable & Resizable Crop Box */}
              {naturalSize.width > 0 && (
                <div
                  onPointerDown={(e) => handlePointerDown('move', e)}
                  className="absolute border-2 cursor-move box-border group"
                  style={{
                    left: `${overlayLeft}%`,
                    top: `${overlayTop}%`,
                    width: `${overlayWidth}%`,
                    height: `${overlayHeight}%`,
                    borderColor: 'var(--c-gold)',
                  }}
                >
                  {/* Rule of Thirds Grid Lines */}
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div />
                    </div>
                  )}

                  {/* Crop Dimension Badge */}
                  <div
                    className="absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold pointer-events-none shadow"
                    style={{ backgroundColor: 'var(--c-card)', color: 'var(--c-gold)', border: '1px solid var(--c-border)' }}
                  >
                    {crop.width} × {crop.height} px
                  </div>

                  {/* 8 Resize Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown('nw', e)}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full cursor-nwse-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('n', e)}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full cursor-ns-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('ne', e)}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full cursor-nesw-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('e', e)}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 rounded-full cursor-ew-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('se', e)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full cursor-nwse-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('s', e)}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full cursor-ns-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('sw', e)}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full cursor-nesw-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown('w', e)}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 rounded-full cursor-ew-resize shadow-md border-2"
                    style={{ backgroundColor: 'var(--c-gold)', borderColor: 'var(--c-bg)' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-cropper" onReset={handleReset} />
    </div>
  );
};
