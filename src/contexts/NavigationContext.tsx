import React, { createContext, useContext, useState, useCallback } from 'react';
import { NavigationState, NavigationContext, NavigationStep, NavigationModule } from '../types/navigation';

/**
 * Navigation Context for managing step and module navigation
 */

const initialNavigationState: NavigationState = {
  currentModule: 'main',
  currentStep: 'upload',
  stepHistory: ['upload'],
  moduleHistory: ['main'],
  canGoBack: false,
  canGoForward: false
};

const NavigationContextProvider = createContext<NavigationContext | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationState>(initialNavigationState);

  /**
   * Navigate to a specific step within current module
   */
  const navigateToStep = useCallback((step: NavigationStep) => {
    setNavigationState(prev => {
      const newHistory = [...prev.stepHistory];
      
      // Add to history if it's a new step
      if (prev.currentStep !== step) {
        newHistory.push(step);
      }

      return {
        ...prev,
        currentStep: step,
        stepHistory: newHistory,
        canGoBack: newHistory.length > 1,
        canGoForward: false // Reset forward navigation when making a new step
      };
    });
  }, []);

  /**
   * Navigate to a different module with optional step
   */
  const navigateToModule = useCallback((module: NavigationModule, step?: NavigationStep) => {
    setNavigationState(prev => {
      const newModuleHistory = [...prev.moduleHistory];
      const newStepHistory = step ? [step] : ['upload'];
      
      // Add to module history if it's a new module
      if (prev.currentModule !== module) {
        newModuleHistory.push(module);
      }

      return {
        ...prev,
        currentModule: module,
        currentStep: step || 'upload',
        moduleHistory: newModuleHistory,
        stepHistory: newStepHistory,
        canGoBack: newModuleHistory.length > 1 || newStepHistory.length > 1,
        canGoForward: false
      };
    });
  }, []);

  /**
   * Go back to previous step or module
   */
  const goBack = useCallback(() => {
    setNavigationState(prev => {
      // If we have step history, go back to previous step
      if (prev.stepHistory.length > 1) {
        const newStepHistory = [...prev.stepHistory];
        newStepHistory.pop(); // Remove current step
        const previousStep = newStepHistory[newStepHistory.length - 1];

        return {
          ...prev,
          currentStep: previousStep,
          stepHistory: newStepHistory,
          canGoBack: newStepHistory.length > 1 || prev.moduleHistory.length > 1,
          canGoForward: true
        };
      }
      
      // If no step history but have module history, go back to previous module
      if (prev.moduleHistory.length > 1) {
        const newModuleHistory = [...prev.moduleHistory];
        newModuleHistory.pop(); // Remove current module
        const previousModule = newModuleHistory[newModuleHistory.length - 1];

        return {
          ...prev,
          currentModule: previousModule,
          currentStep: 'upload', // Default step for previous module
          moduleHistory: newModuleHistory,
          stepHistory: ['upload'],
          canGoBack: newModuleHistory.length > 1,
          canGoForward: true
        };
      }

      return prev; // No change if can't go back
    });
  }, []);

  /**
   * Go forward (if available)
   */
  const goForward = useCallback(() => {
    // Implementation for forward navigation if needed
    // This would require storing forward history
  }, []);

  /**
   * Reset navigation to initial state
   */
  const resetNavigation = useCallback(() => {
    setNavigationState(initialNavigationState);
  }, []);

  const contextValue: NavigationContext = {
    navigationState,
    navigateToStep,
    navigateToModule,
    goBack,
    goForward,
    resetNavigation
  };

  return (
    <NavigationContextProvider.Provider value={contextValue}>
      {children}
    </NavigationContextProvider.Provider>
  );
};

export const useNavigation = (): NavigationContext => {
  const context = useContext(NavigationContextProvider);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};