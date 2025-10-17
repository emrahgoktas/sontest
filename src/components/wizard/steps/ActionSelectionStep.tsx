import React from 'react';
import { ArrowLeft, ArrowRight, FileText, Monitor, Edit, Sparkles, Lock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ActionType, PlanType } from '../../../types/wizard';

/**
 * İşlem Seçimi Adımı
 * Kullanıcının yapmak istediği işlemi seçmesini sağlar
 */

interface ActionSelectionStepProps {
  selectedAction: ActionType | null;
  userPlan: PlanType;
  onSelectAction: (action: ActionType) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ActionSelectionStep: React.FC<ActionSelectionStepProps> = ({
  selectedAction,
  userPlan,
  onSelectAction,
  onNext,
  onPrevious
}) => {
  const actions = [
    {
      id: 'test-creator' as ActionType,
      title: 'Test Oluştur',
      description: 'PDF\'den soru kırparak geleneksel test oluşturun',
      icon: FileText,
      color: 'blue',
      isLocked: false,
      requiredPlan: 'free' as PlanType,
      comingSoon: false
    },
    {
      id: 'online-exam' as ActionType,
      title: 'Online Sınav Oluştur',
      description: 'İnteraktif online sınavlar hazırlayın',
      icon: Monitor,
      color: 'green',
      isLocked: false,
      requiredPlan: 'free' as PlanType,
      comingSoon: false
    },
    {
      id: 'question-editor' as ActionType,
      title: 'Soru Editörü',
      description: 'Mevcut soruları düzenleyin ve yenilerini ekleyin',
      icon: Edit,
      color: 'purple',
      isLocked: userPlan === 'free',
      requiredPlan: 'pro' as PlanType,
      comingSoon: false
    },
    {
      id: 'ai-test-creator' as ActionType,
      title: 'Yapay Zeka ile Test Oluştur',
      description: 'AI destekli otomatik test ve soru oluşturma',
      icon: Sparkles,
      color: 'orange',
      isLocked: false, // AI özelliği aktif edildi
      requiredPlan: 'premium' as PlanType,
      comingSoon: false, // Artık aktif
      isPro: true
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean, isLocked: boolean) => {
    if (isLocked) {
      return 'border-gray-200 bg-gray-50 text-gray-400';
    }
    
    if (isSelected) {
      switch (color) {
        case 'blue': return 'border-blue-500 bg-blue-50 text-blue-700';
        case 'green': return 'border-green-500 bg-green-50 text-green-700';
        case 'purple': return 'border-purple-500 bg-purple-50 text-purple-700';
        case 'orange': return 'border-orange-500 bg-orange-50 text-orange-700';
        default: return 'border-blue-500 bg-blue-50 text-blue-700';
      }
    }
    
    return 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md';
  };

  const handleActionSelect = (action: ActionType, isLocked: boolean, comingSoon: boolean) => {
    if (isLocked || comingSoon) return;
    onSelectAction(action);
  };

  /**
   * Handle next button click
   */
  const handleNext = () => {
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Ne yapmak istiyorsunuz?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Aşağıdaki seçeneklerden birini seçerek devam edin. Her seçenek farklı özellikler ve araçlar sunar.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          const isLocked = action.isLocked;
          const comingSoon = action.comingSoon;
          
          return (
            <div
              key={action.id}
              onClick={() => handleActionSelect(action.id, isLocked, comingSoon)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${getColorClasses(action.color, isSelected, isLocked || comingSoon)}
                ${isLocked || comingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Pro Badge */}
              {action.isPro && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  PRO
                </div>
              )}

              {/* Coming Soon Badge */}
              {comingSoon && (
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Yakında
                </div>
              )}

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute top-4 right-4">
                  <Lock size={20} className="text-gray-400" />
                </div>
              )}

              <div className="space-y-4">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${isLocked || comingSoon 
                    ? 'bg-gray-200' 
                    : isSelected 
                    ? `bg-${action.color}-100` 
                    : `bg-${action.color}-50`
                  }
                `}>
                  <Icon size={24} className={
                    isLocked || comingSoon 
                      ? 'text-gray-400' 
                      : isSelected 
                      ? `text-${action.color}-600` 
                      : `text-${action.color}-500`
                  } />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {action.title}
                  </h3>
                  <p className={`text-sm ${
                    isLocked || comingSoon ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </div>

                {/* Plan Requirement */}
                {action.requiredPlan !== 'free' && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      action.requiredPlan === 'pro' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {action.requiredPlan === 'pro' ? 'Pro Plan Gerekli' : 'Premium Plan Gerekli'}
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && !isLocked && !comingSoon && (
                  <div className="flex items-center justify-center pt-2">
                    <div className={`w-6 h-6 bg-${action.color}-500 rounded-full flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Upgrade Notice */}
      {selectedAction && actions.find(a => a.id === selectedAction)?.isLocked && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="text-orange-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">
                Plan Yükseltmesi Gerekli
              </h4>
              <p className="text-sm text-orange-800">
                Bu özelliği kullanmak için {actions.find(a => a.id === selectedAction)?.requiredPlan === 'pro' ? 'Pro' : 'Premium'} plana yükseltmeniz gerekiyor. 
                Sonraki adımda plan seçimi yapabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon={ArrowLeft}
        >
          Geri
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!selectedAction}
          icon={ArrowRight}
          iconPosition="right"
        >
          {selectedAction ? 'Devam Et' : 'Lütfen bir seçenek seçin'}
        </Button>
      </div>
    </div>
  );
};