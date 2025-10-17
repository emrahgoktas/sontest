/**
 * Profil sistemi için TypeScript tanımları
 */

import { CroppedQuestion, TestMetadata } from './index';
import { BookletSet, OnlineExamConfig, OnlineExamSession } from './booklet';
import { ThemeType } from './themes';

// Profil tab türleri
export type ProfileTab = 'overview' | 'questions' | 'tests' | 'booklets' | 'online-exams' | 'results';

// Kullanım istatistikleri
export interface UsageStats {
  testsCreated: number;
  questionsArchived: number;
  bookletsGenerated: number;
  onlineExamsCreated: number;
  totalStudents: number;
  storageUsed: number; // MB
  storageLimit: number; // MB
}

// Kaydedilmiş test
export interface SavedTest {
  id: string;
  name: string;
  metadata: TestMetadata;
  questions: CroppedQuestion[];
  theme: ThemeType;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
}

// Kaydedilmiş soru
export interface SavedQuestion {
  id: string;
  originalQuestionId: string;
  imageData: string;
  correctAnswer: string;
  tags: string[];
  sourceTest?: string;
  pageNumber?: number;
  createdAt: Date;
  usageCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
}

// Kitapçık özeti
export interface BookletSummary {
  id: string;
  testName: string;
  versions: string[];
  createdAt: Date;
  downloadCount: number;
  totalQuestions: number;
}

// Online sınav özeti
export interface OnlineExamSummary {
  id: string;
  title: string;
  isActive: boolean;
  participantCount: number;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  averageScore?: number;
}

// Sınav sonucu
export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentEmail?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  emptyAnswers: number;
  completionTime: number; // dakika
  completedAt: Date;
  percentage: number;
}

// Profil filtreleri
export interface ProfileFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchTerm?: string;
  sortBy?: 'date' | 'name' | 'usage';
  sortOrder?: 'asc' | 'desc';
}