import React from 'react';
import { User, LogOut, Settings, BarChart3, ChevronDown } from 'lucide-react';
import { Navigation } from './Navigation';
import { Button } from '../ui/Button';
import { AppStep } from '../../types';
import { UserInfo } from '../../types/wizard';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: AppStep;
  onStepChange: (step: AppStep) => void;
  currentUser?: UserInfo | null;
  onShowProfile?: () => void;
  onHideProfile?: () => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentStep,
  onStepChange,
  currentUser,
  onShowProfile,
  onHideProfile,
  onLogout
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Ücretsiz';
      case 'pro': return 'Pro';
      case 'premium': return 'Premium';
      default: return 'Bilinmeyen';
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const closeProfileDropdown = () => setShowProfileDropdown(false);

  const handleOpenProfilePanel = () => {
    closeProfileDropdown();
    onShowProfile?.();
  };

  const handleOpenProfileUpdate = () => {
    closeProfileDropdown();
    onShowProfile?.();
  };

  const handleLogoutClick = () => {
    closeProfileDropdown();
    onLogout?.();
  };

  /** İşlem Seç butonu yönlendirmesi */
  const handleActionSelection = () => {
    window.location.href = '/action-selection';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* HEADER */}
    <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-center justify-between py-3 gap-3">
      
      {/* Sol taraf: logo */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 rounded-lg p-2">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Akıllı Test Oluşturucu</h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            PDF'den soru kırpma ve test oluşturma uygulaması
          </p>
        </div>
      </div>

      {/* Sağ taraf: işlem seç butonu + kullanıcı bilgisi */}
      <div className="flex items-center space-x-4 flex-wrap justify-end w-full sm:w-auto">
        {/* 🟦 İşlem Seç Butonu */}
        <Button
          type="button"
          onClick={() => (window.location.href = '/action-selection')}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6L20 6M4 12L20 12M4 18L20 18" />
            </svg>
            <span>İşlem Seç</span>
          </div>
        </Button>

        {/* Kullanıcı bilgileri */}
        {currentUser && (
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {currentUser.fullName}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanColor(
                    currentUser.planType
                  )}`}
                >
                  {getPlanName(currentUser.planType)}
                </span>
              </div>
            </div>

            {/* Profil dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showProfileDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeProfileDropdown} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {currentUser.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(
                            currentUser.planType
                          )}`}
                        >
                          {getPlanName(currentUser.planType)}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={handleOpenProfileUpdate}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Profil Güncelle
                      </button>
                      <button
                        onClick={handleOpenProfilePanel}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                        İçerik Yönetimi
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</header>


      {/* Navigation */}
      <Navigation currentStep={currentStep} onStepChange={onStepChange} currentUser={currentUser} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)] p-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500 flex flex-col sm:flex-row justify-between">
          <p>© 2025 Akıllı Test Oluşturucu - Tüm hakları saklıdır.</p>
          <p className="hidden sm:block">Eğitim teknolojileri ile geliştirilmiştir.</p>
        </div>
      </footer>
    </div>
  );
};
