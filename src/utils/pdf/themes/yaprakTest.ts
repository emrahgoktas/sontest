/**
 * Yaprak Test Theme (GÜNCELLENMİŞ)
 *
 * Bu dosya, PNG arkaplanlı tek sayfa odaklı bir tema tanımlar.
 * Aşağıda SAFE AREA (güvenli alan) kavramı eklenmiştir.
 *
 * ÖNEMLİ NOTLAR (pdf-lib koordinat sistemi):
 * - PDF koordinatlarında (0,0) SOL-ALT köşedir.
 * - X sağa doğru artar, Y yukarı doğru artar.
 * - Bu nedenle "üstten boşluk" (safeArea.top) belirlemek istediğimizde,
 *   içerik başlangıç Y değeri = PAGE_HEIGHT - safeArea.top olarak hesaplanır.
 * - "alttan boşluk" (safeArea.bottom) doğrudan alt kenarda boşluk bırakır.
 * - left/right değerleri ise sol/sağdan içerik alanına girmememiz gereken güvenli kenar boşluklarıdır.
 *
 * Bu dosyada sadece tema başlık/altlık (header/footer) çizimi yapılır;
 * soru yerleşimleri (sütun genişliği, içerik akışı) ana PDF üretim akışında
 * safeArea değerlerine göre otomatik hesaplanır.
 */

import { PDFPage, rgb } from 'pdf-lib';
import { ThemePlugin, ThemeConfig, ThemedTestMetadata } from '../../../types/themes';
import { PDF_CONSTANTS } from '../constants';
import { sanitizeTextForPDF } from '../textUtils';

/**
 * Küçük yardımcı: mm -> pt dönüşümü (1 mm ≈ 2.83465 pt)
 * Tasarımdan mm ölçtüysen daha okunaklı yazarak çevirebilirsin.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mm = (val: number) => val * 2.83465;

/**
 * Yaprak Test theme configuration with PNG background
 *
 * [KGA-CHANGE]: `safeArea` eklendi. Bu alan, arkaplanın üst/alt/yan bantlarına
 * taşmayı engellemek için içerik yerleşimini sınırlar. Değerler pt cinsindedir.
 *
 * Açıklama:
 * - safeArea.top: Üstten bırakılan güvenli boşluk (ör: üst başlık bandı yüksekliği)
 * - safeArea.bottom: Alttan bırakılan güvenli boşluk (ör: footer/etiket alanı)
 * - safeArea.left/right: Sol/sağ süs/çerçeve veya yazı alanı için ayrılmış paylar
 *
 * NOT: Aşağıdaki sayılar temkinli varsayılandır; kendi arkaplanına göre güncelle.
 */
const yaprakTestConfig: ThemeConfig = {
  id: 'yaprak-test',
  name: 'Yaprak Test Teması',
  description: 'A4 boyutunda PNG arka plan ile özel tasarım teması - test-02.png dosyası kullanılır',

  // PNG background path
  backgroundSvgPath: '/themes/test-02.png',

  // [KGA-CHANGE]: SAFE AREA — burada verdiğin değerler otomatik yerleşimi yönlendirir
  // ÖRNEK: üst bant ~28 mm, alt etiket ~22 mm, kenarlar ~8 mm ise:
  // safeArea: { top: mm(28), bottom: mm(22), left: mm(8), right: mm(8) }
  safeArea: { top: 80, bottom: 64, left: 24, right: 24 },

  colors: {
    primary: { r: 0.1, g: 0.1, b: 0.1 }, // Koyu metin rengi
    secondary: { r: 0.3, g: 0.3, b: 0.3 }, // Orta gri
    accent: { r: 0.5, g: 0.5, b: 0.5 }, // Açık gri
    background: { r: 1, g: 1, b: 1 }, // Beyaz
    text: { r: 0.1, g: 0.1, b: 0.1 }, // Koyu metin rengi
    border: { r: 0.8, g: 0.8, b: 0.8 } // Açık gri kenar
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

  // [Not]: Proje tiplerine göre watermark alanının adı değişik olabilir.
  // Bu tema mevcut projendeki isimle uyumlu olsun diye korunmuştur.
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
 * Header (üst bilgi) çizimi:
 * - `yPos` başta sayfanın üstlerine yakın başlar (örn. 810 pt)
 * - [KGA-CHANGE]: Eğer `safeArea.top` varsa, başlığı onun ALTINA çekiyoruz.
 *   Böylece başlık üst bantla çakışmaz. Sonuçta dönen değer, içerik için
 *   kullanılacak başlangıç Y koordinatıdır ve ana akışta otomatik yerleşime
 *   girdi olur.
 *
 * Parametreler:
 * - page: PDFPage referansı
 * - metadata: Sınav/test bilgileri
 * - contentStartY: Dışarıdan gelebilecek başlangıç önerisi (genelde üstten sonra)
 *
 * Dönüş:
 * - number: İçeriğin BAŞLAYACAĞI Y değeri (bu değerin ALTINA yerleşim yapılır)
 */
const renderYaprakTestHeader = (
  page: PDFPage,
  metadata: ThemedTestMetadata,
  contentStartY: number
): number => {
  // Varsayılan başlama yüksekliği (üst bölgede)
  let yPos = 810;

  // [KGA-CHANGE]: safeArea.top kullan — üst güvenli alanın ALTINDAN başla
  const topSafe = (yaprakTestConfig as any).safeArea?.top ?? 0;
  const maxHeaderY = PDF_CONSTANTS.PAGE_HEIGHT - topSafe; // Üst sınır
  yPos = Math.min(yPos, maxHeaderY);

  // Test başlığı (ortalanmış)
  if (metadata.testName) {
    const titleText = sanitizeTextForPDF(metadata.testName);
    const titleWidth = titleText.length * 5; // Basit yaklaşım: yaklaşık genişlik
    page.drawText(titleText, {
      x: (PDF_CONSTANTS.PAGE_WIDTH - titleWidth) / 2 - 20,
      y: yPos,
      size: 16,
      color: rgb(
        yaprakTestConfig.colors.primary.r,
        yaprakTestConfig.colors.primary.g,
        yaprakTestConfig.colors.primary.b
      )
    });
    yPos -= 25; // Başlıktan sonra düş
  }

  // Tek satır bilgi (sınıf - ders vb.)
  const infoLine: string[] = [];
  if (metadata.className) infoLine.push(sanitizeTextForPDF(metadata.className));
  if (metadata.courseName) infoLine.push(sanitizeTextForPDF(metadata.courseName));

  if (infoLine.length > 0) {
    const infoText = infoLine.join(' - ');
    const infoWidth = infoText.length * 3;
    page.drawText(infoText, {
      x: (PDF_CONSTANTS.PAGE_WIDTH - infoWidth) / 2 - 20,
      y: yPos,
      size: 10,
      color: rgb(
        yaprakTestConfig.colors.secondary.r,
        yaprakTestConfig.colors.secondary.g,
        yaprakTestConfig.colors.secondary.b
      )
    });
  }

  yPos -= 30; // Bilgi satırından sonra boşluk

  // Öğrenci adı alanı (tema alanı açıksa)
  if (yaprakTestConfig.fields.studentName) {
    page.drawText('Ad Soyad: ________________________', {
      x: ((yaprakTestConfig as any).safeArea?.left ?? 50) + 20, // [Açıklama] Sol güvenli alana yasla; yoksa 50 pt
      y: yPos,
      size: 10,
      color: rgb(
        yaprakTestConfig.colors.text.r,
        yaprakTestConfig.colors.text.g,
        yaprakTestConfig.colors.text.b
      )
    });
    yPos -= 20;
  }

  // İnce ayraç çizgisi — solda/sağda güvenli alanı gözet
  const leftX = (yaprakTestConfig as any).safeArea?.left ?? 50;
  const rightX = PDF_CONSTANTS.PAGE_WIDTH - ((yaprakTestConfig as any).safeArea?.right ?? 50);
  page.drawLine({
    start: { x: leftX, y: yPos },
    end: { x: rightX, y: yPos },
    thickness: 0.5,
    color: rgb(
      yaprakTestConfig.colors.border.r,
      yaprakTestConfig.colors.border.g,
      yaprakTestConfig.colors.border.b
    )
  });

  // Header bitti; içerik bundan 15 pt aşağıdan başlasın
  return yPos - 15;
};

/**
 * Footer (alt bilgi) çizimi:
 * - Genellikle sayfa numarasını güvenli alt boşluğa taşmadan gösteririz.
 * - [KGA-CHANGE]: `safeArea.bottom` referans alınır; numara o bandın içine girmesin.
 */
const renderYaprakTestFooter = (
  page: PDFPage,
  pageNumber: number,
  totalPages: number
) => {
  const bottomSafe = (yaprakTestConfig as any).safeArea?.bottom ?? 50;
  const y = bottomSafe - 42; // Alt güvenli alanın HEMEN ÜSTÜ (15 pt içeride)

  // Çok minimal sayfa numarası
  page.drawText(`${pageNumber}`, {
    x: 296,
    y: 21,
    size: 11,
    color: rgb(
      yaprakTestConfig.colors.secondary.r,
      yaprakTestConfig.colors.secondary.g,
      yaprakTestConfig.colors.secondary.b
    )
  });
};

/**
 * Yaprak Test theme plugin implementation
 */
export const yaprakTestTheme: ThemePlugin = {
  config: yaprakTestConfig,
  renderHeader: renderYaprakTestHeader,
  renderFooter: renderYaprakTestFooter
};
