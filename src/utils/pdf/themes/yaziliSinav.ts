/**
 * Yazılı Sınav Theme
 * 
 * Formal written exam theme with school fields, student information, and signature area
 * Perfect for official school examinations and formal assessments
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS, PDF_COLORS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

/**
 * Yazılı Sınav theme configuration with formal styling
 */
const yaziliSinavConfig: ThemeConfig = {
  id: 'yazili-sinav',
  name: 'Yazılı Sınav',
  description: 'Formal exam theme with school information, student details, and signature area',
  
  // PNG background support
  backgroundSvgPath: '/themes/test-10.png',
  
  colors: {
    primary: { r: 0.2, g: 0.2, b: 0.2 }, // Dark gray
    secondary: { r: 0.4, g: 0.4, b: 0.4 }, // Medium gray
    accent: { r: 0.6, g: 0.6, b: 0.6 }, // Light gray
    background: { r: 1, g: 1, b: 1 }, // Pure white
    text: { r: 0.1, g: 0.1, b: 0.1 }, // Near black
    border: { r: 0.3, g: 0.3, b: 0.3 } // Dark gray border
  },
  
  layout: {
    columns: 1, // Single column for formal layout
    questionSpacing: 10,
    backgroundColor: { r: 1, g: 1, b: 1 },
    borderStyle: 'bold',
    questionBoxStyle: 'classic',
    headerStyle: 'detailed',
    footerStyle: 'standard'
  },
  
  fields: {
    schoolName: true,
    studentName: true,
    studentNumber: true,
    signature: true,
    examCode: false,
    bookletNumber: false,
    answerGrid: false
  },
  
  includeAnswerKey: false, // Typically not included in formal exams
  answerKeyInMetadata: true // Store in metadata for teacher access
};

/**
 * Renders formal header for Yazılı Sınav theme
 */
/**
 * Renders formal header for Yazılı Sınav theme (updated - no border, left-aligned, shifted up)
 */
const renderYaziliSinavHeader = (
  page: PDFPage,
  metadata: ThemedTestMetadata,
  contentStartY: number
): number => {
  let yPos = 780; // Normal başlangıç
  const leftPadding = 20;

  // 🔹 Başlık (20 px yukarıdan başlat)
  if (metadata.testName) {
    const titleText = sanitizeTextForPDF(metadata.testName);
    page.drawText(titleText, {
      x: leftPadding,
      y: yPos + 30, // 🔼 20 px yukarı kaydırma
      size: 14,
      color: rgb(
        yaziliSinavConfig.colors.primary.r,
        yaziliSinavConfig.colors.primary.g,
        yaziliSinavConfig.colors.primary.b
      ),
    });
    yPos -= 1;
  }

  // 🔹 Okul adı (normal konum)
  if (metadata.schoolName) {
    const schoolText = sanitizeTextForPDF(metadata.schoolName);
    page.drawText(schoolText, {
      x: leftPadding,
      y: yPos,
      size: 10,
      color: rgb(
        yaziliSinavConfig.colors.secondary.r,
        yaziliSinavConfig.colors.secondary.g,
        yaziliSinavConfig.colors.secondary.b
      ),
    });
    yPos -= 18;
  }

  // 🔹 Ders / Sınıf / Öğretmen bilgileri
  const infoParts: string[] = [];
  if (metadata.courseName)
    infoParts.push(sanitizeTextForPDF(`Ders: ${metadata.courseName}`));
  if (metadata.className)
    infoParts.push(sanitizeTextForPDF(`Sinif: ${metadata.className}`));
  if (metadata.teacherName)
    infoParts.push(sanitizeTextForPDF(`Ogretmen: ${metadata.teacherName}`));

  infoParts.forEach((info) => {
    page.drawText(info, {
      x: leftPadding,
      y: yPos,
      size: 11,
      color: rgb(
        yaziliSinavConfig.colors.text.r,
        yaziliSinavConfig.colors.text.g,
        yaziliSinavConfig.colors.text.b
      ),
    });
    yPos -= 18;
  });

  yPos -= 10;
  renderFormalStudentSection(page, metadata, yPos);

  return yPos - 90;
};


/**
 * Renders formal student information section
 */
const renderFormalStudentSection = (page: PDFPage, metadata: ThemedTestMetadata, startY: number) => {
  let yPos = startY;
  
  // Student information box
  page.drawRectangle({
    x: 50,
    y: yPos - 80,
    width: 495,
    height: 80,
    borderColor: rgb(yaziliSinavConfig.colors.border.r, yaziliSinavConfig.colors.border.g, yaziliSinavConfig.colors.border.b),
    borderWidth: 1.5
  });
  
  // Student information title
  page.drawText('OGRENCI BILGILERI', {
    x: 60,
    y: yPos - 15,
    size: 10,
    color: rgb(yaziliSinavConfig.colors.primary.r, yaziliSinavConfig.colors.primary.g, yaziliSinavConfig.colors.primary.b)
  });
  
  // Student fields with proper spacing - sanitize all text values
  const studentFields = [
    { label: 'Ad Soyad:', value: metadata.studentName ? sanitizeTextForPDF(metadata.studentName) : '', y: yPos - 35 },
    { label: 'Ogrenci No:', value: metadata.studentNumber ? sanitizeTextForPDF(metadata.studentNumber) : '', y: yPos - 55 }
  ];
  
  studentFields.forEach(field => {
    page.drawText(`${field.label}`, {
      x: 60,
      y: field.y,
      size: 10,
      color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
    });
    
    // Underline for writing
    page.drawLine({
      start: { x: 120, y: field.y - 2 },
      end: { x: 350, y: field.y - 2 },
      thickness: 0.5,
      color: rgb(yaziliSinavConfig.colors.border.r, yaziliSinavConfig.colors.border.g, yaziliSinavConfig.colors.border.b)
    });
    
    // Pre-filled value if available
    if (field.value) {
      page.drawText(field.value, {
        x: 125,
        y: field.y,
        size: 10,
        color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
      });
    }
  });
  
  // Date and signature section
  const currentDate = new Date().toLocaleDateString('tr-TR');
  page.drawText(`Tarih: ${currentDate}`, {
    x: 370,
    y: yPos - 35,
    size: 10,
    color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
  });
  
  if (yaziliSinavConfig.fields.signature) {
    page.drawText('Imza:', {
      x: 370,
      y: yPos - 55,
      size: 10,
      color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
    });
    
    // Signature line
    page.drawLine({
      start: { x: 400, y: yPos - 57 },
      end: { x: 530, y: yPos - 57 },
      thickness: 0.5,
      color: rgb(yaziliSinavConfig.colors.border.r, yaziliSinavConfig.colors.border.g, yaziliSinavConfig.colors.border.b)
    });
  }
};

/**
 * Renders answer area for written exam questions
 */
const renderAnswerArea = (page: PDFPage, x: number, y: number, width: number): void => {
  const answerHeight = PDF_CONSTANTS.ANSWER_AREA_HEIGHT;
  const lineSpacing = PDF_CONSTANTS.ANSWER_LINE_SPACING;
  
  // Answer area background
  page.drawRectangle({
    x: x,
    y: y - answerHeight,
    width: width,
    height: answerHeight,
    color: rgb(PDF_COLORS.ANSWER_AREA_BG.r, PDF_COLORS.ANSWER_AREA_BG.g, PDF_COLORS.ANSWER_AREA_BG.b),
    borderColor: rgb(yaziliSinavConfig.colors.border.r, yaziliSinavConfig.colors.border.g, yaziliSinavConfig.colors.border.b),
    borderWidth: 0.5
  });
  
  // Answer area label
  page.drawText('YANIT ALANI:', {
    x: x + 5,
    y: y - 12,
    size: 8,
    color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
  });
  
  // Answer lines
  const numLines = Math.floor((answerHeight - 15) / lineSpacing);
  for (let i = 0; i < numLines; i++) {
    const lineY = y - 20 - (i * lineSpacing);
    page.drawLine({
      start: { x: x + 5, y: lineY },
      end: { x: x + width - 5, y: lineY },
      thickness: 0.3,
      color: rgb(PDF_COLORS.ANSWER_LINE_COLOR.r, PDF_COLORS.ANSWER_LINE_COLOR.g, PDF_COLORS.ANSWER_LINE_COLOR.b)
    });
  }
};

/**
 * Renders formal footer
 */
const renderYaziliSinavFooter = (page: PDFPage, pageNumber: number, totalPages: number) => {
  // Formal separator line
  page.drawLine({
    start: { x: 50, y: 60 },
    end: { x: 545, y: 60 },
    thickness: 1,
    color: rgb(yaziliSinavConfig.colors.border.r, yaziliSinavConfig.colors.border.g, yaziliSinavConfig.colors.border.b)
  });
  
  // Page number
  page.drawText(`Sayfa ${pageNumber} / ${totalPages}`, {
    x: 50,
    y: 45,
    size: 10,
    color: rgb(yaziliSinavConfig.colors.text.r, yaziliSinavConfig.colors.text.g, yaziliSinavConfig.colors.text.b)
  });
  
  // Exam instructions - sanitize Turkish text to prevent encoding errors
  const instructionText = sanitizeTextForPDF('* Tum sorulari dikkatli okuyunuz ve cevaplarınızı net bir sekilde isaretleyiniz.');
  page.drawText(instructionText, {
    x: 150,
    y: 45,
    size: 8,
    color: rgb(yaziliSinavConfig.colors.secondary.r, yaziliSinavConfig.colors.secondary.g, yaziliSinavConfig.colors.secondary.b)
  });
};

/**
 * Yazılı Sınav theme plugin implementation
 */
export const yaziliSinavTheme: ThemePlugin = {
  config: yaziliSinavConfig,

  renderHeader: renderYaziliSinavHeader,
  renderFooter: renderYaziliSinavFooter,

  renderQuestionBox: (page: PDFPage, question: any, layout: any) => {
  if (!layout || layout.y === undefined) return;

  const PAGE_LEFT = 20;
  const topY = Number(layout.y);
  const usableWidth = layout.width || (page.getWidth() - PAGE_LEFT * 2);

  // Görsel varsa
  if (question?.embeddedImage) {
    const imgHeight = typeof question.imageHeight === "number" && question.imageHeight > 0 ? question.imageHeight : 140;
    const imgWidth = typeof question.imageWidth === "number" && question.imageWidth > 0 ? question.imageWidth : usableWidth;

    page.drawImage(question.embeddedImage, {
      x: PAGE_LEFT,
      y: topY - imgHeight - 10,
      width: imgWidth,
      height: imgHeight,
    });

    renderAnswerArea(page, PAGE_LEFT, topY - imgHeight - 40, imgWidth);
    return;
  }

  // Görsel yoksa bile aynı hizadan başlat
  renderAnswerArea(page, PAGE_LEFT, topY - layout.height - 30, usableWidth);
}

};
