import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from './components/user/UserProfile';
import { Layout } from './components/layout/Layout';
import { PDFUploadForm } from './components/forms/PDFUploadForm';
import { PDFCroppingScreen } from './components/pdf/PDFCroppingScreen';
import { useUser } from './contexts/UserContext';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QuestionsList } from './components/questions/QuestionsList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRoute } from './components/admin/AdminRoute';
import { ManualQuestionEditor } from './components/question-editor/ManualQuestionEditor';
import { AIQuestionGenerator } from './components/ai/AIQuestionGenerator';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Tests from './pages/admin/Tests';
import Booklets from './pages/admin/Booklets';
import OnlineExams from './pages/admin/OnlineExams';
import NotificationsPage from './pages/admin/NotificationsPage';
import Settings from './pages/admin/Settings';
import Plans from './pages/admin/Plans';
import { StudentExamInterface } from './components/onlineExam/StudentExamInterface';
import { OnlineExamConfig } from './types/booklet';
import { TestGenerator } from './components/test/TestGenerator';
import { AppStep, AppState, TestMetadata, PDFInfo, CroppedQuestion } from './types';
import { UserInfo, ActionType, WizardStep } from './types/wizard';
import AdminLogin from './pages/AdminLogin';
import OnlineExamScreen from './components/onlineExam/OnlineExamScreen';
import { OnlineExamCreator } from './components/onlineExam/OnlineExamCreator';
import { useLocation } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ActionSelectionPage } from './pages/ActionSelectionPage';

/**
 * Main Application Component
 * Direct access to all features without wizard
 */

const App: React.FC = () => {
  const { updateUserInfo: updateContextUserInfo } = useUser();
  const { isAdmin, currentUser: authUser, loading } = useAuth();
  const location = useLocation();
  
  // Initialize current user
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    const saved = localStorage.getItem('userInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastLoginAt: parsed.lastLoginAt ? new Date(parsed.lastLoginAt) : undefined
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [showUserProfile, setShowUserProfile] = useState(false);

  /**
   * Handle action selection
   */
const handleActionSelection = useCallback((action: ActionType) => {
  document.body.style.overflow = 'auto';
  document.body.classList.remove('modal-open', 'overflow-hidden', 'fixed');
  document.documentElement.style.overflow = 'auto';
  document.documentElement.style.pointerEvents = 'auto';
  console.log('✅ Unlocked overlay');

  // test-creator içinde kal
  if (action === 'test-creator') return;

  if (action === 'ai-test-creator') window.location.assign('/ai-question-generator');
  if (action === 'question-editor') window.location.assign('/manual-question-editor');
  if (action === 'online-exam') window.location.assign('/online-exam');
}, []);



  // Main application state
  const [appState, setAppState] = useState<AppState>(() => {
    // Initialize step from URL hash or localStorage
    const hash = window.location.hash.replace('#', '');
    const savedStep = localStorage.getItem('currentStep');
    const initialStep = (hash && ['upload', 'cropping', 'questions', 'generate'].includes(hash)) 
      ? hash as AppStep
      : (savedStep && ['upload', 'cropping', 'questions', 'generate'].includes(savedStep))
      ? savedStep as AppStep
      : 'upload';
    
    return {
      currentStep: initialStep,
      pdfInfo: null,
      metadata: {
        questionSpacing: 5 // Default 5mm spacing
      },
      questions: [],
      isLoading: false,
      error: null
    };
  });
  
  // Persist current step to localStorage and URL
  useEffect(() => {
    // Only persist step if on the test creator page to avoid interfering with admin routes
    if (currentUser && location.pathname.startsWith('/test-creator')) {
      localStorage.setItem('currentStep', appState.currentStep);
      window.history.replaceState(null, '', `#${appState.currentStep}`);
    }
  }, [appState.currentStep, currentUser, location.pathname]);
  
  // Listen for auth changes
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('userInfo');
    
    // Load user info if available
    if (token && userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setCurrentUser({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastLoginAt: parsed.lastLoginAt ? new Date(parsed.lastLoginAt) : undefined
        });
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }, [authUser, loading]);

  /**
   * Navigate to a specific step (render fazında çağrılsa bile uyarısız)
   */
  const navigateToStep = useCallback((step: AppStep) => {
    queueMicrotask(() => {
      setAppState(prev => ({ ...prev, currentStep: step }));
      window.history.replaceState(null, '', `#${step}`);
    });
  }, []);

  /**
   * Update metadata
   */
  const updateMetadata = (metadata: TestMetadata) => {
    setAppState(prev => ({ ...prev, metadata }));
  };

  /**
   * Handle PDF upload
   */
  const handlePDFUpload = (pdfInfo: PDFInfo) => {
    setAppState(prev => ({
      ...prev,
      pdfInfo,
      error: null
    }));
  };

  /** Add / Update / Delete / Reorder questions */
  const addQuestion = (question: CroppedQuestion) => {
    setAppState(prev => ({ ...prev, questions: [...prev.questions, question] }));
  };
  const updateQuestion = (updatedQuestion: CroppedQuestion) => {
    setAppState(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    }));
  };
  const deleteQuestion = (questionId: string) => {
    setAppState(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== questionId) }));
  };
  const reorderQuestions = (reorderedQuestions: CroppedQuestion[]) => {
    setAppState(prev => ({ ...prev, questions: reorderedQuestions }));
  };

  /** Restart */
  const restartApp = () => {
    setAppState({
      currentStep: 'upload',
      pdfInfo: null,
      metadata: { questionSpacing: 5 },
      questions: [],
      isLoading: false,
      error: null
    });
  };

  /** Navigation helpers */
  const handleNext = () => {
    const stepOrder: AppStep[] = ['upload', 'cropping', 'questions', 'generate'];
    const currentIndex = stepOrder.indexOf(appState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      navigateToStep(stepOrder[currentIndex + 1]);
    }
  };
  const handlePrevious = () => {
    const stepOrder: AppStep[] = ['upload', 'cropping', 'questions', 'generate'];
    const currentIndex = stepOrder.indexOf(appState.currentStep);
    if (currentIndex > 0) {
      navigateToStep(stepOrder[currentIndex - 1]);
    }
  };

  /** Kullanıcı bilgilerini güncelleme */
  const handleUpdateUserInfo = (updatedInfo: UserInfo) => {
    setCurrentUser(updatedInfo);
    updateContextUserInfo(updatedInfo);
    localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
  };

  /** Profilden adıma geçiş */
  const handleNavigateFromProfile = (step: AppStep) => {
    setShowUserProfile(false);
    navigateToStep(step);
  };

  /** Logout */
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('showActionSelection');
    setCurrentUser(null);
    setShowUserProfile(false);
    setAppState({
      currentStep: 'upload',
      pdfInfo: null,
      metadata: { questionSpacing: 5 },
      questions: [],
      isLoading: false,
      error: null
    });
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('auth_token') && !!localStorage.getItem('userInfo');
  
  // Check if user wants to see profile
  const showProfile = localStorage.getItem('showUserProfile') === 'true';
  
  // If not logged in, show welcome page
  if (!isLoggedIn) {
    return <WelcomePageRouter />;
  }
  
  // If user wants to see profile, redirect to test-creator with profile flag
  if (showProfile) {
    localStorage.removeItem('showUserProfile');
    localStorage.setItem('showProfileOnLoad', 'true');
  }
  
  return (
    <AppRouter 
      isAdmin={isAdmin} 
      currentUser={currentUser} 
      showUserProfile={showUserProfile}
      setShowUserProfile={setShowUserProfile}
      appState={appState}
      navigateToStep={navigateToStep}
      updateMetadata={updateMetadata}
      handlePDFUpload={handlePDFUpload}
      addQuestion={addQuestion}
      updateQuestion={updateQuestion}
      deleteQuestion={deleteQuestion}
      reorderQuestions={reorderQuestions}
      restartApp={restartApp}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      handleUpdateUserInfo={handleUpdateUserInfo}
      handleLogout={handleLogout}
    />
  );
};

/**
 * Welcome Page Router Component
 */
const WelcomePageRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/action-selection" element={<ActionSelectionPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

interface AppRouterProps {
  isAdmin: boolean;
  currentUser?: UserInfo | null;
  showUserProfile?: boolean;
  setShowUserProfile?: (show: boolean) => void;
  appState?: AppState;
  navigateToStep?: (step: AppStep) => void;
  updateMetadata?: (metadata: TestMetadata) => void;
  handlePDFUpload?: (pdfInfo: PDFInfo) => void;
  addQuestion?: (question: CroppedQuestion) => void;
  updateQuestion?: (updatedQuestion: CroppedQuestion) => void;
  deleteQuestion?: (questionId: string) => void;
  reorderQuestions?: (reorderedQuestions: CroppedQuestion[]) => void;
  restartApp?: () => void;
  handleNext?: () => void;
  handlePrevious?: () => void;
  handleUpdateUserInfo?: (updatedInfo: UserInfo) => void;
  handleLogout?: () => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ 
  isAdmin, 
  currentUser, 
  showUserProfile,
  setShowUserProfile,
  appState,
  navigateToStep,
  updateMetadata,
  handlePDFUpload,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  restartApp,
  handleNext,
  handlePrevious,
  handleUpdateUserInfo,
  handleLogout
}) => {
  const navigate = useNavigate();
  

  return (
    <Routes>
      {/* Admin Routes - Available to admin users */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } 
      />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/tests" element={<AdminRoute><Tests /></AdminRoute>} />
      <Route path="/admin/booklets" element={<AdminRoute><Booklets /></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><OnlineExams /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
      <Route path="/admin/plans" element={<AdminRoute><Plans /></AdminRoute>} />
      
      {/* Regular User Routes - Available to all users including admins */}
      <Route path="/" element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <ActionSelectionPage />} />
      <Route path="/action-selection" element={<ActionSelectionPage />} />
      <Route path="/manual-question-editor" element={<ManualQuestionEditor />} />
      <Route path="/ai-question-generator" element={<AIQuestionGenerator />} />
      <Route path="/online-exam" element={<OnlineExamCreator metadata={{ questionSpacing: 5 }} questions={[]} onCreateExam={() => {}} onBack={() => navigate('/action-selection')} />} />
      <Route path="/online-exam/:examId" element={<OnlineExamScreen />} />
      <Route path="/test-creator" element={
        <MainContent 
          currentUser={currentUser}
          showUserProfile={showUserProfile}
          setShowUserProfile={setShowUserProfile}
          appState={appState}
          navigateToStep={navigateToStep}
          updateMetadata={updateMetadata}
          handlePDFUpload={handlePDFUpload}
          addQuestion={addQuestion}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
          reorderQuestions={reorderQuestions}
          restartApp={restartApp}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handleUpdateUserInfo={handleUpdateUserInfo}
          handleLogout={handleLogout}
        />
      } />
      
      {/* Fallback Route */}
      <Route 
        path="*" 
        element={
          isAdmin ? 
          <Navigate to="/admin/dashboard" replace /> : 
          <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
};

interface MainContentProps {
  currentUser?: UserInfo | null;
  showUserProfile?: boolean;
  setShowUserProfile?: (show: boolean) => void;
  appState?: AppState;
  navigateToStep?: (step: AppStep) => void;
  updateMetadata?: (metadata: TestMetadata) => void;
  handlePDFUpload?: (pdfInfo: PDFInfo) => void;
  addQuestion?: (question: CroppedQuestion) => void;
  updateQuestion?: (updatedQuestion: CroppedQuestion) => void;
  deleteQuestion?: (questionId: string) => void;
  reorderQuestions?: (reorderedQuestions: CroppedQuestion[]) => void;
  restartApp?: () => void;
  handleNext?: () => void;
  handlePrevious?: () => void;
  handleUpdateUserInfo?: (updatedInfo: UserInfo) => void;
  handleLogout?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentUser,
  showUserProfile,
  setShowUserProfile,
  appState,
  navigateToStep,
  updateMetadata,
  handlePDFUpload,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  restartApp,
  handleNext,
  handlePrevious,
  handleUpdateUserInfo,
  handleLogout
}) => {
  const navigate = useNavigate();

  // Ensure the test builder wizard always starts from the first step when the module mounts
  useEffect(() => {
    localStorage.removeItem('currentStep');
    localStorage.removeItem('testBuilderStep');
    if (navigateToStep) {
      navigateToStep('upload');
    }
  }, [navigateToStep]);
  
  // Profil bayrağı ile açılış
  useEffect(() => {
    const showProfileOnLoad = localStorage.getItem('showProfileOnLoad');
    if (showProfileOnLoad === 'true') {
      localStorage.removeItem('showProfileOnLoad');
      queueMicrotask(() => setShowUserProfile && setShowUserProfile(true));
    }
  }, [setShowUserProfile]);
  
  // Remove the admin redirect from MainContent - admins should be able to use test creator
  // useEffect(() => {
  //   if (isAdmin && !loading) {
  //     navigate('/admin/dashboard');
  //   }
  // }, [isAdmin, loading, navigate]);

  // ⛑️ ÖNEMLİ: render içinde state güncellemesi yapma
  // cropping adımında pdfInfo yoksa güvenli şekilde upload'a dön
  useEffect(() => {
    if (appState?.currentStep === 'cropping' && !appState?.pdfInfo && navigateToStep) {
      navigateToStep('upload');
    }
  }, [appState?.currentStep, appState?.pdfInfo, navigateToStep]);
  
  // Kullanıcı profili gösteriliyorsa
  if (showUserProfile && currentUser) {
    return (
      <Layout
        currentStep={appState?.currentStep || 'upload'}
        onStepChange={navigateToStep!}
        currentUser={currentUser}
        onShowProfile={() => setShowUserProfile!(true)}
        onHideProfile={() => setShowUserProfile!(false)}
        onLogout={handleLogout!}
      >
        <UserProfile
          userInfo={currentUser}
          onUpdateUserInfo={handleUpdateUserInfo!}
          onNavigateToStep={navigateToStep}
        />
      </Layout>
    );
  }

  /**
   * Render current step component
   */
  const renderCurrentStep = () => {
    if (!appState) return null;
    
    switch (appState.currentStep) {
      case 'upload':
        return (
          <PDFUploadForm
            metadata={appState.metadata}
            onMetadataChange={updateMetadata!}
            onPDFUpload={handlePDFUpload!}
            onNext={handleNext!}
            isLoading={appState.isLoading}
          />
        );

      case 'cropping':
        if (!appState.pdfInfo) {
          // Yönlendirme effect'te yapılır; burada UI'ı boş bırakıyoruz
          return null;
        }
        return (
          <PDFCroppingScreen
            pdfInfo={appState.pdfInfo}
            questions={appState.questions}
            onQuestionAdd={addQuestion!}
            onNext={handleNext!}
            onPrevious={handlePrevious!}
          />
        );

      case 'questions':
        return (
          <QuestionsList
            questions={appState.questions}
            onQuestionsReorder={reorderQuestions!}
            onQuestionEdit={updateQuestion!}
            onQuestionDelete={deleteQuestion!}
            onNext={handleNext!}
            onPrevious={handlePrevious!}
          />
        );

      case 'generate':
        return (
          <TestGenerator
            metadata={appState.metadata}
            questions={appState.questions}
            onPrevious={handlePrevious!}
            onRestart={restartApp!}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      currentStep={appState?.currentStep || 'upload'}
      onStepChange={navigateToStep!}
      currentUser={currentUser}
      onShowProfile={() => setShowUserProfile!(true)}
      onHideProfile={() => setShowUserProfile!(false)}
      onLogout={handleLogout!}
    >
      {appState?.error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <h4 className="font-medium">Hata Oluştu</h4>
          <p className="text-sm mt-1">{appState.error}</p>
        </div>
      )}
      
      {renderCurrentStep()}
    </Layout>
  );
};

export default App;
