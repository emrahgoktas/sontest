/**
 * Classic/Minimal Theme
 * 
 * Clean, professional theme with turquoise accents and minimal styling
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS, PDF_COLORS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';
import { addPageFooter } from '../footerUtils';

/**
 * Classic theme configuration with turquoise professional palette
 */
const classicConfig: ThemeConfig = {
  id: 'classic',
  name: 'Classic/Minimal',
  description: 'Clean and professional design with turquoise accents, perfect for standard tests',
  
  colors: {
    primary: { r: 0, g: 0.75, b: 0.8 }, // Turquoise (#00BFCB)
    secondary: { r: 0, g: 0.6, b: 0.65 }, // Darker turquoise
    accent: { r: 0, g: 0.9, b: 0.95 }, // Light turquoise
    background: { r: 1, g: 1, b: 1 }, // Pure white
    text: { r: 0.1, g: 0.1, b: 0.1 }, // Dark text
    border: { r: 0, g: 0.75, b: 0.8 } // Turquoise border
  },
  
  layout: {
    columns: 2,
    questionSpacing: 5,
    backgroundColor: { r: 1, g: 1, b: 1 },
    borderStyle: 'subtle',
    questionBoxStyle: 'minimal',
    headerStyle: 'standard',
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
  
  includeAnswerKey: true,
  answerKeyInMetadata: false
};

/**
 * Renders classic theme header with turquoise styling and borders
 */
const renderClassicHeader = (
  page: PDFPage, 
  metadata: ThemedTestMetadata, 
  contentStartY: number
): number => {
  const currentDate = sanitizeTextForPDF(new Date().toLocaleDateString('tr-TR'));
  let yPos = 800;
  
  // Test title - centered with turquoise background and white text
  if (metadata.testName) {
    const titleText = sanitizeTextForPDF(metadata.testName);
    const titleWidth = titleText.length * 5.5;
    const titleBoxWidth = titleWidth + 40;
    const titleBoxX = (PDF_CONSTANTS.PAGE_WIDTH - titleBoxWidth) / 2;
    
    // Turquoise background box for title
    page.drawRectangle({
      x: titleBoxX,
      y: yPos - 5,
      width: titleBoxWidth,
      height: 30,
      color: rgb(classicConfig.colors.primary.r, classicConfig.colors.primary.g, classicConfig.colors.primary.b),
      borderColor: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b),
      borderWidth: 2
    });
    
    // White text on turquoise background
    page.drawText(titleText, {
      x: (PDF_CONSTANTS.PAGE_WIDTH - titleWidth) / 2,
      y: yPos + 5,
      size: PDF_CONSTANTS.TITLE_SIZE,
      color: rgb(1, 1, 1) // White text
    });
    yPos -= 45;
  }
  
  // Two-column metadata layout with turquoise borders
  const leftColumn = [];
  const rightColumn = [];
  
  if (metadata.className) leftColumn.push(`Sinif: ${sanitizeTextForPDF(metadata.className)}`);
  if (metadata.courseName) leftColumn.push(`Ders: ${sanitizeTextForPDF(metadata.courseName)}`);
  if (metadata.teacherName) rightColumn.push(`Ogretmen: ${sanitizeTextForPDF(metadata.teacherName)}`);
  rightColumn.push(`Tarih: ${currentDate}`);
  
  // Calculate the lowest Y position used by metadata
  const maxLines = Math.max(leftColumn.length, rightColumn.length);
  const metadataHeight = maxLines * 18;
  
  // Left column box with turquoise border
  if (leftColumn.length > 0) {
    page.drawRectangle({
      x: 45,
      y: yPos - metadataHeight - 5,
      width: 240,
      height: metadataHeight + 10,
      borderColor: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b),
      borderWidth: 2,
      color: rgb(1, 1, 1) // White background
    });
  }
  
  // Right column box with turquoise border
  if (rightColumn.length > 0) {
    page.drawRectangle({
      x: 310,
      y: yPos - metadataHeight - 5,
      width: 240,
      height: metadataHeight + 10,
      borderColor: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b),
      borderWidth: 2,
      color: rgb(1, 1, 1) // White background
    });
  }
  
  // Render left column text
  let leftYPos = yPos - 10;
  leftColumn.forEach(line => {
    page.drawText(line, {
      x: 55,
      y: leftYPos,
      size: PDF_CONSTANTS.BODY_SIZE,
      color: rgb(classicConfig.colors.text.r, classicConfig.colors.text.g, classicConfig.colors.text.b)
    });
    leftYPos -= 18;
  });
  
  // Render right column text
  let rightYPos = yPos - 10;
  rightColumn.forEach(line => {
    page.drawText(line, {
      x: 320,
      y: rightYPos,
      size: PDF_CONSTANTS.BODY_SIZE,
      color: rgb(classicConfig.colors.text.r, classicConfig.colors.text.g, classicConfig.colors.text.b)
    });
    rightYPos -= 18;
  });
  
  // Position divider below all metadata with clear gap
  const dividerY = yPos - metadataHeight - 25;
  
  // Horizontal divider with turquoise color
  page.drawLine({
    start: { x: 50, y: dividerY },
    end: { x: 545, y: dividerY },
    thickness: 2,
    color: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b)
  });
  
  return dividerY - 20; // Return content start position
};

/**
 * Renders turquoise column divider between columns
 */
const renderColumnDivider = (page: PDFPage, contentArea: any): void => {
  if (contentArea.maxColumns < 2) return;
  
  // Calculate divider position (center between columns)
  const dividerX = contentArea.x + contentArea.columnWidth + (contentArea.columnGap / 2);
  const dividerStartY = contentArea.y - 5;
  const dividerEndY = 85;
  
  // Draw 2px turquoise vertical divider
  page.drawLine({
    start: { x: dividerX, y: dividerStartY },
    end: { x: dividerX, y: dividerEndY },
    thickness: 2,
    color: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b)
  });
};

/**
 * Enhanced footer with turquoise border for page number
 */
const renderClassicFooter = (page: PDFPage, pageNumber: number, totalPages: number): void => {
  const pageText = `${pageNumber}`;
  const pageTextWidth = pageText.length * 6;
  const pageBoxX = 535 - pageTextWidth;
  
  // Turquoise border box for page number
  page.drawRectangle({
    x: pageBoxX - 10,
    y: 40,
    width: pageTextWidth + 20,
    height: 20,
    borderColor: rgb(classicConfig.colors.border.r, classicConfig.colors.border.g, classicConfig.colors.border.b),
    borderWidth: 2,
    color: rgb(1, 1, 1) // White background
  });
  
  // Page number text
  page.drawText(pageText, {
    x: pageBoxX,
    y: 45,
    size: 10,
    color: rgb(classicConfig.colors.text.r, classicConfig.colors.text.g, classicConfig.colors.text.b)
  });
};

/**
 * Classic theme plugin implementation with turquoise styling
 */
export const classicTheme: ThemePlugin = {
  config: classicConfig,
  
  renderHeader: renderClassicHeader,
  
  renderFooter: renderClassicFooter,
  
  // Custom method to render column divider
  renderColumnDivider: renderColumnDivider
};