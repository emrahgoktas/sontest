import React, { useState } from 'react';
import { Save, RefreshCw, Sliders, Palette, Zap, Database, Shield } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/Button';

/**
 * Admin Settings Page
 * Displays and manages system-wide settings
 */

export const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: {
      primaryColor: '#3b82f6',
      darkMode: false,
      defaultZoom: 1.0,
      highContrastMode: false
    },
    system: {
      cacheEnabled: true,
      maxUploadSize: 50, // MB
      sessionTimeout: 60, // minutes
      maintenanceMode: false
    },
    security: {
      twoFactorAuth: false,
      passwordExpiry: 90, // days
      loginAttempts: 5,
      ipBlocking: true
    }
  });

  /**
   * Save settings
   */
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset settings to defaults
   */
  const handleResetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılana sıfırlamak istediğinizden emin misiniz?')) {
      setSettings({
        theme: {
          primaryColor: '#3b82f6',
          darkMode: false,
          defaultZoom: 1.0,
          highContrastMode: false
        },
        system: {
          cacheEnabled: true,
          maxUploadSize: 50,
          sessionTimeout: 60,
          maintenanceMode: false
        },
        security: {
          twoFactorAuth: false,
          passwordExpiry: 90,
          loginAttempts: 5,
          ipBlocking: true
        }
      });
    }
  };

  return (
    <AdminLayout title="Sistem Ayarları" description="Sistem genelinde ayarları yönetin">
      <div className="space-y-8">
        {/* Theme Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tema Ayarları</h3>
              <p className="text-sm text-gray-500">Görünüm ve arayüz ayarları</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ana Renk
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.theme.primaryColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, primaryColor: e.target.value }
                  })}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <span className="text-sm text-gray-600">{settings.theme.primaryColor}</span>
              </div>
            </div>
            
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Karanlık Mod
                </label>
                <p className="text-xs text-gray-500">Koyu tema kullan</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="dark-mode"
                  checked={settings.theme.darkMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, darkMode: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="dark-mode"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.theme.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            
            {/* Default Zoom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Varsayılan Zoom ({settings.theme.defaultZoom}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.theme.defaultZoom}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, defaultZoom: parseFloat(e.target.value) }
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yüksek Kontrast Modu
                </label>
                <p className="text-xs text-gray-500">Erişilebilirlik için</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="high-contrast"
                  checked={settings.theme.highContrastMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, highContrastMode: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="high-contrast"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.theme.highContrastMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Sliders className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h3>
              <p className="text-sm text-gray-500">Genel sistem yapılandırması</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Cache */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Önbellek
                </label>
                <p className="text-xs text-gray-500">Sistem önbelleğini etkinleştir</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="cache-enabled"
                  checked={settings.system.cacheEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    system: { ...settings.system, cacheEnabled: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="cache-enabled"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.system.cacheEnabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            
            {/* Max Upload Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Yükleme Boyutu ({settings.system.maxUploadSize} MB)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.system.maxUploadSize}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, maxUploadSize: parseInt(e.target.value) }
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Session Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oturum Zaman Aşımı ({settings.system.sessionTimeout} dakika)
              </label>
              <select
                value={settings.system.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, sessionTimeout: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 dakika</option>
                <option value="30">30 dakika</option>
                <option value="60">1 saat</option>
                <option value="120">2 saat</option>
                <option value="240">4 saat</option>
              </select>
            </div>
            
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bakım Modu
                </label>
                <p className="text-xs text-gray-500">Sistemi bakım moduna al</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="maintenance-mode"
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    system: { ...settings.system, maintenanceMode: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="maintenance-mode"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.system.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Güvenlik Ayarları</h3>
              <p className="text-sm text-gray-500">Sistem güvenlik yapılandırması</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Two Factor Auth */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İki Faktörlü Doğrulama
                </label>
                <p className="text-xs text-gray-500">Admin hesapları için zorunlu</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="two-factor"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="two-factor"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            
            {/* Password Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Sona Erme Süresi ({settings.security.passwordExpiry} gün)
              </label>
              <select
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30">30 gün</option>
                <option value="60">60 gün</option>
                <option value="90">90 gün</option>
                <option value="180">180 gün</option>
                <option value="365">365 gün</option>
              </select>
            </div>
            
            {/* Login Attempts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Giriş Denemesi
              </label>
              <select
                value={settings.security.loginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, loginAttempts: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3">3 deneme</option>
                <option value="5">5 deneme</option>
                <option value="10">10 deneme</option>
              </select>
            </div>
            
            {/* IP Blocking */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IP Engelleme
                </label>
                <p className="text-xs text-gray-500">Şüpheli IP'leri otomatik engelle</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="ip-blocking"
                  checked={settings.security.ipBlocking}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, ipBlocking: e.target.checked }
                  })}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="ip-blocking"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.security.ipBlocking ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            icon={RefreshCw}
          >
            Varsayılana Sıfırla
          </Button>
          <Button
            onClick={handleSaveSettings}
            isLoading={isLoading}
            icon={Save}
          >
            {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </div>
      </div>

      {/* Custom CSS for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: white;
        }
        .toggle-label {
          transition: background-color 0.2s ease;
        }
        .toggle-checkbox {
          transition: all 0.2s ease;
          right: 4px;
          z-index: 1;
        }
      `}</style>
    </AdminLayout>
  );
};

export default Settings;