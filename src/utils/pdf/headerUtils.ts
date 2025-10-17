import { PDFPage, rgb } from 'pdf-lib';
import { PDF_CONSTANTS, PDF_COLORS } from './constants';
import { sanitizeTextForPDF } from './textUtils';
import { TestMetadata } from '../../types';

/**
 * PDF header generation utilities with professional exam-style design
 * 
 * Handles test header creation with metadata information using clean,
 * professional styling with proper spacing and layout
 */

/**
 * Adds professional test header with single-line metadata at top-left
 * 
 * @param page - PDF page to add header to
 * @param metadata - Test metadata for header content
 * @returns Y position where content should start
 */
export const addTestHeader = (page: PDFPage, metadata: TestMetadata): number => {
  const currentDate = sanitizeTextForPDF(new Date().toLocaleDateString('tr-TR'));
  let yPos = 800; // Start from top with 10mm margin
  
  // Single line metadata at top-left with bold, high-contrast text
  const metadataItems = [];
  if (metadata.testName) metadataItems.push(sanitizeTextForPDF(metadata.testName));
  if (metadata.courseName) metadataItems.push(sanitizeTextForPDF(metadata.courseName));
  if (metadata.className) metadataItems.push(sanitizeTextForPDF(metadata.className));
  if (metadata.teacherName) metadataItems.push(sanitizeTextForPDF(metadata.teacherName));
  metadataItems.push(currentDate);
  
  if (metadataItems.length > 0) {
    const metadataText = metadataItems.join(' • ');
    
    page.drawText(metadataText, {
      x: 50, // Left margin (approximately 5mm)
      y: yPos,
      size: 12,
      color: rgb(0.067, 0.067, 0.067) // Strong black (#111)
    });
    
    yPos -= 30; // 10mm space below metadata
  }
  
  // Horizontal divider line under meta area
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: 545, y: yPos },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9) // Very light gray
  });
  
  return yPos - 20; // Return content start position with adequate spacing
};

/**
 * Adds minimal continuation header for multi-page tests
 * 
 * @param page - PDF page to add header to
 * @returns Y position where content should start
 */
export const addContinuationHeader = (page: PDFPage): number => {
  const startY = 800-20;
  
  page.drawText('Test (devam)', {
    x: 50,
    y: startY,
    size: 12,
    color: rgb(0.067, 0.067, 0.067) // Strong black (#111)
  });
  
  // Add separator line
  page.drawLine({
    start: { x: 50, y: startY - 15 },
    end: { x: 545, y: startY - 15 },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9)
  });
  
  return startY - 35; // Return content start position
};