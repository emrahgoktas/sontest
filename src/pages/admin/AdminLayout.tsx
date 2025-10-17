import React, { useState } from 'react';
import { Users, FileText, BookOpen, Monitor, Bell, BarChart3, Settings, LogOut, User, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

/**
 * Admin Layout Component
 * Provides consistent layout structure for all admin pages
 */

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  description 
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { logout, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      window.location.href = '/';
    }
  };

  /**
   * Navigate to tab
   */
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.location.href = `/admin/${tab}`;
    setIsMobileMenuOpen(false);
  };

  /**
   * Navigate back to ActionSelectionPage
   */
  const handleBackToActionSelection = () => {
    // Clear any admin-specific localStorage items that might cause redirect loops
    localStorage.removeItem('currentStep');
    navigate('/action-selection');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md z-10 flex-shrink-0 hidden md:block">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-3 px-6 py-5 border-b border-gray-200">
            <div className="bg-blue-600 rounded-lg p-2">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Yönetim Paneli</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin/dashboard' },
              { id: 'users', label: 'Kullanıcılar', icon: Users, href: '/admin/users' },
              { id: 'tests', label: 'Testler', icon: FileText, href: '/admin/tests' },
              { id: 'booklets', label: 'Kitapçıklar', icon: BookOpen, href: '/admin/booklets' },
              { id: 'exams', label: 'Online Sınavlar', icon: Monitor, href: '/admin/exams' },
              { id: 'notifications', label: 'Bildirimler', icon: Bell, href: '/admin/notifications' },
              { id: 'settings', label: 'Ayarlar', icon: Settings, href: '/admin/settings' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-medium">{tab.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button
              variant="ghost"
              onClick={handleBackToActionSelection}
              icon={ArrowLeft}
              className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              İşlem Seçimine Dön
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              icon={LogOut}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="fixed bottom-4 right-4 md:hidden z-20">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Admin Menü</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin/dashboard' },
                { id: 'users', label: 'Kullanıcılar', icon: Users, href: '/admin/users' },
                { id: 'tests', label: 'Testler', icon: FileText, href: '/admin/tests' },
                { id: 'booklets', label: 'Kitapçıklar', icon: BookOpen, href: '/admin/booklets' },
                { id: 'exams', label: 'Online Sınavlar', icon: Monitor, href: '/admin/exams' },
                { id: 'notifications', label: 'Bildirimler', icon: Bell, href: '/admin/notifications' },
                { id: 'settings', label: 'Ayarlar', icon: Settings, href: '/admin/settings' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigateTo(tab.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
              
              
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleBackToActionSelection}
                  icon={ArrowLeft}
                  className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  İşlem Seçimine Dön
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  icon={LogOut}
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Çıkış Yap
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Admin
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.email || 'admin@akilli.com'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
