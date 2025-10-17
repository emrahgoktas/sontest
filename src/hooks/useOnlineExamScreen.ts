/**
 * Online Exam Screen Hook
 * Manages all state and logic for the online exam screen
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from './useExamSession';
import { 
  getExamDetails, 
  startExamSession, 
  submitExamAnswers,
  getExamSession 
} from '../utils/onlineExamApi';
import { ExamScreenState, ExamScreenActions } from '../types/onlineExamScreen';
import { ExamConfig, Question, ExamSession, ExamResult } from '../types/onlineExam';

export const useOnlineExamScreen = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  // Main state
  const [state, setState] = useState<ExamScreenState>({
    examConfig: null,
    questions: [],
    pdfPages: [],
    currentSession: null,
    examResult: null,
    currentQuestionIndex: 0,
    isLoading: true,
    error: null,
    showExitConfirm: false,
    isSubmitting: false
  });

  // Exam session hook
  const {
    session,
    timeRemaining,
    answers,
    answerQuestion,
    goToQuestion,
    getProgress,
    isQuestionAnswered,
    getQuestionAnswer,
    updateSession
  } = useExamSession({
    session: state.currentSession,
    questions: state.questions,
    config: state.examConfig,
    onTimeUp: handleTimeUp,
    onSessionUpdate: (session) => setState(prev => ({ ...prev, currentSession: session }))
  });

  /**
   * Load exam data on component mount
   */
  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  /**
   * Handle time up
   */
  function handleTimeUp() {
    handleSubmitExam();
  }

  /**
   * Load exam configuration and questions
   */
  const loadExamData = useCallback(async () => {
    if (!examId) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get exam details with fallback
      let examData;
      try {
        examData = await getExamDetails(examId);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        // If API fails, create mock data
        examData = {
          config: {
            id: examId,
            title: 'Demo Matematik Sınavı',
            description: 'Backend bağlantısı olmadan demo sınav',
            timeLimit: 60,
            totalQuestions: 10,
            totalPoints: 10,
            passingScore: 60,
            shuffleQuestions: false,
            allowReview: true,
            showResults: true,
            canStart: true,
            status: { status: 'active', can_start: true }
          },
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: `question_${i + 1}`,
            type: 'multiple-choice' as const,
            text: `Demo soru ${i + 1}: Aşağıdakilerden hangisi doğrudur?`,
            options: {
              A: `Seçenek A - ${i + 1}`,
              B: `Seçenek B - ${i + 1}`,
              C: `Seçenek C - ${i + 1}`,
              D: `Seçenek D - ${i + 1}`,
              E: `Seçenek E - ${i + 1}`
            },
            correctAnswer: ['A', 'B', 'C', 'D', 'E'][i % 5] as 'A' | 'B' | 'C' | 'D' | 'E',
            points: 1,
            order: i
          })),
          pdfPages: generateMockPDFPages()
        };
      }
      
      console.log('Loaded exam data:', {
        config: examData.config,
        questionsCount: examData.questions?.length,
        pdfPagesCount: examData.pdfPages?.length
      });
      
      // Validate that we have questions
      if (!examData.questions || examData.questions.length === 0) {
        console.warn('No questions found in exam data, but continuing with PDF display');
      }
      
      // Always set exam data first
      setState(prev => ({
        ...prev,
        examConfig: examData.config,
        questions: examData.questions || [],
        pdfPages: examData.pdfPages || []
      }));
      
      // Check if exam can be started
      if (examData.config.canStart === false) {
        const status = examData.config.status;
        let errorMessage = 'Sınav şu anda başlatılamıyor';
        
        if (status?.status === 'not_started') {
          const startDate = status.start_date_formatted || 'Belirtilmemiş';
          errorMessage = `Sınav henüz başlamamış.\n\nBaşlangıç zamanı: ${startDate}\n\nLütfen belirtilen zamanda tekrar deneyin.`;
        } else if (status?.status === 'expired') {
          const endDate = status.end_date_formatted || 'Belirtilmemiş';
          errorMessage = `Sınav süresi dolmuş.\n\nBitiş zamanı: ${endDate}\n\nBu sınava artık katılamazsınız.`;
        } else if (status?.status === 'inactive') {
          errorMessage = `Bu sınav henüz aktifleştirilmemiş.\n\nLütfen öğretmeninizle iletişime geçin.`;
        }
        
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        return;
      }
      
      // Check for existing session
      const savedSessionId = localStorage.getItem(`exam_session_${examId}`);
      if (savedSessionId) {
        try {
          const existingSession = await getExamSession(savedSessionId);
          setState(prev => ({
            ...prev,
            currentSession: existingSession,
            currentQuestionIndex: existingSession.currentQuestionIndex
          }));
        } catch (error) {
          console.warn('Could not load existing session, starting new one');
          await startNewSession();
        }
      } else {
        await startNewSession();
      }
      
    } catch (error) {
      console.error('Error loading exam data:', error);
      
      // Enhanced error handling for 403 Forbidden responses
      let errorMessage = 'Sınav yüklenirken hata oluştu';
      
      if (error instanceof Error) {
        // Try to extract detailed error information from API response
        const apiError = error as any;
        const responseData = apiError?.response?.data || apiError?.data || {};
        const errorData = responseData?.data || {};
        
        console.log('API Error Details:', { responseData, errorData });
        
        // Use the message from API response if available
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific 403 error cases with detailed messages
        if (apiError?.response?.status === 403 || error.message.includes('403')) {
          if (error.message.includes('başlamamış') || error.message.includes('not_started')) {
            const startDate = errorData?.start_date_formatted || 'Belirtilmemiş';
            errorMessage = `Sınav henüz başlamamış.\n\nBaşlangıç zamanı: ${startDate}\n\nLütfen belirtilen zamanda tekrar deneyin.`;
          } else if (error.message.includes('dolmuş') || error.message.includes('expired')) {
            const endDate = errorData?.end_date_formatted || 'Belirtilmemiş';
            errorMessage = `Sınav süresi dolmuş.\n\nBitiş zamanı: ${endDate}\n\nBu sınava artık katılamazsınız.`;
          } else if (error.message.includes('aktifleştirilmemiş') || error.message.includes('inactive')) {
            errorMessage = `Bu sınav henüz aktifleştirilmemiş.\n\nLütfen öğretmeninizle iletişime geçin.`;
          } else {
            errorMessage = `Sınava erişim engellendi.\n\n${error.message}`;
          }
        }
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [examId]);

  /**
   * Generate mock PDF pages for demo
   */
  const generateMockPDFPages = (): string[] => {
    const pages = [];
    
    // Sanitize Turkish characters for btoa encoding
    const sanitizeForBtoa = (text: string): string => {
      return text
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O');
    };
    
    // Page 1: Questions 1-8
    const page1Svg = `
      <svg width="595" height="842" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <rect x="20" y="20" width="555" height="802" fill="none" stroke="#e5e5e5" stroke-width="2"/>
        
        <!-- Header -->
        <text x="297.5" y="60" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#333">
          Demo Matematik Sinavi
        </text>
        <text x="297.5" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
          Sayfa 1 - Sorular 1-8
        </text>
        
        <!-- Questions Grid (2x4) -->
        ${Array.from({ length: 8 }, (_, i) => {
          const questionNum = i + 1;
          const row = Math.floor(i / 2);
          const col = i % 2;
          const x = 50 + (col * 250);
          const y = 120 + (row * 160);
          
          return `
            <!-- Question ${questionNum} Box -->
            <rect x="${x}" y="${y}" width="240" height="150" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
            <text x="${x + 10}" y="${y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#333">
              ${questionNum}.
            </text>
            
            <!-- Question content -->
            <rect x="${x + 10}" y="${y + 35}" width="220" height="70" fill="white" stroke="#e9ecef" stroke-width="1"/>
            <text x="${x + 120}" y="${y + 75}" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">
              Demo Soru ${questionNum}
            </text>
            
            <!-- Answer options -->
            <text x="${x + 10}" y="${y + 125}" font-family="Arial" font-size="11" fill="#495057">
              A) Secenek A   B) Secenek B   C) Secenek C
            </text>
            <text x="${x + 10}" y="${y + 140}" font-family="Arial" font-size="11" fill="#495057">
              D) Secenek D   E) Secenek E
            </text>
          `;
        }).join('')}
        
        <!-- Footer -->
        <text x="297.5" y="820" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
          Sayfa 1 / 2 • Demo Sinav
        </text>
      </svg>
    `;
    
    // Page 2: Questions 9-10
    const page2Svg = `
      <svg width="595" height="842" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <rect x="20" y="20" width="555" height="802" fill="none" stroke="#e5e5e5" stroke-width="2"/>
        
        <!-- Header -->
        <text x="297.5" y="60" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#333">
          Demo Matematik Sinavi
        </text>
        <text x="297.5" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
          Sayfa 2 - Sorular 9-10
        </text>
        
        <!-- Questions Grid (2 questions) -->
        ${Array.from({ length: 2 }, (_, i) => {
          const questionNum = i + 9;
          const col = i % 2;
          const x = 50 + (col * 250);
          const y = 120;
          
          return `
            <!-- Question ${questionNum} Box -->
            <rect x="${x}" y="${y}" width="240" height="150" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
            <text x="${x + 10}" y="${y + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#333">
              ${questionNum}.
            </text>
            
            <!-- Question content -->
            <rect x="${x + 10}" y="${y + 35}" width="220" height="70" fill="white" stroke="#e9ecef" stroke-width="1"/>
            <text x="${x + 120}" y="${y + 75}" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">
              Demo Soru ${questionNum}
            </text>
            
            <!-- Answer options -->
            <text x="${x + 10}" y="${y + 125}" font-family="Arial" font-size="11" fill="#495057">
              A) Secenek A   B) Secenek B   C) Secenek C
            </text>
            <text x="${x + 10}" y="${y + 140}" font-family="Arial" font-size="11" fill="#495057">
              D) Secenek D   E) Secenek E
            </text>
          `;
        }).join('')}
        
        <!-- Footer -->
        <text x="297.5" y="820" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
          Sayfa 2 / 2 • Demo Sinav
        </text>
      </svg>
    `;
    
    try {
      // Use safe base64 encoding for UTF-8 content
      pages.push(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(page1Svg)))}`);
      pages.push(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(page2Svg)))}`);
    } catch (encodingError) {
      console.warn('SVG encoding failed, using simple fallback:', encodingError);
      // Simple fallback without special characters
      const simpleSvg = `
        <svg width="595" height="842" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          <text x="297.5" y="400" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
            Demo Sinav
          </text>
          <text x="297.5" y="450" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
            10 soru mevcut
          </text>
        </svg>
      `;
      pages.push(`data:image/svg+xml;base64,${btoa(simpleSvg)}`);
      pages.push(`data:image/svg+xml;base64,${btoa(simpleSvg)}`);
    }
    
    return pages;
  };

  /**
   * Start new exam session
   */
  const startNewSession = useCallback(async () => {
    if (!examId) return;
    
    try {
      try {
        const newSession = await startExamSession(examId);
        setState(prev => ({ ...prev, currentSession: newSession }));
        localStorage.setItem(`exam_session_${examId}`, newSession.id);
      } catch (apiError) {
        console.warn('API session start failed, creating mock session:', apiError);
        
        // Create mock session directly
        const mockSession = {
          id: `mock_session_${Date.now()}`,
          examId: examId,
          userId: 'demo_student',
          startTime: new Date(),
          currentQuestionIndex: 0,
          answers: {},
          timeRemaining: 3600, // 60 minutes
          isCompleted: false,
          isPaused: false
        };
        
        setState(prev => ({ ...prev, currentSession: mockSession }));
        localStorage.setItem(`exam_session_${examId}`, mockSession.id);
      }
    } catch (error) {
      console.error('Error starting exam session:', error);
      setState(prev => ({
        ...prev,
        error: 'Sınav oturumu başlatılamadı.'
      }));
    }
  }, [examId]);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = useCallback((questionId: string, answer: string | boolean | string[]) => {
    if (!session || session.isCompleted) return;
    answerQuestion(questionId, answer);
  }, [session, answerQuestion]);

  /**
   * Navigate to specific question
   */
  const handleQuestionNavigation = useCallback((index: number) => {
    if (index >= 0 && index < state.questions.length) {
      setState(prev => ({ ...prev, currentQuestionIndex: index }));
      goToQuestion(index);
    }
  }, [state.questions.length, goToQuestion]);

  /**
   * Submit exam
   */
  const handleSubmitExam = useCallback(async () => {
    if (!session || !examId) return;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const result = await submitExamAnswers(session.id, answers);
      setState(prev => ({ ...prev, examResult: result }));
      
      // Clear session from localStorage
      localStorage.removeItem(`exam_session_${examId}`);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Sınav gönderilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [session, examId, answers]);

  /**
   * Handle exam exit
   */
  const handleExitExam = useCallback(() => {
    if (session && !session.isCompleted) {
      setState(prev => ({ ...prev, showExitConfirm: true }));
    } else {
      navigate('/');
    }
  }, [session, navigate]);

  /**
   * Confirm exam exit
   */
  const confirmExitExam = useCallback(() => {
    // Save current progress before exiting
    if (session) {
      updateSession({
        currentQuestionIndex: state.currentQuestionIndex,
        answers
      });
    }
    navigate('/');
  }, [session, state.currentQuestionIndex, answers, updateSession, navigate]);

  const actions: ExamScreenActions = {
    loadExamData,
    startNewSession,
    handleTimeUp,
    handleAnswerSelect,
    handleQuestionNavigation,
    handleSubmitExam,
    handleExitExam,
    confirmExitExam
  };

  return {
    state,
    setState,
    session,
    timeRemaining,
    answers,
    getProgress,
    isQuestionAnswered,
    getQuestionAnswer,
    actions
  };
};