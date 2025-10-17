import React from 'react';
import { Upload, Scissors, List, FileText, Check } from 'lucide-react';
import { AppStep } from '../../types';
import { UserInfo } from '../../types/wizard';

/**
 * Navigation component showing progress through the application steps
 * Provides visual feedback and step navigation
 */

interface NavigationProps {
  currentStep: AppStep;
  onStepChange: (step: AppStep) => void;
  currentUser?: UserInfo | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  onStepChange,
  currentUser
}) => {
  // Define the steps with their metadata
  const steps = [
    {
      key: 'upload' as AppStep,
      title: 'PDF Yükleme',
      description: 'PDF yükle ve bilgileri gir',
      icon: Upload
    },
    {
      key: 'cropping' as AppStep,
      title: 'Soru Kırpma',
      description: 'PDF\'den soruları kırp',
      icon: Scissors
    },
    {
      key: 'questions' as AppStep,
      title: 'Soru Listesi',
      description: 'Soruları düzenle ve sırala',
      icon: List
    },
    {
      key: 'generate' as AppStep,
      title: 'Test Oluştur',
      description: 'Testi oluştur ve indir',
      icon: FileText
    }
  ];

  // Get current step index
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  // Show navigation only if user is logged in
  if (!currentUser) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Progress bar */}
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.key === currentStep;
                const isCompleted = index < currentStepIndex;
                const isClickable = index <= currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => isClickable && onStepChange(step.key)}
                  >
                    {/* Step icon */}
                    <div className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                      }
                      ${isClickable ? 'group-hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                    `}>
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    
                    {/* Step info */}
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isActive 
                          ? 'text-blue-600' 
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="hidden sm:block text-xs text-gray-400 mt-1 max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};