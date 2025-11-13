/**
 * Original-size layout calculation utilities for PDF positioning
 * 
 * Handles layout calculations where questions are placed at their original pixel size.
 * Questions are NEVER resized to fit - if they don't fit, they move to the next column
 * or page. Uses 5mm margins, 10mm top space, and proper column dividers.
 */

import { PDF_CONSTANTS } from './constants';

/**
 * Represents the usable content area on a PDF page with column support
 */
export interface ContentArea {
  x: number;
  y: number;
  width: number;
  height: number;
  remainingHeight: number;
  currentColumn: number;
  maxColumns: number;
  columnWidth: number;
  columnGap: number;
}

/**
 * Represents a question's layout requirements and position with original dimensions
 */
export interface QuestionLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  questionNumber: number;
  actualImageWidth: number;
  actualImageHeight: number;
  column: number;
  // Original pixel dimensions (never modified)
  originalPixelWidth: number;
  originalPixelHeight: number;
  scaleFactor: number; // Always 1.0 for original size
}

/**
 * PDF layout constants based on requirements
 */
const LAYOUT_CONSTANTS = {
  // Margins: 5mm left/right, 10mm top
  LEFT_MARGIN: 14.17, // 5mm in points (5 * 72/25.4)
  RIGHT_MARGIN: 14.17,
  TOP_MARGIN: 28.35, // 10mm in points (10 * 72/25.4)
  
  // Meta info space: 10mm
  META_SPACE: 28.35, // 10mm in points
  
  // Divider width
  DIVIDER_WIDTH: 1, // 1 point for vertical divider
  
  // Footer space
  FOOTER_SPACE: 50 // Space reserved for footer
};

/**
 * Calculates the usable content area for a PDF page with proper margins
 * 
 * @param contentStartY - Y position where content area begins (after header)
 * @param maxColumns - Maximum number of columns (default: 2)
 * @returns Content area dimensions with column information
 */
export const calculateContentArea = (contentStartY: number, maxColumns: number = 2): ContentArea => {
  const pageWidth = PDF_CONSTANTS.PAGE_WIDTH;
  const availableWidth = pageWidth - LAYOUT_CONSTANTS.LEFT_MARGIN - LAYOUT_CONSTANTS.RIGHT_MARGIN;
  const availableHeight = contentStartY - LAYOUT_CONSTANTS.FOOTER_SPACE;
  
  // Calculate column width: (pageWidth - 2 × margin - dividerWidth) / 2
  const columnGap = maxColumns > 1 ? LAYOUT_CONSTANTS.DIVIDER_WIDTH : 0;
  const columnWidth = maxColumns > 1 
    ? (availableWidth - columnGap) / maxColumns
    : availableWidth;
  
  return {
    x: LAYOUT_CONSTANTS.LEFT_MARGIN,
    y: contentStartY,
    width: availableWidth,
    height: availableHeight,
    remainingHeight: availableHeight,
    currentColumn: 0,
    maxColumns,
    columnWidth,
    columnGap
  };
};

/**
 * Calculates display size for a question using original pixel dimensions
 * NO RESIZING - returns original size converted to points or null if won't fit
 * 
 * @param actualWidth - Original cropped image width in pixels
 * @param actualHeight - Original cropped image height in pixels
 * @param maxWidth - Maximum allowed width in points
 * @param maxHeight - Maximum allowed height in points
 * @param questionSpacing - Additional spacing around question
 * @returns Original display dimensions or null if won't fit
 */
export const calculateQuestionDisplaySize = (
  actualWidth: number,
  actualHeight: number,
  maxWidth: number,
  maxHeight: number,
  questionSpacing: number
): { width: number; height: number; scaleFactor: number } | null => {
  // Validate input dimensions
  if (actualWidth <= 0 || actualHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { 
      width: Math.min(100, maxWidth), 
      height: Math.min(100, maxHeight),
      scaleFactor: 1.0
    };
  }
  
  // Account for spacing in available dimensions
  const availableWidth = maxWidth - (questionSpacing * 2);
  const availableHeight = maxHeight - (questionSpacing * 2);
  
  // Convert pixel dimensions to points (72 DPI standard)
  // Use high-quality conversion: assume source is 300 DPI for print quality
  const pixelToPointRatio = 72 / 300;
  const naturalWidth = actualWidth * pixelToPointRatio;
  const naturalHeight = actualHeight * pixelToPointRatio;
  
    // 🔹 Yazılı sınav temasında görseli %30 büyüt
    const themeScaleBoost = (window?.activePdfTheme === 'yazili-sinav') ? 1.3 : 1.0;
    const boostedWidth = naturalWidth * themeScaleBoost;
    const boostedHeight = naturalHeight * themeScaleBoost;
      
  // Check if original size fits in available space
  if (boostedWidth <= availableWidth && boostedHeight <= availableHeight) {
    return { 
      width: Math.round(boostedWidth), 
      height: Math.round(boostedHeight),
      scaleFactor: 1.3 // No scaling applied
    };
  }
  
  // If original size doesn't fit, return null - DO NOT RESIZE
  return null;
};

/**
 * Determines if a question can fit in the remaining space of current column
 * 
 * @param questionHeight - Required height for the question (including spacing)
 * @param contentArea - Current content area with remaining space
 * @returns True if question fits in current column, false otherwise
 */
export const canQuestionFitInCurrentColumn = (
  questionHeight: number,
  contentArea: ContentArea
): boolean => {
  const minRequiredHeight = questionHeight + 20; // Question number + minimal spacing
  return contentArea.remainingHeight >= minRequiredHeight;
};

/**
 * Moves to the next column in the content area
 * 
 * @param contentArea - Current content area to update
 * @returns Updated content area for next column or null if no more columns
 */
export const moveToNextColumn = (contentArea: ContentArea): ContentArea | null => {
  if (contentArea.currentColumn >= contentArea.maxColumns - 1) {
    return null; // No more columns available
  }
  
  return {
    ...contentArea,
    currentColumn: contentArea.currentColumn + 1,
    remainingHeight: contentArea.height // Reset height for new column
  };
};

/**
 * Calculates the X position for the current column
 * 
 * @param contentArea - Content area with column information
 * @returns X position for current column
 */
export const calculateColumnX = (contentArea: ContentArea): number => {
  return contentArea.x + (contentArea.currentColumn * (contentArea.columnWidth + contentArea.columnGap));
};

/**
 * Calculates the next available position for a question in current column
 * 
 * @param contentArea - Current content area state
 * @param questionWidth - Width needed for the question
 * @param questionHeight - Height needed for the question
 * @returns Position coordinates for the question in current column
 */
export const calculateQuestionPositionInColumn = (
  contentArea: ContentArea,
  questionWidth: number,
  questionHeight: number
): { x: number; y: number } => {
  const x = calculateColumnX(contentArea);
  const y = contentArea.y - (contentArea.height - contentArea.remainingHeight) - questionHeight;
  
  return { x, y };
};

/**
 * Updates content area after placing a question in current column
 * 
 * @param contentArea - Current content area to update
 * @param questionHeight - Height of the question that was just placed
 * @param questionSpacing - Additional spacing after the question
 * @returns Updated content area with reduced remaining space in current column
 */
export const updateContentAreaAfterQuestion = (
  contentArea: ContentArea,
  questionHeight: number,
  questionSpacing: number
): ContentArea => {
  const usedHeight = questionHeight + questionSpacing;
  
  return {
    ...contentArea,
    remainingHeight: contentArea.remainingHeight - usedHeight
  };
};

/**
 * Calculates optimal question layout using original-size positioning
 * NO RESIZING - questions use their original pixel dimensions
 * 
 * @param question - Question with actual image dimensions
 * @param questionNumber - Display number for the question
 * @param contentArea - Available content area with column information
 * @param questionSpacing - Spacing around questions
 * @returns Complete layout information for the question or null if won't fit
 */
export const calculateColumnBasedQuestionLayout = (
  question: { actualWidth: number; actualHeight: number },
  questionNumber: number,
  contentArea: ContentArea,
  questionSpacing: number
): QuestionLayout | null => {
  // Calculate original display size - NO RESIZING
  const maxQuestionWidth = contentArea.columnWidth;
  const maxQuestionHeight = contentArea.remainingHeight - 30; // Reserve space for question number
  
  const displaySize = calculateQuestionDisplaySize(
    question.actualWidth,
    question.actualHeight,
    maxQuestionWidth,
    maxQuestionHeight,
    questionSpacing
  );
  
  if (!displaySize) {
    return null; // Question won't fit at original size
  }
  
  // Add space for question number (small, top-left aligned)
  const totalHeight = displaySize.height + 15; // 15 points for question number and spacing
  
  // Check if it fits in current column
  if (!canQuestionFitInCurrentColumn(totalHeight, contentArea)) {
    return null; // Won't fit in current column
  }
  
  // Calculate position in current column
  const position = calculateQuestionPositionInColumn(contentArea, displaySize.width, totalHeight);
  
  // Center image horizontally within its column
  // Görseli sütunun İÇ kenarına (gutter’a) yasla, dışta boşluk kalsın.
// INNER_PAD: iki sütun arasındaki net iç boşluk (pt). 4–8 iyi aralık.
const columnX = calculateColumnX(contentArea);
const INNER_PAD = 50; // dar istersen 2–4, biraz ferah istersen 6–8

const placedX =
  contentArea.currentColumn === 0
    // Sol sütun: görseli sağ kenara (gutter’a) INNER_PAD kadar yaklaştır
    ? columnX + contentArea.columnWidth - displaySize.width - INNER_PAD
    // Sağ sütun: görseli sol kenara (gutter’a) INNER_PAD kadar yaklaştır
    : columnX + INNER_PAD;


  return {
    x: placedX,
    y: position.y,
    width: displaySize.width,
    height: totalHeight,
    questionNumber,
    actualImageWidth: displaySize.width,
    actualImageHeight: displaySize.height,
    column: contentArea.currentColumn,
    // Original pixel dimensions (never modified)
    originalPixelWidth: question.actualWidth,
    originalPixelHeight: question.actualHeight,
    scaleFactor: 1.0 // Always 1.0 for original size
  };
};

// Legacy functions for backward compatibility (deprecated)

/**
 * @deprecated Use calculateColumnBasedQuestionLayout instead
 */
export const calculateRealSizeQuestionLayout = (
  question: { actualWidth: number; actualHeight: number },
  questionNumber: number,
  contentArea: ContentArea,
  questionSpacing: number
): QuestionLayout => {
  const layout = calculateColumnBasedQuestionLayout(question, questionNumber, contentArea, questionSpacing);
  
  // Fallback for backward compatibility
  if (!layout) {
    return {
      x: contentArea.x,
      y: contentArea.y - 100,
      width: 200,
      height: 100,
      questionNumber,
      actualImageWidth: 180,
      actualImageHeight: 70,
      column: 0,
      originalPixelWidth: question.actualWidth,
      originalPixelHeight: question.actualHeight,
      scaleFactor: 1.0
    };
  }
  
  return layout;
};

/**
 * @deprecated Use canQuestionFitInCurrentColumn instead
 */
export const canQuestionFitOnPage = (
  questionHeight: number,
  contentArea: ContentArea
): boolean => {
  return canQuestionFitInCurrentColumn(questionHeight, contentArea);
};

/**
 * @deprecated Use calculateQuestionPositionInColumn instead
 */
export const calculateNextQuestionPosition = (
  contentArea: ContentArea,
  questionWidth: number,
  questionHeight: number
): { x: number; y: number } => {
  return calculateQuestionPositionInColumn(contentArea, questionWidth, questionHeight);
};

/**
 * @deprecated Use calculateOptimalGridForPage instead
 */
export const calculateOptimalGridForPage = (
  questionsOnPage: number,
  availableHeight: number
): { rows: number; columns: number; questionsPerPage: number; rowHeight: number } => {
  const columns = 2;
  const rows = Math.ceil(questionsOnPage / columns);
  const rowHeight = availableHeight / rows;
  
  return {
    rows,
    columns,
    questionsPerPage: questionsOnPage,
    rowHeight
  };
};

/**
 * @deprecated Use calculateColumnBasedQuestionLayout instead
 */
export const calculateGridPosition = (
  questionIndexOnPage: number,
  columns: number
): { row: number; column: number } => {
  const row = Math.floor(questionIndexOnPage / columns);
  const column = questionIndexOnPage % columns;
  return { row, column };
};

/**
 * @deprecated Use calculateColumnBasedQuestionLayout instead
 */
export const calculateQuestionLayout = (
  column: number,
  row: number,
  contentStartY: number,
  questionSpacing: number,
  rowHeight: number
) => {
  const availableWidth = PDF_CONSTANTS.PAGE_WIDTH - (2 * PDF_CONSTANTS.MARGIN);
  const columnWidth = (availableWidth - PDF_CONSTANTS.COLUMN_GAP) / 2;
  
  const cellX = column === 0 
    ? PDF_CONSTANTS.MARGIN 
    : PDF_CONSTANTS.MARGIN + columnWidth + PDF_CONSTANTS.COLUMN_GAP;
  const cellY = contentStartY - (row * rowHeight);
  
  const questionNumberHeight = 20;
  const imageAreaY = cellY - questionNumberHeight;
  const imageAreaHeight = rowHeight - questionNumberHeight - questionSpacing;
  const imageAreaWidth = columnWidth - 10;
  
  return {
    cellX,
    cellY,
    columnWidth,
    rowHeight,
    questionNumberY: cellY - 12,
    imageAreaY,
    imageAreaHeight,
    imageAreaWidth
  };
};

/**
 * @deprecated Use calculateQuestionDisplaySize instead
 */
export const calculateContainedImageSize = (
  actualWidth: number,
  actualHeight: number,
  cellWidth: number,
  cellHeight: number,
  padding: number = PDF_CONSTANTS.IMAGE_PADDING
): { width: number; height: number; x: number; y: number } => {
  const size = calculateQuestionDisplaySize(actualWidth, actualHeight, cellWidth, cellHeight, padding);
  
  if (!size) {
    return { width: 100, height: 100, x: 0, y: 0 };
  }
  
  const x = Math.max(0, (cellWidth - size.width) / 2);
  const y = Math.max(0, (cellHeight - size.height) / 2);
  
  return { 
    width: size.width, 
    height: size.height, 
    x: Math.round(x), 
    y: Math.round(y) 
  };
};