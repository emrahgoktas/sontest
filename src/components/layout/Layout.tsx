import React from 'react';
import { User, LogOut, Settings, BarChart3, ChevronDown } from 'lucide-react';
import { Navigation } from './Navigation';
import { ModuleNavigation } from './ModuleNavigation';
import { Button } from '../ui/Button';
import { AppStep } from '../../types';
import { UserInfo } from '../../types/wizard';

/**
 * Main layout component that wraps the entire application
 * Provides consistent structure and navigation
 */

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

  /**
   * Plan adını getir
   */
  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Ücretsiz';
      case 'pro': return 'Pro';
      case 'premium': return 'Premium';
      default: return 'Bilinmeyen';
    }
  };

  /**
   * Plan rengini getir
   */
  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Profil dropdown menüsünü kapat
   */
  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  /**
   * Profil yönetim panelini aç
   */
  const handleOpenProfilePanel = () => {
    closeProfileDropdown();
    if (onShowProfile) {
      onShowProfile();
    }
  };

  /**
   * Profil güncelleme sayfasını aç
   */
  const handleOpenProfileUpdate = () => {
    closeProfileDropdown();
    // Bu fonksiyon UserProfile bileşeninde edit modunu açacak
    if (onShowProfile) {
      onShowProfile();
    }
  };

  /**
   * Çıkış yap
   */
  const handleLogoutClick = () => {
    closeProfileDropdown();
    if (onLogout) {
      onLogout();
    }
  };

  /**
   * Handle action selection navigation
   */
  const handleActionSelection = () => {
    // Show action selection modal or navigate directly
    const actionSelectionModal = document.createElement('div');
    actionSelectionModal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; width: 90%;">
          <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; font-weight: bold;">İşlem Seçin</h2>
          <div style="display: grid; gap: 1rem;">
            <button onclick="window.location.href='/'" style="padding: 1rem; border: 2px solid #3b82f6; border-radius: 0.5rem; background: #eff6ff; color: #1d4ed8; cursor: pointer;">
              📄 Test Oluştur (PDF Kırpma)
            </button>
            <button onclick="window.location.href='/manual-question-editor'" style="padding: 1rem; border: 2px solid #7c3aed; border-radius: 0.5rem; background: #f3e8ff; color: #6b21a8; cursor: pointer;">
              ✏️ Soru Editörü
            </button>
            <button onclick="window.location.href='/ai-question-generator'" style="padding: 1rem; border: 2px solid #f59e0b; border-radius: 0.5rem; background: #fef3c7; color: #d97706; cursor: pointer;">
              🤖 AI ile Test Oluştur
            </button>
            <button onclick="window.location.href='/online-exam'" style="padding: 1rem; border: 2px solid #10b981; border-radius: 0.5rem; background: #d1fae5; color: #047857; cursor: pointer;">
              💻 Online Sınav Oluştur
            </button>
            <button onclick="this.closest('div').parentElement.remove()" style="padding: 0.5rem 1rem; border: 1px solid #6b7280; border-radius: 0.5rem; background: #f9fafb; color: #374151; cursor: pointer; margin-top: 1rem;">
              İptal
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(actionSelectionModal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
     <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
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
              {/* User Info */}
              {currentUser && (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanColor(currentUser.planType)}`}>
                        {getPlanName(currentUser.planType)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <>
                        {/* Overlay to close dropdown */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={closeProfileDropdown}
                        />
                        
                        {/* Dropdown Content */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          {/* User Info Header */}
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
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(currentUser.planType)}`}>
                                {getPlanName(currentUser.planType)}
                              </span>
                            </div>
                          </div>

                          {/* Menu Items */}
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

                          {/* Logout */}
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
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                MVP v1.0
              </span>
            </div>
          </div>
          
          {/* Action Selection Button */}
          <div className="w-full max-w-xs">
            <Button
              onClick={handleActionSelection}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 font-semibold"
              size="lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6L20 6M4 12L20 12M4 18L20 18" />
                </svg>
                <span className="text-base">İşlem Seç</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9L12 16L5 9" />
                </svg>
              </div>
            </Button>
          </div>
          
      </header>

      {/* Navigation */}
      <Navigation 
        currentStep={currentStep} 
        onStepChange={onStepChange}
        currentUser={currentUser}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <p>© 2025 Akıllı Test Oluşturucu - Tüm hakları saklıdır.</p>
            <p className="hidden sm:block">
              Eğitim teknolojileri ile geliştirilmiştir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};