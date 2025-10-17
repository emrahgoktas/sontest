/**
 * TYT 2024 Theme
 * 
 * Professional exam-style theme inspired by the 2024-TYT booklet
 * Features pure white background, modern sans-serif typography, and minimal design
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

/**
 * TYT 2024 theme configuration with professional exam styling
 */
const tyt2024Config: ThemeConfig = {
  id: 'tyt-2024',
  name: 'TYT 2024 Professional',
  description: 'Clean, professional exam template inspired by 2024-TYT with modern typography and minimal design',
  
  // PNG background path
  backgroundSvgPath: '/themes/test-04.png',
  
  colors: {
    primary: { r: 0.067, g: 0.067, b: 0.067 }, // #111 - Strong black
    secondary: { r: 0.2, g: 0.2, b: 0.2 }, // Dark gray for secondary text
    accent: { r: 0.4, g: 0.4, b: 0.4 }, // Medium gray for accents
    background: { r: 1, g: 1, b: 1 }, // Pure white
    text: { r: 0.067, g: 0.067, b: 0.067 }, // #111 - Strong black
    border: { r: 0.9, g: 0.9, b: 0.9 } // Very light gray for minimal borders
  },
  
  layout: {
    columns: 2,
    questionSpacing: 12, // Generous spacing
    backgroundColor: { r: 1, g: 1, b: 1 }, // Pure white
    borderStyle: 'none', // No decorative borders
    questionBoxStyle: 'none', // No question boxes
    headerStyle: 'minimal',
    footerStyle: 'minimal'
  },
  
  fields: {
    schoolName: false,
    studentName: false,
    studentNumber: false,
    signature: false,
    examCode: false,
    bookletNumber: false,
    answerGrid: false
  },
  
  defaultWatermark: {
    type: 'text',
    content: 'DENEME',
    opacity: 0.05, // Extremely faint
    position: 'center',
    size: 72,
    rotation: -30,
    color: { r: 0.5, g: 0.5, b: 0.5 }
  },
  
  includeAnswerKey: true,
  answerKeyInMetadata: false
};

/**
 * Renders TYT 2024 style header with single-line metadata
 */
const renderTYT2024Header = (
  page: PDFPage, 
  metadata: ThemedTestMetadata, 
  contentStartY: number
): number => {
  let yPos = 800;
  
  // Single line metadata at top-left with bold, high-contrast text
  const metadataItems = [];
  if (metadata.testName) metadataItems.push(sanitizeTextForPDF(metadata.testName));
  if (metadata.courseName) metadataItems.push(sanitizeTextForPDF(metadata.courseName));
  if (metadata.className) metadataItems.push(sanitizeTextForPDF(metadata.className));
  if (metadata.teacherName) metadataItems.push(sanitizeTextForPDF(metadata.teacherName));
  
  // Add current date
  const currentDate = new Date().toLocaleDateString('tr-TR');
  metadataItems.push(currentDate);
  
  if (metadataItems.length > 0) {
    const metadataText = metadataItems.join(' • ');
    
    page.drawText(metadataText, {
      x: 50,
      y: yPos,
      size: 12,
      color: rgb(tyt2024Config.colors.primary.r, tyt2024Config.colors.primary.g, tyt2024Config.colors.primary.b)
    });
    
    yPos -= 35; // Generous spacing below header
  }
  
  return yPos;
};

/**
 * Renders minimal footer with right-aligned page number
 */
const renderTYT2024Footer = (page: PDFPage, pageNumber: number, totalPages: number) => {
  // Right-aligned page number only
  const pageText = `${pageNumber}`;
  
  page.drawText(pageText, {
    x: 545, // Right-aligned
    y: 45,
    size: 10,
    color: rgb(tyt2024Config.colors.secondary.r, tyt2024Config.colors.secondary.g, tyt2024Config.colors.secondary.b)
  });
};

/**
 * Custom question rendering for TYT 2024 style
 */
const renderTYT2024QuestionBox = (page: PDFPage, question: any, layout: any) => {
  // No question boxes - completely clean design
  // Questions are rendered with just the number and image, no decorative elements
};

/**
 * TYT 2024 theme plugin implementation
 */
export const tyt2024Theme: ThemePlugin = {
  config: tyt2024Config,
  
  renderHeader: renderTYT2024Header,
  renderFooter: renderTYT2024Footer,
  renderQuestionBox: renderTYT2024QuestionBox
};