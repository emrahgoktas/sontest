import React from 'react';
import { Bell } from 'lucide-react';
import { NotificationCard, Notification } from './NotificationCard';

/**
 * Notification List Component
 * Displays a list of notifications with loading and empty states
 */

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onToggleStatus: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onToggleStatus,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Bildirimler yükleniyor...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Bildirim bulunamadı</h3>
        <p className="mt-1 text-gray-500">Henüz bildirim oluşturulmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};