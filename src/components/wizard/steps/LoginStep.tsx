import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus, Info, Settings } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Login Step Component
 * Allows users to login with email and password
 */

interface LoginStepProps {
  onNext: () => void;
  onBack: () => void;
  onRegister?: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginStep: React.FC<LoginStepProps> = ({
  onNext,
  onBack,
  onRegister,
  onLoginSuccess
}) => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  /**
   * Form validation
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    
    // Clear login error when user makes changes
    if (loginError) {
      setLoginError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add admin login hint
    if (formData.email === 'admin@akilli.com' && formData.password === 'admin123') {
      console.log('Admin login detected in LoginStep');
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success && result.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', result.token);
        
        // Check if user is admin
        if (result.user?.role === 'admin') {
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
          return;
        }

        // Call success callback
        onLoginSuccess(result.token, result.user);
      } else {
        setLoginError(result.message || 'Giriş yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to admin login
   */
  const goToAdminLogin = () => {
    navigate('/admin-login');
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handle register button click
   */
  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister();
    } else {
      // Go back to welcome step for registration flow
      onPrevious();
    }
  };

  const isFormValid = formData.email.trim() && formData.password.length >= 6;

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Giriş Yapın
        </h2>
        <p className="text-lg text-gray-600">
          Hesabınıza giriş yaparak devam edin
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login Error */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Giriş Hatası</h4>
                <p className="text-sm text-red-700 mt-1">{loginError}</p>
              </div>
            </div>
          )}
          
          {/* Admin Login Hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Admin Girişi</h4>
              <p className="text-sm text-blue-700 mt-1">
                Admin girişi için: <br />
                Email: admin@akilli.com <br />
                Şifre: admin123
              </p>
            </div>
          </div>
          
          {/* Login Error - Moved below admin hint */}
          {false && loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Giriş Hatası</h4>
                <p className="text-sm text-red-700 mt-1">{loginError}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <Input
            label="E-posta Adresi"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="ornek@email.com"
            error={errors.email}
            leftIcon={<Mail size={16} />}
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
                onClick={togglePasswordVisibility}
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
            icon={LogIn}
            fullWidth
            size="lg"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Button
              onClick={handleRegisterClick}
              variant="ghost"
              size="sm"
              icon={UserPlus}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isLoading}
            >
              Kayıt Ol
            </Button>
          </p>
          
          <p className="text-sm text-gray-600 mt-2">
            Admin misiniz?{' '}
            <Button
              onClick={goToAdminLogin}
              variant="ghost"
              size="sm"
              icon={Settings}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isLoading}
            >
              Admin Girişi
            </Button>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          disabled={isLoading}
        >
          Ana Sayfaya Dön
        </Button>
        
        <div className="text-sm text-gray-500 flex items-center space-x-1">
          <span>Güvenli giriş</span>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>
  );
};