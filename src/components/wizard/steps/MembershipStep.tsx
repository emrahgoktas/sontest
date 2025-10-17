import React from 'react';
import { ArrowLeft, ArrowRight, Check, Star, Zap, Crown } from 'lucide-react';
import { Button } from '../../ui/Button';
import { PlanType, MembershipPlan } from '../../../types/wizard';

/**
 * Üyelik Planı Seçimi Adımı
 * Kullanıcının üyelik planını seçmesini sağlar
 */

interface MembershipStepProps {
  selectedPlan?: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const MembershipStep: React.FC<MembershipStepProps> = ({
  selectedPlan,
  onSelectPlan,
  onNext,
  onPrevious
}) => {
  // Log when plan selection changes
  const handlePlanSelection = (plan: PlanType) => {
    console.log('Plan selected:', plan);
    // Ensure the plan is immediately saved to localStorage for persistence
    const wizardState = JSON.parse(localStorage.getItem('wizardState') || '{}');
    const updatedWizardState = {
      ...wizardState,
      userInfo: {
        ...wizardState.userInfo,
        planType: plan
      }
    };
    localStorage.setItem('wizardState', JSON.stringify(updatedWizardState));
    
    onSelectPlan(plan);
  };
  
  const plans: MembershipPlan[] = [
    {
      id: 'free',
      name: 'Ücretsiz Plan',
      description: 'Başlamak için ideal',
      price: 0,
      currency: 'TL',
      period: 'lifetime',
      color: 'green',
      features: {
        testCreationLimit: 5,
        bookletCreationLimit: 1,
        onlineExamLimit: 2,
        aiTestCreation: false,
        advancedThemes: false,
        prioritySupport: false,
        exportFormats: ['PDF'],
        storageLimit: '100MB'
      }
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Profesyonel öğretmenler için',
      price: 29,
      currency: 'TL',
      period: 'monthly',
      color: 'blue',
      isPopular: true,
      features: {
        testCreationLimit: 'unlimited',
        bookletCreationLimit: 'unlimited',
        onlineExamLimit: 'unlimited',
        aiTestCreation: false,
        advancedThemes: true,
        prioritySupport: true,
        exportFormats: ['PDF', 'Word', 'Excel'],
        storageLimit: '5GB'
      }
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Tüm özelliklere erişim',
      price: 49,
      currency: 'TL',
      period: 'monthly',
      color: 'purple',
      features: {
        testCreationLimit: 'unlimited',
        bookletCreationLimit: 'unlimited',
        onlineExamLimit: 'unlimited',
        aiTestCreation: true,
        advancedThemes: true,
        prioritySupport: true,
        exportFormats: ['PDF', 'Word', 'Excel', 'PowerPoint'],
        storageLimit: '20GB'
      }
    }
  ];

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case 'free': return Star;
      case 'pro': return Zap;
      case 'premium': return Crown;
      default: return Star;
    }
  };

  const getPlanColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'green': return 'border-green-500 bg-green-50';
        case 'blue': return 'border-blue-500 bg-blue-50';
        case 'purple': return 'border-purple-500 bg-purple-50';
        default: return 'border-blue-500 bg-blue-50';
      }
    }
    return 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md';
  };

  const formatFeatureValue = (value: number | string) => {
    if (value === 'unlimited') return 'Sınırsız';
    if (typeof value === 'number') return value.toString();
    return value;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Üyelik Planınızı Seçin
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          İhtiyaçlarınıza en uygun planı seçin. İstediğiniz zaman plan değiştirebilirsiniz.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.id);
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => handlePlanSelection(plan.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${getPlanColorClasses(plan.color, isSelected)}
              `}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    EN POPÜLER
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Plan Header */}
                <div className="text-center">
                  <div className={`
                    w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3
                    ${isSelected 
                      ? `bg-${plan.color}-100` 
                      : `bg-${plan.color}-50`
                    }
                  `}>
                    <Icon size={24} className={`text-${plan.color}-600`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {plan.description}
                  </p>
                  
                  <div className="text-center">
                    {plan.price === 0 ? (
                      <div className="text-2xl font-bold text-gray-900">
                        Ücretsiz
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.price} {plan.currency}
                        </span>
                        <span className="text-gray-600">/{plan.period === 'monthly' ? 'ay' : 'yıl'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Test Oluşturma:</span>
                    <span className="font-medium">{formatFeatureValue(plan.features.testCreationLimit)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kitapçık Oluşturma:</span>
                    <span className="font-medium">{formatFeatureValue(plan.features.bookletCreationLimit)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Online Sınav:</span>
                    <span className="font-medium">{formatFeatureValue(plan.features.onlineExamLimit)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Depolama:</span>
                    <span className="font-medium">{plan.features.storageLimit}</span>
                  </div>

                  {/* Premium Features */}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center text-sm">
                      {plan.features.aiTestCreation ? (
                        <Check size={16} className="text-green-600 mr-2" />
                      ) : (
                        <div className="w-4 h-4 mr-2" />
                      )}
                      <span className={plan.features.aiTestCreation ? 'text-gray-900' : 'text-gray-400'}>
                        AI Test Oluşturma
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      {plan.features.advancedThemes ? (
                        <Check size={16} className="text-green-600 mr-2" />
                      ) : (
                        <div className="w-4 h-4 mr-2" />
                      )}
                      <span className={plan.features.advancedThemes ? 'text-gray-900' : 'text-gray-400'}>
                        Gelişmiş Temalar
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      {plan.features.prioritySupport ? (
                        <Check size={16} className="text-green-600 mr-2" />
                      ) : (
                        <div className="w-4 h-4 mr-2" />
                      )}
                      <span className={plan.features.prioritySupport ? 'text-gray-900' : 'text-gray-400'}>
                        Öncelikli Destek
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="flex items-center justify-center pt-4">
                    <div className={`w-6 h-6 bg-${plan.color}-500 rounded-full flex items-center justify-center`}>
                      <Check size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Karşılaştırması</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Özellik</th>
                <th className="text-center py-2">Ücretsiz</th>
                <th className="text-center py-2">Pro</th>
                <th className="text-center py-2">Premium</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Test Oluşturma</td>
                <td className="text-center py-2">5 adet</td>
                <td className="text-center py-2">Sınırsız</td>
                <td className="text-center py-2">Sınırsız</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">AI Test Oluşturma</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Gelişmiş Temalar</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
                <td className="text-center py-2">✅</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Öncelikli Destek</td>
                <td className="text-center py-2">❌</td>
                <td className="text-center py-2">✅</td>
                <td className="text-center py-2">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
          onClick={onNext}
          disabled={!selectedPlan}
          className={`${!selectedPlan ? 'opacity-50 cursor-not-allowed' : ''} px-8`}
          icon={ArrowRight}
          iconPosition="right"
        >
          {selectedPlan ? 'Devam Et' : 'Lütfen bir plan seçin'}
        </Button>
      </div>
    </div>
  );
};