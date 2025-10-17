/**
 * Online Exam API utilities
 * Handles all API communication for the online exam system
 */

import { ExamConfig, Question, ExamSession, ExamAnswer, ExamResult } from '../types/onlineExam';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * API request wrapper with authentication
 */
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Response parsing failed: ${response.statusText}`);
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
      (error as any).response = { data, status: response.status };
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Get available exams for student
 */
export const getAvailableExams = async (): Promise<ExamConfig[]> => {
  try {
    const response = await apiRequest('/student/exams');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching available exams:', error);
    return [];
  }
};

/**
 * Get exam details and questions
 */
export const getExamDetails = async (examId: string): Promise<{ 
  config: ExamConfig & { canStart: boolean; status: any }; 
  questions: Question[]; 
  pdfPages: string[] 
}> => {
  try {
    // First check localStorage for real PDF data from online exam creation
    const realPDFData = getRealPDFFromStorage(examId);
    
    if (realPDFData) {
      console.log('✅ Found real PDF data in localStorage:', realPDFData.pdfPages.length, 'pages');
      return realPDFData;
    }
    
    // Try API if no local data
    try {
      const response = await apiRequest(`/student/exams/${examId}`);
      console.log('✅ API response received:', response);
      return {
        config: response.data.config,
        questions: response.data.questions || [],
        pdfPages: response.data.pdfPages || []
      };
    } catch (apiError) {
      console.warn('⚠️ API failed, using fallback mock data:', apiError);
      return createFallbackExamData(examId);
    }
  } catch (error) {
    console.error('Error fetching exam details:', error);
    throw error;
  }
};

/**
 * Get real PDF data from localStorage (from online exam creation)
 */
const getRealPDFFromStorage = (examId: string): { 
  config: ExamConfig & { canStart: boolean; status: any }; 
  questions: Question[]; 
  pdfPages: string[] 
} | null => {
  try {
    console.log('🔍 Checking localStorage for PDF data...');
    
    // Check for online exam data in localStorage
    const onlineExamData = localStorage.getItem('onlineExamData');
    if (onlineExamData) {
      try {
        const examData = JSON.parse(onlineExamData);
      
        // Check if this is the right exam
        if (examData.examId === examId || examData.id === examId) {
          console.log('📄 Found online exam data in localStorage');
        
          // Get PDF data from separate storage
          const pdfData = localStorage.getItem('uploadedPDFData');
          let pdfPages: string[] = [];
        
          if (pdfData) {
            try {
              const parsedPdfData = JSON.parse(pdfData);
              pdfPages = parsedPdfData.pageImages || [];
              console.log('📄 Loaded PDF pages from storage:', pdfPages.length);
            } catch (error) {
              console.warn('Could not parse PDF data');
            }
          }
        
          // Create questions based on PDF pages or default
          let questions = [];
          if (pdfPages.length > 0) {
            questions = createMockQuestions(pdfPages.length * 8); // 8 questions per page
          } else {
            questions = createMockQuestions(10); // Default 10 questions
          }
        
          return {
            config: {
              id: examId,
              title: examData.title || 'Online Sınav',
              description: pdfPages.length > 0 ? 'Öğretmen tarafından yüklenen PDF' : 'Online Sınav',
              timeLimit: 60,
              totalQuestions: questions.length,
              totalPoints: questions.length,
              passingScore: 60,
              shuffleQuestions: false,
              allowReview: true,
              showResults: true,
              canStart: true,
              status: { status: 'active', can_start: true }
            },
            questions: questions,
            pdfPages: pdfPages
          };
        }
      } catch (parseError) {
        console.warn('Could not parse online exam data');
      }
    }
    
    // Check for PDF upload data
    const pdfUploadData = localStorage.getItem('uploadedPDFData');
    if (pdfUploadData) {
      const pdfData = JSON.parse(pdfUploadData);
      console.log('📄 Found uploaded PDF data in localStorage:', {
        pages: pdfData.pageImages?.length,
        compressed: pdfData.compressed,
        reduced: pdfData.reduced
      });
      
      return {
        config: {
          id: examId,
          title: pdfData.fileName ? `PDF Sınavı - ${pdfData.fileName}` : 'Yüklenen PDF Sınavı',
          description: `Öğretmen tarafından yüklenen PDF dökümanı${pdfData.compressed ? ' (Optimize edilmiş)' : ''}${pdfData.reduced ? ' (Azaltılmış)' : ''}`,
          timeLimit: 60,
          totalQuestions: pdfData.pageImages?.length * 8 || 10,
          totalPoints: pdfData.pageImages?.length * 8 || 10,
          passingScore: 60,
          shuffleQuestions: false,
          allowReview: true,
          showResults: true,
          canStart: true,
          status: { status: 'active', can_start: true }
        },
        questions: createMockQuestions(pdfData.pageImages?.length * 8 || 10),
        pdfPages: pdfData.pageImages || []
      };
    }
    
    console.log('❌ No PDF data found in localStorage');
    return null;
  } catch (error) {
    console.warn('Error reading PDF data from localStorage:', error);
    return null;
  }
};

/**
 * Create fallback exam data when no real data available
 */
const createFallbackExamData = (examId: string) => {
  const mockConfig: ExamConfig & { canStart: boolean; status: any } = {
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
  };
  
  const mockQuestions = createMockQuestions(10);
  const mockPdfPages = generateSimpleMockPDFPages();
  
  return {
    config: mockConfig,
    questions: mockQuestions,
    pdfPages: mockPdfPages
  };
};

/**
 * Create mock questions
 */
const createMockQuestions = (count: number): Question[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `question_${i + 1}`,
    type: 'multiple-choice',
    text: `Demo soru ${i + 1}: Asagidakilerden hangisi dogrudur?`,
    options: {
      A: `Secenek A - ${i + 1}`,
      B: `Secenek B - ${i + 1}`,
      C: `Secenek C - ${i + 1}`,
      D: `Secenek D - ${i + 1}`,
      E: `Secenek E - ${i + 1}`
    },
    correctAnswer: ['A', 'B', 'C', 'D', 'E'][i % 5] as 'A' | 'B' | 'C' | 'D' | 'E',
    points: 1,
    order: i
  }));
};

/**
 * Generate simple mock PDF pages (fallback)
 */
const generateSimpleMockPDFPages = (): string[] => {
  const pdfPages: string[] = [];
  
  // Create 2 simple demo pages
  for (let pageNum = 1; pageNum <= 2; pageNum++) {
    const simpleSvg = `
      <svg width="595" height="842" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="297.5" y="400" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
          Demo Sinav - Sayfa ${pageNum}
        </text>
        <text x="297.5" y="450" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
          Backend baglantisi olmadan demo
        </text>
      </svg>
    `;
    
    pdfPages.push(`data:image/svg+xml;base64,${btoa(simpleSvg)}`);
  }
  
  return pdfPages;
};

/**
 * Start exam session
 */
export const startExamSession = async (examId: string): Promise<ExamSession> => {
  try {
    try {
      const response = await apiRequest(`/student/exams/${examId}/start`, {
        method: 'POST'
      });
      return response.data;
    } catch (apiError) {
      console.warn('API start session failed, using mock session:', apiError);
      
      // Create mock session
      const mockSession: ExamSession = {
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
      
      return mockSession;
    }
  } catch (error) {
    console.error('Error starting exam session:', error);
    throw error;
  }
};

/**
 * Save exam progress
 */
export const saveExamProgress = async (sessionId: string, answers: Record<string, ExamAnswer>, currentQuestionIndex: number): Promise<void> => {
  try {
    await apiRequest(`/student/exam-sessions/${sessionId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({
        answers,
        currentQuestionIndex,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error saving exam progress:', error);
    // Don't throw error for progress saves to avoid interrupting exam
  }
};

/**
 * Submit exam answers
 */
export const submitExamAnswers = async (sessionId: string, answers: Record<string, ExamAnswer>): Promise<ExamResult> => {
  try {
    // Always use mock results since backend is not available
    console.warn('Using mock exam results (backend not available)');
    
    // Calculate mock results
    const answerArray = Object.values(answers);
    const correctAnswers = answerArray.filter(a => a.isCorrect).length;
    const totalQuestions = answerArray.length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    const mockResult: ExamResult = {
      sessionId: sessionId,
      examId: 'demo_exam',
      userId: 'demo_student',
      score: correctAnswers,
      percentage: percentage,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      unansweredQuestions: 0,
      timeSpent: 30, // Mock 30 minutes
      passed: percentage >= 60,
      completedAt: new Date(),
      questionResults: answerArray.map((answer, index) => ({
        questionId: answer.questionId,
        userAnswer: answer.answer,
        correctAnswer: ['A', 'B', 'C', 'D', 'E'][index % 5],
        isCorrect: answer.isCorrect || false,
        points: answer.isCorrect ? 1 : 0,
        timeSpent: answer.timeSpent || 0
      }))
    };
    
    return mockResult;
  } catch (error) {
    console.error('Error submitting exam answers:', error);
    throw error;
  }
};

/**
 * Get exam session (for resuming)
 */
export const getExamSession = async (sessionId: string): Promise<ExamSession> => {
  try {
    const response = await apiRequest(`/student/exam-sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam session:', error);
    throw error;
  }
};

/**
 * Pause exam session
 */
export const pauseExamSession = async (sessionId: string): Promise<void> => {
  try {
    await apiRequest(`/student/exam-sessions/${sessionId}/pause`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error pausing exam session:', error);
    throw error;
  }
};

/**
 * Resume exam session
 */
export const resumeExamSession = async (sessionId: string): Promise<void> => {
  try {
    await apiRequest(`/student/exam-sessions/${sessionId}/resume`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error resuming exam session:', error);
    throw error;
  }
};