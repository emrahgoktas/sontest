import React, { useState, useEffect } from 'react';
import { WelcomeStep } from './steps/WelcomeStep';
import { LoginStep } from './steps/LoginStep';
import { ActionSelectionStep } from './steps/ActionSelectionStep';
import { UserInfoStep } from './steps/UserInfoStep';
import { MembershipStep } from './steps/MembershipStep';
import { DashboardStep } from './steps/DashboardStep';
import { WizardProgress } from './WizardProgress';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { WizardState, WizardStep, ActionType, UserInfo, PlanType } from '../../types/wizard';
import { getCurrentUser } from '../../utils/api';

/**
 * Ana Wizard Container Bileşeni
 * Tüm wizard adımlarını yönetir ve localStorage ile durumu saklar
 */

interface WizardContainerProps {
  onComplete: (userInfo: UserInfo) => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ onComplete }) => {
  const { updateUserInfo: updateContextUserInfo } = useUser();
  const { checkAuth, currentUser: authUser } = useAuth();
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    // localStorage'dan mevcut durumu yükle
    const saved = localStorage.getItem('wizardState');
    const authToken = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('userInfo');
    const showActionSelection = localStorage.getItem('showActionSelection');
    
    // If user clicked "İşlem Seç" button, show action selection
    if (showActionSelection === 'true') {
      localStorage.removeItem('showActionSelection');
      return {
        currentStep: 'action-selection',
        selectedAction: null,
        userInfo: userInfo ? JSON.parse(userInfo) : {},
        isCompleted: false,
        completedSteps: ['welcome', 'login']
      };
    }
    
    // If user is already logged in and no action selection requested, skip wizard
    if (authToken && userInfo && !showActionSelection) {
      return {
        currentStep: 'dashboard',
        selectedAction: 'test-creator',
        userInfo: JSON.parse(userInfo),
        isCompleted: true,
        completedSteps: ['welcome', 'login', 'action-selection', 'user-info', 'membership']
      };
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userInfo: {
            ...parsed.userInfo,
            createdAt: parsed.userInfo.createdAt ? new Date(parsed.userInfo.createdAt) : undefined
          }
        };
      } catch {
        // Hatalı veri varsa token kontrolü yap
      }
    }
    
    // Eğer token varsa login adımına yönlendir
    const initialStep = authToken ? 'action-selection' : 'welcome';
    
    return {
      currentStep: initialStep,
      selectedAction: null,
      userInfo: {},
      isCompleted: false,
      completedSteps: []
    };
  });

  /**
   * Listen for custom navigation events
   */
  useEffect(() => {
    const handleWizardNavigate = (event: CustomEvent) => {
      if (event.detail && event.detail.step) {
        if (event.detail.step === 'question-editor') {
          // Complete wizard and navigate to question editor
          completeWizard();
        } else if (event.detail.step === 'online-exam') {
          // Complete wizard and navigate to online exam creator
          completeWizard();
        } else {
          goToStep(event.detail.step);
        }
      }
    };

    window.addEventListener('wizard-navigate', handleWizardNavigate as EventListener);
    return () => {
      window.removeEventListener('wizard-navigate', handleWizardNavigate as EventListener);
    };
  }, []);
  /**
   * Token ile otomatik giriş kontrolü
   */
  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (token && (wizardState.currentStep === 'welcome' || wizardState.currentStep === 'login')) {
        try {
          // Use the auth context to check authentication
          const isAuthenticated = await checkAuth();
          
          if (isAuthenticated) {
            // Get user info from localStorage (already set by AuthContext)
            const savedUserInfo = localStorage.getItem('userInfo');
            const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;

            setWizardState(prev => ({
              ...prev,
              userInfo,
              currentStep: 'action-selection'
            }));
          } else {
            // Token geçersiz, temizle
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('auth_token');
        }
      }
    };

    checkAuthToken();
  }, [wizardState.currentStep]);

  /**
   * Wizard durumunu localStorage'a kaydet
   */
  useEffect(() => {
    localStorage.setItem('wizardState', JSON.stringify(wizardState));
  }, [wizardState]);

  /**
   * Adım değiştirme
   */
  const goToStep = (step: WizardStep) => {
    setWizardState(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: prev.completedSteps.includes(prev.currentStep) 
        ? prev.completedSteps 
        : [...prev.completedSteps, prev.currentStep]
    }));
  };

  /**
   * İşlem seçimi
   */
  const selectAction = (action: ActionType) => {
    setWizardState(prev => ({
      ...prev,
      selectedAction: action
    }));
  };

  /**
   * Kullanıcı bilgilerini güncelleme
   */
  const updateUserInfo = (info: Partial<UserInfo>) => {
    setWizardState(prev => ({
      ...prev,
      userInfo: { ...prev.userInfo, ...info }
    }));
  };

  /**
   * Üyelik planı seçimi
   */
  const selectPlan = (planType: PlanType) => {
    updateUserInfo({ planType });
  };

  /**
   * Wizard'ı tamamlama
   */
  const completeWizard = () => {
    console.log('Completing wizard with state:', JSON.stringify(wizardState, null, 2));
    
    const userInfo: UserInfo = {
      id: `user_${Date.now()}`,
      fullName: wizardState.userInfo.fullName || authUser?.fullName || '',
      email: wizardState.userInfo.email || authUser?.email || '',
      password: wizardState.userInfo.password, // Include password for registration
      schoolName: wizardState.userInfo.schoolName,
      subject: wizardState.userInfo.subject || authUser?.subject || '',
      gradeLevel: wizardState.userInfo.gradeLevel,
      role: wizardState.userInfo.role || authUser?.role || 'teacher',
      planType: wizardState.userInfo.planType || authUser?.planType || 'free', // Ensure planType is set
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    console.log('Final user info for completion:', JSON.stringify(userInfo, null, 2));
    
    // localStorage'a kullanıcı bilgilerini kaydet
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // Update user context
    updateContextUserInfo(userInfo);
    
    setWizardState(prev => ({
      ...prev,
      isCompleted: true,
      userInfo: userInfo
    }));

    // Add a small delay to ensure state is updated before calling onComplete
    setTimeout(() => {
      console.log('Calling onComplete with:', JSON.stringify(userInfo, null, 2));
      onComplete(userInfo);
    }, 100);
  };

  /**
   * Login başarılı olduğunda
   */
  const handleLoginSuccess = async (token: string, user: any) => {
    const userInfo: UserInfo = {
      id: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role || 'teacher', // Ensure role is set
      planType: user.plan_type || 'free',
      createdAt: new Date(user.created_at),
      lastLoginAt: new Date()
    };
    
    // Save to localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // Update user context
    updateContextUserInfo(userInfo);
    
    setWizardState(prev => ({
      ...prev,
      userInfo,
      isCompleted: false
    }));
    
    // If user is admin, redirect to admin dashboard
    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard';
      return;
    }
    
    // All users go to action selection after login
    completeWizard();
  };

  /**
   * Wizard'ı sıfırlama
   */
  const resetWizard = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wizardState');
    localStorage.removeItem('userInfo');
    setWizardState({
      currentStep: 'welcome',
      selectedAction: null,
      userInfo: {},
      isCompleted: false,
      completedSteps: []
    });
  };

  /**
   * Mevcut adımın bileşenini render etme
   */
  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            onNext={() => {
              // Eğer token varsa action-selection'a, yoksa login'e yönlendir
              const token = localStorage.getItem('auth_token');
              if (token) {
                goToStep('action-selection');
              } else {
                goToStep('login');
              }
            }}
          />
        );

      case 'login':
        return (
          <LoginStep
            onNext={() => {
              // Login başarılı olduğunda action-selection'a yönlendir
              goToStep('action-selection');
            }}
            onRegister={() => {
              // Kayıt ol butonuna tıklandığında user-info adımına yönlendir
              goToStep('user-info');
            }}
            onBack={() => goToStep('welcome')}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'action-selection':
        return (
          <ActionSelectionStep
            selectedAction={wizardState.selectedAction}
            userPlan={wizardState.userInfo.planType || 'free'}
            onSelectAction={selectAction}
            onNext={() => {
              if (wizardState.selectedAction) {
                // Dispatch action selected event
                const event = new CustomEvent('actionSelected', { 
                  detail: { action: wizardState.selectedAction } 
                });
                window.dispatchEvent(event);
                
                // Complete wizard immediately after action selection
                setWizardState(prev => ({
                  ...prev,
                  isCompleted: true
                }));
              }
            }}
            onPrevious={() => {
              // Eğer token varsa welcome'a, yoksa login'e yönlendir
              const token = localStorage.getItem('auth_token');
              if (token) {
                goToStep('welcome');
              } else {
                goToStep('login');
              }
            }}
          />
        );

      case 'user-info':
        return (
          <UserInfoStep
            userInfo={wizardState.userInfo}
            onUpdateUserInfo={updateUserInfo}
            onNext={() => goToStep('membership')}
            onPrevious={() => goToStep('action-selection')}
          />
        );

      case 'membership':
        return (
          <MembershipStep
            selectedPlan={wizardState.userInfo.planType}
            onSelectPlan={selectPlan}
            onNext={() => goToStep('dashboard')}
            onPrevious={() => goToStep('user-info')}
          />
        );

      case 'dashboard':
        return (
          <DashboardStep
            userInfo={wizardState.userInfo as UserInfo}
            selectedAction={wizardState.selectedAction}
            onComplete={completeWizard}
            onPrevious={() => goToStep('action-selection')}
            onRestart={() => {
              localStorage.removeItem('auth_token');
              resetWizard();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      <WizardProgress
        currentStep={wizardState.currentStep}
        completedSteps={wizardState.completedSteps}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
};