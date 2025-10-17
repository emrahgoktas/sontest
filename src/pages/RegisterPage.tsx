import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, User, School, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/api';

/**
 * Register Page Component
 * Standalone registration page with navigation to action selection after success
 */

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    subject: '',
    gradeLevel: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Subject options
  const subjects = [
    'Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce',
    'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Edebiyat',
    'Almanca', 'Fransızca', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
  ];

  // Grade level options
  const gradeLevels = [
    'Anaokulu', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf',
    '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
    'Üniversite', 'Karma'
  ];

  /**
   * Form validation
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad zorunludur';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı zorunludur';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Update form field
   */
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear register error when user makes changes
    if (registerError) {
      setRegisterError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setRegisterError(null);

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: 'teacher',
        plan_type: 'free',
        school_name: formData.schoolName,
        subject: formData.subject,
        grade_level: formData.gradeLevel
      });

      if (result.success && result.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', result.token);
        
        // Save user info
        if (result.user) {
          const userInfo = {
            id: result.user.id,
            fullName: result.user.name,
            email: result.user.email,
            role: result.user.role || 'teacher',
            planType: result.user.plan_type || 'free',
            schoolName: result.user.school_name,
            subject: result.user.subject,
            gradeLevel: result.user.grade_level,
            createdAt: new Date(result.user.created_at),
            lastLoginAt: new Date()
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }

        // Redirect to action selection
        navigate('/action-selection');
      } else {
        setRegisterError(result.message || 'Kayıt olurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Register error:', error);
      setRegisterError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to login page
   */
  const handleLoginClick = () => {
    navigate('/login');
  };

  /**
   * Navigate back to welcome page
   */
  const handleBackToWelcome = () => {
    navigate('/');
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                     formData.password.length >= 6 && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hesap Oluşturun</h1>
          <p className="text-gray-600 mt-2">Ücretsiz hesabınızı oluşturun ve başlayın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Register Error */}
          {registerError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Kayıt Hatası</h4>
                <p className="text-sm text-red-700 mt-1">{registerError}</p>
              </div>
            </div>
          )}

          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Zorunlu Bilgiler
            </h3>
            
            <Input
              label="Ad Soyad"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="örn: Ahmet Yılmaz"
              error={errors.name}
              leftIcon={<User size={16} />}
              required
              disabled={isLoading}
            />

            <Input
              label="E-posta Adresi"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="örn: ahmet@okul.edu.tr"
              error={errors.email}
              leftIcon={<Mail size={16} />}
              helpText="Giriş yapmak için kullanılacak"
              required
              disabled={isLoading}
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
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Şifrenizi girin"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
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
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.confirmPassword
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
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

          {/* Optional Fields */}
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
              value={formData.schoolName}
              onChange={(e) => updateField('schoolName', e.target.value)}
              placeholder="örn: Atatürk İlkokulu"
              leftIcon={<School size={16} />}
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branş
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Branş seçin</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sınıf Seviyesi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => updateField('gradeLevel', e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Seviye seçin</option>
                    {gradeLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
            icon={UserPlus}
            fullWidth
            size="lg"
          >
            {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Button
              onClick={handleLoginClick}
              variant="ghost"
              size="sm"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isLoading}
            >
              Giriş Yap
            </Button>
          </p>
        </div>

        {/* Back to Welcome */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleBackToWelcome}
            icon={ArrowLeft}
            size="sm"
            disabled={isLoading}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
};