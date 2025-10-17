/**
 * Kitapçık sistemi için TypeScript tanımları
 */

import { CroppedQuestion, TestMetadata } from './index';
import { ThemeType } from './themes';

// Kitapçık versiyonu (A-H)
export type BookletVersion = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

// Kitapçık yapısı
export interface Booklet {
  id: string;
  version: BookletVersion;
  name: string;
  questions: CroppedQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

// Kitapçık seti (bir test için tüm versiyonlar)
export interface BookletSet {
  id: string;
  testId: string;
  metadata: TestMetadata;
  theme: ThemeType;
  booklets: Booklet[];
  createdAt: Date;
  updatedAt: Date;
}

// Optik form yapılandırması
export interface OptikFormConfig {
  id: string;
  name: string;
  questionCount: number;
  optionCount: 3 | 4 | 5; // A-C, A-D, A-E
  customSvg?: string; // Özel SVG template
  isDefault: boolean;
}

// Optik form
export interface OptikForm {
  id: string;
  bookletId: string;
  config: OptikFormConfig;
  svgContent: string;
  createdAt: Date;
}

// Test arşivi
export interface ArchivedTest {
  id: string;
  name: string;
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  bookletSet?: BookletSet;
  theme: ThemeType;
  createdAt: Date;
  tags: string[];
}

// Soru arşivi
export interface ArchivedQuestion {
  id: string;
  originalQuestionId: string;
  imageData: string;
  correctAnswer: string;
  tags: string[];
  sourceTest?: string;
  pageNumber?: number;
  createdAt: Date;
  usageCount: number;
}

// Online sınav yapılandırması
export interface OnlineExamConfig {
  id: string;
  testId: string;
  bookletId?: string;
  pdfId?: string; // Backend'deki PDF dosyası ID'si
  pdfUrl?: string; // Backend'deki PDF dosyası URL'si
  title: string;
  description?: string;
  timeLimit?: number; // dakika
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  allowReview: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Öğrenci cevabı
export interface StudentAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number; // saniye
  answeredAt: Date;
}

// Online sınav oturumu
export interface OnlineExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: StudentAnswer[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  isCompleted: boolean;
  currentQuestionIndex: number;
}

// Kitapçık oluşturma durumu
export interface BookletCreationState {
  currentStep: 'setup' | 'arrange' | 'preview' | 'generate';
  selectedVersions: BookletVersion[];
  booklets: Booklet[];
  optikForms: OptikForm[];
  isGenerating: boolean;
  error: string | null;
}