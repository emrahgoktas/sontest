import React from 'react';
import { Trash2, Info, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Notification Card Component
 * Displays a single notification with actions
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole?: 'all' | 'admin' | 'teacher' | 'student';
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

interface NotificationCardProps {
  notification: Notification;
  onToggleStatus: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onToggleStatus,
  onDelete
}) => {
  /**
   * Get notification type icon
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * Get notification type color
   */
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get target role label
   */
  const getTargetRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Sadece Adminler';
      case 'teacher': return 'Öğretmenler';
      case 'student': return 'Öğrenciler';
      case 'all':
      default: return 'Tüm Kullanıcılar';
    }
  };

  /**
   * Format date
   */
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div 
      className={`border rounded-lg p-4 ${notification.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-75'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-medium text-gray-900">{notification.title}</h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                {notification.type === 'info' && 'Bilgi'}
                {notification.type === 'warning' && 'Uyarı'}
                {notification.type === 'success' && 'Başarı'}
                {notification.type === 'error' && 'Hata'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Oluşturulma: {formatDate(notification.createdAt)}</span>
              {notification.expiresAt && (
                <span>Son Geçerlilik: {formatDate(notification.expiresAt)}</span>
              )}
              <span>Hedef: {getTargetRoleLabel(notification.targetRole)}</span>
              <span className={notification.isActive ? 'text-green-600' : 'text-gray-500'}>
                {notification.isActive ? 'Aktif' : 'İnaktif'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className={`inline-flex items-center px-2 py-1 border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              notification.isActive
                ? 'border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50'
                : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
            }`}
            onClick={() => onToggleStatus(notification.id)}
          >
            {notification.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}
          </button>
          <button
            type="button"
            className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};