import React, { useState } from 'react';
import { Users, FileText, BookOpen, Monitor, Bell, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UsersTable } from './tables/UsersTable';
import { TestsTable } from './tables/TestsTable';
import { BookletsTable } from './tables/BookletsTable';
import { OnlineExamsTable } from './tables/OnlineExamsTable';
import { Notifications } from './Notifications';
import { Stats } from './Stats';
import { Button } from '../ui/Button';

/**
 * Admin Dashboard Component
 * Main interface for admin operations
 */

type AdminTab = 'users' | 'tests' | 'booklets' | 'exams' | 'notifications' | 'stats';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const { logout } = useAuth();
  const [adminInfo, setAdminInfo] = useState({
    email: 'admin@akilli.com',
    name: 'Admin User'
  });

  /**
   * Render active tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTable />;
      case 'tests':
        return <TestsTable />;
      case 'booklets':
        return <BookletsTable />;
      case 'exams':
        return <OnlineExamsTable />;
      case 'notifications':
        return <Notifications />;
      case 'stats':
        return <Stats />;
      default:
        return null;
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      window.location.href = '/';
    }
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
              { id: 'users', label: 'Kullanıcılar', icon: Users },
              { id: 'tests', label: 'Testler', icon: FileText },
              { id: 'booklets', label: 'Kitapçıklar', icon: BookOpen },
              { id: 'exams', label: 'Online Sınavlar', icon: Monitor },
              { id: 'notifications', label: 'Bildirimler', icon: Bell },
              { id: 'stats', label: 'İstatistikler', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
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
          <div className="p-4 border-t border-gray-200">
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

      {/* Mobile Sidebar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'users', label: 'Kullanıcılar', icon: Users },
            { id: 'tests', label: 'Testler', icon: FileText },
            { id: 'booklets', label: 'Kitapçıklar', icon: BookOpen },
            { id: 'exams', label: 'Sınavlar', icon: Monitor },
            { id: 'notifications', label: 'Bildirimler', icon: Bell },
            { id: 'stats', label: 'İstatistikler', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`
                  flex flex-col items-center justify-center py-3
                  ${isActive ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'users' && 'Kullanıcı Yönetimi'}
              {activeTab === 'tests' && 'Test Yönetimi'}
              {activeTab === 'booklets' && 'Kitapçık Yönetimi'}
              {activeTab === 'exams' && 'Online Sınav Yönetimi'}
              {activeTab === 'notifications' && 'Bildirim Yönetimi'}
              {activeTab === 'stats' && 'İstatistikler'}
            </h1>
            
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
                  {adminInfo.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};