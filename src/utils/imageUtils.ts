export function loadImage(src: string | Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    
    if (typeof src === 'string') {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
}

export interface CompressOptions {
  quality: number; // 0.05 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<{
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}> {
  const img = await loadImage(file);
  let { width, height } = img;
  
  // Scale down if dimensions exceed bounds
  if (options.maxWidth && width > options.maxWidth) {
    height = Math.round((height * options.maxWidth) / width);
    width = options.maxWidth;
  }
  if (options.maxHeight && height > options.maxHeight) {
    width = Math.round((width * options.maxHeight) / height);
    height = options.maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // If compressing as JPEG, fill transparent backgrounds with white
  const targetFormat = options.format || (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob'));
          return;
        }
        const dataUrl = canvas.toDataURL(targetFormat, options.quality);
        resolve({
          blob,
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: blob.size,
        });
      },
      targetFormat,
      options.quality
    );
  });
}

export async function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  format: string = 'image/png',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create resized blob'));
          return;
        }
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({ blob, dataUrl });
      },
      format,
      quality
    );
  });
}

export async function convertImage(
  file: File,
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image'));
          return;
        }
        const dataUrl = canvas.toDataURL(targetFormat, quality);
        resolve({
          blob,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      },
      targetFormat,
      quality
    );
  });
}
