import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PDFInfo, CroppedQuestion, CropArea, AnswerChoice, PDFDocumentInfo } from '../../../types';
import { usePDFCropping } from '../../../hooks/usePDFCropping';
import {
  renderPDFPageToCanvas,
  cropImageFromCanvas,
  getCanvasMousePosition,
  getCanvasTouchPosition,
  createCropPreview,
  getRecommendedScale,
  estimateMemoryUsage
} from '../../../utils/cropUtils';
import * as pdfjsLib from 'pdfjs-dist';

// Import sub-components
import { HeaderSection } from './HeaderSection';
import { ControlsSection } from './ControlsSection';
import { InstructionsBox } from './InstructionsBox';
import { CanvasArea } from './CanvasArea';
import { PreviewPanel } from './PreviewPanel';
import { FooterActions } from './FooterActions';
import { QualityInfoBox } from './QualityInfoBox';
import { CroppingPopup } from '../CroppingPopup';

/**
 * Enhanced PDF Cropping Screen Component with High-Quality Rendering and Touch Support
 * Now supports adding another PDF inside the cropping screen and continue cropping seamlessly.
 */

interface PDFCroppingScreenProps {
  pdfInfo: PDFInfo; // initial (backward-compatible)
  questions: CroppedQuestion[];
  onQuestionAdd: (question: CroppedQuestion) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PDFCroppingScreen: React.FC<PDFCroppingScreenProps> = ({
  pdfInfo,
  questions,
  onQuestionAdd,
  onNext,
  onPrevious
}) => {
  // --- Multi-PDF: local documents list (initial includes the incoming pdfInfo) ---
  const [documents, setDocuments] = useState<PDFDocumentInfo[]>(() => {
    const makeId = () => {
      try { return crypto.randomUUID(); } catch { return `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
    };
    return [{
      id: makeId(),
      name: (pdfInfo.file as any)?.name ?? 'Yüklenen PDF',
      pdfInfo
    }];
  });

  // active document id lives in the hook so createQuestion can tag sourceDocumentId automatically
  const {
    isSelecting,
    currentSelection,
    startSelection,
    updateSelection,
    completeSelection,
    createQuestion,
    resetSelection,
    activeDocumentId,
    setActiveDocumentId
  } = usePDFCropping();

  // ensure first document is active on mount
  useEffect(() => {
    if (!activeDocumentId && documents[0]) {
      setActiveDocumentId(documents[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeDocument = documents.find(d => d.id === activeDocumentId) ?? documents[0];
  const activePdfInfo = activeDocument?.pdfInfo ?? pdfInfo;

  const [currentPage, setCurrentPage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<string>('');
  const [currentCropArea, setCurrentCropArea] = useState<CropArea | null>(null);
  const [currentImageDimensions, setCurrentImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [mobilePageOffset, setMobilePageOffset] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  // High-quality rendering settings (based on ACTIVE document)
  const [baseScale, setBaseScale] = useState(() => Math.max(getRecommendedScale(activePdfInfo.numPages), 2.0));
  const scale = baseScale * zoomLevel;
  const [qualityInfo, setQualityInfo] = useState<{
    estimatedMemory: number;
    recommendedScale: number;
  }>({
    estimatedMemory: estimateMemoryUsage(activePdfInfo.numPages, scale),
    recommendedScale: getRecommendedScale(activePdfInfo.numPages)
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRenderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const currentRenderPromiseRef = useRef<Promise<void> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Load a file and turn into PDFInfo (minimal fields used here).
   * We don't pre-render page images; cropping view renders pages on demand.
   */
  const loadFileAsPDFInfo = useCallback(async (file: File): Promise<PDFInfo> => {
    const url = URL.createObjectURL(file);
    const doc = await pdfjsLib.getDocument({ url }).promise;
    return {
      file,
      numPages: doc.numPages,
      pageImages: [], // not needed here
      pdfDocument: doc as unknown as pdfjsLib.PDFDocumentProxy
    };
  }, []);

  /**
   * Add another PDF into the cropping session and switch to it.
   */
  const handleAddAnotherPDF = useCallback(async (file: File) => {
    const info = await loadFileAsPDFInfo(file);
    const makeId = () => {
      try { return crypto.randomUUID(); } catch { return `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
    };
    const docWrap: PDFDocumentInfo = {
      id: makeId(),
      name: file.name,
      pdfInfo: info
    };
    setDocuments(prev => [...prev, docWrap]);
    setActiveDocumentId(docWrap.id);
    // reset view for the new document
    setCurrentPage(0);
    setMobilePageOffset(0);
    resetSelection();
    setPreviewImageData('');
  }, [loadFileAsPDFInfo, resetSelection, setActiveDocumentId]);

  const onAddAnotherPDFClick = () => fileInputRef.current?.click();
  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleAddAnotherPDF(file);
      // allow re-picking the same file consecutively
      e.target.value = '';
    }
  };

  /**
   * Load PDF page to canvas with high-quality serialized rendering
   */
  const loadPageToCanvas = useCallback(async (pageIndex: number) => {
    if (!canvasRef.current || !activePdfInfo.pdfDocument) return;

    // Wait for any previous render to complete before starting a new one
    if (currentRenderPromiseRef.current) {
      try {
        await currentRenderPromiseRef.current;
      } catch {
        // ignore
      }
    }

    setIsPageLoading(true);

    const renderPromise = (async () => {
      try {
        // cancel previous
        if (currentRenderTaskRef.current) {
          try { currentRenderTaskRef.current.cancel(); } catch {}
          currentRenderTaskRef.current = null;
        }

        const renderTask = await renderPDFPageToCanvas(
          activePdfInfo.pdfDocument,
          pageIndex,
          canvasRef.current!,
          scale
        );

        currentRenderTaskRef.current = renderTask;
      } catch (error: any) {
        if (error?.name === 'RenderingCancelledException') return;
        console.error('Sayfa yükleme hatası:', error);
        alert('PDF sayfası yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      }
    })();

    currentRenderPromiseRef.current = renderPromise;

    try {
      await renderPromise;
    } finally {
      if (currentRenderPromiseRef.current === renderPromise) {
        setIsPageLoading(false);
        currentRenderPromiseRef.current = null;
      }
    }
  }, [activePdfInfo.pdfDocument, scale]);

  // Mouse / touch handlers (unchanged except they use current active doc/page)
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPageLoading) return;
    const position = getCanvasMousePosition(event, canvasRef.current);
    startSelection(event, currentPage, position);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPageLoading) return;
    event.preventDefault();
    const position = getCanvasTouchPosition(event, canvasRef.current);
    startSelection(event as any, currentPage, position);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isSelecting || isPageLoading) return;
    const position = getCanvasMousePosition(event, canvasRef.current);
    updateSelection(event, position);
    if (showPreview && currentSelection && currentSelection.width > 20 && currentSelection.height > 20) {
      createLivePreview();
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isSelecting || isPageLoading) return;
    event.preventDefault();
    const position = getCanvasTouchPosition(event, canvasRef.current);
    updateSelection(event as any, position);
    if (showPreview && currentSelection && currentSelection.width > 20 && currentSelection.height > 20) {
      createLivePreview();
    }
  };

  const handleMouseUp = async () => {
    if (!canvasRef.current || isPageLoading) return;
    const cropArea = completeSelection();
    if (cropArea && cropArea.width > 20 && cropArea.height > 20) {
      try {
        const cropResult = await cropImageFromCanvas(canvasRef.current, cropArea);
        setCroppedImageData(cropResult.imageData);
        setCurrentCropArea(cropArea);
        setCurrentImageDimensions({ width: cropResult.actualWidth, height: cropResult.actualHeight });
        setShowPopup(true);
      } catch (error) {
        console.error('Görsel kırpma hatası:', error);
        alert('Görsel kırpılırken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleTouchEnd = async (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPageLoading) return;
    event.preventDefault();
    const cropArea = completeSelection();
    if (cropArea && cropArea.width > 20 && cropArea.height > 20) {
      try {
        const cropResult = await cropImageFromCanvas(canvasRef.current, cropArea);
        setCroppedImageData(cropResult.imageData);
        setCurrentCropArea(cropArea);
        setCurrentImageDimensions({ width: cropResult.actualWidth, height: cropResult.actualHeight });
        setShowPopup(true);
      } catch (error) {
        console.error('Görsel kırpma hatası:', error);
        alert('Görsel kırpılırken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const createLivePreview = useCallback(async () => {
    if (!canvasRef.current || !currentSelection) return;
    try {
      const previewData = await createCropPreview(canvasRef.current, currentSelection);
      setPreviewImageData(previewData);
    } catch (error) {
      console.error('Preview creation error:', error);
    }
  }, [currentSelection]);

  const calculateOverlayPosition = useCallback(() => {
    if (!currentSelection || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const displayScaleX = rect.width / canvas.width;
    const displayScaleY = rect.height / canvas.height;
    return {
      left: currentSelection.x * displayScaleX,
      top: currentSelection.y * displayScaleY,
      width: currentSelection.width * displayScaleX,
      height: currentSelection.height * displayScaleY
    };
  }, [currentSelection]);

  /** NEW: mevcut kırpımları (aktif PDF + aktif sayfa) DOM koordinatlarına çevirip CanvasArea'ya gönder */
  const existingOverlays = React.useMemo(() => {
    if (!canvasRef.current) return [];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / canvas.width;
    const sy = rect.height / canvas.height;

    // sadece aktif PDF + aktif sayfa
    const filtered = questions
      .filter(q =>
        (q.cropArea?.pageNumber ?? -1) === currentPage &&
        (activeDocument?.id ? q.sourceDocumentId === activeDocument.id : true)
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const palette = [
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#3B82F6', // blue-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#22C55E', // green-500
      '#06B6D4', // cyan-500
      '#E11D48', // rose-600
    ];

    return filtered.map((q, idx) => {
      const n = (q.order ?? idx) + 1;
      const ca = q.cropArea;
      const left = ca.x * sx;
      const top = ca.y * sy;
      const width = ca.width * sx;
      const height = ca.height * sy;
      const color = palette[(n - 1) % palette.length];
      const label = `${n}. ${q.correctAnswer}`;
      return { left, top, width, height, color, label, id: q.id };
    });
  }, [questions, currentPage, activeDocument?.id]);

  const handleQuestionSave = useCallback((correctAnswer: AnswerChoice) => {
    if (!currentCropArea || !croppedImageData || !currentImageDimensions) return;

    // Pass activeDocumentId so the crop gets tagged with its source PDF.
    const question = createQuestion(
      croppedImageData,
      currentCropArea,
      correctAnswer,
      currentImageDimensions.width,
      currentImageDimensions.height,
      activeDocument?.id // explicit tag; createQuestion also falls back to hook's activeDocumentId
    );
    question.order = questions.length;

    onQuestionAdd(question);

    // Reset state
    setShowPopup(false);
    setCroppedImageData('');
    setCurrentCropArea(null);
    setCurrentImageDimensions(null);
    setPreviewImageData('');
  }, [currentCropArea, croppedImageData, currentImageDimensions, createQuestion, questions.length, onQuestionAdd, activeDocument?.id]);

  const handlePopupCancel = useCallback(() => {
    setShowPopup(false);
    setCroppedImageData('');
    setCurrentCropArea(null);
    setCurrentImageDimensions(null);
    setPreviewImageData('');
    resetSelection();
  }, [resetSelection]);

  const changePage = (newPage: number) => {
    if (newPage >= 0 && newPage < activePdfInfo.numPages) {
      setCurrentPage(newPage);
      resetSelection();
      setPreviewImageData('');
    }
  };

  const handleMobileNext = () => {
    const maxOffset = Math.max(0, Math.ceil(activePdfInfo.numPages / 5) - 1);
    if (mobilePageOffset < maxOffset) {
      setMobilePageOffset(prev => prev + 1);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(3.0, prev + 0.25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.25));
  const togglePreview = () => setShowPreview(!showPreview);
  const toggleInstructions = () => setShowInstructions(!showInstructions);

  // Recompute quality info when zoom OR active document changes
  useEffect(() => {
    const recommended = getRecommendedScale(activePdfInfo.numPages);
    const initialBase = Math.max(recommended, 2.0);
    setBaseScale(initialBase); // update base when doc changes
  }, [activePdfInfo.numPages]);

  useEffect(() => {
    const currentScale = baseScale * zoomLevel;
    setQualityInfo({
      estimatedMemory: estimateMemoryUsage(activePdfInfo.numPages, currentScale),
      recommendedScale: getRecommendedScale(activePdfInfo.numPages)
    });
  }, [zoomLevel, activePdfInfo.numPages, baseScale]);

  // Load page when page/zoom/active document changes
  useEffect(() => {
    setIsPageLoading(true);
    loadPageToCanvas(currentPage).finally(() => {});
  }, [currentPage, zoomLevel, loadPageToCanvas, activePdfInfo.pdfDocument]);

  // When active document changes, reset page to 0 (if out of range) and rerender
  useEffect(() => {
    if (currentPage >= activePdfInfo.numPages) {
      setCurrentPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePdfInfo.numPages]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (currentRenderTaskRef.current) {
        try { currentRenderTaskRef.current.cancel(); } catch {}
      }
    };
  }, []);

  const overlayPosition = calculateOverlayPosition();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <HeaderSection
        questionsCount={questions.length}
        currentPage={currentPage}
        totalPages={activePdfInfo.numPages}
      />

      {/* Top bar: Document tabs + Add another PDF */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => {
                setActiveDocumentId(doc.id);
                setCurrentPage(0);
                resetSelection();
                setPreviewImageData('');
              }}
              className={`px-2 py-1 rounded-md text-sm border ${
                doc.id === activeDocument?.id ? 'bg-gray-100 border-gray-300' : 'bg-white hover:bg-gray-50'
              }`}
              title={doc.name}
            >
              {doc.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddAnotherPDFClick}
          className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50"
        >
          Başka PDF Ekle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFilePicked}
        />
      </div>

      {/* Controls */}
      <ControlsSection
        currentPage={currentPage}
        totalPages={activePdfInfo.numPages}
        isPageLoading={isPageLoading}
        showPreview={showPreview}
        zoomLevel={zoomLevel}
        mobilePageOffset={mobilePageOffset}
        onChangePage={changePage}
        onTogglePreview={togglePreview}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMobileNext={handleMobileNext}
      />

      {/* Enhanced Cropping Instructions */}
      <InstructionsBox
        showInstructions={showInstructions}
        onToggleInstructions={toggleInstructions}
      />

      {/* PDF Canvas Container with Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Canvas */}
        <CanvasArea
          canvasRef={canvasRef}
          isPageLoading={isPageLoading}
          currentSelection={currentSelection}
          overlayPosition={overlayPosition}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          /** NEW: mevcut kırpımları sayfa üzerinde göster */
          existingOverlays={existingOverlays}
        />

        {/* Live Preview Panel */}
        <PreviewPanel
          showPreview={showPreview}
          previewImageData={previewImageData}
        />
      </div>

      {/* Action buttons */}
      <FooterActions
        questionsCount={questions.length}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      {/* Quality Information */}
      <QualityInfoBox
        scale={scale}
        recommendedScale={qualityInfo.recommendedScale}
        estimatedMemory={qualityInfo.estimatedMemory}
      />

      {/* Enhanced Cropping popup */}
      <CroppingPopup
        isOpen={showPopup}
        imageData={croppedImageData}
        onSave={handleQuestionSave}
        onCancel={handlePopupCancel}
      />
    </div>
  );
};

export default PDFCroppingScreen;
