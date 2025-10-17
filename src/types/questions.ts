/**
 * Question types for manual question creation
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SubjectType = 'matematik' | 'turkce' | 'fen' | 'sosyal' | 'ingilizce' | 'fizik' | 'kimya' | 'biyoloji' | 'tarih' | 'cografya' | 'other';

export interface ManualQuestion {
  id: string;
  questionText: string;
  imageData?: string; // Optional image upload (base64)
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation?: string;
  tags: string[];
  difficulty?: DifficultyLevel;
  subject?: SubjectType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionFormData {
  questionText: string;
  imageData?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation?: string;
  tags: string[];
  difficulty?: DifficultyLevel;
  subject?: SubjectType;
}

export interface QuestionValidationErrors {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctAnswer?: string;
  tags?: string;
  subject?: string;
}