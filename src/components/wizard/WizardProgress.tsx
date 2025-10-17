import React from 'react';
import { Check, User, Settings, CreditCard, Home } from 'lucide-react';
import { WizardStep } from '../../types/wizard';

/**
 * Wizard İlerleme Çubuğu Bileşeni
 * Kullanıcının hangi adımda olduğunu ve tamamlanan adımları gösterir
 */

interface WizardProgressProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  completedSteps
}) => {
  const steps = [
    { key: 'welcome', label: 'Başla', icon: Home },
    { key: 'login', label: 'Giriş', icon: User },
    { key: 'action-selection', label: 'İşlem Seç', icon: Settings },
    { key: 'user-info', label: 'Bilgiler', icon: Settings },
    { key: 'membership', label: 'Üyelik', icon: CreditCard },
    { key: 'dashboard', label: 'Tamamla', icon: Check }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const isStepCompleted = (stepKey: string) => {
    return completedSteps.includes(stepKey as WizardStep);
  };

  const isStepActive = (stepKey: string) => {
    return currentStep === stepKey;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step.key);
            const isActive = isStepActive(step.key);
            const isAccessible = index <= currentIndex;

            return (
              <div key={step.key} className="flex items-center">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : isAccessible
                      ? 'bg-white border-gray-300 text-gray-600'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <Check size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isActive 
                        ? 'text-blue-600' 
                        : isCompleted
                        ? 'text-green-600'
                        : isAccessible
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 sm:w-16 h-0.5 mx-4 transition-colors duration-300
                    ${index < currentIndex ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Labels */}
        <div className="sm:hidden mt-3 text-center">
          <p className="text-sm font-medium text-gray-700">
            {steps[currentIndex]?.label}
          </p>
          <p className="text-xs text-gray-500">
            Adım {currentIndex + 1} / {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
};