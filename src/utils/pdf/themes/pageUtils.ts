/**
 * Global cache for embedded background images to prevent re-embedding on every page.
 */
const backgroundCache = new Map<string, any>();

/**
 * Adds PNG/SVG background to PDF page, handling caching and multiple options.
 * * @param page - PDF page
 * @param pdfDoc - PDF document
 * @param themePlugin - Theme plugin containing configuration
 */
const addPngBackground = async (page: PDFPage, pdfDoc: PDFDocument, themePlugin: ThemePlugin): Promise<void> => {
  try {
    const themeConfig = themePlugin.config;
    
    // --- KRİTİK HATA AYIKLAMA LOGU ---
    // Bu logu görmüyorsanız, ya fonksiyon çağrılmıyordur ya da tema konfigürasyonunuzda sorun vardır.
    console.log(`[DEBUG] addPngBackground called for theme: ${themeConfig.id}. Path: ${themeConfig.backgroundSvgPath}`);
    // ---------------------------------

    // 1. Temanın arka plan yolu yoksa dur
    // EĞER TEMA DOSYANIZDA (yks2025.ts gibi) 'backgroundSvgPath' TANIMLI DEĞİLSE, FONKSİYON BURADA DURUR.
    if (!themeConfig.backgroundSvgPath) {
      console.warn(`[DEBUG] Theme ${themeConfig.id} has no backgroundSvgPath. Skipping background loading.`);
      return;
    }

    // 2. Önbellek kontrolü
    const cacheKey = `${themeConfig.id}_${themeConfig.backgroundSvgPath}`;
    if (backgroundCache.has(cacheKey)) {
      const cachedImage = backgroundCache.get(cacheKey);
      page.drawImage(cachedImage, {
        x: 0,
        y: 0,
        width: PDF_CONSTANTS.PAGE_WIDTH,
        height: PDF_CONSTANTS.PAGE_HEIGHT
      });
      console.log(`✅ Cached background: ${cacheKey}`);
      return; // Önbellekten yüklendi, işlemi bitir
    }

    // 3. Arka plan seçeneklerini hazırla (Temanın varsayılan yolu her zaman ilk seçenek olmalı)
    const backgroundOptions = [
      themeConfig.backgroundSvgPath, // Tema config'den gelen ana yol (örn: /themes/test03-1.png)
      '/themes/test-02.png', // Genel yedek seçenek
      '/themes/test 02.svg'  // Genel yedek seçenek
    ];
    
    // Temaya özel alternatif yolları başa ekle (unshift)
    if (themePlugin.config.id === 'deneme-sinavi') {
      backgroundOptions.unshift('/themes/test-03.png');
    }
    
    if (themePlugin.config.id === 'yazili-sinav') {
      backgroundOptions.unshift('/themes/test-05.png');
    }
    
    if (themePlugin.config.id === 'tyt-2024') {
      backgroundOptions.unshift('/themes/test-04.png');
    }
    
    // *** YENİ TEMANIZ İÇİN YEDEK YOL ***
    // (Eğer tema config'deki yol çalışmazsa bu kullanılır)
    if (themePlugin.config.id === 'yks-2025') { // Kendi tema ID'niz ile değiştirin
      backgroundOptions.unshift('/themes/test03-1.png'); 
    }
    // **********************************
    
    let backgroundLoaded = false;
    let loadedImage: any = null;
    
    // 4. YÜKLEME DÖNGÜSÜ (Artık if/else bloğunun DIŞINDA)
    for (const backgroundPath of backgroundOptions) {
      try {
        if (!backgroundPath) continue; // Boş veya null yolları atla

        if (backgroundPath.endsWith('.png')) {
          // Bu fonksiyonun dosyanızda var olduğunu varsayıyoruz
          const pngImage = await addPngBackgroundDirect(page, pdfDoc, backgroundPath); 
          loadedImage = pngImage;
          console.log('PNG embedded in PDF successfully:', backgroundPath);
          backgroundLoaded = true;
          break;
        } else if (backgroundPath.endsWith('.svg')) {
          // Bu fonksiyonun dosyanızda var olduğunu varsayıyoruz
          const svgImage = await addSvgBackgroundAsPng(page, pdfDoc, backgroundPath); 
          loadedImage = svgImage;
          console.log('SVG converted and embedded in PDF successfully:', backgroundPath);
          backgroundLoaded = true;
          break;
        }
      } catch (error) {
        // Hata ayıklama için daha detaylı log
        console.warn(`[WARN] Failed to load background for theme ${themeConfig.id} path ${backgroundPath}:`, error.message || error);
        continue;
      }
    }
    
    // 5. Başarılı yükleme sonrası önbellekle
    if (backgroundLoaded && loadedImage) {
      backgroundCache.set(cacheKey, loadedImage);
      console.log(`✅ Cached background: ${cacheKey}`);
    }
    
    if (!backgroundLoaded) {
      console.warn('All background options failed, using white background fallback');
      drawFallbackBackground(page); // Bu fonksiyonun dosyanızda var olduğunu varsayıyoruz
    }
    
  } catch (error) {
    console.error('Error in PNG background process:', error);
    drawFallbackBackground(page); // Bu fonksiyonun dosyanızda var olduğunu varsayıyoruz
  }
};