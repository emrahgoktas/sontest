import React from 'react';
import { AdminLayout } from './AdminLayout';
import { Notifications } from '../Notifications';

/**
 * Notifications Management Page
 * Displays and manages all system notifications
 */

export const NotificationsPage: React.FC = () => {
  return (
    <AdminLayout 
      title="Bildirim Yönetimi" 
      description="Sistem bildirimlerini oluşturun ve yönetin"
    >
      <Notifications />
    </AdminLayout>
  );
};

export default NotificationsPage;