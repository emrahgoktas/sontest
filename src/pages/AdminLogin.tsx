import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Admin login attempt:', email);
      const result = await login(email, password);
      console.log('🔐 Admin login result:', result);
      
      if (result.success && result.user && result.user.role === 'admin') {
        console.log('Admin login successful, redirecting to dashboard');
        // Ensure we have the admin role set in localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo && (!userInfo.role || userInfo.role !== 'admin')) {
          userInfo.role = 'admin';
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          navigate('/action-selection');
        }, 100);

      } else if (result.success && result.user && result.user.role !== 'admin') {
        setError('Bu hesap admin yetkisine sahip değil.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Admin yetkisi bulunamadı. Lütfen admin hesabınızla giriş yapın.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş başarısız. Email ve şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Girişi</h1>
          <p className="text-gray-600 mt-2">Yönetici paneline erişim için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@akilli.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Test için admin bilgileri:</p>
          <p className="text-sm font-mono text-gray-800">Email: admin@akilli.com</p>
          <p className="text-sm font-mono text-gray-800">Şifre: admin123</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Ana sayfaya dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
