import React from 'react';
import { BookPlus } from 'lucide-react';

/**
 * Step Header Component
 * Displays the title, description, and progress steps
 */

interface StepHeaderProps {
  currentStep: 'setup' | 'arrange' | 'preview' | 'generate';
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep
}) => {
  return (
    <>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-blue-600 rounded-lg p-2">
            <BookPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Kitapçık Oluşturucu
          </h2>
        </div>
        <p className="text-gray-600">
          Testinizi farklı versiyonlarda kitapçık haline getirin
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          {[
            { key: 'setup', label: 'Kurulum', icon: Settings },
            { key: 'arrange', label: 'Düzenleme', icon: BookPlus },
            { key: 'preview', label: 'Önizleme', icon: Eye },
            { key: 'generate', label: 'Oluştur', icon: Download }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = ['setup', 'arrange', 'preview', 'generate'].indexOf(currentStep) > 
                              ['setup', 'arrange', 'preview', 'generate'].indexOf(step.key);

            return (
              <div key={step.key} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isCompleted
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon size={20} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Import icons at the top to avoid reference errors
import { Settings, Eye, Download } from 'lucide-react';