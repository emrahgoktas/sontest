import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PDF_CONSTANTS, PDF_COLORS } from './constants';
import { QuestionLayout } from './layoutUtils';
import { CroppedQuestion } from '../../types';

/**
 * Original-size question rendering utilities for PDF generation
 * 
 * Handles individual question placement using original cropped dimensions
 * with NO RESIZING - questions appear at their natural size for maximum quality
 */

/**
 * Adds a question to PDF page using original size with minimal styling
 * 
 * @param page - PDF page to add question to
 * @param pdfDoc - PDF document for image embedding
 * @param question - Question data with original image dimensions
 * @param layout - Pre-calculated layout information preserving original size
 */
export const addRealSizeQuestionToPage = async (
  page: PDFPage,
  pdfDoc: PDFDocument,
  question: CroppedQuestion,
  layout: QuestionLayout
): Promise<void> => {
  // Add small, left-aligned question number at top-left corner
  addTopLeftQuestionNumber(page, layout.questionNumber, layout);
  
  // Add original-size question image with maximum quality
  try {
    await addOriginalSizeQuestionImage(page, pdfDoc, question, layout);
  } catch (error) {
    addCleanErrorPlaceholder(page, layout, error);
  }
};

/**
 * Adds small question number aligned with the top-left corner of the image,
 * slightly shifted left for better visual balance.
 * 
 * @param page - PDF page to add number to
 * @param questionNumber - Number to display
 * @param layout - Layout information for positioning
 */
const IMAGE_X_OFFSET = -20; // sola 20pt

const addTopLeftQuestionNumber = (
  page: PDFPage, 
  questionNumber: number, 
  layout: QuestionLayout
): void => {
  // Görsel pozisyonu
  const imageX = layout.x + IMAGE_X_OFFSET; // [KGA-CHANGE] sola kaydırma uygulandı
  const imageY = layout.y + layout.height - 15 - layout.actualImageHeight;

  // Numara görselin üst hizasında, görselin solundan 10pt daha sola
  const numberX = imageX - 16;   // [KGA-CHANGE] numara da birlikte kayar
  const numberY = imageY + layout.actualImageHeight - 2;

  page.drawText(`${questionNumber}.`, {
    x: numberX,
    y: numberY,
    size: 11,
    color: rgb(0.067, 0.067, 0.067),
  });
};

/**
 * Adds question image at original size with maximum quality preservation
 * NO RESIZING - image appears at its natural cropped dimensions
 * 
 * @param page - PDF page to add image to
 * @param pdfDoc - PDF document for image embedding
 * @param question - Question with original image data and actual dimensions
 * @param layout - Layout information with calculated positions
 */
const addOriginalSizeQuestionImage = async (
  page: PDFPage,
  pdfDoc: PDFDocument,
  question: CroppedQuestion,
  layout: QuestionLayout
): Promise<void> => {
  const base64Data = extractBase64Data(question.imageData);
  const imageBytes = convertBase64ToBytes(base64Data);
  const image = await embedImageWithOptimalQuality(pdfDoc, imageBytes);

  // --- Sabit genişlik senin dediğin gibi (ör: 200) — yükseklik orantılı
  const fixedWidth = 200; // <== 
  const aspectRatio = layout.originalPixelHeight / layout.originalPixelWidth;
  const scaledHeight = fixedWidth * aspectRatio;

  // [KGA-CHANGE]: X’e sola ofset uygula
  const imageX = layout.x + IMAGE_X_OFFSET;
  const imageY = layout.y + layout.height - scaledHeight;

  page.drawImage(image, {
    x: imageX,
    y: imageY,
    width: fixedWidth,
    height: scaledHeight,
  });
};



/**
 * Extracts base64 data from data URL
 * 
 * @param imageData - Complete data URL
 * @returns Base64 encoded image data
 */
const extractBase64Data = (imageData: string): string => {
  return imageData.split(',')[1];
};

/**
 * Converts base64 string to Uint8Array for optimal PDF embedding
 * 
 * @param base64Data - Base64 encoded data
 * @returns Byte array optimized for PDF embedding
 */
const convertBase64ToBytes = (base64Data: string): Uint8Array => {
  return Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
};

/**
 * Embeds image with optimal quality settings and format detection
 * Prioritizes PNG for lossless quality, falls back to JPEG if needed
 * 
 * @param pdfDoc - PDF document
 * @param imageBytes - High-quality image byte data
 * @returns Embedded image object optimized for quality
 */
const embedImageWithOptimalQuality = async (pdfDoc: PDFDocument, imageBytes: Uint8Array) => {
  try {
    // Always try PNG first for lossless quality - ideal for question images
    return await pdfDoc.embedPng(imageBytes);
  } catch {
    try {
      // Fallback to JPEG only if PNG fails
      console.warn('PNG embedding failed, falling back to JPEG (quality may be reduced)');
      return await pdfDoc.embedJpg(imageBytes);
    } catch {
      throw new Error('Unsupported image format - use PNG for maximum quality');
    }
  }
};

/**
 * Adds clean error placeholder without decorative styling
 * Maintains the clean aesthetic while indicating an error
 * 
 * @param page - PDF page to add placeholder to
 * @param layout - Layout information
 * @param error - Error that occurred
 */
const addCleanErrorPlaceholder = (page: PDFPage, layout: QuestionLayout, error: unknown): void => {
  console.error('Görsel ekleme hatası:', error);
  
  const placeholderX = layout.x;
  const placeholderY = layout.y + layout.height - 15 - layout.actualImageHeight;
  const placeholderWidth = layout.actualImageWidth;
  const placeholderHeight = layout.actualImageHeight;
  
  // Clean error background with minimal styling
  page.drawRectangle({
    x: placeholderX,
    y: placeholderY,
    width: placeholderWidth,
    height: placeholderHeight,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98)
  });
  
  // Error text with clean typography
  const errorText = 'Gorsel yuklenemedi';
  const textX = placeholderX + (placeholderWidth - errorText.length * 3) / 2;
  const textY = placeholderY + placeholderHeight / 2;
  
  page.drawText(errorText, {
    x: Math.max(placeholderX + 5, textX),
    y: textY,
    size: 10,
    color: rgb(0.5, 0.5, 0.5)
  });
};

// Legacy function for backward compatibility (deprecated)

/**
 * @deprecated Use addRealSizeQuestionToPage instead
 */
export const addQuestionToPage = async (
  page: PDFPage,
  pdfDoc: PDFDocument,
  question: CroppedQuestion,
  questionNumber: number,
  column: number,
  row: number,
  contentStartY: number,
  questionSpacing: number,
  rowHeight: number
): Promise<void> => {
  // Convert to real-size layout for backward compatibility
  const layout: QuestionLayout = {
    x: PDF_CONSTANTS.MARGIN + (column * 250),
    y: contentStartY - (row * rowHeight),
    width: 240,
    height: rowHeight,
    questionNumber,
    actualImageWidth: 200,
    actualImageHeight: rowHeight - 40,
    column: 0,
    originalPixelWidth: question.actualWidth,
    originalPixelHeight: question.actualHeight,
    scaleFactor: 1.0
  };
  
  await addRealSizeQuestionToPage(page, pdfDoc, question, layout);
};
