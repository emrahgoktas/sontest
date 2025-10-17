import React from 'react';
import { ArrowLeft, Check, User, Mail, School, CreditCard, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '../../ui/Button';
import { UserInfo, ActionType, PlanType } from '../../../types/wizard';

/**
 * Dashboard ve Tamamlama Adımı
 * Kullanıcı bilgilerini özetler ve wizard'ı tamamlar
 */

interface DashboardStepProps {
  userInfo: UserInfo;
  selectedAction: ActionType | null;
  onComplete: () => void;
  onPrevious: () => void;
  onRestart: () => void;
}

export const DashboardStep: React.FC<DashboardStepProps> = ({
  userInfo,
  selectedAction,
  onComplete,
  onPrevious,
  onRestart
}) => {
  const getActionTitle = (action: ActionType | null) => {
    switch (action) {
      case 'test-creator': return 'Test Oluşturucu';
      case 'online-exam': return 'Online Sınav Oluşturucu';
      case 'question-editor': return 'Soru Editörü';
      case 'ai-test-creator': return 'AI Test Oluşturucu';
      default: return 'Seçilmemiş';
    }
  };

  const getPlanName = (plan: PlanType) => {
    switch (plan) {
      case 'free': return 'Ücretsiz Plan';
      case 'pro': return 'Pro Plan';
      case 'premium': return 'Premium Plan';
      default: return 'Bilinmeyen Plan';
    }
  };

  const getPlanColor = (plan: PlanType) => {
    switch (plan) {
      case 'free': return 'text-green-600 bg-green-100';
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'premium': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  /**
   * Handle complete button click
   */
  const handleCompleteClick = () => {
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Tebrikler! Hesabınız Hazır
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Bilgileriniz başarıyla kaydedildi. Artık güçlü araçlarımızı kullanmaya başlayabilirsiniz.
        </p>
      </div>

      {/* User Summary */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Hesap Özeti</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <User className="mr-2" size={18} />
              Kişisel Bilgiler
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center space-x-3">
                <User size={16} className="text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Ad Soyad:</span>
                  <div className="font-medium">{userInfo.fullName}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">E-posta:</span>
                  <div className="font-medium">{userInfo.email}</div>
                </div>
              </div>
              
              {userInfo.schoolName && (
                <div className="flex items-center space-x-3">
                  <School size={16} className="text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">Okul:</span>
                    <div className="font-medium">{userInfo.schoolName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <School className="mr-2" size={18} />
              Mesleki Bilgiler
            </h4>
            
            <div className="space-y-3 pl-6">
              {userInfo.subject && (
                <div>
                  <span className="text-sm text-gray-600">Branş:</span>
                  <div className="font-medium">{userInfo.subject}</div>
                </div>
              )}
              
              {userInfo.gradeLevel && (
                <div>
                  <span className="text-sm text-gray-600">Sınıf Seviyesi:</span>
                  <div className="font-medium">{userInfo.gradeLevel}</div>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-600">Seçilen İşlem:</span>
                <div className="font-medium">{getActionTitle(selectedAction)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard size={18} className="text-gray-600" />
              <div>
                <span className="text-sm text-gray-600">Üyelik Planı:</span>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${getPlanColor(userInfo.planType)}`}>
                  {getPlanName(userInfo.planType)}
                </div>
              </div>
            </div>
            
            {userInfo.planType === 'premium' && (
              <div className="flex items-center space-x-2 text-purple-600">
                <Sparkles size={16} />
                <span className="text-sm font-medium">AI Özellikli</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Sonraki Adımlar</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <div className="font-medium text-blue-900">Seçtiğiniz araca yönlendirileceksiniz</div>
              <div className="text-sm text-blue-700">{getActionTitle(selectedAction)} ile işe başlayın</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <div className="font-medium text-blue-900">İlk testinizi oluşturun</div>
              <div className="text-sm text-blue-700">Adım adım rehberlik ile kolayca başlayın</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <div className="font-medium text-blue-900">Özelleştirilmiş deneyimin keyfini çıkarın</div>
              <div className="text-sm text-blue-700">Seçtiğiniz plan özelliklerini kullanın</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Reminder */}
      {userInfo.planType !== 'free' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            {getPlanName(userInfo.planType)} Özellikleriniz
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span className="text-sm text-green-800">Sınırsız test oluşturma</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span className="text-sm text-green-800">Gelişmiş temalar</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span className="text-sm text-green-800">Öncelikli destek</span>
            </div>
            {userInfo.planType === 'premium' && (
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-green-600" />
                <span className="text-sm text-green-800">AI test oluşturma</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onPrevious}
            icon={ArrowLeft}
          >
            Geri
          </Button>
          
          <Button
            onClick={onRestart}
            icon={RotateCcw}
            className="text-gray-600"
          >
            Yeniden Başla
          </Button>
        </div>
      </div>
    </div>
  );
};