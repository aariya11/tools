import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pipette,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Eye,
  Code2,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  hsv: string;
  r: number;
  g: number;
  b: number;
}

// Convert RGB to HEX, HSL, CMYK, HSV
function rgbToColorValues(r: number, g: number, b: number): ColorValues {
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // HSL
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }
  const hsl = `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  // CMYK
  let c = 0;
  let m = 0;
  let y = 0;
  let k = 1 - Math.max(rn, gn, bn);
  if (k < 1) {
    c = Math.round(((1 - rn - k) / (1 - k)) * 100);
    m = Math.round(((1 - gn - k) / (1 - k)) * 100);
    y = Math.round(((1 - bn - k) / (1 - k)) * 100);
  }
  const cmyk = `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;

  // HSV
  let v = max;
  let hsvS = max === 0 ? 0 : (max - min) / max;
  const hsv = `hsv(${h}, ${Math.round(hsvS * 100)}%, ${Math.round(v * 100)}%)`;

  return { hex, rgb, hsl, cmyk, hsv, r, g, b };
}

export const ImageColorPicker: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Active color & hover state
  const [currentColor, setCurrentColor] = useState<ColorValues>(rgbToColorValues(183, 155, 112));
  const [hoverColor, setHoverColor] = useState<ColorValues | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Palettes
  const [dominantColors, setDominantColors] = useState<ColorValues[]>([]);
  const [colorHistory, setColorHistory] = useState<ColorValues[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
  };

  // Load image and extract dominant palette
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Extract Dominant Palette by pixel sampling
      try {
        const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        const step = Math.max(1, Math.floor(imgData.length / 4000));
        for (let i = 0; i < imgData.length; i += step * 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 128) continue;

          // Quantize to 32-step buckets
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 });
          }
        }

        const sorted = Array.from(colorBuckets.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
          .map((c) => rgbToColorValues(c.r, c.g, c.b));

        setDominantColors(sorted);
        if (sorted[0]) {
          setCurrentColor(sorted[0]);
          setColorHistory([sorted[0]]);
        }
      } catch {
        // ignore
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Render Loupe Magnifier 11x11 Grid
  const updateLoupe = useCallback(
    (canvasX: number, canvasY: number) => {
      const loupe = loupeCanvasRef.current;
      const mainCanvas = canvasRef.current;
      if (!loupe || !mainCanvas) return;

      loupe.width = 110;
      loupe.height = 110;
      const lCtx = loupe.getContext('2d');
      if (!lCtx) return;

      lCtx.imageSmoothingEnabled = false;
      // Crop 11x11 square around cursor
      lCtx.drawImage(
        mainCanvas,
        Math.max(0, canvasX - 5),
        Math.max(0, canvasY - 5),
        11,
        11,
        0,
        0,
        110,
        110
      );

      // Draw Center Pixel Crosshair Box
      lCtx.strokeStyle = '#FFFFFF';
      lCtx.lineWidth = 2;
      lCtx.strokeRect(40, 40, 30, 30);
      lCtx.strokeStyle = '#000000';
      lCtx.lineWidth = 1;
      lCtx.strokeRect(39, 39, 32, 32);
    },
    []
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !naturalDimensions.width) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const canvasX = Math.round(((clientX - rect.left) / rect.width) * naturalDimensions.width);
    const canvasY = Math.round(((clientY - rect.top) / rect.height) * naturalDimensions.height);

    setCursorPos({ x: clientX - rect.left, y: clientY - rect.top, canvasX, canvasY });
    setIsHovering(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(
        Math.max(0, Math.min(naturalDimensions.width - 1, canvasX)),
        Math.max(0, Math.min(naturalDimensions.height - 1, canvasY)),
        1,
        1
      ).data;

      const sampled = rgbToColorValues(pixel[0], pixel[1], pixel[2]);
      setHoverColor(sampled);
      updateLoupe(canvasX, canvasY);
    } catch {
      // ignore
    }
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
    setHoverColor(null);
  };

  const handleCanvasClick = () => {
    if (!hoverColor) return;
    setCurrentColor(hoverColor);

    // Append to color history without duplicates at start
    setColorHistory((prev) => {
      const filtered = prev.filter((c) => c.hex !== hoverColor.hex);
      return [hoverColor, ...filtered].slice(0, 16);
    });

    showToast({
      type: 'info',
      title: 'Color Picked',
      message: `${hoverColor.hex} saved to palette.`,
    });
  };

  const copyToClipboard = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: textToCopy,
    });
  };

  // Export Palettes
  const exportAsCss = () => {
    const css = colorHistory.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    copyToClipboard(`:root {\n${css}\n}`, 'css-all');
  };

  const downloadPaletteImage = () => {
    if (colorHistory.length === 0) return;
    const canvas = document.createElement('canvas');
    const swatchW = 120;
    const swatchH = 140;
    canvas.width = colorHistory.length * swatchW;
    canvas.height = swatchH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    colorHistory.forEach((c, idx) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(idx * swatchW, 0, swatchW, 100);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(idx * swatchW, 100, swatchW, 40);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.hex, idx * swatchW + swatchW / 2, 125);
    });

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, 'color-palette.png');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
    }, 'image/png');
  };

  const handleReset = () => {
    setFile(null);
    setImageSrc('');
    setDominantColors([]);
    setColorHistory([]);
    setNaturalDimensions({ width: 0, height: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
        allowedFormatsText="JPG, PNG, WebP, SVG"
        label="Drop image here to pick colors"
        description="Inspect pixel colors with 10x loupe magnifier, dominant palette extraction, and HEX/RGB/HSL/CMYK copy."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const activeColorToDisplay = hoverColor || currentColor;

  return (
    <div className="space-y-8">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Color HEX"
          value={activeColorToDisplay.hex}
          subValue={activeColorToDisplay.rgb}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="HSL Values"
          value={activeColorToDisplay.hsl}
          badge="Live"
          badgeType="success"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Dominant Colors"
          value={`${dominantColors.length} Extracted`}
          subValue="Auto color quantization"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Sampled History"
          value={`${colorHistory.length} Colors`}
          subValue="Click canvas to add"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Color Inspector Panel */}
        <div
          className="lg:col-span-5 space-y-6 p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Pipette className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Color Inspector
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          {/* Large Color Swatch & Live Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl border shadow-inner shrink-0 transition-colors duration-75"
              style={{
                backgroundColor: activeColorToDisplay.hex,
                borderColor: 'var(--c-border)',
              }}
            />
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
                {isHovering ? 'Hovering Pixel' : 'Locked Sample'}
              </span>
              <h2 className="text-2xl font-mono font-bold" style={{ color: 'var(--c-text)' }}>
                {activeColorToDisplay.hex}
              </h2>
              <span className="text-xs font-mono" style={{ color: 'var(--c-gold)' }}>
                {activeColorToDisplay.rgb}
              </span>
            </div>
          </div>

          {/* Formats Copy Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Color Codes (Click to Copy)
            </label>

            {[
              { label: 'HEX', val: activeColorToDisplay.hex },
              { label: 'RGB', val: activeColorToDisplay.rgb },
              { label: 'HSL', val: activeColorToDisplay.hsl },
              { label: 'CMYK', val: activeColorToDisplay.cmyk },
              { label: 'HSV', val: activeColorToDisplay.hsv },
            ].map((fmt) => (
              <div
                key={fmt.label}
                onClick={() => copyToClipboard(fmt.val, fmt.label)}
                className="p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-bold uppercase" style={{ color: 'var(--c-gold)' }}>
                    {fmt.label}
                  </span>
                  <span className="text-xs font-mono font-medium truncate" style={{ color: 'var(--c-text)' }}>
                    {fmt.val}
                  </span>
                </div>

                <button
                  type="button"
                  className="text-slate-400 group-hover:text-amber-500 transition-colors"
                >
                  {copiedKey === fmt.label ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>

          {/* Dominant Image Palette */}
          {dominantColors.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-muted)' }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Dominant Image Palette
              </label>

              <div className="grid grid-cols-4 gap-2">
                {dominantColors.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentColor(col);
                      copyToClipboard(col.hex, `dom-${idx}`);
                    }}
                    className="p-1.5 rounded-xl border flex flex-col items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                    }}
                  >
                    <div
                      className="w-full h-8 rounded-lg border shadow-xs"
                      style={{ backgroundColor: col.hex, borderColor: 'var(--c-border)' }}
                    />
                    <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--c-text)' }}>
                      {col.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session Color History */}
          {colorHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Color History ({colorHistory.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportAsCss}
                    title="Copy CSS variables"
                    className="text-[11px] font-medium text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Code2 className="w-3 h-3" /> CSS
                  </button>
                  <button
                    type="button"
                    onClick={downloadPaletteImage}
                    title="Download palette image"
                    className="text-[11px] font-medium text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> PNG
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {colorHistory.map((col, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentColor(col)}
                    className="w-8 h-8 rounded-lg border shadow-xs transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: col.hex,
                      borderColor: 'var(--c-border)',
                    }}
                    title={`${col.hex} (Click to select)`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Photo Inspector & Magnifier */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Eye className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Hover to Inspect & Click to Sample
            </span>

            {cursorPos && (
              <span className="text-xs font-mono" style={{ color: 'var(--c-subtle)' }}>
                X: {cursorPos.canvasX}px | Y: {cursorPos.canvasY}px
              </span>
            )}
          </div>

          {/* Interactive Canvas Viewport */}
          <div
            className="flex-1 min-h-[480px] rounded-2xl border p-4 sm:p-8 flex items-center justify-center overflow-auto relative cursor-crosshair"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            {/* Loupe Floating Magnifier Overlay */}
            {isHovering && cursorPos && (
              <div
                className="absolute pointer-events-none rounded-2xl border-2 shadow-2xl p-2 z-30 flex flex-col items-center gap-1"
                style={{
                  left: Math.max(10, Math.min(window.innerWidth - 200, cursorPos.x + 20)),
                  top: Math.max(10, Math.min(400, cursorPos.y + 20)),
                  backgroundColor: 'var(--c-card)',
                  borderColor: 'var(--c-gold)',
                }}
              >
                <canvas ref={loupeCanvasRef} className="rounded-lg shadow-md block" />
                <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--c-gold)' }}>
                  {hoverColor?.hex}
                </span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={handleCanvasClick}
              className="max-h-[500px] max-w-full block rounded-xl shadow-lg object-contain"
            />
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-color-picker" onReset={handleReset} />
    </div>
  );
};
