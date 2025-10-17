import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

/**
 * Admin Route Component
 * Protects routes that should only be accessible by admin users
 */

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isAdmin, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAuth = async () => {
      console.log('🔒 AdminRoute - Mevcut durum:', { isAdmin, loading, currentUser });
      
      // Eğer currentUser zaten varsa ve admin ise yeniden doğrulama yapmaya gerek yok
      if (currentUser && currentUser.role === 'admin') {
        console.log('🔒 AdminRoute - Mevcut kullanıcı admin, doğrulama atlanıyor');
        return;
      }
      
      // Aksi takdirde token kontrolü yap
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('🔒 AdminRoute - Token bulunamadı, login sayfasına yönlendiriliyor');
        navigate('/admin-login');
        return;
      }
      
      // Token varsa doğrula
      console.log('🔒 AdminRoute - Token doğrulanıyor...');
      const isAuthenticated = await checkAuth();
      console.log('🔒 AdminRoute - Token doğrulama sonucu:', { isAuthenticated, isAdmin });
      
      if (!isAuthenticated || !isAdmin) {
        console.log('🔒 AdminRoute - Yetkisiz erişim, login sayfasına yönlendiriliyor');
        navigate('/admin-login');
      }
    };

    verifyAuth();
    
    // Fail-safe: 3 saniye içinde yönlendirme olmazsa login sayfasına geri dön
    const failSafeTimer = setTimeout(() => {
      if (loading && !isAdmin) {
        console.log('⚠️ Fail-safe: Yetkilendirme zaman aşımına uğradı');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
        navigate('/admin-login');
      }
    }, 3000);
    
    return () => clearTimeout(failSafeTimer);
  }, [checkAuth, navigate, currentUser, isAdmin, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    console.log('🔒 AdminRoute - Admin yetkisi yok, yönlendiriliyor');
    return <Navigate to="/admin-login" replace />;
  }

  // Render children if admin
  console.log('🔒 AdminRoute - Admin yetkisi doğrulandı, içerik gösteriliyor');
  return <>{children}</>;
};