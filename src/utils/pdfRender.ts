/**
 * Main PDF rendering module - Re-exports all PDF generation utilities
 * 
 * This module serves as the main entry point for PDF generation functionality,
 * providing a clean interface to all PDF-related utilities while maintaining
 * backward compatibility with existing imports.
 */

// Core PDF generation with theme support
export { generateTestPDF, generateThemedTestPDF } from './pdf/themedCore';

// Text utilities
export { generateTestFilename, sanitizeTextForPDF } from './pdf/textUtils';

// Layout utilities - Updated for column-based system
export { 
  calculateQuestionDisplaySize,
  calculateColumnBasedQuestionLayout,
  canQuestionFitInCurrentColumn,
  moveToNextColumn,
  calculateColumnX,
  calculateQuestionPositionInColumn,
  updateContentAreaAfterQuestion,
  // Legacy exports for backward compatibility
  calculateContainedImageSize,
  calculateGridPosition,
  calculateQuestionLayout 
} from './pdf/layoutUtils';

// Component utilities
export { addTestHeader } from './pdf/headerUtils';
export { addPageFooter } from './pdf/footerUtils';
export { addRealSizeQuestionToPage } from './pdf/questionUtils';
export { generateAnswerKeyPage } from './pdf/answerKeyUtils';
export { generateColumnBasedQuestionPages } from './pdf/pageUtils';
export { setPDFMetadata } from './pdf/metadataUtils';

// Theme system exports
export * from './pdf/themes';

// Constants
export { PDF_CONSTANTS, PDF_COLORS } from './pdf/constants';