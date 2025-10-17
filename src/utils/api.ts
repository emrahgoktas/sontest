/**
 * API utility functions for authentication and data operations
 * Real Laravel backend integration with Sanctum authentication
 */

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
      console.warn('Failed to parse JSON response:', parseError);
      throw new Error(`Response parsing failed: ${response.statusText}`);
    }

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication error, clearing tokens');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Only log non-auth errors to reduce console noise
    if (!error.message?.includes('401') && !error.message?.includes('403')) {
      console.error('API request failed:', error);
    }
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      return {
        success: true,
        token: response.token,
        user: response.user
      };
    }

    return {
      success: false,
      message: response.message || 'Giriş başarısız'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Giriş yapılırken bir hata oluştu'
    };
  }
};

/**
 * Register new user
 */
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  plan_type?: string;
  school_name?: string;
  subject?: string;
  grade_level?: string;
}): Promise<{
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      return {
        success: true,
        token: response.token,
        user: response.user
      };
    }

    return {
      success: false,
      message: response.message || 'Kayıt başarısız'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Kayıt olurken bir hata oluştu'
    };
  }
};

/**
 * Save test with questions to database
 */
export const saveTestToDatabase = async (testData: {
  title: string;
  description?: string;
  lesson: string;
  class_name?: string;
  teacher_name?: string;
  question_spacing?: number;
  theme?: string;
  watermark_config?: any;
  include_answer_key?: boolean;
  is_public?: boolean;
  tags?: string[];
  questions: any[];
}): Promise<{
  success: boolean;
  test?: any;
  message?: string;
}> => {
  try {
    // First create the test
    const testResponse = await apiRequest('/tests', {
      method: 'POST',
      body: JSON.stringify({
        title: testData.title,
        description: testData.description,
        lesson: testData.lesson,
        class_name: testData.class_name,
        teacher_name: testData.teacher_name,
        question_spacing: testData.question_spacing || 5,
        theme: testData.theme || 'classic',
        watermark_config: testData.watermark_config,
        include_answer_key: testData.include_answer_key ?? true,
        is_public: testData.is_public ?? false,
        tags: testData.tags || []
      }),
    });

    if (!testResponse.success) {
      return {
        success: false,
        message: testResponse.message || 'Test oluşturulamadı'
      };
    }

    const test = testResponse.data;

    // Then add questions to the test
    for (let i = 0; i < testData.questions.length; i++) {
      const question = testData.questions[i];
      
      const questionData = {
        question_text: question.questionText || null,
        image_data: question.imageData || null,
        options: question.options || null,
        correct_answer: question.correctAnswer,
        explanation: question.explanation || null,
        order_index: i,
        crop_area: question.cropArea || null,
        actual_width: question.actualWidth || null,
        actual_height: question.actualHeight || null,
        question_type: question.questionText ? 'manual' : 'cropped',
        difficulty: question.difficulty || null,
        subject: question.subject || null,
        tags: question.tags || []
      };

      await apiRequest(`/tests/${test.id}/questions`, {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
    }

    return {
      success: true,
      test: test,
      message: 'Test ve sorular başarıyla kaydedildi'
    };
  } catch (error) {
    console.error('Test kaydetme hatası:', error);
    return {
      success: false,
      message: 'Test kaydedilirken bir hata oluştu'
    };
  }
};

/**
 * Upload question image to server
 */
export const uploadQuestionImage = async (imageFile: File): Promise<{
  success: boolean;
  imageUrl?: string;
  imagePath?: string;
  message?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/questions/upload-image`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      imageUrl: data.data.url,
      imagePath: data.data.path,
      message: data.message
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      message: 'Görsel yüklenirken bir hata oluştu'
    };
  }
};

/**
 * Upload PDF file to backend server
 */
export const uploadPDFFile = async (pdfFile: File): Promise<{
  success: boolean;
  pdfUrl?: string;
  pdfId?: string;
  message?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      pdfUrl: data.data.url,
      pdfId: data.data.id,
      message: data.message
    };
  } catch (error) {
    console.error('PDF upload error:', error);
    return {
      success: false,
      message: 'PDF yüklenirken bir hata oluştu'
    };
  }
};

/**
 * Get PDF pages as high-resolution images from backend
 */
export const getPDFPages = async (pdfId: string): Promise<{
  success: boolean;
  pages?: string[];
  totalPages?: number;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/pdf/${pdfId}/pages`);
    
    return {
      success: response.success,
      pages: response.data.pages,
      totalPages: response.data.totalPages,
      message: response.message
    };
  } catch (error) {
    console.error('PDF pages fetch error:', error);
    return {
      success: false,
      message: 'PDF sayfaları alınırken bir hata oluştu'
    };
  }
};

/**
 * Save manual question to database
 */
export const saveManualQuestion = async (testId: string, questionData: {
  questionText: string;
  imageData?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  subject?: string;
  tags?: string[];
}): Promise<{
  success: boolean;
  question?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        question_text: questionData.questionText,
        image_data: questionData.imageData,
        options: questionData.options,
        correct_answer: questionData.correctAnswer,
        explanation: questionData.explanation,
        question_type: 'manual',
        difficulty: questionData.difficulty,
        subject: questionData.subject,
        tags: questionData.tags || []
      }),
    });

    return {
      success: response.success,
      question: response.data,
      message: response.message || (response.success ? 'Soru başarıyla kaydedildi' : 'Soru kaydedilemedi')
    };
  } catch (error) {
    console.error('Manual question save error:', error);
    return {
      success: false,
      message: 'Soru kaydedilirken bir hata oluştu'
    };
  }
};

/**
 * Save cropped question to database
 */
export const saveCroppedQuestion = async (testId: string, questionData: {
  imageData: string;
  correctAnswer: string;
  cropArea: any;
  actualWidth: number;
  actualHeight: number;
  orderIndex: number;
}): Promise<{
  success: boolean;
  question?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        image_data: questionData.imageData,
        correct_answer: questionData.correctAnswer,
        crop_area: questionData.cropArea,
        actual_width: questionData.actualWidth,
        actual_height: questionData.actualHeight,
        order_index: questionData.orderIndex,
        question_type: 'cropped'
      }),
    });

    return {
      success: response.success,
      question: response.data,
      message: response.message || (response.success ? 'Soru başarıyla kaydedildi' : 'Soru kaydedilemedi')
    };
  } catch (error) {
    console.error('Cropped question save error:', error);
    return {
      success: false,
      message: 'Soru kaydedilirken bir hata oluştu'
    };
  }
};

/**
 * Create booklet from test
 */
export const createBooklet = async (bookletData: {
  test_id: string;
  name: string;
  versions: string[];
  question_orders: any;
}): Promise<{
  success: boolean;
  booklet?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest('/booklets', {
      method: 'POST',
      body: JSON.stringify(bookletData),
    });

    return {
      success: response.success,
      booklet: response.data,
      message: response.message || (response.success ? 'Kitapçık başarıyla oluşturuldu' : 'Kitapçık oluşturulamadı')
    };
  } catch (error) {
    console.error('Booklet creation error:', error);
    return {
      success: false,
      message: 'Kitapçık oluşturulurken bir hata oluştu'
    };
  }
};

/**
 * Create online exam from test
 */
export const createOnlineExam = async (examData: {
  test_id: string;
  title: string;
  description?: string;
  time_limit?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_results?: boolean;
  allow_review?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}): Promise<{
  success: boolean;
  exam?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest('/online-exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });

    return {
      success: response.success,
      exam: response.data,
      message: response.message || (response.success ? 'Online sınav başarıyla oluşturuldu' : 'Online sınav oluşturulamadı')
    };
  } catch (error) {
    console.error('Online exam creation error:', error);
    return {
      success: false,
      message: 'Online sınav oluşturulurken bir hata oluştu'
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData: {
  name?: string;
  email?: string;
  school_name?: string;
  subject?: string;
  grade_level?: string;
}): Promise<{
  success: boolean;
  user?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    return {
      success: response.success,
      user: response.data,
      message: response.message || (response.success ? 'Profil başarıyla güncellendi' : 'Profil güncellenemedi')
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      message: 'Profil güncellenirken bir hata oluştu'
    };
  }
};

/**
 * Delete test
 */
export const deleteTest = async (testId: string): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/tests/${testId}`, {
      method: 'DELETE',
    });

    return {
      success: response.success,
      message: response.message || (response.success ? 'Test başarıyla silindi' : 'Test silinemedi')
    };
  } catch (error) {
    console.error('Test delete error:', error);
    return {
      success: false,
      message: 'Test silinirken bir hata oluştu'
    };
  }
};

/**
 * Update question
 */
export const updateQuestion = async (testId: string, questionId: string, questionData: any): Promise<{
  success: boolean;
  question?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/tests/${testId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });

    return {
      success: response.success,
      question: response.data,
      message: response.message || (response.success ? 'Soru başarıyla güncellendi' : 'Soru güncellenemedi')
    };
  } catch (error) {
    console.error('Question update error:', error);
    return {
      success: false,
      message: 'Soru güncellenirken bir hata oluştu'
    };
  }
};

/**
 * Delete question
 */
export const deleteQuestion = async (testId: string, questionId: string): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/tests/${testId}/questions/${questionId}`, {
      method: 'DELETE',
    });

    return {
      success: response.success,
      message: response.message || (response.success ? 'Soru başarıyla silindi' : 'Soru silinemedi')
    };
  } catch (error) {
    console.error('Question delete error:', error);
    return {
      success: false,
      message: 'Soru silinirken bir hata oluştu'
    };
  }
};

/**
 * Submit exam answers
 */
export const submitExamAnswers = async (examId: string, answers: any[]): Promise<{
  success: boolean;
  session?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/online-exams/${examId}/submit-answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });

    return {
      success: response.success,
      session: response.data,
      message: response.message || (response.success ? 'Sınav başarıyla tamamlandı' : 'Sınav tamamlanamadı')
    };
  } catch (error) {
    console.error('Exam submit error:', error);
    return {
      success: false,
      message: 'Sınav gönderilirken bir hata oluştu'
    };
  }
};

/**
 * Start exam session
 */
export const startExamSession = async (examId: string): Promise<{
  success: boolean;
  session?: any;
  message?: string;
}> => {
  try {
    const response = await apiRequest(`/online-exams/${examId}/start-session`, {
      method: 'POST',
    });

    return {
      success: response.success,
      session: response.data,
      message: response.message || (response.success ? 'Sınav oturumu başlatıldı' : 'Sınav oturumu başlatılamadı')
    };
  } catch (error) {
    console.error('Exam session start error:', error);
    return {
      success: false,
      message: 'Sınav oturumu başlatılırken bir hata oluştu'
    };
  }
};
/**
 * Logout user
 */
export const logoutUser = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });

    localStorage.removeItem('auth_token');
    return { success: true };
  } catch (error) {
    localStorage.removeItem('auth_token');
    return {
      success: false,
      message: 'Çıkış yapılırken bir hata oluştu'
    };
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (): Promise<{
  success: boolean;
  user?: any;
  isAdmin?: boolean;
  message?: string;
}> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'Token bulunamadı'
      };
    }

    const response = await apiRequest('/auth/me');

    if (response.success && response.user) {
      return {
        success: true,
        user: response.user,
        isAdmin: response.user.role === 'admin'
      };
    }

    return {
      success: false,
      message: response.message || 'Kullanıcı bilgileri alınamadı'
    };
  } catch (error) {
    localStorage.removeItem('auth_token');
    return {
      success: false,
      message: 'Kullanıcı bilgileri alınamadı'
    };
  }
};

/**
 * Test API functions
 */
export const testAPI = {
  // Get all tests
  getTests: async (params?: { search?: string; lesson?: string; per_page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.lesson) queryParams.append('lesson', params.lesson);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/tests${query ? `?${query}` : ''}`);
  },

  // Create test
  createTest: async (testData: any) => {
    return apiRequest('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  // Get test by ID
  getTest: async (id: string) => {
    return apiRequest(`/tests/${id}`);
  },

  // Update test
  updateTest: async (id: string, testData: any) => {
    return apiRequest(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData),
    });
  },

  // Delete test
  deleteTest: async (id: string) => {
    return apiRequest(`/tests/${id}`, {
      method: 'DELETE',
    });
  },

  // Duplicate test
  duplicateTest: async (id: string) => {
    return apiRequest(`/tests/${id}/duplicate`, {
      method: 'POST',
    });
  }
};

/**
 * Question API functions
 */
export const questionAPI = {
  // Get questions for a test
  getQuestions: async (testId: string) => {
    return apiRequest(`/tests/${testId}/questions`);
  },

  // Create question
  createQuestion: async (testId: string, questionData: any) => {
    return apiRequest(`/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  // Update question
  updateQuestion: async (testId: string, questionId: string, questionData: any) => {
    return apiRequest(`/tests/${testId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  // Delete question
  deleteQuestion: async (testId: string, questionId: string) => {
    return apiRequest(`/tests/${testId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  // Upload question image
  uploadImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE_URL}/questions/upload-image`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  },

  // Reorder questions
  reorderQuestions: async (testId: string, questions: any[]) => {
    return apiRequest(`/tests/${testId}/questions/reorder`, {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
  }
};

/**
 * Booklet API functions
 */
export const bookletAPI = {
  // Get all booklets
  getBooklets: async () => {
    return apiRequest('/booklets');
  },

  // Create booklet
  createBooklet: async (bookletData: any) => {
    return apiRequest('/booklets', {
      method: 'POST',
      body: JSON.stringify(bookletData),
    });
  },

  // Get booklets for a test
  getTestBooklets: async (testId: string) => {
    return apiRequest(`/tests/${testId}/booklets`);
  },

  // Download booklet
  downloadBooklet: async (bookletId: string, version?: string) => {
    const query = version ? `?version=${version}` : '';
    return apiRequest(`/booklets/${bookletId}/download${query}`);
  }
};

/**
 * Online Exam API functions
 */
export const onlineExamAPI = {
  // Get all online exams
  getOnlineExams: async () => {
    return apiRequest('/online-exams');
  },

  // Create online exam
  createOnlineExam: async (examData: any) => {
    return apiRequest('/online-exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  },

  // Get online exam by ID
  getOnlineExam: async (id: string) => {
    return apiRequest(`/online-exams/${id}`);
  },

  // Start exam session
  startExamSession: async (examId: string) => {
    return apiRequest(`/online-exams/${examId}/start-session`, {
      method: 'POST',
    });
  },

  // Submit exam answers
  submitExamAnswers: async (examId: string, answers: any[]) => {
    return apiRequest(`/online-exams/${examId}/submit-answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Get exam results
  getExamResults: async (examId: string) => {
    return apiRequest(`/online-exams/${examId}/results`);
  },

  // Toggle exam status
  toggleExamStatus: async (examId: string) => {
    return apiRequest(`/online-exams/${examId}/toggle-status`, {
      method: 'PATCH',
    });
  }
};

/**
 * Profile API functions
 */
export const profileAPI = {
  // Get user's tests
  getTests: async (params?: { search?: string; lesson?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.lesson) queryParams.append('lesson', params.lesson);
    
    const query = queryParams.toString();
    return apiRequest(`/profile/tests${query ? `?${query}` : ''}`);
  },

  // Get user's questions
  getQuestions: async (params?: { search?: string; difficulty?: string; subject?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.subject) queryParams.append('subject', params.subject);
    
    const query = queryParams.toString();
    return apiRequest(`/profile/questions${query ? `?${query}` : ''}`);
  },

  // Get user's booklets
  getBooklets: async (params?: { search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return apiRequest(`/profile/booklets${query ? `?${query}` : ''}`);
  },

  // Get user's online exams
  getOnlineExams: async (params?: { search?: string; is_active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/profile/online-exams${query ? `?${query}` : ''}`);
  },

  // Get user's exam results (for students)
  getResults: async (params?: { search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return apiRequest(`/profile/results${query ? `?${query}` : ''}`);
  },

  // Get user statistics
  getStatistics: async () => {
    return apiRequest('/profile/statistics');
  }
};

/**
 * Admin API functions
 */
export const adminAPI = {
  // Get all users
  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard-stats');
  }
};

/**
 * Create default admin user (for development)
 */
export const createDefaultAdminUser = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  // This will be handled by Laravel seeder
  return { success: true, message: 'Admin kullanıcı Laravel seeder ile oluşturulacak' };
};