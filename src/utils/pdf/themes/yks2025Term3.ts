import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

const yks2025Term3Config: ThemeConfig = {
  id: 'yks-2025-3',
  name: 'YKS 2025 (3. Dönem)',
  description: 'YKS 2025 deneme sınavı için modern temalı PDF düzeni',
  backgroundSvgPath: '/themes/test03-3.png',
  colors: {
    primary: { r: 0.12, g: 0.12, b: 0.12 },
    secondary: { r: 0.35, g: 0.35, b: 0.35 },
    accent: { r: 0.83, g: 0.33, b: 0.36 },
    background: { r: 1, g: 1, b: 1 },
    text: { r: 0.12, g: 0.12, b: 0.12 },
    border: { r: 0.78, g: 0.78, b: 0.78 }
  },
  layout: {
    columns: 2,
    questionSpacing: 18,
    backgroundColor: { r: 1, g: 1, b: 1 },
    borderStyle: 'subtle',
    questionBoxStyle: 'minimal',
    headerStyle: 'minimal',
    footerStyle: 'minimal'
  },
  fields: {
    schoolName: false,
    studentName: true,
    studentNumber: true,
    signature: false,
    examCode: true,
    bookletNumber: false,
    answerGrid: false
  },
  defaultWatermark: {
    type: 'text',
    content: 'YKS 2025',
    opacity: 0.08,
    position: 'center',
    size: 52,
    rotation: -30,
    color: { r: 0.75, g: 0.75, b: 0.75 }
  },
  includeAnswerKey: true,
  answerKeyInMetadata: false
};

// Ortalanmış beyaz metin çizer
const drawCenteredText = (
  page: PDFPage,
  text: string,
  y: number,
  size: number
): void => {
  const sanitized = sanitizeTextForPDF(text);
  if (!sanitized) return;

  const estimatedWidth = sanitized.length * (size * 0.45);
  const x = (PDF_CONSTANTS.PAGE_WIDTH - estimatedWidth) / 2 - 6;

  page.drawText(sanitized, {
    x,
    y,
    size,
    color: rgb(1, 1, 1)
  });
};

// HEADER
const renderHeader = (
  page: PDFPage,
  metadata: ThemedTestMetadata,
  _contentStartY: number
): number => {
  let yPos = 805;

  // 🔹 Başlık (beyaz)
  const titleText = sanitizeTextForPDF(metadata.testName || 'YKS 2025 DENEMESİ');
  const titleSize = 14;
  const titleWidth = titleText.length * (titleSize * 0.45);
  const titleX = (PDF_CONSTANTS.PAGE_WIDTH - titleWidth) / 2 - 13;

  yPos -= 30;
  page.drawText(titleText, {
    x: titleX,
    y: yPos - 20,
    size: titleSize,
    color: rgb(1, 1, 1)
  });

  yPos -= 40;

  // 🔹 Alt başlık (ders adı, sınıf, kod) – beyaz + başlığa göre hizalanmış
  const infoParts: string[] = [];
  if (metadata.courseName) infoParts.push(metadata.courseName);
  if (metadata.className) infoParts.push(metadata.className);
  if (metadata.examCode) infoParts.push(`Kod: ${metadata.examCode}`);

  if (infoParts.length) {
    const infoText = sanitizeTextForPDF(infoParts.join(' • '));
    const infoSize = 14;
    const infoWidth = infoText.length * (infoSize * 0.45);

    const titleCenter = titleX + titleWidth / -4;
    const infoX = titleCenter - infoWidth / -4;

    page.drawText(infoText, {
      x: infoX,
      y: yPos,
      size: infoSize,
      color: rgb(1, 1, 1)
    });

    yPos -= 20;
  }

  const leftX = 60;
  const lineColor = rgb(
    yks2025Term3Config.colors.border.r,
    yks2025Term3Config.colors.border.g,
    yks2025Term3Config.colors.border.b
  );

  // 🔹 Öğrenci bilgileri
  if (yks2025Term3Config.fields.studentName) {
    const label = sanitizeTextForPDF('Ad Soyad: ____________');
    page.drawText(label, {
      x: leftX,
      y: yPos,
      size: 10,
      color: rgb(
        yks2025Term3Config.colors.text.r,
        yks2025Term3Config.colors.text.g,
        yks2025Term3Config.colors.text.b
      )
    });
    yPos -= 15;
  }

  if (yks2025Term3Config.fields.studentNumber) {
    const label = sanitizeTextForPDF('Öğrenci No: _________');
    page.drawText(label, {
      x: leftX,
      y: yPos,
      size: 10,
      color: rgb(
        yks2025Term3Config.colors.text.r,
        yks2025Term3Config.colors.text.g,
        yks2025Term3Config.colors.text.b
      )
    });
    yPos -= 16;
  }

  // 🔹 Alt çizgi
  page.drawLine({
    start: { x: 40, y: yPos },
    end: { x: PDF_CONSTANTS.PAGE_WIDTH - 40, y: yPos },
    thickness: 0.8,
    color: lineColor
  });

  return yPos - 25;
};

// FOOTER
const renderFooter = (page: PDFPage, pageNumber: number, totalPages: number): void => {
  const footerY = 40;

  // 🔹 Footer çizgisi
  page.drawLine({
    start: { x: 40, y: footerY + 18 },
    end: { x: PDF_CONSTANTS.PAGE_WIDTH - 40, y: footerY + 18 },
    thickness: 0.8,
    color: rgb(
      yks2025Term3Config.colors.border.r,
      yks2025Term3Config.colors.border.g,
      yks2025Term3Config.colors.border.b
    )
  });

  // 🔹 Sayfa numarası (beyaz, ortada)
  const pageInfo = `Sayfa ${pageNumber} / ${totalPages}`;
  const size = 10;
  const estimatedWidth = pageInfo.length * (size * 0.45);
  const x = (PDF_CONSTANTS.PAGE_WIDTH - estimatedWidth) / 2 - 2;

  page.drawText(pageInfo, {
    x,
    y: footerY,
    size,
    color: rgb(0, 0, 0)
  });
};

export const yks2025Term3Theme: ThemePlugin = {
  config: yks2025Term3Config,
  renderHeader,
  renderFooter
};
