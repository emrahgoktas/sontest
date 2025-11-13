/**
 * Watermark utilities for PDF generation
 * 
 * Handles text and image watermarks with proper layering, opacity, and positioning
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { WatermarkConfig } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

/**
 * Adds watermark to PDF page with proper layering (behind content but above background)
 * 
 * @param page - PDF page to add watermark to
 * @param watermark - Watermark configuration
 * @param pdfDoc - PDF document for image embedding
 * 
 * @example
 * ```typescript
 * addWatermark(page, {
 *   type: 'text',
 *   content: 'DENEME',
 *   opacity: 0.08,
 *   position: 'center',
 *   rotation: -45
 * });
 * ```
 */
export const addWatermark = async (page: PDFPage, watermark: WatermarkConfig, pdfDoc?: PDFDocument): Promise<void> => {
  if (watermark.type === 'none' || !watermark.content) return;
  
  switch (watermark.type) {
    case 'text':
      addTextWatermark(page, watermark);
      break;
    case 'image':
      if (pdfDoc) {
        await addImageWatermark(page, watermark, pdfDoc);
      }
      break;
  }
};

/**
 * Adds text watermark with diagonal positioning and enhanced styling
 * 
 * @param page - PDF page
 * @param watermark - Watermark configuration
 */
const addTextWatermark = (page: PDFPage, watermark: WatermarkConfig): void => {
  if (!watermark.content) return;
  
  // Sanitize watermark text to handle Turkish characters
  const sanitizedContent = sanitizeTextForPDF(watermark.content);
  
  const position = calculateWatermarkPosition(watermark.position || 'center');
  const size = Math.max(40, watermark.size || 48); // Minimum 40pt for visibility
  const opacity = Math.max(0.05, Math.min(0.15, watermark.opacity || 0.08)); // Default to 8% opacity, max 15%
  const rotation = (watermark.rotation || -30) * (Math.PI / 180); // Default -30 degrees for diagonal
  const color = watermark.color || { r: 0.8, g: 0.8, b: 0.8 }; // Light gray default
  
  // Calculate text width for proper centering
  const textWidth = sanitizedContent.length * size * 0.6;
  const adjustedX = position.x - (textWidth / 2);
  
  // Create watermark with enhanced visibility using RGBA color
  const watermarkColor = rgb(
    Math.max(0, Math.min(1, color.r)),
    Math.max(0, Math.min(1, color.g)),
    Math.max(0, Math.min(1, color.b))
  );
  
  // Draw watermark text with proper layering and italic/bold styling
  page.drawText(sanitizedContent, {
    x: adjustedX,
    y: position.y,
    size: size,
    color: watermarkColor,
    opacity: opacity,
    rotate: rotation !== 0 ? {
      type: 'radians',
      angle: rotation
    } : undefined
  });
};

/**
 * Adds image watermark to page with proper scaling and positioning
 * 
 * @param page - PDF page
 * @param watermark - Watermark configuration
 * @param pdfDoc - PDF document for image embedding
 */
const addImageWatermark = async (page: PDFPage, watermark: WatermarkConfig, pdfDoc: PDFDocument): Promise<void> => {
  if (!watermark.content || !pdfDoc) return;
  
  try {
    // Extract base64 data from data URL
    const base64Data = watermark.content.includes(',') 
      ? watermark.content.split(',')[1] 
      : watermark.content;
    
    // Convert base64 to bytes
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Try to embed as PNG first, then JPG
    let image;
    try {
      image = await pdfDoc.embedPng(imageBytes);
    } catch {
      try {
        image = await pdfDoc.embedJpg(imageBytes);
      } catch {
        console.warn('Unsupported image format for watermark');
        return;
      }
    }
    
    // Calculate position and size
    const position = calculateWatermarkPosition(watermark.position || 'center');
    const opacity = Math.max(0.05, Math.min(0.15, watermark.opacity || 0.1)); // Default to 10% opacity
    const rotation = (watermark.rotation || 0) * (Math.PI / 180);
    
    // Get original image dimensions
    const originalDims = image.size();
    
    // Calculate maximum width (40% of page width)
    const maxWidth = PDF_CONSTANTS.PAGE_WIDTH * 0.4;
    const maxHeight = PDF_CONSTANTS.PAGE_HEIGHT * 0.4;
    
    // Calculate scale factor to fit within 40% of page width while maintaining aspect ratio
    const scaleX = maxWidth / originalDims.width;
    const scaleY = maxHeight / originalDims.height;
    const scaleFactor = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    // Apply additional user scale if provided
    const userScale = (watermark.size || 100) / 100;
    const finalScale = scaleFactor * userScale;
    
    const imageDims = image.scale(finalScale);
    const imageWidth = imageDims.width;
    const imageHeight = imageDims.height;
    
    // Center the image at the calculated position
    const imageX = position.x - (imageWidth / 2);
    const imageY = position.y - (imageHeight / 2);
    
    // Draw the image watermark
    page.drawImage(image, {
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
      opacity: opacity,
      rotate: rotation !== 0 ? {
        type: 'radians',
        angle: rotation
      } : undefined
    });
    
  } catch (error) {
    console.error('Error adding image watermark:', error);
  }
};

/**
 * Calculates watermark position based on position string
 * 
 * @param position - Position identifier
 * @returns X, Y coordinates for watermark
 */
const calculateWatermarkPosition = (position: string): { x: number; y: number } => {
  const pageWidth = PDF_CONSTANTS.PAGE_WIDTH;
  const pageHeight = PDF_CONSTANTS.PAGE_HEIGHT;
  
  switch (position) {
    case 'center':
      return { x: pageWidth / 2, y: pageHeight / 2 };
    case 'top-left':
      return { x: 100, y: pageHeight - 100 };
    case 'top-right':
      return { x: pageWidth - 100, y: pageHeight - 100 };
    case 'bottom-left':
      return { x: 100, y: 100 };
    case 'bottom-right':
      return { x: pageWidth - 100, y: 100 };
    default:
      return { x: pageWidth / 2, y: pageHeight / 2 };
  }
};

/**
 * Creates default watermark configurations for different themes
 * 
 * @param themeType - Type of theme
 * @returns Default watermark configuration
 */
export const getDefaultWatermarkForTheme = (themeType: string): WatermarkConfig => {
  switch (themeType) {
    case 'yaprak-test':
      return {
        type: 'text',
        content: 'YAPRAK TEST',
        opacity: 0.1,
        position: 'center',
        size: 48,
        rotation: -45,
        color: { r: 0.2, g: 0.6, b: 0.3 }
      };
    case 'deneme-sinavi':
      return {
        type: 'text',
        content: 'DENEME',
        opacity: 0.08,
        position: 'center',
        size: 60,
        rotation: -30,
        color: { r: 0.2, g: 0.4, b: 0.8 }
      };
    case 'yazili-sinav':
      return {
        type: 'text',
        content: 'YAZILI SINAV',
        opacity: 0.06,
        position: 'center',
        size: 40,
        rotation: 0,
        color: { r: 0.3, g: 0.3, b: 0.3 }
      };
    case 'classic':
      return {
        type: 'text',
        content: 'TEST',
        opacity: 0.08,
        position: 'center',
        size: 50,
        rotation: -30,
        color: { r: 0, g: 0.75, b: 0.8 }
      };
      case 'yks-2025': // Yeni temanızın ID'si
      return {
        type: 'text',
        content: 'YKS',
        opacity: 0.08,
        position: 'center',
        size: 55,
        rotation: -30,
        color: { r: 0.1, g: 0.3, b: 0.8 } // Mavi ton
      };
    default:
      return { type: 'none' };
  }
};