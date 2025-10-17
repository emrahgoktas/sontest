import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Mail, School, BookOpen, GraduationCap, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useUser } from '../../../contexts/UserContext';
import { UserInfo } from '../../../types/wizard';

/**
 * Kullanıcı Bilgileri Adımı
 * Zorunlu ve isteğe bağlı kullanıcı bilgilerini toplar
 */

interface UserInfoStepProps {
  userInfo: Partial<UserInfo>;
  onUpdateUserInfo: (info: Partial<UserInfo>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
  userInfo,
  onUpdateUserInfo,
  onNext,
  onPrevious
}) => {
  const { updateUserInfo: updateGlobalUserInfo } = useUser();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Form validasyonu
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Zorunlu alanlar
    if (!userInfo.fullName?.trim()) {
      newErrors.fullName = 'Ad Soyad zorunludur';
    }

    if (!userInfo.email?.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Şifre zorunludur';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Şifre onayı zorunludur';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form alanını güncelleme
   */
  const updateField = (field: keyof UserInfo, value: string) => {
    onUpdateUserInfo({ [field]: value });
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Sonraki adıma geçiş
   */
  const handleNext = () => {
    if (validateForm()) {
      // Update global user context with the same information
      updateGlobalUserInfo({
        fullName: userInfo.fullName,
        email: userInfo.email,
        password: password, // Add password to user info
        schoolName: userInfo.schoolName,
        subject: userInfo.subject,
        gradeLevel: userInfo.gradeLevel
      });
      
      onNext();
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

  const isFormValid = userInfo.fullName?.trim() && userInfo.email?.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email) &&
                     password.length >= 6 && password === confirmPassword;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Bilgilerinizi Girin
        </h2>
        <p className="text-lg text-gray-600">
          Hesabınızı oluşturmak için gerekli bilgileri doldurun
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-6">
        {/* Zorunlu Alanlar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Zorunlu Bilgiler
          </h3>
          
          <Input
            label="Ad Soyad"
            value={userInfo.fullName || ''}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="örn: Ahmet Yılmaz"
            error={errors.fullName}
            leftIcon={<User size={16} />}
            required
          />

          <Input
            label="E-posta Adresi"
            type="email"
            value={userInfo.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="örn: ahmet@okul.edu.tr"
            error={errors.email}
            leftIcon={<Mail size={16} />}
            helpText="Giriş yapmak için kullanılacak"
            required
          />

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                placeholder="Şifrenizi girin"
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.password
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">En az 6 karakter olmalıdır</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre Onayı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Şifrenizi tekrar girin"
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.confirmPassword
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* İsteğe Bağlı Alanlar */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            İsteğe Bağlı Bilgiler
          </h3>
          <p className="text-sm text-gray-600">
            Bu bilgiler deneyiminizi kişiselleştirmemize yardımcı olur
          </p>
          
          <Input
            label="Okul Adı"
            value={userInfo.schoolName || ''}
            onChange={(e) => updateField('schoolName', e.target.value)}
            placeholder="örn: Atatürk İlkokulu"
            leftIcon={<School size={16} />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branş
              </label>
              <select
                value={userInfo.subject || ''}
                onChange={(e) => updateField('subject', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Branş seçin</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen size={16} className="text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf Seviyesi
              </label>
              <select
                value={userInfo.gradeLevel || ''}
                onChange={(e) => updateField('gradeLevel', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seviye seçin</option>
                {gradeLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Gizlilik Bildirimi</h4>
          <p className="text-sm text-blue-800">
            Bilgileriniz güvenli bir şekilde saklanır ve sadece hizmet kalitesini artırmak için kullanılır. 
            Üçüncü taraflarla paylaşılmaz.
          </p>
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
          onClick={handleNext}
          disabled={!isFormValid}
          icon={ArrowRight}
          iconPosition="right"
        >
          Devam Et
        </Button>
      </div>
    </div>
  );
};