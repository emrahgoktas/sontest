import React, { useState } from 'react';
import { ArrowLeft, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page Component
 * Standalone login page with navigation to action selection after success
 */

export const LoginPage: React.FC = () => {
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
        
        // Check if user is admin
        if (result.user?.role === 'admin') {
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
          return;
        }

        // Redirect to action selection for regular users
        navigate('/action-selection');
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
   * Navigate to register page
   */
  const handleRegisterClick = () => {
    navigate('/register');
  };

  /**
   * Navigate back to welcome page
   */
  const handleBackToWelcome = () => {
    navigate('/');
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

  const isFormValid = formData.email.trim() && formData.password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Giriş Yapın</h1>
          <p className="text-gray-600 mt-2">Hesabınıza giriş yaparak devam edin</p>
        </div>

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
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Test Hesapları</h4>
              <p className="text-sm text-blue-700 mt-1">
                Admin: admin@akilli.com / admin123<br />
                Öğretmen: ahmet@example.com / password
              </p>
            </div>
          </div>

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
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isLoading}
            >
              Admin Girişi
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