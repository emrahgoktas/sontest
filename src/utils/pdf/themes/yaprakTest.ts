/**
 * Yaprak Test Theme (GÜNCELLENMİŞ + 2 SAYFA LİMİTİ)
 *
 * PNG arkaplanlı, safeArea destekli ve maksimum 2 sayfa sınırlı tema.
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

/**
 * Küçük yardımcı: mm -> pt dönüşümü (1 mm ≈ 2.83465 pt)
 */
const mm = (val: number) => val * 2.83465;

/**
 * Yaprak Test Teması
 */
const yaprakTestConfig: ThemeConfig = {
  id: 'yaprak-test',
  name: 'Yaprak Test Teması',
  description: 'A4 boyutunda PNG arka plan ile özel tasarım teması - test-02.png dosyası kullanılır',

  backgroundSvgPath: '/themes/test-02.png',

  safeArea: { top: 80, bottom: 64, left: 24, right: 24 },

  colors: {
    primary: { r: 0.1, g: 0.1, b: 0.1 },
    secondary: { r: 0.3, g: 0.3, b: 0.3 },
    accent: { r: 0.5, g: 0.5, b: 0.5 },
    background: { r: 1, g: 1, b: 1 },
    text: { r: 0.1, g: 0.1, b: 0.1 },
    border: { r: 0.8, g: 0.8, b: 0.8 }
  },

  layout: {
    columns: 2,
    questionSpacing: 8,
    backgroundColor: { r: 1, g: 1, b: 1 },
    borderStyle: 'subtle',
    questionBoxStyle: 'modern',
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
    content: 'YAPRAK TEST',
    opacity: 0.1,
    position: 'center',
    size: 48,
    rotation: -45,
    color: { r: 0.5, g: 0.5, b: 0.5 }
  },

  includeAnswerKey: true,
  answerKeyInMetadata: false
};

/**
 * Header (üst bilgi)
 */
/**
 * Header (üst bilgi)
 */
const renderYaprakTestHeader = (
  page: PDFPage,
  metadata: ThemedTestMetadata,
  contentStartY: number
): number => {
  // 🔧 Yükseklik ofseti (20 px yukarı)
  let yPos = 850; // eskiden 810'du → 20 px yukarı

  const leftPadding = 20; // soldan 20 px içeri
  const topSafe = (yaprakTestConfig as any).safeArea?.top ?? 0;
  const maxHeaderY = PDF_CONSTANTS.PAGE_HEIGHT - topSafe;
  yPos = Math.min(yPos, maxHeaderY);

  // 🎯 Başlık (sola hizalı, soldan 20 px boşluk)
  if (metadata.testName) {
    const titleText = sanitizeTextForPDF(metadata.testName);
    page.drawText(titleText, {
      x: leftPadding,
      y: yPos,
      size: 16,
      color: rgb(
        yaprakTestConfig.colors.primary.r,
        yaprakTestConfig.colors.primary.g,
        yaprakTestConfig.colors.primary.b
      ),
    });
    yPos -= 25;
  }

  // 🎯 Bilgi satırı (Sınıf - Ders) (sola hizalı, 20 px içeri)
  const infoLine: string[] = [];
  if (metadata.className) infoLine.push(sanitizeTextForPDF(metadata.className));
  if (metadata.courseName) infoLine.push(sanitizeTextForPDF(metadata.courseName));

  if (infoLine.length > 0) {
    const infoText = infoLine.join(' - ');
    page.drawText(infoText, {
      x: leftPadding,
      y: yPos,
      size: 11,
      color: rgb(
        yaprakTestConfig.colors.secondary.r,
        yaprakTestConfig.colors.secondary.g,
        yaprakTestConfig.colors.secondary.b
      ),
    });
  }

  yPos -= 30;

  // 🎯 Ad Soyad alanı (aynı sol hizalama)
  if (yaprakTestConfig.fields.studentName) {
    page.drawText('Ad Soyad: ________________________', {
      x: leftPadding,
      y: yPos,
      size: 10,
      color: rgb(
        yaprakTestConfig.colors.text.r,
        yaprakTestConfig.colors.text.g,
        yaprakTestConfig.colors.text.b
      ),
    });
    yPos -= 20;
  }

  // Alt çizgi (aynı hizada)
  const leftX = (yaprakTestConfig as any).safeArea?.left ?? leftPadding;
  const rightX = PDF_CONSTANTS.PAGE_WIDTH - ((yaprakTestConfig as any).safeArea?.right ?? 50);
  page.drawLine({
    start: { x: leftX, y: yPos },
    end: { x: rightX, y: yPos },
    thickness: 0.5,
    color: rgb(
      yaprakTestConfig.colors.border.r,
      yaprakTestConfig.colors.border.g,
      yaprakTestConfig.colors.border.b
    ),
  });

  return yPos - 15;
};


/**
 * Footer (alt bilgi)
 */
const renderYaprakTestFooter = (
  page: PDFPage,
  pageNumber: number,
  totalPages: number
) => {
  const bottomSafe = (yaprakTestConfig as any).safeArea?.bottom ?? 50;

  page.drawText(`${pageNumber}`, {
    x: 296,
    y: bottomSafe - 42,
    size: 11,
    color: rgb(
      yaprakTestConfig.colors.secondary.r,
      yaprakTestConfig.colors.secondary.g,
      yaprakTestConfig.colors.secondary.b
    )
  });
};

/**
 * Tema Plugin Export (2 Sayfa Limiti dahil)
 */
export const yaprakTestTheme: ThemePlugin = {
  config: yaprakTestConfig,
  renderHeader: renderYaprakTestHeader,
  renderFooter: renderYaprakTestFooter,

  // ✅ Tema bazlı sayfa limiti
  validatePageLimit: (pageCount: number) => {
    const maxPages = 2;
    if (pageCount >= maxPages) {
      alert(
        '⚠️ Yaprak Test teması en fazla 2 sayfa içerebilir.\n' +
        'Daha fazla soru veya görsel eklemek için diğer temaları kullanın.'
      );
      console.warn('[YaprakTest] 2 sayfa limitine ulaşıldı, yeni sayfa oluşturulmadı.');
      return false;
    }
    return true;
  }
};
