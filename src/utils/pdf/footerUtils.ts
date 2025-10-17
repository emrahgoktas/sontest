import { PDFPage, rgb } from 'pdf-lib';
import { PDF_CONSTANTS, PDF_COLORS } from './constants';

/**
 * PDF footer generation utilities with minimal professional design
 * 
 * Handles page footer creation with minimal styling for professional appearance
 */

/**
 * Adds minimal professional page footer with right-aligned page number
 * 
 * @param page - PDF page to add footer to
 * @param pageNumber - Current page number
 * @param totalPages - Total number of pages
 */
export const addPageFooter = (page: PDFPage, pageNumber: number, totalPages: number): void => {
  // Right-aligned page number only (minimal footer)
  const pageText = `${pageNumber}`;
  
  page.drawText(pageText, {
    x: 545, // Right-aligned
    y: 45,
    size: 10,
    color: rgb(0.2, 0.2, 0.2) // Dark gray for subtle appearance
  });
};