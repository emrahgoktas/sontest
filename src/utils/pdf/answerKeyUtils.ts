import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PDF_CONSTANTS, PDF_COLORS } from './constants';
import { addPageFooter } from './footerUtils';
import { addWatermark } from './themes/watermarkUtils';
import { CroppedQuestion } from '../../types';
import { WatermarkConfig } from '../../types/themes';

/**
 * Modern answer key generation utilities with enhanced styling
 * 
 * Handles answer key page creation with professional formatting
 * and modern design elements for improved visual hierarchy
 */

/**
 * Generates the answer key page with enhanced modern professional formatting
 * 
 * @param pdfDoc - PDF document to add page to
 * @param questions - Array of questions with correct answers
 * @param totalPages - Total number of pages for footer
 * @param includeAnswerKey - Whether to include answer key (default: true)
 * @param watermark - Optional watermark configuration
 * 
 * @example
 * ```typescript
 * await generateAnswerKeyPage(pdfDoc, questions, 3, true, watermarkConfig);
 * ```
 */
export const generateAnswerKeyPage = async (
  pdfDoc: PDFDocument,
  questions: CroppedQuestion[],
  totalPages: number,
  includeAnswerKey: boolean = true,
  watermark?: WatermarkConfig
): Promise<void> => {
  // Only generate answer key page if explicitly requested
  if (!includeAnswerKey) {
    return;
  }
  
  const answerPage = pdfDoc.addPage([PDF_CONSTANTS.PAGE_WIDTH, PDF_CONSTANTS.PAGE_HEIGHT]);
  
  // Add watermark to answer key page if provided
  if (watermark && watermark.type !== 'none') {
    const faintWatermark = {
      ...watermark,
      opacity: Math.min(0.1, watermark.opacity || 0.08)
    };
    await addWatermark(answerPage, faintWatermark, pdfDoc);
  }
  
  addEnhancedAnswerKeyHeader(answerPage);
  renderEnhancedAnswerGrid(answerPage, questions);
  addPageFooter(answerPage, totalPages, totalPages);
};

/**
 * Adds enhanced answer key header with modern styling and balanced title
 * 
 * @param page - PDF page to add header to
 */
const addEnhancedAnswerKeyHeader = (page: PDFPage): void => {
  // Enhanced answer key title with modern background
  const titleText = 'CEVAP ANAHTARI';
  const titleWidth = titleText.length * 7;
  const titleX = (PDF_CONSTANTS.PAGE_WIDTH - titleWidth) / 2;
  
  // Add title background with gradient effect
  page.drawRectangle({
    x: titleX - 20,
    y: 795,
    width: titleWidth + 40,
    height: 30,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1
  });
  
  // Add subtle inner highlight
  page.drawRectangle({
    x: titleX - 19,
    y: 823,
    width: titleWidth + 38,
    height: 1,
    color: rgb(1, 1, 1)
  });
  
  page.drawText(titleText, {
    x: titleX,
    y: 805,
    size: 20,
    color: rgb(0.15, 0.15, 0.15) // Darker for better contrast
  });
  
  // Enhanced separator line with modern styling
  page.drawLine({
    start: { x: 50, y: 780 },
    end: { x: 545, y: 780 },
    thickness: 1.5,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  // Add highlight line above
  page.drawLine({
    start: { x: 50, y: 781 },
    end: { x: 545, y: 781 },
    thickness: 0.3,
    color: rgb(0.8, 0.8, 0.8)
  });
};

/**
 * Renders the answer grid with enhanced modern professional styling
 * 
 * @param page - PDF page to render grid on
 * @param questions - Array of questions with answers
 */
const renderEnhancedAnswerGrid = (page: PDFPage, questions: CroppedQuestion[]): void => {
  let yPos = 750; // Adjusted for enhanced header spacing
  let xPos = 50;
  
  questions.forEach((question, index) => {
    // Move to next row when needed
    if (index > 0 && index % PDF_CONSTANTS.ANSWER_ITEMS_PER_ROW === 0) {
      yPos -= PDF_CONSTANTS.ANSWER_ITEM_HEIGHT + 12; // Increased spacing for modern look
      xPos = 50;
    }
    
    renderEnhancedAnswerItem(page, question, index, xPos, yPos);
    xPos += PDF_CONSTANTS.ANSWER_ITEM_WIDTH;
  });
};

/**
 * Renders a single answer item with enhanced modern styling and effects
 * 
 * @param page - PDF page to render on
 * @param question - Question with correct answer
 * @param index - Question index (0-based)
 * @param x - X position
 * @param y - Y position
 */
const renderEnhancedAnswerItem = (
  page: PDFPage,
  question: CroppedQuestion,
  index: number,
  x: number,
  y: number
): void => {
  const boxWidth = 46;
  const boxHeight = 22;
  
  // Enhanced shadow effect with multiple layers
  page.drawRectangle({
    x: x + 2,
    y: y - 4,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.8, 0.8, 0.8) // Darker shadow
  });
  
  page.drawRectangle({
    x: x + 1,
    y: y - 2,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.9, 0.9, 0.9) // Lighter shadow
  });
  
  // Enhanced answer box background with modern styling
  page.drawRectangle({
    x: x,
    y: y,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.6, 0.6, 0.6), // Darker border
    borderWidth: 0.8,
    color: rgb(0.98, 0.98, 0.98) // Almost white background
  });
  
  // Add inner highlight for modern effect
  page.drawRectangle({
    x: x + 1,
    y: y + boxHeight - 2,
    width: boxWidth - 2,
    height: 1,
    color: rgb(1, 1, 1)
  });
  
  // Answer text with enhanced typography - reduced font size by 1pt
  const answerText = `${index + 1}.${question.correctAnswer}`;
  const textWidth = answerText.length * 3;
  const textX = x + (boxWidth - textWidth) / 2;
  
  page.drawText(answerText, {
    x: textX,
    y: y + 6,
    size: 10, // Reduced from 11 to 10 (1pt smaller)
    color: rgb(0.1, 0.1, 0.1) // Much darker for better contrast
  });
};