import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileText, Monitor, Edit, Sparkles, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Action Selection Page Component
 * Standalone page for selecting what action to perform
 */

export const ActionSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userPlan = userInfo.planType || 'free';

  const actions = [
    {
      id: 'test-creator',
      title: 'Test Oluştur',
      description: 'PDF\'den soru kırparak geleneksel test oluşturun',
      icon: FileText,
      color: 'blue',
      isLocked: false,
      requiredPlan: 'free',
      comingSoon: false
    },
    {
      id: 'online-exam',
      title: 'Online Sınav Oluştur',
      description: 'İnteraktif online sınavlar hazırlayın',
      icon: Monitor,
      color: 'green',
      isLocked: false,
      requiredPlan: 'free',
      comingSoon: false
    },
    {
      id: 'question-editor',
      title: 'Soru Editörü',
      description: 'Mevcut soruları düzenleyin ve yenilerini ekleyin',
      icon: Edit,
      color: 'purple',
      isLocked: userPlan === 'free',
      requiredPlan: 'pro',
      comingSoon: false
    },
    {
      id: 'ai-test-creator',
      title: 'Yapay Zeka ile Test Oluştur',
      description: 'AI destekli otomatik test ve soru oluşturma',
      icon: Sparkles,
      color: 'orange',
      isLocked: false,
      requiredPlan: 'premium',
      comingSoon: false,
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

    const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const navigateToAction = (actionId: string) => {
    switch (actionId) {
      case 'test-creator':
        // Clear any existing step state to start fresh
        localStorage.removeItem('currentStep');
        navigate('/test-creator');
        break;
      case 'question-editor':
        navigate('/manual-question-editor');
        break;
      case 'ai-test-creator':
        navigate('/ai-question-generator');
        break;
      case 'online-exam':
        navigate('/online-exam');
        break;
      default:
        localStorage.removeItem('currentStep');
        navigate('/test-creator');
    }
  };

  const handleActionSelect = (actionId: string, isLocked: boolean, comingSoon: boolean) => {
    if (isLocked || comingSoon) return;

    setSelectedAction(actionId);

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      navigateToAction(actionId);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Navigate back to welcome page or admin dashboard
   */
  const handleBack = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">İşlem Seçimi</h1>
                <p className="text-sm text-gray-500">Ne yapmak istediğinizi seçin</p>
              </div>
            </div>
            
            {userInfo.fullName && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userInfo.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {userInfo.planType === 'free' && 'Ücretsiz Plan'}
                  {userInfo.planType === 'pro' && 'Pro Plan'}
                  {userInfo.planType === 'premium' && 'Premium Plan'}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
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
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            icon={ArrowLeft}
          >
            {isAdmin ? 'Admin Paneline Dön' : 'Ana Sayfaya Dön'}
          </Button>

     
          {/* Profile Button */}
          {userInfo.fullName && (
            <Button
              variant="outline"
              onClick={() => {
                // Navigate to profile management
                localStorage.setItem('showUserProfile', 'true');
                window.location.href = '/test-creator';
              }}
              icon={User}
              size="sm"
            >
              Profil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
