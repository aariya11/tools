import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Import local worker via Vite ?url so it's always version-matched, offline-capable, and never blocked by cross-origin policies
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { readFileAsArrayBuffer } from './fileUtils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

/**
 * Merge multiple PDF files into a single PDF
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(new Uint8Array(arrayBuffer), {
      ignoreEncryption: true,
      parseSpeed: 1,
    });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split a PDF by page ranges (e.g. "1-2, 3-5")
 */
export async function splitPdfByRanges(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(new Uint8Array(arrayBuffer), {
    ignoreEncryption: true,
  });
  const totalPages = srcDoc.getPageCount();
  const results: { name: string; bytes: Uint8Array }[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i];
    const validStart = Math.max(1, Math.min(start, totalPages));
    const validEnd = Math.max(validStart, Math.min(end, totalPages));

    const newDoc = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = validStart - 1; p <= validEnd - 1; p++) {
      pageIndices.push(p);
    }

    if (pageIndices.length > 0) {
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const bytes = await newDoc.save();
      results.push({
        name: `${file.name.replace(/\.pdf$/i, '')}_pages_${validStart}-${validEnd}.pdf`,
        bytes,
      });
    }
  }

  return results;
}

/**
 * Extract specific selected pages from a PDF
 */
export async function extractPdfPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(new Uint8Array(arrayBuffer), {
    ignoreEncryption: true,
  });
  const totalPages = srcDoc.getPageCount();

  const newDoc = await PDFDocument.create();
  const indices = Array.from(new Set(pageNumbers))
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)
    .map((p) => p - 1);

  if (indices.length === 0) {
    throw new Error('No valid pages selected for extraction.');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Convert multiple image files to a single PDF with canvas fallback for all image formats
 */
export async function imagesToPdf(
  imageFiles: { file: File; dataUrl: string; width: number; height: number }[],
  options: { orientation: 'auto' | 'portrait' | 'landscape'; margin: number }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const item of imageFiles) {
    let pdfImage: any = null;

    // Try direct JPG/PNG embedding
    try {
      const arrayBuffer = await readFileAsArrayBuffer(item.file);
      if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
        pdfImage = await pdfDoc.embedJpg(new Uint8Array(arrayBuffer));
      } else if (item.file.type === 'image/png') {
        pdfImage = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));
      }
    } catch {
      pdfImage = null;
    }

    // Fallback: draw image to Canvas and re-encode to RGB JPEG to ensure 100% compatibility with CMYK/WebP/GIF
    if (!pdfImage) {
      const canvas = document.createElement('canvas');
      canvas.width = item.width || 800;
      canvas.height = item.height || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.src = item.dataUrl;
        await new Promise((resolve) => {
          if (img.complete) resolve(null);
          else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        });
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64Data = jpgDataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        pdfImage = await pdfDoc.embedJpg(bytes);
      }
    }

    if (!pdfImage) continue;

    const { width: imgW, height: imgH } = pdfImage;
    const margin = options.margin;

    let pageW = 595.28; // Standard A4 points
    let pageH = 841.89;

    if (options.orientation === 'landscape') {
      pageW = 841.89;
      pageH = 595.28;
    } else if (options.orientation === 'auto') {
      if (imgW > imgH) {
        pageW = 841.89;
        pageH = 595.28;
      }
    }

    const maxW = Math.max(10, pageW - margin * 2);
    const maxH = Math.max(10, pageH - margin * 2);

    const scale = Math.min(maxW / imgW, maxH / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const posX = margin + (maxW - drawW) / 2;
    const posY = margin + (maxH - drawH) / 2;

    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(pdfImage, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
}

/**
 * Render all pages of a PDF into JPG images with robust error resilience
 */
export async function renderPdfToJpg(
  file: File,
  scale: number = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pages: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext('2d');

      if (!context) continue;

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
      };

      await (page.render(renderContext as any) as any).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92)
      );

      pages.push({ pageNumber: i, dataUrl, blob });
    } catch (pageErr) {
      console.warn(`Error rendering page ${i}:`, pageErr);
    }

    if (onProgress) {
      onProgress(i, totalPages);
    }
  }

  if (pages.length === 0) {
    throw new Error('Unable to render pages from this PDF file.');
  }

  return pages;
}

/**
 * PDF Document Compression / Object stream optimization
 */
export async function compressPdfDocument(
  file: File,
  _level: 'low' | 'medium' | 'high'
): Promise<Uint8Array> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(new Uint8Array(arrayBuffer), {
    ignoreEncryption: true,
  });

  // Strip bloated non-essential metadata
  srcDoc.setTitle('');
  srcDoc.setAuthor('');
  srcDoc.setSubject('');
  srcDoc.setKeywords([]);
  srcDoc.setProducer('ToolBoxX Engine');
  srcDoc.setCreator('ToolBoxX');

  return await srcDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}
