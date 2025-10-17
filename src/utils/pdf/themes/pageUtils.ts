/**
 * Clear background cache (useful for memory management)
 */
export const clearBackgroundCache = (): void => {
  backgroundCache.clear();
  console.log('Background cache cleared');
};
@@ .. @@
 /**
  * Adds PNG background to PDF page for yaprak-test theme
  * 
const addSvgBackgroundAsPng = async (page: PDFPage, pdfDoc: PDFDocument, svgPath: string): Promise<any> => {
  * @param pdfDoc - PDF document
  * @param themePlugin - Theme plugin containing configuration
  */
+const backgroundCache = new Map<string, any>();
+
 const addPngBackground = async (page: PDFPage, pdfDoc: PDFDocument, themePlugin: ThemePlugin): Promise<void> => {
   try {
     const themeConfig = themePlugin.config;
     
     if (!themeConfig.backgroundSvgPath) {
       return;
     }

+    // Check cache first to prevent infinite loops
+    const cacheKey = `${themeConfig.id}_${themeConfig.backgroundSvgPath}`;
+    if (backgroundCache.has(cacheKey)) {
+      const cachedImage = backgroundCache.get(cacheKey);
+      page.drawImage(cachedImage, {
+        x: 0,
+        y: 0,
+        width: PDF_CONSTANTS.PAGE_WIDTH,
+        height: PDF_CONSTANTS.PAGE_HEIGHT
  // Limit background loading to prevent infinite loops
  let backgroundAttempted = false;
  
+      });
  if (theme?.config?.backgroundSvgPath && theme.config.id === 'yaprak-test' && !backgroundAttempted) {
    backgroundAttempted = true;
+    }
+
     // Try multiple background options
     const backgroundOptions = [
       themeConfig.backgroundSvgPath,
       '/themes/test-02.png',
       '/themes/test 02.svg'
     ];
     
     // Add specific options for deneme-sinavi theme
     if (themePlugin.config.id === 'deneme-sinavi') {
       backgroundOptions.unshift('/themes/test-03.png');
    
  } else if (theme?.config?.backgroundSvgPath && theme.config.id === 'deneme-sinavi' && !backgroundAttempted) {
    backgroundAttempted = true;
     }
     
     // Add specific options for yazili-sinav theme
     if (themePlugin.config.id === 'yazili-sinav') {
       backgroundOptions.unshift('/themes/test-05.png');
     }
     
     // Add specific options for tyt-2024 theme
     if (themePlugin.config.id === 'tyt-2024') {
       backgroundOptions.unshift('/themes/test-04.png');
     }
     
     let backgroundLoaded = false;
  } else if (theme?.config?.backgroundSvgPath && theme.config.id === 'yazili-sinav' && !backgroundAttempted) {
    backgroundAttempted = true;
     for (const backgroundPath of backgroundOptions) {
       try {
         if (backgroundPath.endsWith('.png')) {
-          await addPngBackgroundDirect(page, pdfDoc, backgroundPath);
+          const pngImage = await addPngBackgroundDirect(page, pdfDoc, backgroundPath);
+          // Cache the loaded image to prevent reloading
+          backgroundCache.set(cacheKey, pngImage);
           console.log('PNG background successfully loaded:', backgroundPath);
           backgroundLoaded = true;
           break;
         } else if (backgroundPath.endsWith('.svg')) {
-          await addSvgBackgroundAsPng(page, pdfDoc, backgroundPath);
+          const svgImage = await addSvgBackgroundAsPng(page, pdfDoc, backgroundPath);
  } else if (theme?.config?.backgroundSvgPath && theme.config.id === 'tyt-2024' && !backgroundAttempted) {
    backgroundAttempted = true;
    return pngImage; // Return the embedded image for caching
+          // Cache the converted image
+          backgroundCache.set(cacheKey, svgImage);
           console.log('SVG background successfully converted and loaded:', backgroundPath);
           backgroundLoaded = true;
           break;
         }
       } catch (error) {
         console.warn(`Background loading failed for ${backgroundPath}:`, error.message || error);
         continue;
       }
     }
     
     if (!backgroundLoaded) {
       console.warn('All background options failed, using white background fallback');
       drawFallbackBackground(page);
     }
     
   } catch (error) {
     console.error('Error in PNG background process:', error);
     drawFallbackBackground(page);
    return null;
   }
 };