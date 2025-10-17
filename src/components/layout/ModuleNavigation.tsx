import React from 'react';
import { Upload, Edit, Monitor, FileText } from 'lucide-react';
import { AppStep } from '../../types';

/**
 * Module Navigation Component
 * Allows switching between different modules after wizard completion
 */

interface ModuleNavigationProps {
  currentView: 'main' | 'question-editor';
  navigateToModule: (view: 'main' | 'question-editor', step?: AppStep) => void;
}

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentView,
  navigateToModule
}) => {
  const modules = [
    {
      id: 'pdf-cropping',
      label: 'PDF Kırpma',
      icon: Upload,
      view: 'main' as const,
      step: 'upload' as AppStep,
      description: 'PDF\'den soru kırp'
    },
    {
      id: 'question-editor',
      label: 'Soru Editörü',
      icon: Edit,
      view: 'question-editor' as const,
      step: undefined as AppStep | undefined,
      description: 'Manuel soru oluştur'
    },
    {
      id: 'test-generator',
      label: 'Test Oluştur',
      icon: Monitor,
      view: 'main' as const,
      step: 'generate' as AppStep,
      description: 'Test ve kitapçık oluştur'
    }
  ];

  /**
   * Check if a module is currently active
   */
  const isModuleActive = (moduleView: 'main' | 'question-editor', moduleStep?: AppStep) => {
    if (currentView !== moduleView) return false;
    
    // For main view, also check the step if provided
    if (moduleView === 'main' && moduleStep) {
      // Get current step from URL hash or default logic
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash && ['upload', 'cropping', 'questions', 'generate'].includes(currentHash)) {
        return currentHash === moduleStep;
      }
      // Fallback to checking if we're in the right general area
      return true;
    }
    
    return true;
  };

  /**
   * Handle module navigation
   */
  const handleModuleClick = (view: 'main' | 'question-editor' | 'online-exam' | 'student-exam', step?: AppStep) => {
    // Update URL hash for better navigation tracking
    if (view === 'main' && step) {
      window.location.hash = step;
    } else if (view === 'question-editor') {
      window.location.hash = 'question-editor';
    } else if (view === 'online-exam') {
      window.location.hash = 'online-exam';
    }
    
    navigateToModule(view, step);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 py-4">
          {/* Module Navigation Title */}
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Modüller:</span>
          </div>

          {/* Module Buttons */}
          <div className="flex items-center space-x-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = isModuleActive(module.view, module.step);
              
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.view, module.step)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{module.label}</div>
                    <div className="text-xs opacity-75">{module.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};