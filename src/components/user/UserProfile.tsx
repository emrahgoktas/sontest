import React, { useState } from 'react';
import { User, Mail, School, BookOpen, GraduationCap, CreditCard, Settings, Edit2, Save, X, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfileTabs } from '../profile/ProfileTabs';
import { UserInfo, PlanType } from '../../types/wizard';
import { AppStep } from '../../types';

/**
 * Kullanıcı Profili Bileşeni
 * Kullanıcı bilgilerini görüntüleme ve düzenleme
 */

interface UserProfileProps {
  userInfo: UserInfo;
  onUpdateUserInfo: (updatedInfo: UserInfo) => void;
  onNavigateToStep?: (step: AppStep) => void;
  onPlanUpgrade?: (newPlan: PlanType) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userInfo,
  onUpdateUserInfo,
  onNavigateToStep,
  onPlanUpgrade
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState<'profile' | 'tabs'>('profile');
  const [editedInfo, setEditedInfo] = useState<UserInfo>(userInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Düzenleme modunu başlat
   */
  const startEditing = () => {
    setEditedInfo(userInfo);
    setIsEditing(true);
    setErrors({});
  };

  /**
   * Düzenlemeyi iptal et
   */
  const cancelEditing = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
    setErrors({});
  };

  /**
   * Form validasyonu
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedInfo.fullName?.trim()) {
      newErrors.fullName = 'Ad Soyad zorunludur';
    }

    if (!editedInfo.email?.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedInfo.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Değişiklikleri kaydet
   */
  const saveChanges = () => {
    if (validateForm()) {
      onUpdateUserInfo(editedInfo);
      setIsEditing(false);
    }
  };

  /**
   * Form alanını güncelle
   */
  const updateField = (field: keyof UserInfo, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Plan adını getir
   */
  const getPlanName = (plan: PlanType) => {
    switch (plan) {
      case 'free': return 'Ücretsiz Plan';
      case 'pro': return 'Pro Plan';
      case 'premium': return 'Premium Plan';
      default: return 'Bilinmeyen Plan';
    }
  };

  /**
   * Plan rengini getir
   */
  const getPlanColor = (plan: PlanType) => {
    switch (plan) {
      case 'free': return 'text-green-600 bg-green-100 border-green-200';
      case 'pro': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'premium': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Branş seçenekleri
  const subjects = [
    'Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce',
    'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Edebiyat',
    'Almanca', 'Fransızca', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
  ];

  // Sınıf seviyeleri
  const gradeLevels = [
    'Anaokulu', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf',
    '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
    'Üniversite', 'Karma'
  ];

  // İçerik yönetimi gösteriliyorsa
  if (currentView === 'tabs') {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentView('profile')}
          >
            ← Profil Bilgilerine Dön
          </Button>
        </div>
        <ProfileTabs
          userInfo={userInfo}
          onUpdateUserInfo={onUpdateUserInfo}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Profili</h1>
              <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve düzenleyin</p>
            </div>
          </div>

          {!isEditing && (
            <Button
              onClick={startEditing}
              icon={Edit2}
              variant="outline"
            >
              Düzenle
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation Bar */}
      {onNavigateToStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Hızlı Erişim</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onNavigateToStep('upload')}
              className="bg-white"
            >
              PDF Yükleme
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onNavigateToStep('cropping')}
              className="bg-white"
            >
              Soru Kırpma
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onNavigateToStep('questions')}
              className="bg-white"
            >
              Soru Listesi
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onNavigateToStep('generate')}
              className="bg-white"
            >
              Test Oluştur
            </Button>
          </div>
        </div>
      )}
      
        {/* İçerik Yönetimi Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">İçerik Yönetimi</h2>
                <p className="text-blue-800 text-sm">
                  Testlerinizi, sorularınızı, kitapçıklarınızı ve online sınavlarınızı yönetin
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setCurrentView('tabs')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={CreditCard}
            >
              Profil Yönetim Panelini Aç
            </Button>
          </div>
        </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="mr-2" size={20} />
              Kişisel Bilgiler
            </h2>
            
            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  size="sm"
                  icon={X}
                >
                  İptal
                </Button>
                <Button
                  onClick={saveChanges}
                  size="sm"
                  icon={Save}
                >
                  Kaydet
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ad Soyad */}
            <div>
              {isEditing ? (
                <Input
                  label="Ad Soyad"
                  value={editedInfo.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  error={errors.fullName}
                  leftIcon={<User size={16} />}
                />
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-900">{userInfo.fullName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* E-posta */}
            <div>
              {isEditing ? (
                <Input
                  label="E-posta"
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail size={16} />}
                />
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">E-posta</label>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-900">{userInfo.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Okul Adı */}
            <div>
              {isEditing ? (
                <Input
                  label="Okul Adı"
                  value={editedInfo.schoolName || ''}
                  onChange={(e) => updateField('schoolName', e.target.value)}
                  leftIcon={<School size={16} />}
                />
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Okul Adı</label>
                  <div className="flex items-center space-x-2">
                    <School size={16} className="text-gray-400" />
                    <span className="text-gray-900">{userInfo.schoolName || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Branş */}
            <div>
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branş</label>
                  <select
                    value={editedInfo.subject || ''}
                    onChange={(e) => updateField('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Branş seçin</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Branş</label>
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className="text-gray-400" />
                    <span className="text-gray-900">{userInfo.subject || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sınıf Seviyesi */}
            <div>
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sınıf Seviyesi</label>
                  <select
                    value={editedInfo.gradeLevel || ''}
                    onChange={(e) => updateField('gradeLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seviye seçin</option>
                    {gradeLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Sınıf Seviyesi</label>
                  <div className="flex items-center space-x-2">
                    <GraduationCap size={16} className="text-gray-400" />
                    <span className="text-gray-900">{userInfo.gradeLevel || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Hesap Bilgileri
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Üyelik Tarihi</label>
              <div className="text-gray-900">
                {userInfo.createdAt.toLocaleDateString('tr-TR')}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Son Giriş</label>
              <div className="text-gray-900">
                {userInfo.lastLoginAt?.toLocaleDateString('tr-TR') || 'İlk giriş'}
              </div>
            </div>
          </div>
        </div>

        {/* Membership Plan */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Üyelik Planı
            </h2>
            
            {onPlanUpgrade && userInfo.planType !== 'premium' && (
              <Button
                onClick={() => onPlanUpgrade('premium')}
                variant="outline"
                size="sm"
              >
                Plan Yükselt
              </Button>
            )}
          </div>

          <div className={`inline-block px-4 py-2 rounded-lg border ${getPlanColor(userInfo.planType)}`}>
            <span className="font-medium">{getPlanName(userInfo.planType)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};