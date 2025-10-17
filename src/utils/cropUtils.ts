import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker?worker';
import type React from 'react';

// Configure PDF.js worker – workerPort tercih edilir (daha akıcı UI)
try {
  // @ts-ignore
  const G: any = pdfjsLib.GlobalWorkerOptions;
  // @ts-ignore
  if (!G._workerPort) {
    // @ts-ignore
    G.workerPort = new (PDFWorker as any)();
  }
} catch (error) {
  console.warn('PDF.js worker configuration failed. PDF performance may be degraded.', error);
}

/**
 * High-quality PDF cropping and image processing utilities
 *
 * - High-resolution PDF page rendering (min 2.5x, ideal 3.0x)
 * - Lossless PNG cropping
 * - Accurate coordinate mapping
 * - Touch + mouse destekleri
 */

// High-quality rendering configuration
const QUALITY_CONFIG = {
  MIN_SCALE: 2.5,
  IDEAL_SCALE: 3.0,
  MAX_SCALE: 4.0,
  PNG_QUALITY: 1.0,
  TARGET_DPI: 300,
  STORAGE_MAX_WIDTH: 800,
  STORAGE_MAX_HEIGHT: 600,
  STORAGE_JPEG_QUALITY: 0.7,
} as const;

// PDF processing options
interface PDFProcessingOptions {
  lazy?: boolean;            // upload→kırpma akışında sayfa ön-üretimini atla
  maxPages?: number;
  compressionLevel?: number;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Converts a PDF file to high-resolution page images using optimal scaling
 */
export const convertPDFToImages = async (
  file: File,
  options: PDFProcessingOptions = {}
): Promise<{ numPages: number; pageImages: string[]; pdfDocument: pdfjsLib.PDFDocumentProxy }> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Büyük PDF optimizasyonları ile yükle
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      disableAutoFetch: true,      // gereksiz fetch'i kes
      stopAtErrors: false,
      rangeChunkSize: 65536 * 8,   // 512KB chunk
    });

    const pdfDocument = await loadingTask.promise;
    const totalPages = pdfDocument.numPages;
    const pagesToProcess = Math.min(totalPages, options.maxPages ?? totalPages);

    // LAZY path: sayfa görsellerini üretmeden dön
    if (options.lazy) {
      return { numPages: pagesToProcess, pageImages: [], pdfDocument };
    }

    // Non-lazy path: yüksek çözünürlükte sırayla üret
    const pageImages: string[] = [];
    const optimalScale = calculateOptimalScale(pagesToProcess);

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const img = await renderPageToHighResBase64(pdfDocument, pageNum, optimalScale, options);
      pageImages.push(img);
      // UI'yi bloklamamak için küçük bir yield
      if (pageNum % 2 === 0) await new Promise((r) => setTimeout(r, 0));
    }

    return { numPages: pagesToProcess, pageImages, pdfDocument };
  } catch (error) {
    console.error('PDF işleme hatası:', error);
    throw new Error('PDF dosyası işlenirken hata oluştu. Lütfen geçerli bir PDF dosyası seçin.');
  }
};

/** Ölçek seçimi: sayfa arttıkça daha muhafazakâr */
const calculateOptimalScale = (pageCount: number): number => {
  if (pageCount <= 5) return QUALITY_CONFIG.IDEAL_SCALE;
  if (pageCount <= 15) return QUALITY_CONFIG.MIN_SCALE;
  return Math.max(2.0, QUALITY_CONFIG.MIN_SCALE - 0.5);
};

/**
 * Renders a single PDF page to high-resolution base64 image string
 */
const renderPageToHighResBase64 = async (
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  options: PDFProcessingOptions = {}
): Promise<string> => {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context oluşturulamadı');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  await page.render({ canvasContext: context, viewport }).promise;

  // Depolama optimizasyonu (JPEG)
  if (options.compressionLevel && options.compressionLevel < 1.0) {
    if (options.targetWidth || options.targetHeight) {
      const resized = resizeCanvas(
        canvas,
        options.targetWidth || QUALITY_CONFIG.STORAGE_MAX_WIDTH,
        options.targetHeight || QUALITY_CONFIG.STORAGE_MAX_HEIGHT
      );
      return resized.toDataURL('image/jpeg', options.compressionLevel);
    }
    return canvas.toDataURL('image/jpeg', options.compressionLevel);
  }

  // Varsayılan: lossless PNG
  return canvas.toDataURL('image/png');
};

/** Oran koruyarak yeniden boyutlandır */
const resizeCanvas = (
  sourceCanvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  const ratio = Math.min(maxWidth / sourceCanvas.width, maxHeight / sourceCanvas.height);
  canvas.width = Math.max(1, Math.floor(sourceCanvas.width * ratio));
  canvas.height = Math.max(1, Math.floor(sourceCanvas.height * ratio));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Renders a PDF page to a canvas element with high-resolution and cancellation support
 * OffscreenCanvas destekliyse off-thread render + hızlı kopya
 */
export const renderPDFPageToCanvas = async (
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = QUALITY_CONFIG.IDEAL_SCALE
): Promise<pdfjsLib.RenderTask> => {
  try {
    const qualityScale = Math.max(scale, QUALITY_CONFIG.MIN_SCALE);
    const page = await pdfDocument.getPage(pageNumber + 1); // 1-based
    const viewport = page.getViewport({ scale: qualityScale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const canUseOffscreen = typeof (window as any).OffscreenCanvas !== 'undefined';
    if (canUseOffscreen) {
      const off = new (window as any).OffscreenCanvas(viewport.width, viewport.height);
      const offCtx = off.getContext('2d');
      if (!offCtx) throw new Error('OffscreenCanvas context oluşturulamadı');
      const renderTask = page.render({ canvasContext: offCtx as unknown as CanvasRenderingContext2D, viewport });
      await renderTask.promise;
      const bmp = off.transferToImageBitmap();
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context oluşturulamadı');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (typeof (ctx as any).transferFromImageBitmap === 'function') {
        (ctx as any).transferFromImageBitmap(bmp);
      } else {
        (ctx as CanvasRenderingContext2D).drawImage(bmp as any, 0, 0);
      }
      return renderTask;
    }

    // Fallback: doğrudan görünür canvas'a render
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context oluşturulamadı');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, canvas.width, canvas.height);
    const renderTask = page.render({ canvasContext: context, viewport });
    await renderTask.promise;
    return renderTask;
  } catch (error: any) {
    if (isRenderingCancellationError(error)) throw error;
    console.error('Sayfa render hatası:', error);
    throw new Error('PDF sayfası yüklenirken hata oluştu');
  }
};

/** pdf.js rendering cancel hatası mı? */
const isRenderingCancellationError = (error: unknown): boolean => {
  return !!(
    error &&
    typeof error === 'object' &&
    'name' in (error as any) &&
    (error as any).name === 'RenderingCancelledException'
  );
};

/**
 * Crops an image from canvas with maximum quality and returns actual pixel dimensions
 */
export const cropImageFromCanvas = async (
  canvasElement: HTMLCanvasElement,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<{ imageData: string; actualWidth: number; actualHeight: number }> => {
  const cropCanvas = createHighQualityCropCanvas(cropArea);
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) throw new Error('Kırpma canvas bağlamı oluşturulamadı');

  // piksel-sadık kırpma
  cropCtx.imageSmoothingEnabled = false;
  cropCtx.imageSmoothingQuality = 'high';

  cropCtx.drawImage(
    canvasElement,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  const imageData = cropCanvas.toDataURL('image/png');
  const dimensions = await getImageDimensions(imageData);
  return { imageData, actualWidth: dimensions.width, actualHeight: dimensions.height };
};

/** Kırpma için tam boyutlu canvas oluştur */
const createHighQualityCropCanvas = (cropArea: { width: number; height: number }): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  return canvas;
};

/** Base64 görselin gerçek piksel ölçülerini döndür */
const getImageDimensions = (base64Data: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image for dimension calculation'));
    img.src = base64Data;
  });
};

/** İşaretçi yardımcıları */
export const getCanvasMousePosition = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;
  return { x: Math.round(canvasX), y: Math.round(canvasY) };
};

export const getCanvasTouchPosition = (
  event: React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0] || event.changedTouches[0];
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (touch.clientX - rect.left) * scaleX;
  const canvasY = (touch.clientY - rect.top) * scaleY;
  return { x: Math.round(canvasX), y: Math.round(canvasY) };
};

/** Basit doğrulama */
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.type !== 'application/pdf') return { isValid: false, error: 'Lütfen bir PDF dosyası seçin' };
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.size > MAX_FILE_SIZE) return { isValid: false, error: "PDF dosya boyutu 100MB'dan küçük olmalıdır" };
  return { isValid: true };
};

/** Kırpma önizlemesi */
export const createCropPreview = async (
  canvas: HTMLCanvasElement,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const { imageData } = await cropImageFromCanvas(canvas, cropArea);
  return imageData;
};

/** Hafıza tahmini (yaklaşık) */
export const estimateMemoryUsage = (pageCount: number, scale: number): number => {
  const avgPageSizeMB = 8 * (scale / 3.0);
  return pageCount * avgPageSizeMB;
};

export const getRecommendedScale = (pageCount: number): number => {
  const estimatedMemory = estimateMemoryUsage(pageCount, QUALITY_CONFIG.IDEAL_SCALE);
  if (estimatedMemory > 500) return QUALITY_CONFIG.MIN_SCALE;
  return QUALITY_CONFIG.IDEAL_SCALE;
};
