/**
 * Online Exam Screen Types
 * Type definitions specific to the online exam screen interface
 */

export interface ExamScreenState {
  examConfig: ExamConfig | null;
  questions: Question[];
  pdfPages: string[];
  currentSession: ExamSession | null;
  examResult: ExamResult | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  showExitConfirm: boolean;
  isSubmitting: boolean;
}

export interface ExamScreenActions {
  loadExamData: () => Promise<void>;
  startNewSession: () => Promise<void>;
  handleTimeUp: () => void;
  handleAnswerSelect: (questionId: string, answer: string | boolean | string[]) => void;
  handleQuestionNavigation: (index: number) => void;
  handleSubmitExam: () => Promise<void>;
  handleExitExam: () => void;
  confirmExitExam: () => void;
}

export interface PDFDisplayProps {
  pdfPages: string[];
  currentQuestionIndex: number;
  questions: Question[];
  isCompleted: boolean;
}

export interface AnswerFormProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, ExamAnswer>;
  onAnswerSelect: (questionId: string, answer: string) => void;
  onQuestionNavigation: (index: number) => void;
  isCompleted: boolean;
}

export interface ExamHeaderProps {
  examTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  timeLimit: number;
  onExitExam: () => void;
}

export interface ExamFooterProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitExam: () => void;
}

// Re-export from main types
export type {
  ExamConfig,
  Question,
  ExamSession,
  ExamAnswer,
  ExamResult,
  ExamProgress
} from './onlineExam';