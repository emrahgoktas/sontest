import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Notification Form Component
 * Allows admins to create and send new notifications
 */

interface NotificationFormProps {
  onSendNotification: (notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    targetRole: 'all' | 'admin' | 'teacher' | 'student';
    expiresAt: string;
  }) => Promise<void>;
  isSending: boolean;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  onSendNotification,
  isSending
}) => {
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetRole: 'all' as const,
    expiresAt: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate notification form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newNotification.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    }

    if (!newNotification.message.trim()) {
      newErrors.message = 'Mesaj zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Send notification
   */
  const handleSendNotification = async () => {
    if (!validateForm()) return;
    await onSendNotification(newNotification);
    
    // Reset form after successful submission
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      targetRole: 'all',
      expiresAt: ''
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Bildirim Oluştur</h3>
      
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Başlık <span className="text-red-500">*</span>
          </label>
          <Input
            value={newNotification.title}
            onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
            placeholder="Bildirim başlığı"
            error={errors.title}
          />
        </div>
        
        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj <span className="text-red-500">*</span>
          </label>
          <textarea
            value={newNotification.message}
            onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
            placeholder="Bildirim mesajı"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.message
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        
        {/* Type and Target */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildirim Tipi
            </label>
            <select
              value={newNotification.type}
              onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="info">Bilgi</option>
              <option value="warning">Uyarı</option>
              <option value="success">Başarı</option>
              <option value="error">Hata</option>
            </select>
          </div>
          
          {/* Target Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hedef Kullanıcılar
            </label>
            <select
              value={newNotification.targetRole}
              onChange={(e) => setNewNotification({...newNotification, targetRole: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="admin">Sadece Adminler</option>
              <option value="teacher">Öğretmenler</option>
              <option value="student">Öğrenciler</option>
            </select>
          </div>
          
          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Son Geçerlilik Tarihi (Opsiyonel)
            </label>
            <input
              type="date"
              value={newNotification.expiresAt}
              onChange={(e) => setNewNotification({...newNotification, expiresAt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSendNotification}
            disabled={isSending}
            isLoading={isSending}
            icon={Send}
          >
            {isSending ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </Button>
        </div>
      </div>
    </div>
  );
};