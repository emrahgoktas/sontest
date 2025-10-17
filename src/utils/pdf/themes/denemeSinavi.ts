/**
 * Deneme Sınavı Theme — header spacing & centered footer page number
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

const denemeSinaviConfig: ThemeConfig & {
  footer?: {
    pageNumber?: { margin?: number; y?: number; size?: number };
  };
} = {
  id: 'deneme-sinavi',
  name: 'Deneme Sınavı',
  description: 'Modern exam theme with clean typography, proper spacing, and professional matbaa-quality layout',

  backgroundSvgPath: '/themes/test-03.png',

  colors: {
    primary:   { r: 0.11, g: 0.11, b: 0.11 },
    secondary: { r: 0.45, g: 0.45, b: 0.45 },
    accent:    { r: 0.8,  g: 0.8,  b: 0.8  },
    background:{ r: 1,    g: 1,    b: 1    },
    text:      { r: 0.11, g: 0.11, b: 0.11 },
    border:    { r: 0.8,  g: 0.8,  b: 0.8  },
  },

  layout: {
    columns: 2,
    questionSpacing: 20,
    backgroundColor: { r: 1, g: 1, b: 1 },
    borderStyle: 'subtle',
    questionBoxStyle: 'none',
    headerStyle: 'minimal',
    footerStyle: 'minimal',
    showColumnDivider: false,
  },

  fields: {
    schoolName: false,
    studentName: false,
    studentNumber: false,
    signature: false,
    examCode: false,
    bookletNumber: false,
    answerGrid: false,
  },

  defaultWatermark: {
    type: 'text',
    content: 'DENEME',
    opacity: 0.08,
    position: 'center',
    size: 60,
    rotation: -30,
    color: { r: 0.8, g: 0.8, b: 0.8 },
  },

  includeAnswerKey: true,
  answerKeyInMetadata: false,

  footer: {
    pageNumber: {
      margin: 30,
      y: 50,
      size: 11, // büyütüldü
    },
  },
};

/** kaba genişlik tahmini */
const approxWidth = (text: string, letterWidth = 6) => text.length * letterWidth;

const renderDenemeSinaviHeader = (
  page: PDFPage,
  metadata: ThemedTestMetadata,
  _contentStartY: number
): number => {
  let yPos = 810;

  // üst çizgi
  page.drawLine({
    start: { x: 30, y: yPos },
    end: { x: 565, y: yPos },
    thickness: 1,
    color: rgb(
      denemeSinaviConfig.colors.border.r,
      denemeSinaviConfig.colors.border.g,
      denemeSinaviConfig.colors.border.b
    ),
  });

  yPos -= 26;

  // metinler
  const now = new Date();
  const monthNames = ['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];

  const termRaw      = (metadata as any)?.term ?? '';
  const testNameRaw  = (metadata as any)?.testName ?? 'Deneme Sınavı';
  const monthRaw     = monthNames[now.getMonth()];
  const courseNameRaw= metadata.courseName?.toUpperCase?.() ?? 'DERS';

  const term       = sanitizeTextForPDF(termRaw.trim());
  const testName   = sanitizeTextForPDF(testNameRaw.trim());
  const monthName  = sanitizeTextForPDF(monthRaw);
  const courseName = sanitizeTextForPDF(courseNameRaw.trim());

  const leftX = 30;

  // 1. satır: [Test adı]␠-␠[Dönem]␠[Ay]
  let cursorX = leftX;

  if (testName) {
    page.drawText(testName, {
      x: cursorX,
      y: yPos,
      size: 14,
      color: rgb(
        denemeSinaviConfig.colors.primary.r,
        denemeSinaviConfig.colors.primary.g,
        denemeSinaviConfig.colors.primary.b
      ),
    });
    cursorX += approxWidth(testName, 7.2) + 8; // testName genişliği + boşluk
  }

  if (term || monthName) {
    const combo = [term, monthName].filter(Boolean).join(' ');
    const comboText = `- ${combo}`;
    page.drawText(comboText, {
      x: cursorX,
      y: yPos,
      size: 12,
      color: rgb(
        denemeSinaviConfig.colors.secondary.r,
        denemeSinaviConfig.colors.secondary.g,
        denemeSinaviConfig.colors.secondary.b
      ),
    });
  }

  // 2. satır: ders adı
  yPos -= 24;
  page.drawText(courseName, {
    x: leftX,
    y: yPos,
    size: 12,
    color: rgb(
      denemeSinaviConfig.colors.primary.r,
      denemeSinaviConfig.colors.primary.g,
      denemeSinaviConfig.colors.primary.b
    ),
  });

  yPos -= 30;

  // alt çizgi
  page.drawLine({
    start: { x: 30, y: yPos },
    end: { x: 565, y: yPos },
    thickness: 1,
    color: rgb(
      denemeSinaviConfig.colors.border.r,
      denemeSinaviConfig.colors.border.g,
      denemeSinaviConfig.colors.border.b
    ),
  });

  return yPos - 30;
};

const renderColumnDivider = (page: PDFPage, contentArea: any): void => {
  if (!denemeSinaviConfig.layout.showColumnDivider) return;
  if (contentArea.maxColumns < 2) return;

  const dividerX = contentArea.x + contentArea.columnWidth + (contentArea.columnGap / 2);
  page.drawLine({
    start: { x: dividerX, y: contentArea.y - 5 },
    end: { x: dividerX, y: 80 },
    thickness: 1,
    color: rgb(
      denemeSinaviConfig.colors.border.r,
      denemeSinaviConfig.colors.border.g,
      denemeSinaviConfig.colors.border.b
    ),
  });
};

const renderDenemeSinaviFooter = (page: PDFPage, pageNumber: number, totalPages: number) => {
  // alt çizgi
  page.drawLine({
    start: { x: 30, y: 70 },
    end: { x: 565, y: 70 },
    thickness: 1,
    color: rgb(
      denemeSinaviConfig.colors.border.r,
      denemeSinaviConfig.colors.border.g,
      denemeSinaviConfig.colors.border.b
    ),
  });

  // ortalanmış sayfa numarası
  const pnText = pageNumber.toString();
  const fontSize = denemeSinaviConfig.footer?.pageNumber?.size ?? 11;
  const textW = approxWidth(pnText, 6);
  const x = (PDF_CONSTANTS.PAGE_WIDTH - textW) / 2;

  page.drawText(pnText, {
    x,
    y: denemeSinaviConfig.footer?.pageNumber?.y ?? 50,
    size: fontSize,
    color: rgb(
      denemeSinaviConfig.colors.secondary.r,
      denemeSinaviConfig.colors.secondary.g,
      denemeSinaviConfig.colors.secondary.b
    ),
  });
};

export const denemeSinaviTheme: ThemePlugin = {
  config: denemeSinaviConfig,
  renderHeader: renderDenemeSinaviHeader,
  renderFooter: renderDenemeSinaviFooter,
  renderColumnDivider,
};
