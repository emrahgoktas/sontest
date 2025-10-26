import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PDF_CONSTANTS, PDF_COLORS } from './constants';
import { addTestHeader, addContinuationHeader } from './headerUtils';
import { addPageFooter } from './footerUtils';
import { addRealSizeQuestionToPage } from './questionUtils';
import { addWatermark } from './themes/watermarkUtils';
import { getTheme } from './themes/themeManager';
import { 
  calculateContentArea, 
  calculateColumnBasedQuestionLayout, 
  canQuestionFitInCurrentColumn, 
  updateContentAreaAfterQuestion,
  moveToNextColumn,
  ContentArea 
} from './layoutUtils';
import { TestMetadata, CroppedQuestion } from '../../types';
import { PDFGenerationOptions, ThemedTestMetadata, ThemePlugin } from '../../types/themes';

/**
 * Original-size column-based page generation utilities for PDF creation
 * 
 * Handles page creation and question placement using original image sizes with
 * professional exam-style layout: 5mm margins, 10mm top space, column dividers
 */

// Global cache and tracking variables
const backgroundCache = new Map<string, any>();
let backgroundAttempts = new Set<string>();

/**
 * Clears the background cache and attempts tracking
 */
export const clearBackgroundCache = (): void => {
  backgroundCache.clear();
  backgroundAttempts = new Set<string>(); // Reset attempts tracking
  console.log('Background cache cleared');
};

/**
 * Generates all question pages with original-size layout (NO RESIZING)
 * 
 * @param pdfDoc - PDF document to add pages to
 * @param metadata - Test metadata for headers
 * @param questions - Array of questions to place
 * @param options - Theme and generation options
 * @returns Number of pages created
 */
export const generateThemedQuestionPages = async (
  pdfDoc: PDFDocument,
  metadata: ThemedTestMetadata,
  questions: CroppedQuestion[],
  options?: PDFGenerationOptions
): Promise<number> => {
  // Clear cache at start of PDF generation
  clearBackgroundCache();
  
  const theme = options?.theme ? getTheme(options.theme) : null;
  const themeConfig = theme?.config;
  
  let currentPage: PDFPage | null = null;
  let contentArea: ContentArea | null = null;
  let pageCount = 0;
  let isFirstPage = true;
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionNumber = question.order + 1;
    let questionPlaced = false;
    
    // Try to place question on current page
    while (!questionPlaced) {
      // Create new page if needed
      if (!currentPage || !contentArea) {
        const newPageResult = await createProfessionalPageWithContent(pdfDoc, metadata, isFirstPage, theme);
        currentPage = newPageResult.page;
        contentArea = newPageResult.contentArea;
        
        
        
        // Add column divider using theme-specific method if available
       // if (theme && theme.renderColumnDivider) {
       //   theme.renderColumnDivider(currentPage, contentArea);
       // } else {
        //  addProfessionalColumnDivider(currentPage, contentArea);
        //}
        
        // Add column borders for deneme-sinavi theme
        if (theme && theme.renderColumnBorders) {
          theme.renderColumnBorders(currentPage, contentArea);
        }
        
        pageCount++;
        isFirstPage = false;
      }
      
      // Try to place question in current column at ORIGINAL SIZE
      const questionLayout = calculateColumnBasedQuestionLayout(
        question,
        questionNumber,
        contentArea,
        metadata.questionSpacing
      );
      
      if (questionLayout) {
        // Question fits in current column at original size
        await addRealSizeQuestionToPage(currentPage, pdfDoc, question, questionLayout);
        
        // Update content area with generous spacing
        contentArea = updateContentAreaAfterQuestion(
          contentArea,
          questionLayout.height,
          metadata.questionSpacing + 20 // Generous spacing for professional appearance
        );
        
        questionPlaced = true;
      } else {
        // Question doesn't fit at original size, try next column
        const nextColumnArea = moveToNextColumn(contentArea);
        
        if (nextColumnArea) {
          // Move to next column
          contentArea = nextColumnArea;
        } else {
          // No more columns, need new page
          currentPage = null;
          contentArea = null;
        }
      }
    }
  }
  
  // Add footers to all pages
// [KGA-CHANGE]: Footers + (EN SONA ALINMIŞ) Watermark — for...of ile await güvenli
const pages = pdfDoc.getPages();
const questionPages = pages.slice(0, pageCount);

for (let i = 0; i < questionPages.length; i++) {
  const page = questionPages[i];
  const pageNumber = i + 1;

  // Footer
  if (theme?.renderFooter) {
    theme.renderFooter(page, pageNumber, pageCount + 1);
  } else {
    addPageFooter(page, pageNumber, pageCount + 1);
  }

  // Watermark (sona taşındı → üstte görünür)
  let wm: any = null;
  if (options?.watermark && options.watermark.type !== 'none') {
    wm = { ...options.watermark, opacity: Math.min(0.1, options.watermark.opacity || 0.08) };
  } else if (themeConfig?.defaultWatermark && themeConfig.defaultWatermark.type !== 'none') {
    wm = { ...themeConfig.defaultWatermark, opacity: Math.min(0.1, themeConfig.defaultWatermark.opacity || 0.08) };
  }

  if (wm) {
    await addWatermark(page, wm, pdfDoc);
  }
}

  
  // Clear cache at end of PDF generation
  clearBackgroundCache();
  
  return pageCount;
};

/**
 * Generates all question pages with original-size layout (backward compatibility)
 * 
 * @param pdfDoc - PDF document to add pages to
 * @param metadata - Test metadata for headers
 * @param questions - Array of questions to place
 * @returns Number of pages created
 */
export const generateColumnBasedQuestionPages = async (
  pdfDoc: PDFDocument,
  metadata: TestMetadata,
  questions: CroppedQuestion[]
): Promise<number> => {
  return generateThemedQuestionPages(pdfDoc, metadata, questions);
};

/**
 * Adds extremely thin column divider between columns (fallback)
 * 
 * @param page - PDF page to add divider to
 * @param contentArea - Content area information for positioning
 */
const addProfessionalColumnDivider = (page: PDFPage, contentArea: ContentArea): void => {

};

/**
 * Creates a new PDF page with professional content area setup
 * 
 * @param pdfDoc - PDF document to add page to
 * @param metadata - Test metadata for header
 * @param isFirstPage - Whether this is the first page
 * @param theme - Theme plugin for custom rendering
 * @returns New page and initialized content area
 */
const createProfessionalPageWithContent = async (
  pdfDoc: PDFDocument,
  metadata: ThemedTestMetadata,
  isFirstPage: boolean,
  theme?: any
): Promise<{ page: PDFPage; contentArea: ContentArea }> => {
  const page = createNewPage(pdfDoc);
  if (theme?.config?.backgroundSvgPath) {
    try {
      await addPngBackground(page, pdfDoc, theme);
    } catch (backgroundError) {
      console.warn('Background loading failed, continuing without background:', backgroundError);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PDF_CONSTANTS.PAGE_WIDTH,
        height: PDF_CONSTANTS.PAGE_HEIGHT,
        color: rgb(1, 1, 1) // Pure white fallback
      });
    }
  } else {
    // Apply pure white background for other themes
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PDF_CONSTANTS.PAGE_WIDTH,
      height: PDF_CONSTANTS.PAGE_HEIGHT,
      color: rgb(1, 1, 1) // Pure white
    });
  }
  
  
  const contentStartY = addProfessionalPageHeader(page, metadata, isFirstPage, theme);
  const columns = theme?.config?.layout?.columns || 2;
  const contentArea = calculateContentArea(contentStartY, columns);
  
  return { page, contentArea };
};

/**
 * Creates a new PDF page with standard dimensions
 * 
 * @param pdfDoc - PDF document to add page to
 * @returns New PDF page
 */
const createNewPage = (pdfDoc: PDFDocument): PDFPage => {
  return pdfDoc.addPage([PDF_CONSTANTS.PAGE_WIDTH, PDF_CONSTANTS.PAGE_HEIGHT]);
};

/**
 * Adds professional header to page (main or continuation)
 * 
 * @param page - PDF page to add header to
 * @param metadata - Test metadata
 * @param isFirstPage - Whether this is the first page
 * @param theme - Theme plugin for custom rendering
 * @returns Y position where content should start
 */
const addProfessionalPageHeader = (
  page: PDFPage, 
  metadata: ThemedTestMetadata, 
  isFirstPage: boolean, 
  theme?: any
): number => {
  if (theme?.renderHeader && isFirstPage) {
    return theme.renderHeader(page, metadata, 0);
  } else if (isFirstPage) {
    return addTestHeader(page, metadata);
  } else {
    return addContinuationHeader(page);
  }
};

/**
 * Adds PNG background to PDF page for yaprak-test theme
 * 
 * @param page - PDF page to add background to
 * @param pdfDoc - PDF document
 * @param themePlugin - Theme plugin containing configuration
 */
// REPLACE THIS FUNCTION IN: src/utils/pdf/pageUtils.ts
const addPngBackground = async (page: PDFPage, pdfDoc: PDFDocument, themePlugin: ThemePlugin): Promise<void> => {
  try {
    const themeConfig = themePlugin.config;
    if (!themeConfig.backgroundSvgPath) return;

    const cacheKey = `${themeConfig.id}_${themeConfig.backgroundSvgPath}`;

    // [KGA-CHANGE]: 1) ÖNCE CACHE — varsa direkt kullan ve çık
    const cachedImage = backgroundCache.get(cacheKey);
    if (cachedImage) {
      page.drawImage(cachedImage, {
        x: 0,
        y: 0,
        width: PDF_CONSTANTS.PAGE_WIDTH,
        height: PDF_CONSTANTS.PAGE_HEIGHT
      });
      console.log('✅ Used cached background:', cacheKey);
      console.log('[pageUtils] background applied:', themeConfig.backgroundSvgPath);
      return;
    }

    // [KGA-CHANGE]: 2) Daha önce başarısız denendiyse, tekrar uğraşma → fallback
    if (backgroundAttempts.has(cacheKey)) {
      console.warn('Background previously attempted (failed), drawing fallback:', cacheKey);
      drawFallbackBackground(page);
      return;
    }

    // [KGA-CHANGE]: 3) İlk deneme — attempt işaretle
    backgroundAttempts.add(cacheKey);

    // Try multiple background options (orijinal liste korunur)
     const backgroundOptions: string[] = [];
    if (themeConfig.backgroundSvgPath) {
      backgroundOptions.push(themeConfig.backgroundSvgPath);
    }

    if (themePlugin.config.id === 'deneme-sinavi') {
      backgroundOptions.push('/themes/test-03.png');
    }
    if (themePlugin.config.id === 'yazili-sinav') {
      backgroundOptions.push('/themes/test-05.png');
    }
    if (themePlugin.config.id === 'tyt-2024') {
      backgroundOptions.push('/themes/test-04.png');
    }
     backgroundOptions.push('/themes/test-02.png', '/themes/test 02.svg');
    let loadedImage: any = null;

    for (const backgroundPath of backgroundOptions) {
      try {
        if (backgroundPath.endsWith('.png')) {
          const res = await fetch(backgroundPath);
          if (!res.ok) throw new Error(`Failed to fetch PNG: ${res.statusText}`);
          const bytes = new Uint8Array(await res.arrayBuffer());

          // PNG tercih; olmazsa JPEG'e düş
          try {
            loadedImage = await pdfDoc.embedPng(bytes);
            console.log('PNG embedded in PDF successfully:', backgroundPath);
          } catch (pngErr) {
            console.warn('PNG embedding failed, trying JPEG:', pngErr);
            loadedImage = await pdfDoc.embedJpg(bytes);
            console.log('JPEG embedded in PDF successfully:', backgroundPath);
          }
        } else if (backgroundPath.endsWith('.svg')) {
          const svgRes = await fetch(backgroundPath);
          if (!svgRes.ok) throw new Error(`Failed to fetch SVG: ${svgRes.statusText}`);
          const svgContent = await svgRes.text();
          const optimized = optimizeSvgForPdf(svgContent);
          const pngDataUrl = await convertSvgToPng(optimized, PDF_CONSTANTS.PAGE_WIDTH, PDF_CONSTANTS.PAGE_HEIGHT);
          const base64 = pngDataUrl.split(',')[1];
          const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          loadedImage = await pdfDoc.embedPng(pngBytes);
          console.log('SVG background converted & embedded successfully:', backgroundPath);
        }

        if (loadedImage) {
          // Başarılı → cache’le ve çiz
          backgroundCache.set(cacheKey, loadedImage);
          console.log('✅ Cached background:', cacheKey);

          page.drawImage(loadedImage, {
            x: 0,
            y: 0,
            width: PDF_CONSTANTS.PAGE_WIDTH,
            height: PDF_CONSTANTS.PAGE_HEIGHT
          });
          console.log('[pageUtils] background applied:', backgroundPath);
          return; // [KGA-CHANGE]: başarıyla çizildi, fonksiyondan çık
        }
      } catch (error: any) {
        console.warn(`Background loading failed for ${backgroundPath}:`, error?.message || error);
        // [KGA-CHANGE]: Burada global cacheKey attempt'ını SİLME.
        // Diğer path'leri denemeye devam edeceğiz.
        continue;
      }
    }

    // Tüm seçenekler denendi ve olmadı → fallback
    console.warn('All background options failed, using white background fallback');
    drawFallbackBackground(page);

  } catch (error) {
    console.error('Error in PNG background process:', error);
    drawFallbackBackground(page);
  }
};


/**
 * Loads PNG file directly for reliable PDF embedding
 */
const addPngBackgroundDirect = async (page: PDFPage, pdfDoc: PDFDocument, pngPath: string): Promise<any> => {
  try {
    console.log('Attempting to load PNG from:', pngPath);
    
    // Memory check before loading
    if (backgroundCache.size > 5) {
      console.warn('Background cache full, clearing oldest entries');
      const firstKey = backgroundCache.keys().next().value;
      if (firstKey) {
        backgroundCache.delete(firstKey);
      }
    }
    
    // Load PNG file
    const response = await fetch(pngPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch PNG: ${response.statusText}`);
    }
    
    // Get PNG as array buffer
    let arrayBuffer;
    try {
      arrayBuffer = await response.arrayBuffer();
      console.log('PNG file fetched successfully, size:', arrayBuffer.byteLength);
    } catch (bufferError) {
      throw new Error(`Failed to read PNG data: ${bufferError?.message || bufferError}`);
    }
    
    // Check if file exists and has content
    if (arrayBuffer.byteLength < 100) {
      throw new Error(`File too small (${arrayBuffer.byteLength} bytes), likely empty or not found`);
    }
    
    // Check file size to prevent memory issues - more reasonable limit
    if (arrayBuffer.byteLength > 5 * 1024 * 1024) { // 5MB limit for safety
      console.warn(`PNG file large (${arrayBuffer.byteLength} bytes), may cause memory issues`);
      // Don't throw error, just warn and continue with smaller processing
    }
    
    let pngBytes;
    try {
      pngBytes = new Uint8Array(arrayBuffer);
    } catch (memoryError) {
      console.error(`Memory allocation failed for PNG: ${memoryError?.message || memoryError}`);
      return null; // Return null instead of throwing
    }
    
    console.log('PNG bytes prepared, length:', pngBytes.length);
    
    // Try to validate PNG header, but be more lenient
    if (pngBytes.length >= 8) {
      const isPNG = pngBytes[0] === 0x89 && pngBytes[1] === 0x50 && 
                   pngBytes[2] === 0x4E && pngBytes[3] === 0x47;
      
      if (!isPNG) {
        console.warn('File does not have PNG header, but attempting to embed anyway');
      }
    }
    
    // Try to embed as PNG, with fallback to JPEG
    let pngImage;
    try {
      pngImage = await pdfDoc.embedPng(pngBytes);
      console.log('PNG embedded in PDF successfully');
    } catch (pngError) {
      console.warn('PNG embedding failed, trying JPEG:', pngError);
      try {
        pngImage = await pdfDoc.embedJpg(pngBytes);
        console.log('JPEG embedded in PDF successfully');
      } catch (jpgError) {
        // Don't throw, return null to use fallback
        console.error('Both PNG and JPEG embedding failed, using fallback');
        return null;
      }
    }
    
    if (!pngImage) {
      console.warn('No image created, using fallback');
      return null;
    }
    
    // Draw as full-page background
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: PDF_CONSTANTS.PAGE_WIDTH,
      height: PDF_CONSTANTS.PAGE_HEIGHT
    });
    
    console.log('Background successfully drawn on page');
    
    return pngImage; // Return for caching
    
  } catch (error) {
    console.error('PNG direct loading failed:', error);
    return null; // Return null instead of throwing
  }
};

/**
 * Alternative: Convert SVG to PNG if needed (kept for fallback)
 */
const addSvgBackgroundAsPng = async (page: PDFPage, pdfDoc: PDFDocument, svgPath: string): Promise<any> => {
  try {
    // Load SVG content
    const response = await fetch(svgPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgContent = await response.text();
    
    // Optimize SVG for rendering
    const optimizedSvg = optimizeSvgForPdf(svgContent);
    
    // Convert SVG to PNG using canvas
    const pngDataUrl = await convertSvgToPng(optimizedSvg, PDF_CONSTANTS.PAGE_WIDTH, PDF_CONSTANTS.PAGE_HEIGHT);
    
    // Extract base64 data and convert to bytes
    const base64Data = pngDataUrl.split(',')[1];
    const pngBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Embed PNG in PDF
    const pngImage = await pdfDoc.embedPng(pngBytes);
    
    // Draw as full-page background
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: PDF_CONSTANTS.PAGE_WIDTH,
      height: PDF_CONSTANTS.PAGE_HEIGHT
    });
    
    console.log('SVG background successfully converted to PNG and embedded');
    
    return pngImage; // Return for caching
    
  } catch (error) {
    console.warn('SVG to PNG conversion failed:', error);
    return null; // Return null instead of drawing fallback here
  }
};

/**
 * Converts SVG to PNG using canvas for reliable PDF embedding
 */
const convertSvgToPng = (svgContent: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for conversion
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Set canvas size to A4 dimensions at high DPI
      const scale = 2; // 2x for high quality
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // Scale context for high quality
      ctx.scale(scale, scale);
      
      // Create image from SVG
      const img = new Image();
      
      img.onload = () => {
        try {
          // Clear canvas with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // Draw SVG image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to PNG
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          resolve(pngDataUrl);
        } catch (drawError) {
          reject(drawError);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load SVG image'));
      };
      
      // Create blob URL from SVG content
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      img.src = svgUrl;
      
      // Cleanup after 10 seconds
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
      }, 10000);
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creates a fallback SVG when the original cannot be loaded
 */
const createFallbackSVG = (): string => {
  return `
    <svg width="595.28" height="841.89" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f8f0" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="white"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <rect x="20" y="20" width="555.28" height="801.89" fill="none" stroke="#e8f5e8" stroke-width="1"/>
    </svg>
  `;
};

/**
 * Optimizes SVG content for PDF rendering
 */
const optimizeSvgForPdf = (svgContent: string): string => {
  let optimized = svgContent;
  
  // Ensure proper A4 dimensions
  optimized = optimized.replace(
    /width="[^"]*"/g, 
    'width="595.28"'
  ).replace(
    /height="[^"]*"/g, 
    'height="841.89"'
  );
  
  // Set proper viewBox for A4
  if (!optimized.includes('viewBox')) {
    optimized = optimized.replace(
      /<svg([^>]*)>/,
      '<svg$1 viewBox="0 0 595.28 841.89">'
    );
  } else {
    optimized = optimized.replace(
      /viewBox="[^"]*"/g,
      'viewBox="0 0 595.28 841.89"'
    );
  }
  
  // Remove problematic attributes that might cause PDF rendering issues
  optimized = optimized
    .replace(/mix-blend-mode="[^"]*"/g, '') // Remove blend modes
    .replace(/filter="[^"]*"/g, '') // Remove complex filters
    .replace(/mask="[^"]*"/g, '') // Remove masks
    .replace(/clip-path="[^"]*"/g, '') // Remove clip paths
    .replace(/opacity="0\.0*[1-9][^"]*"/g, 'opacity="0.1"') // Normalize low opacity values
    .replace(/fill-opacity="0\.0*[1-9][^"]*"/g, 'fill-opacity="0.1"') // Normalize fill opacity
    .replace(/stroke-opacity="0\.0*[1-9][^"]*"/g, 'stroke-opacity="0.1"'); // Normalize stroke opacity
  
  // Remove complex gradients that might cause issues
  optimized = optimized.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  
  // Ensure all paths have proper fill colors (no transparent fills)
  optimized = optimized.replace(/fill="none"/g, 'fill="#ffffff"');
  optimized = optimized.replace(/fill="transparent"/g, 'fill="#ffffff"');
  
  return optimized;
};

/**
 * Draws a simple fallback background when SVG fails
 */
const drawFallbackBackground = (page: PDFPage): void => {
  // Clean white background for yaprak test theme
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PDF_CONSTANTS.PAGE_WIDTH,
    height: PDF_CONSTANTS.PAGE_HEIGHT,
    color: rgb(1, 1, 1) // Pure white background
  });
};

// Legacy function for backward compatibility (deprecated)

/**
 * @deprecated Use generateThemedQuestionPages instead
 */
export const generateRealSizeQuestionPages = async (
  pdfDoc: PDFDocument,
  metadata: TestMetadata,
  questions: CroppedQuestion[]
): Promise<number> => {
  return await generateColumnBasedQuestionPages(pdfDoc, metadata, questions);
};

/**
 * @deprecated Use generateThemedQuestionPages instead
 */
export const generateQuestionPages = async (
  pdfDoc: PDFDocument,
  metadata: TestMetadata,
  questions: CroppedQuestion[],
  totalPages: number
): Promise<void> => {
  await generateColumnBasedQuestionPages(pdfDoc, metadata, questions);
};