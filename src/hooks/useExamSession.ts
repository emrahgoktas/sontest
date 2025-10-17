/**
 * Custom hook for managing exam session state
 * Handles persistence, auto-save, and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExamSession, ExamAnswer, Question, ExamConfig } from '../types/onlineExam';
import { saveExamProgress } from '../utils/onlineExamApi';

interface UseExamSessionProps {
  session: ExamSession | null;
  questions: Question[];
  config: ExamConfig | null;
  onTimeUp: () => void;
  onSessionUpdate: (session: ExamSession) => void;
}

export const useExamSession = ({
  session: initialSession,
  questions,
  config,
  onTimeUp,
  onSessionUpdate
}: UseExamSessionProps) => {
  const [session, setSession] = useState<ExamSession | null>(initialSession);
  const [timeRemaining, setTimeRemaining] = useState(initialSession?.timeRemaining ?? 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialSession?.currentQuestionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>(initialSession?.answers ?? {});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  /**
   * Persist session to localStorage
   */
  const persistSession = useCallback((sessionData: ExamSession) => {
    try {
      localStorage.setItem(`exam_session_${sessionData.id}`, JSON.stringify({
        ...sessionData,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  }, []);

  /**
   * Load session from localStorage
   */
  const loadPersistedSession = useCallback((sessionId: string): ExamSession | null => {
    try {
      const saved = localStorage.getItem(`exam_session_${sessionId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined
        };
      }
    } catch (error) {
      console.error('Error loading persisted session:', error);
    }
    return null;
  }, []);

  /**
   * Start timer
   */
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeUp]);

  /**
   * Stop timer
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Auto-save progress
   */
  const autoSave = useCallback(async () => {
    if (!session) return;
    
    const now = Date.now();
    if (now - lastSaveRef.current > 30000) { // Save every 30 seconds
      try {
        await saveExamProgress(session.id, answers, currentQuestionIndex);
        lastSaveRef.current = now;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [session?.id, answers, currentQuestionIndex]);

  /**
   * Update session state
   */
  const updateSession = useCallback((updates: Partial<ExamSession>) => {
    if (!session) return;
    
    const updatedSession = { ...session, ...updates };
    setSession(updatedSession);
    persistSession(updatedSession);
    onSessionUpdate(updatedSession);
  }, [session, persistSession, onSessionUpdate]);

  /**
   * Answer a question
   */
  const answerQuestion = useCallback((questionId: string, answer: string | boolean | string[], timeSpent: number = 0) => {
    const newAnswer: ExamAnswer = {
      questionId,
      answer,
      timeSpent,
      isCorrect: undefined // Will be calculated on submit
    };

    const newAnswers = { ...answers, [questionId]: newAnswer };
    setAnswers(newAnswers);
    
    updateSession({
      answers: newAnswers
    });
  }, [answers, updateSession]);

  /**
   * Navigate to question
   */
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      updateSession({
        currentQuestionIndex: index
      });
    }
  }, [questions.length, updateSession]);

  /**
   * Get exam progress
   */
  const getProgress = useCallback(() => {
    const answeredCount = Object.keys(answers).length;
    return {
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions: questions.length,
      answeredQuestions: answeredCount,
      percentage: Math.round((answeredCount / questions.length) * 100)
    };
  }, [answers, currentQuestionIndex, questions.length]);

  /**
   * Check if question is answered
   */
  const isQuestionAnswered = useCallback((questionId: string) => {
    return questionId in answers;
  }, [answers]);

  /**
   * Get answer for question
   */
  const getQuestionAnswer = useCallback((questionId: string) => {
    return answers[questionId]?.answer;
  }, [answers]);

  // Initialize timer on mount
  useEffect(() => {
    if (session && !session.isCompleted && !session.isPaused) {
      startTimer();
    }

    return () => {
      stopTimer();
    };
  }, [session?.isCompleted, session?.isPaused, startTimer, stopTimer]);

  // Auto-save setup
  useEffect(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    autoSaveRef.current = setInterval(autoSave, 10000); // Auto-save every 10 seconds

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSave]);

  // Update time remaining in session
  useEffect(() => {
    if (session) {
      updateSession({ timeRemaining });
    }
  }, [timeRemaining, updateSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [stopTimer]);

  return {
    session,
    timeRemaining,
    currentQuestionIndex,
    answers,
    answerQuestion,
    goToQuestion,
    getProgress,
    isQuestionAnswered,
    getQuestionAnswer,
    startTimer,
    stopTimer,
    loadPersistedSession,
    updateSession
  };
};