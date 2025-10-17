/**
 * WIZARD sistemi için TypeScript tanımları
 */

// Wizard adımları
export type WizardStep = 'welcome' | 'login' | 'action-selection' | 'user-info' | 'membership' | 'dashboard';

// İşlem türleri
export type ActionType = 'test-creator' | 'online-exam' | 'question-editor' | 'ai-test-creator';

// Üyelik planları
export type PlanType = 'free' | 'pro' | 'premium';

// Kullanıcı bilgileri
export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Optional for registration
  schoolName?: string;
  subject?: string;
  role: 'admin' | 'teacher' | 'student';
  gradeLevel?: string;
  planType: PlanType;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Wizard durumu
export interface WizardState {
  currentStep: WizardStep;
  selectedAction: ActionType | null;
  userInfo: Partial<UserInfo>;
  isCompleted: boolean;
  completedSteps: WizardStep[];
}

// Üyelik planı özellikleri
export interface PlanFeatures {
  testCreationLimit: number | 'unlimited';
  bookletCreationLimit: number | 'unlimited';
  onlineExamLimit: number | 'unlimited';
  aiTestCreation: boolean;
  advancedThemes: boolean;
  prioritySupport: boolean;
  exportFormats: string[];
  storageLimit: string;
}

// Üyelik planı
export interface MembershipPlan {
  id: PlanType;
  name: string;
  description: string;
  price: number; // 0 for free
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: PlanFeatures;
  isPopular?: boolean;
  color: string;
}

// İşlem kartı
export interface ActionCard {
  id: ActionType;
  title: string;
  description: string;
  icon: string;
  isLocked: boolean;
  requiredPlan: PlanType;
  comingSoon?: boolean;
}

// Wizard navigasyon
export interface WizardNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: WizardStep | null;
  previousStep: WizardStep | null;
}