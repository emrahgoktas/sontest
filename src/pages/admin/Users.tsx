import React from 'react';
import { AdminLayout } from './AdminLayout';
import { UsersTable } from '../../components/admin/tables/UsersTable';

/**
 * Users Management Page
 * Displays and manages all users in the system
 */

export const Users: React.FC = () => {
  return (
    <AdminLayout 
      title="Kullanıcı Yönetimi" 
      description="Tüm kullanıcıları görüntüleyin ve yönetin"
    >
      <UsersTable />
    </AdminLayout>
  );
};

export default Users;