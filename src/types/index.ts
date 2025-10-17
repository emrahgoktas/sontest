/**
 * Core TypeScript interfaces for the PDF Test Cropping Application
 * Defines all data structures used throughout the application
 */

import * as pdfjsLib from 'pdfjs-dist';

// Application flow steps
export type AppStep = 'upload' | 'cropping' | 'questions' | 'generate';

// Test metadata interface
export interface TestMetadata {
  className?: string;
  courseName?: string;
  testName?: string;
  teacherName?: string;
  questionSpacing: number; // in mm
}

// Answer choices for multiple choice questions
export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E';

// Individual cropped question structure
export interface CroppedQuestion {
  id: string;
  imageData: string; // base64 encoded image
  correctAnswer: AnswerChoice;
  order: number;
  cropArea: CropArea;
  // Add actual pixel dimensions of the cropped image
  actualWidth: number;
  actualHeight: number;

  /**
   * NEW (optional, backward-compatible):
   * If the question was cropped from a specific PDF among multiple loaded PDFs,
   * this field links the crop to its source document.
   */
  sourceDocumentId?: string;
}

// Crop area coordinates and dimensions
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

// PDF file information
export interface PDFInfo {
  file: File;
  numPages: number;
  pageImages: string[]; // base64 encoded page images
  pdfDocument: pdfjsLib.PDFDocumentProxy; // Add PDF document object
}

/**
 * NEW:
 * Wrapper to manage multiple PDFs in the cropping screen without breaking the old single-pdf flow.
 */
export interface PDFDocumentInfo {
  id: string;       // stable identifier for linking crops -> document
  name: string;     // display name (usually the file name)
  pdfInfo: PDFInfo; // original PDF information
}

// Main application state interface
export interface AppState {
  currentStep: AppStep;

  /**
   * BACKWARD COMPAT:
   * Existing single-PDF state stays as-is so old flows keep working.
   */
  pdfInfo: PDFInfo | null;

  /**
   * NEW (optional):
   * When using multi-PDF cropping, keep documents here and point to the active one.
   * If unused, these can remain undefined/null and won't affect existing consumers.
   */
  documents?: PDFDocumentInfo[];
  activeDocumentId?: string | null;

  metadata: TestMetadata;
  questions: CroppedQuestion[];
  isLoading: boolean;
  error: string | null;
}

// Props interfaces for components
export interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export interface CroppingPopupProps {
  isOpen: boolean;
  imageData: string;
  onSave: (correctAnswer: AnswerChoice) => void;
  onCancel: () => void;
}

export interface QuestionCardProps {
  question: CroppedQuestion;
  onEdit: (question: CroppedQuestion) => void;
  onDelete: (questionId: string) => void;
}

// Saved test interface for localStorage
export interface SavedTest {
  id: string;
  title: string;
  description?: string;
  lesson: string;
  questions: CroppedQuestion[];
  metadata: TestMetadata;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  isPublic?: boolean;
  downloadCount?: number;
  theme?: string;
  isExternalPDF?: boolean; // Flag for PDF uploads
}

// Manual question interface for Question Editor
export interface ManualQuestion {
  id: string;
  questionText: string;
  imageData?: string; // Optional image upload
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: AnswerChoice;
  explanation?: string;
  order: number;
  createdAt: Date;
}

// Source type for test generation
export type TestSourceType = 'pdf' | 'manual';

// Drag and drop interfaces
export interface DragEndEvent {
  active: { id: string };
  over: { id: string } | null;
}
