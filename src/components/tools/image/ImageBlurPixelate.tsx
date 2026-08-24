import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  EyeOff,
  Download,
  Square,
  Paintbrush,
  RefreshCw,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

type ToolMode = 'rect' | 'brush';
type EffectType = 'pixelate' | 'blur' | 'blackout' | 'whiteout';

interface RedactionRegion {
  id: string;
  type: ToolMode;
  effect: EffectType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  brushSize?: number;
  intensity: number;
}

export const ImageBlurPixelate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Tool settings
  const [toolMode, setToolMode] = useState<ToolMode>('rect');
  const [effectType, setEffectType] = useState<EffectType>('pixelate');
  const [pixelSize, setPixelSize] = useState<number>(18); // 4 - 60px
  const [blurRadius, setBlurRadius] = useState<number>(14); // 2 - 40px
  const [brushSize, setBrushSize] = useState<number>(28); // 8 - 80px

  // Redaction regions history
  const [regions, setRegions] = useState<RedactionRegion[]>([]);
  const [undoStack, setUndoStack] = useState<RedactionRegion[][]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentBrushPointsRef = useRef<{ x: number; y: number }[]>([]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setRegions([]);
    setUndoStack([]);
    setZoomLevel(1);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseImageRef.current = img;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply a censorship effect to a bounding box on context
  const applyEffectToBox = (
    ctx: CanvasRenderingContext2D,
    effect: EffectType,
    intensity: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    if (w <= 0 || h <= 0) return;

    if (effect === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
      return;
    }

    if (effect === 'whiteout') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);
      return;
    }

    if (effect === 'pixelate') {
      const blockSize = Math.max(4, intensity);
      const offCanvas = document.createElement('canvas');
      const tinyW = Math.max(1, Math.floor(w / blockSize));
      const tinyH = Math.max(1, Math.floor(h / blockSize));
      offCanvas.width = tinyW;
      offCanvas.height = tinyH;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, tinyW, tinyH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, tinyW, tinyH, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
      return;
    }

    if (effect === 'blur') {
      const radius = Math.max(2, intensity);
      const blurCanvas = document.createElement('canvas');
      const scaleDown = Math.max(2, Math.floor(radius / 3));
      const smallW = Math.max(1, Math.floor(w / scaleDown));
      const smallH = Math.max(1, Math.floor(h / scaleDown));

      blurCanvas.width = smallW;
      blurCanvas.height = smallH;
      const blurCtx = blurCanvas.getContext('2d');
      if (!blurCtx) return;

      blurCtx.imageSmoothingEnabled = true;
      blurCtx.imageSmoothingQuality = 'high';
      blurCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, smallW, smallH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(blurCanvas, 0, 0, smallW, smallH, x, y, w, h);
    }
  };

  // Re-render complete canvas with all redactions
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = baseImageRef.current;
    if (!canvas || !img || !naturalSize.width) return;

    canvas.width = naturalSize.width;
    canvas.height = naturalSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    regions.forEach((region) => {
      if (region.type === 'rect' && region.width && region.height) {
        applyEffectToBox(
          ctx,
          region.effect,
          region.intensity,
          region.x || 0,
          region.y || 0,
          region.width,
          region.height
        );
      } else if (region.type === 'brush' && region.points && region.points.length > 0) {
        const rSize = region.brushSize || 20;
        region.points.forEach((pt) => {
          applyEffectToBox(
            ctx,
            region.effect,
            region.intensity,
            Math.round(pt.x - rSize / 2),
            Math.round(pt.y - rSize / 2),
            rSize,
            rSize
          );
        });
      }
    });
  }, [regions, naturalSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer Interaction Handlers for Drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !naturalSize.width) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * naturalSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * naturalSize.height;

    startPosRef.current = { x, y };

    setUndoStack((prev) => [...prev, [...regions]]);

    if (toolMode === 'brush') {
      currentBrushPointsRef.current = [{ x, y }];
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !naturalSize.width) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * naturalSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * naturalSize.height;

    if (toolMode === 'brush') {
      currentBrushPointsRef.current.push({ x, y });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const effIntensity = effectType === 'pixelate' ? pixelSize : blurRadius;
        applyEffectToBox(
          ctx,
          effectType,
          effIntensity,
          Math.round(x - brushSize / 2),
          Math.round(y - brushSize / 2),
          brushSize,
          brushSize
        );
      }
    } else {
      redrawCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = Math.min(startPosRef.current.x, x);
        const startY = Math.min(startPosRef.current.y, y);
        const w = Math.abs(x - startPosRef.current.x);
        const h = Math.abs(y - startPosRef.current.y);

        const effIntensity = effectType === 'pixelate' ? pixelSize : blurRadius;
        applyEffectToBox(ctx, effectType, effIntensity, startX, startY, w, h);

        ctx.strokeStyle = '#B79B70';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(startX, startY, w, h);
        ctx.setLineDash([]);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !naturalSize.width) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = ((e.clientX - rect.left) / rect.width) * naturalSize.width;
    const endY = ((e.clientY - rect.top) / rect.height) * naturalSize.height;

    const effIntensity = effectType === 'pixelate' ? pixelSize : blurRadius;

    if (toolMode === 'rect') {
      const x = Math.min(startPosRef.current.x, endX);
      const y = Math.min(startPosRef.current.y, endY);
      const width = Math.abs(endX - startPosRef.current.x);
      const height = Math.abs(endY - startPosRef.current.y);

      if (width > 5 && height > 5) {
        const newRegion: RedactionRegion = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'rect',
          effect: effectType,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
          intensity: effIntensity,
        };
        setRegions((prev) => [...prev, newRegion]);
      }
    } else {
      if (currentBrushPointsRef.current.length > 0) {
        const newRegion: RedactionRegion = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'brush',
          effect: effectType,
          points: [...currentBrushPointsRef.current],
          brushSize,
          intensity: effIntensity,
        };
        setRegions((prev) => [...prev, newRegion]);
        currentBrushPointsRef.current = [];
      }
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRegions(previous);
  };

  const handleClearAll = () => {
    setUndoStack((prev) => [...prev, [...regions]]);
    setRegions([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const base = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${base}-redacted.png`;
      downloadBlob(blob, filename);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      showToast({
        type: 'success',
        title: 'Censored Image Downloaded',
        message: `Saved ${filename} with ${regions.length} redacted areas.`,
      });
    }, 'image/png');
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setRegions([]);
    setUndoStack([]);
    setNaturalSize({ width: 0, height: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop image here to blur or pixelate"
        description="Censor sensitive faces, license plates, documents, and private data directly in your browser."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Resolution"
          value={`${naturalSize.width} × ${naturalSize.height}`}
          subValue="pixels"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Active Redactions"
          value={regions.length}
          badge={regions.length > 0 ? 'Protected' : 'None'}
          badgeType={regions.length > 0 ? 'success' : 'neutral'}
          subValue="Censored regions"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Censorship Mode"
          value={effectType.toUpperCase()}
          subValue={toolMode === 'rect' ? 'Rectangle Box' : 'Freehand Brush'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Source Size"
          value={formatFileSize(file.size)}
          subValue={file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tools & Redaction Controls */}
        <div
          className="lg:col-span-4 space-y-5 p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <EyeOff className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Censorship Tools
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer disabled:opacity-40"
                style={{ color: 'var(--c-gold)' }}
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
                style={{ color: 'var(--c-muted)' }}
              >
                <RefreshCw className="w-3 h-3" /> Change File
              </button>
            </div>
          </div>

          {/* Selection Shape Mode (Box vs Brush) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Selection Tool
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setToolMode('rect')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  toolMode === 'rect' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: toolMode === 'rect' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: toolMode === 'rect' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: toolMode === 'rect' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <Square className="w-4 h-4" /> Rectangle Box
              </button>
              <button
                type="button"
                onClick={() => setToolMode('brush')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  toolMode === 'brush' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: toolMode === 'brush' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: toolMode === 'brush' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: toolMode === 'brush' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <Paintbrush className="w-4 h-4" /> Freehand Brush
              </button>
            </div>
          </div>

          {/* Effect Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Censorship Effect
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pixelate' as EffectType, label: 'Pixelate' },
                { id: 'blur' as EffectType, label: 'Smooth Blur' },
                { id: 'blackout' as EffectType, label: 'Blackout Bar' },
                { id: 'whiteout' as EffectType, label: 'Whiteout Bar' },
              ].map((eff) => (
                <button
                  key={eff.id}
                  type="button"
                  onClick={() => setEffectType(eff.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    effectType === eff.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: effectType === eff.id ? 'var(--c-card)' : 'var(--c-bg)',
                    borderColor: effectType === eff.id ? 'var(--c-gold)' : 'var(--c-border)',
                    color: effectType === eff.id ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {eff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders for effect parameter */}
          {effectType === 'pixelate' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Pixel Block Size:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{pixelSize} px</span>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                value={pixelSize}
                onChange={(e) => setPixelSize(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          )}

          {effectType === 'blur' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Blur Intensity:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{blurRadius} px</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                value={blurRadius}
                onChange={(e) => setBlurRadius(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          )}

          {toolMode === 'brush' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--c-muted)' }}>Brush Thickness:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{brushSize} px</span>
              </div>
              <input
                type="range"
                min="8"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-lg"
              />
            </div>
          )}

          {/* Active Redaction List */}
          {regions.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Redactions ({regions.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {regions.map((reg, idx) => (
                  <div
                    key={reg.id}
                    className="px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}
                  >
                    <span className="capitalize" style={{ color: 'var(--c-text)' }}>
                      #{idx + 1} {reg.type} ({reg.effect})
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegions((prev) => prev.filter((r) => r.id !== reg.id))}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download CTA Button */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              Download Censored Image
            </button>
          </div>
        </div>

        {/* Right Column: Visual Interactive Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <EyeOff className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Click & Drag to Censor Sensitive Areas
            </span>

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
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-lg border text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div
            className="flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative select-none"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`max-h-[500px] max-w-full block rounded-lg shadow-xl object-contain transition-transform duration-75 ${
                toolMode === 'rect' ? 'cursor-crosshair' : 'cursor-cell'
              }`}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                touchAction: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-blur-pixelate" onReset={handleReset} />
    </div>
  );
};
