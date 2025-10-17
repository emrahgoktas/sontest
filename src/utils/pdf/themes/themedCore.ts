@@ .. @@
 import { generateThemedQuestionPages } from './pageUtils';
 import { generateAnswerKeyPage } from './answerKeyUtils';
 import { setPDFMetadata } from './metadataUtils';
+import { clearBackgroundCache } from './pageUtils';

 /**
  * Generates themed PDF with advanced options and full theme support
  * 
  * @param metadata - Test metadata
  * @param questions - Array of questions
  * @param options - Theme and generation options
  * @returns PDF bytes
  * 
  * @example
  * ```typescript
  * const pdfBytes = await generateThemedTestPDF(metadata, questions, {
  *   theme: 'yazili-sinav',
  *   watermark: { type: 'text', content: 'DENEME', opacity: 0.12, rotation: -30 },
  *   includeAnswerKey: false
  * });
  * ```
  */
 export const generateThemedTestPDF = async (
   metadata: TestMetadata,
   questions: CroppedQuestion[],
   options: PDFGenerationOptions
 ): Promise<Uint8Array> => {
+  // Clear background cache at start to prevent memory leaks
+  clearBackgroundCache();
+  
   const pdfDoc = await PDFDocument.create();
   
   // Get theme
   const theme = getTheme(options.theme) || getDefaultTheme();
   
   // Prepare themed metadata
   const themedMetadata: ThemedTestMetadata = {
     ...metadata,
     ...options.customFields
   };
   
   // Generate question pages with theme
   const questionPageCount = await generateThemedQuestionPages(
     pdfDoc, 
     themedMetadata, 
     questions, 
     options
   );
   
   // Determine if answer key should be included
   const includeAnswerKey = options.includeAnswerKey ?? theme.config.includeAnswerKey ?? true;
   
   // Calculate total pages
   const totalPages = questionPageCount + (includeAnswerKey ? 1 : 0);
   
   // Generate answer key if requested - pass the includeAnswerKey flag and watermark
   await generateAnswerKeyPage(pdfDoc, questions, totalPages, includeAnswerKey, options.watermark);
   
   // Store answer key in metadata if theme requires it and answer key is not included as page
   if (!includeAnswerKey && theme.config.answerKeyInMetadata) {
     storeAnswerKeyInMetadata(pdfDoc, questions);
   }
   
   // Set PDF metadata
   setPDFMetadata(pdfDoc, themedMetadata);
   
+  // Clear cache after PDF generation to free memory
+  clearBackgroundCache();
+  
   return await pdfDoc.save();
 };