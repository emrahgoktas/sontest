import { useState, useCallback } from 'react';
import { CroppedQuestion, CropArea, AnswerChoice } from '../types';

/**
 * Custom hook for managing PDF cropping functionality
 * Handles cropping state, area selection, and question creation
 *
 * Multi-PDF ready (backward-compatible):
 * - `createQuestion` son parametre olarak opsiyonel `sourceDocumentId` alır.
 * - `activeDocumentId` state'i ile kırpımlar otomatik olarak aktif PDF'e etiketlenebilir.
 */
export const usePDFCropping = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<CropArea | null>(null);

  /**
   * NEW (optional):
   * When cropping across multiple PDFs, keep track of which document is active.
   * If you don't use multi-PDF, you can ignore these; everything works as before.
   */
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  /**
   * Start cropping selection on mouse down
   */
  const startSelection = useCallback((
    event: React.MouseEvent,
    pageNumber: number,
    position: { x: number; y: number }
  ) => {
    setIsSelecting(true);
    setSelectionStart(position);
    setCurrentSelection({
      x: position.x,
      y: position.y,
      width: 0,
      height: 0,
      pageNumber
    });
  }, []);

  /**
   * Update selection area on mouse move
   */
  const updateSelection = useCallback((
    event: React.MouseEvent,
    position: { x: number; y: number }
  ) => {
    if (!isSelecting || !selectionStart) return;

    const width = Math.abs(position.x - selectionStart.x);
    const height = Math.abs(position.y - selectionStart.y);
    const x = Math.min(position.x, selectionStart.x);
    const y = Math.min(position.y, selectionStart.y);

    setCurrentSelection(prev => prev ? {
      ...prev,
      x,
      y,
      width,
      height
    } : null);
  }, [isSelecting, selectionStart]);

  /**
   * Complete selection on mouse up
   */
  const completeSelection = useCallback((): CropArea | null => {
    setIsSelecting(false);
    setSelectionStart(null);

    // Return the final selection area
    const selection = currentSelection;
    setCurrentSelection(null);

    // Only return valid selections (minimum 20x20 pixels)
    if (selection && selection.width > 20 && selection.height > 20) {
      return selection;
    }

    return null;
  }, [currentSelection]);

  /**
   * Create a cropped question from image data with actual dimensions
   *
   * Backward-compatible signature:
   * - previous calls without `sourceDocumentId` keep working
   * - if provided, or if `activeDocumentId` is set, question will be tagged
   */
  const createQuestion = useCallback((
    imageData: string,
    cropArea: CropArea,
    correctAnswer: AnswerChoice,
    actualWidth: number,
    actualHeight: number,
    sourceDocumentId?: string
  ): CroppedQuestion => {
    const makeId = () => {
      try {
        // Prefer stable UUID when available
        return `question_${crypto.randomUUID()}`;
      } catch {
        return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    };

    return {
      id: makeId(),
      imageData,
      correctAnswer,
      order: 0, // Will be set when added to questions array
      cropArea,
      actualWidth,
      actualHeight,
      // tag with explicit sourceDocumentId if provided,
      // otherwise fall back to currently active document (if any)
      ...(sourceDocumentId || activeDocumentId
        ? { sourceDocumentId: sourceDocumentId ?? activeDocumentId ?? undefined }
        : {})
    };
  }, [activeDocumentId]);

  /**
   * Reset cropping state
   */
  const resetSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  }, []);

  return {
    // selection state
    isSelecting,
    currentSelection,

    // selection actions
    startSelection,
    updateSelection,
    completeSelection,
    resetSelection,

    // question factory
    createQuestion,

    // multi-PDF helpers (optional)
    activeDocumentId,
    setActiveDocumentId,
  };
};
