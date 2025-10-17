/**
 * Navigation system types for step and module management
 */

export type NavigationStep = 
  | 'upload' 
  | 'cropping' 
  | 'questions' 
  | 'generate'
  | 'question-editor'
  | 'online-exam'
  | 'booklet-creation';

export type NavigationModule = 
  | 'main' 
  | 'question-editor' 
  | 'online-exam' 
  | 'booklet-creator'
  | 'themed-test-builder';

export interface NavigationState {
  currentModule: NavigationModule;
  currentStep: NavigationStep;
  stepHistory: NavigationStep[];
  moduleHistory: NavigationModule[];
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface NavigationContext {
  navigationState: NavigationState;
  navigateToStep: (step: NavigationStep) => void;
  navigateToModule: (module: NavigationModule, step?: NavigationStep) => void;
  goBack: () => void;
  goForward: () => void;
  resetNavigation: () => void;
}

export interface StepNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onNavigateToModule?: (module: NavigationModule, step?: NavigationStep) => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
}