import React, { useState, useEffect } from 'react';
import { NotificationForm } from '../components/notifications/NotificationForm';
import { NotificationList } from '../components/notifications/NotificationList';
import { createNotification } from '../components/notifications/utils';
import { Notification } from '../components/notifications/NotificationCard';

/**
 * Notifications Component
 * Allows admins to send system-wide notifications to users
 */

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch notifications (mock data for now)
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Sistem Bakımı',
            message: 'Sistem 15 Ekim 2023 tarihinde 02:00-04:00 saatleri arasında bakım nedeniyle geçici olarak kullanılamayacaktır.',
            type: 'warning',
            targetRole: 'all',
            createdAt: new Date('2023-10-10'),
            expiresAt: new Date('2023-10-16'),
            isActive: true
          },
          {
            id: '2',
            title: 'Yeni Özellik: Kitapçık Oluşturucu',
            message: 'Artık testlerinizden farklı versiyonlarda kitapçıklar oluşturabilirsiniz. Detaylı bilgi için yardım sayfasını ziyaret edin.',
            type: 'info',
            targetRole: 'teacher',
            createdAt: new Date('2023-09-25'),
            isActive: true
          },
          {
            id: '3',
            title: 'Premium Üyelik İndirimi',
            message: 'Ekim ayına özel %25 indirimle Premium üyeliğe geçebilirsiniz. Fırsatı kaçırmayın!',
            type: 'success',
            targetRole: 'teacher',
            createdAt: new Date('2023-10-01'),
            expiresAt: new Date('2023-10-31'),
            isActive: true
          },
          {
            id: '4',
            title: 'Hata Düzeltmesi',
            message: 'Online sınavlarda yaşanan teknik sorun giderilmiştir. Özür dileriz.',
            type: 'error',
            targetRole: 'all',
            createdAt: new Date('2023-09-18'),
            expiresAt: new Date('2023-09-25'),
            isActive: false
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /**
   * Send notification
   */
  const handleSendNotification = async ({
    title,
    message,
    type,
    targetRole,
    expiresAt
  }: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    targetRole: 'all' | 'admin' | 'teacher' | 'student';
    expiresAt: string;
  }) => {
    setIsSending(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNotification = createNotification(
        title,
        message,
        type,
        targetRole,
        expiresAt
      );

      setNotifications([newNotification, ...notifications]);
      alert('Bildirim başarıyla gönderildi!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Bildirim gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Delete notification
   */
  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      // Mock API call
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    }
  };

  /**
   * Toggle notification status
   */
  const handleToggleStatus = (notificationId: string) => {
    // Mock API call
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isActive: !notification.isActive } 
        : notification
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bildirim Yönetimi</h2>
          <p className="text-gray-600">Sistem bildirimleri oluşturun ve yönetin</p>
        </div>
      </div>

      {/* New Notification Form */}
      <NotificationForm 
        onSendNotification={handleSendNotification}
        isSending={isSending}
      />

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mevcut Bildirimler</h3>
        
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteNotification}
        />
      </div>
    </div>
  );
};