import React, { useState, useEffect, useCallback } from 'react';
import {
  Stamp,
  Download,
  Image as ImageIcon,
  Type,
  Grid,
  Archive,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type WatermarkType = 'text' | 'image';
type PositionAnchor = 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br' | 'tile';

interface SourceImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  watermarkedBlob: Blob | null;
  watermarkedDataUrl: string | null;
}

export const ImageWatermark: React.FC = () => {
  const [images, setImages] = useState<SourceImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Watermark Settings
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // Text options
  const [text, setText] = useState<string>('© ToolBoxX Confidential');
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textOpacity, setTextOpacity] = useState<number>(65); // 0 - 100
  const [textRotation, setTextRotation] = useState<number>(0); // -180 to 180
  const [isBold, setIsBold] = useState<boolean>(true);
  const [hasShadow, setHasShadow] = useState<boolean>(true);

  // Logo / Image options
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [logoScale, setLogoScale] = useState<number>(25); // 5% to 80%
  const [logoOpacity, setLogoOpacity] = useState<number>(75);
  const [logoRotation, setLogoRotation] = useState<number>(0);

  // Position
  const [anchor, setAnchor] = useState<PositionAnchor>('br');
  const [margin] = useState<number>(24);
  const [tileSpacing, setTileSpacing] = useState<number>(120);

  // Processing & Export
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    const newItems: SourceImageItem[] = [];

    let loadedCount = 0;
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          watermarkedBlob: null,
          watermarkedDataUrl: null,
        });

        loadedCount++;
        if (loadedCount === files.length) {
          setImages((prev) => [...prev, ...newItems]);
        }
      };
      img.src = url;
    });
  };

  const handleLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setLogoSrc(URL.createObjectURL(selected));
    }
  };

  // Render Watermark onto a source image on Canvas
  const applyWatermarkToImage = useCallback(
    async (item: SourceImageItem, logoImg: HTMLImageElement | null): Promise<{ blob: Blob; dataUrl: string }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          const w = canvas.width;
          const h = canvas.height;

          if (anchor === 'tile') {
            const spacing = tileSpacing * (w / 1000);
            ctx.save();
            ctx.rotate((textRotation * Math.PI) / 180);

            if (watermarkType === 'text') {
              const scaledFontSize = Math.max(14, Math.round(fontSize * (w / 1000)));
              ctx.font = `${isBold ? 'bold ' : ''}${scaledFontSize}px ${fontFamily}`;
              ctx.fillStyle = textColor;
              ctx.globalAlpha = textOpacity / 100;
              if (hasShadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 4;
              }

              const diag = Math.sqrt(w * w + h * h) * 1.5;
              for (let y = -diag; y < diag; y += spacing) {
                for (let x = -diag; x < diag; x += spacing * 1.5) {
                  ctx.fillText(text, x, y);
                }
              }
            } else if (logoImg) {
              const logoW = Math.max(40, Math.round((logoScale / 100) * w * 0.4));
              const logoH = (logoW / logoImg.naturalWidth) * logoImg.naturalHeight;
              ctx.globalAlpha = logoOpacity / 100;

              const diag = Math.sqrt(w * w + h * h) * 1.5;
              for (let y = -diag; y < diag; y += spacing) {
                for (let x = -diag; x < diag; x += spacing * 1.5) {
                  ctx.drawImage(logoImg, x, y, logoW, logoH);
                }
              }
            }
            ctx.restore();
          } else {
            let targetX = 0;
            let targetY = 0;

            if (watermarkType === 'text') {
              const scaledFontSize = Math.max(16, Math.round(fontSize * (w / 1000)));
              ctx.font = `${isBold ? 'bold ' : ''}${scaledFontSize}px ${fontFamily}`;
              ctx.fillStyle = textColor;
              ctx.globalAlpha = textOpacity / 100;

              if (hasShadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
              }

              const textMetrics = ctx.measureText(text);
              const textW = textMetrics.width;
              const textH = scaledFontSize;

              if (anchor.includes('l')) targetX = margin;
              else if (anchor.includes('c') && !anchor.includes('l') && !anchor.includes('r')) targetX = (w - textW) / 2;
              else if (anchor.includes('r')) targetX = w - textW - margin;

              if (anchor.includes('t')) targetY = margin + textH;
              else if (anchor.includes('c') && !anchor.includes('t') && !anchor.includes('b')) targetY = h / 2;
              else if (anchor.includes('b')) targetY = h - margin;

              ctx.save();
              ctx.translate(targetX + textW / 2, targetY - textH / 2);
              ctx.rotate((textRotation * Math.PI) / 180);
              ctx.fillText(text, -textW / 2, textH / 2);
              ctx.restore();
            } else if (logoImg) {
              const logoW = Math.max(40, Math.round((logoScale / 100) * w));
              const logoH = (logoW / logoImg.naturalWidth) * logoImg.naturalHeight;
              ctx.globalAlpha = logoOpacity / 100;

              if (anchor.includes('l')) targetX = margin;
              else if (anchor.includes('c') && !anchor.includes('l') && !anchor.includes('r')) targetX = (w - logoW) / 2;
              else if (anchor.includes('r')) targetX = w - logoW - margin;

              if (anchor.includes('t')) targetY = margin;
              else if (anchor.includes('c') && !anchor.includes('t') && !anchor.includes('b')) targetY = (h - logoH) / 2;
              else if (anchor.includes('b')) targetY = h - logoH - margin;

              ctx.save();
              ctx.translate(targetX + logoW / 2, targetY + logoH / 2);
              ctx.rotate((logoRotation * Math.PI) / 180);
              ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
              ctx.restore();
            }
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Export failed'));
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              resolve({ blob, dataUrl });
            },
            'image/jpeg',
            0.92
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = item.previewUrl;
      });
    },
    [
      anchor,
      watermarkType,
      tileSpacing,
      textRotation,
      fontSize,
      isBold,
      fontFamily,
      textColor,
      textOpacity,
      hasShadow,
      text,
      logoScale,
      logoOpacity,
      margin,
      logoRotation,
    ]
  );

  // Update watermarks across all items
  const refreshAllWatermarks = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    let logoImg: HTMLImageElement | null = null;
    if (watermarkType === 'image' && logoSrc) {
      logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        logoImg!.onload = resolve;
        logoImg!.src = logoSrc;
      });
    }

    const updated = [...images];
    for (let i = 0; i < updated.length; i++) {
      try {
        const res = await applyWatermarkToImage(updated[i], logoImg);
        updated[i] = {
          ...updated[i],
          watermarkedBlob: res.blob,
          watermarkedDataUrl: res.dataUrl,
        };
      } catch {
        // ignore
      }
    }

    setImages(updated);
    setIsProcessing(false);
  }, [images.length, watermarkType, logoSrc, applyWatermarkToImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAllWatermarks();
    }, 100);
    return () => clearTimeout(timer);
  }, [
    text,
    fontFamily,
    fontSize,
    textColor,
    textOpacity,
    textRotation,
    isBold,
    hasShadow,
    logoSrc,
    logoScale,
    logoOpacity,
    logoRotation,
    anchor,
    margin,
    tileSpacing,
    watermarkType,
  ]);

  const handleDownloadSingle = (item: SourceImageItem) => {
    if (!item.watermarkedBlob) return;
    const base = item.file.name.replace(/\.[^/.]+$/, '');
    const filename = `${base}-watermarked.jpg`;
    downloadBlob(item.watermarkedBlob, filename);
    showToast({
      type: 'success',
      title: 'Watermarked Image Downloaded',
      message: `Saved ${filename}`,
    });
  };

  const handleDownloadAllZip = async () => {
    const readyItems = images.filter((i) => i.watermarkedBlob);
    if (readyItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      readyItems.forEach((it) => {
        const base = it.file.name.replace(/\.[^/.]+$/, '');
        zip.file(`${base}-watermarked.jpg`, it.watermarkedBlob as Blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'watermarked-batch.zip');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 } });
      showToast({
        type: 'success',
        title: 'ZIP Archive Downloaded',
        message: `Saved ${readyItems.length} watermarked photos in ZIP.`,
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'ZIP Failed', message: err.message || 'Error creating ZIP' });
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setSelectedIndex(0);
    setLogoSrc('');
  };

  if (images.length === 0) {
    return (
      <FileUploader
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple={true}
        allowedFormatsText="JPG, PNG, WebP"
        label="Drop images here to add watermark"
        description="Add text or logo watermarks to single or batch photos with custom position, opacity, and tiled patterns."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const currentItem = images[selectedIndex] || images[0];

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Images"
          value={images.length}
          subValue={`${images.filter((i) => i.watermarkedBlob).length} watermarked`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Watermark Style"
          value={watermarkType === 'text' ? 'Text Watermark' : 'Logo / Image'}
          badge={anchor === 'tile' ? 'Tiled Grid' : 'Anchored'}
          badgeType="success"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Opacity"
          value={`${watermarkType === 'text' ? textOpacity : logoOpacity}%`}
          subValue={watermarkType === 'text' ? `${fontSize}px ${fontFamily}` : `${logoScale}% scale`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
        <StatCard
          label="Active Photo"
          value={`${currentItem?.width || 0} × ${currentItem?.height || 0}`}
          subValue={`Photo ${selectedIndex + 1} of ${images.length}`}
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div
          className="lg:col-span-4 space-y-5 p-6 rounded-2xl border max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Stamp className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Watermark Options
            </h3>
            <button
              onClick={handleReset}
              className="text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--c-muted)' }}
            >
              <RefreshCw className="w-3 h-3" /> Clear All
            </button>
          </div>

          {/* Watermark Type Selector (Text vs Image Logo) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--c-muted)' }}>
              Watermark Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWatermarkType('text')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  watermarkType === 'text' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: watermarkType === 'text' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: watermarkType === 'text' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: watermarkType === 'text' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <Type className="w-4 h-4" /> Text
              </button>
              <button
                type="button"
                onClick={() => setWatermarkType('image')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  watermarkType === 'image' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: watermarkType === 'image' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: watermarkType === 'image' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: watermarkType === 'image' ? 'var(--c-gold)' : 'var(--c-text)',
                }}
              >
                <ImageIcon className="w-4 h-4" /> Logo Image
              </button>
            </div>
          </div>

          {/* Text Controls */}
          {watermarkType === 'text' ? (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--c-muted)' }}>
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none"
                  style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>Font Family</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  >
                    <option value="sans-serif">Sans-Serif</option>
                    <option value="serif">Classic Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="Impact">Impact / Bold</option>
                    <option value="cursive">Script / Cursive</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] block mb-1" style={{ color: 'var(--c-subtle)' }}>Color & Style</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border bg-transparent cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBold((b) => !b)}
                      className={`px-2 py-1 text-xs font-bold rounded-lg border cursor-pointer ${isBold ? 'ring-1' : ''}`}
                      style={{
                        backgroundColor: isBold ? 'var(--c-card)' : 'var(--c-bg)',
                        borderColor: isBold ? 'var(--c-gold)' : 'var(--c-border)',
                        color: isBold ? 'var(--c-gold)' : 'var(--c-muted)',
                      }}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasShadow((s) => !s)}
                      className={`px-2 py-1 text-xs rounded-lg border cursor-pointer ${hasShadow ? 'ring-1' : ''}`}
                      style={{
                        backgroundColor: hasShadow ? 'var(--c-card)' : 'var(--c-bg)',
                        borderColor: hasShadow ? 'var(--c-gold)' : 'var(--c-border)',
                        color: hasShadow ? 'var(--c-gold)' : 'var(--c-muted)',
                      }}
                    >
                      Shadow
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--c-muted)' }}>Font Size:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{fontSize} px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--c-muted)' }}>Text Opacity:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{textOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={textOpacity}
                  onChange={(e) => setTextOpacity(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--c-muted)' }}>Rotation Angle:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{textRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={textRotation}
                  onChange={(e) => setTextRotation(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            </div>
          ) : (
            /* Logo Upload Controls */
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--c-muted)' }}>
                  Upload Logo (PNG / SVG)
                </label>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={handleLogoSelected}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:text-xs file:font-semibold file:cursor-pointer"
                  style={{ color: 'var(--c-text)' }}
                />
              </div>

              {logoSrc && (
                <>
                  {/* Logo Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--c-muted)' }}>Logo Size Scale:</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{logoScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={logoScale}
                      onChange={(e) => setLogoScale(Number(e.target.value))}
                      className="w-full cursor-pointer h-2 rounded-lg"
                    />
                  </div>

                  {/* Logo Opacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--c-muted)' }}>Logo Opacity:</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{logoOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(Number(e.target.value))}
                      className="w-full cursor-pointer h-2 rounded-lg"
                    />
                  </div>

                  {/* Logo Rotation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--c-muted)' }}>Rotation Angle:</span>
                      <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{logoRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={logoRotation}
                      onChange={(e) => setLogoRotation(Number(e.target.value))}
                      className="w-full cursor-pointer h-2 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 9-Point Anchor Position Grid & Tiled Mode */}
          <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                Watermark Position
              </label>
              <button
                type="button"
                onClick={() => setAnchor(anchor === 'tile' ? 'br' : 'tile')}
                className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  anchor === 'tile' ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: anchor === 'tile' ? 'var(--c-card)' : 'var(--c-bg)',
                  borderColor: anchor === 'tile' ? 'var(--c-gold)' : 'var(--c-border)',
                  color: anchor === 'tile' ? 'var(--c-gold)' : 'var(--c-muted)',
                }}
              >
                <Grid className="w-3 h-3 inline mr-1" />
                Tiled Pattern
              </button>
            </div>

            {anchor !== 'tile' ? (
              <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto p-1.5 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                {(['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br'] as PositionAnchor[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setAnchor(pos)}
                    className={`h-7 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      anchor === pos ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: anchor === pos ? 'var(--c-card)' : 'var(--c-surface)',
                      borderColor: anchor === pos ? 'var(--c-gold)' : 'var(--c-border)',
                      color: anchor === pos ? 'var(--c-gold)' : 'var(--c-muted)',
                    }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--c-muted)' }}>Tile Spacing:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--c-gold)' }}>{tileSpacing} px</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="300"
                  value={tileSpacing}
                  onChange={(e) => setTileSpacing(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <button
              onClick={() => currentItem && handleDownloadSingle(currentItem)}
              disabled={isProcessing || !currentItem?.watermarkedBlob}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              <Download className="w-5 h-5" />
              Download Active Photo
            </button>

            {images.length > 1 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="w-full py-3 px-6 rounded-2xl font-bold text-xs border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--c-card)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              >
                <Archive className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
                {isZipping ? 'Creating ZIP...' : `Download All ${images.length} as ZIP`}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Visual Preview & Gallery Strip */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
              <Eye className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
              Live Watermarked Preview ({currentItem?.file.name})
            </span>

            <label
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-gold)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add More Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Main Visual Preview */}
          <div
            className="flex-1 min-h-[440px] rounded-2xl border p-4 flex items-center justify-center overflow-hidden relative"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
            }}
          >
            {currentItem?.watermarkedDataUrl ? (
              <img
                src={currentItem.watermarkedDataUrl}
                alt="Watermark preview"
                className="max-h-[460px] max-w-full object-contain rounded-xl shadow-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs" style={{ color: 'var(--c-muted)' }}>
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Applying watermark layer...</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Strip for batch selection */}
          {images.length > 1 && (
            <div className="p-3 rounded-2xl border flex items-center gap-3 overflow-x-auto" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
              {images.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-16 h-16 rounded-xl border overflow-hidden shrink-0 transition-all cursor-pointer ${
                    selectedIndex === idx ? 'ring-2 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: selectedIndex === idx ? 'var(--c-gold)' : 'var(--c-border)',
                  }}
                >
                  <img
                    src={item.watermarkedDataUrl || item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="image-watermark" onReset={handleReset} />
    </div>
  );
};
