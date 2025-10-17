/**
 * Online Exam Types
 * Comprehensive type definitions for the online exam system
 */

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  order: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  correctAnswers: string[]; // Multiple possible correct answers
  caseSensitive: boolean;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion;

export interface ExamConfig {
  id: string;
  title: string;
  description?: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  allowReview: boolean;
  showResults: boolean;
}

export interface ExamAnswer {
  questionId: string;
  answer: string | boolean | string[];
  timeSpent: number; // in seconds
  isCorrect?: boolean;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  answers: Record<string, ExamAnswer>;
  timeRemaining: number; // in seconds
  isCompleted: boolean;
  isPaused: boolean;
}

export interface ExamResult {
  sessionId: string;
  examId: string;
  userId: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  timeSpent: number; // in minutes
  passed: boolean;
  completedAt: Date;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string | boolean | string[];
  correctAnswer: string | boolean | string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number;
}

export interface ExamProgress {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
}

/**
 * Student interface for taking exams
 */
export interface StudentExamInterface {
  examId: string;
  examTitle: string;
  questions: Question[];
  pdfUrl?: string; // URL to the PDF file for display
  timeLimit?: number;
  currentQuestionIndex: number;
  answers: Record<string, ExamAnswer>;
  isCompleted: boolean;
}

/**
 * Interactive answer form for students
 */
export interface InteractiveAnswerForm {
  questionId: string;
  questionNumber: number;
  selectedAnswer?: string;
  isAnswered: boolean;
  timeSpent: number;
}