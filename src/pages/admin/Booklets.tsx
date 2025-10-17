import React from 'react';
import { AdminLayout } from './AdminLayout';
import { BookletsTable } from '../../components/admin/tables/BookletsTable';

/**
 * Booklets Management Page
 * Displays and manages all booklets in the system
 */

export const Booklets: React.FC = () => {
  return (
    <AdminLayout 
      title="Kitapçık Yönetimi" 
      description="Tüm kitapçıkları görüntüleyin ve yönetin"
    >
      <BookletsTable />
    </AdminLayout>
  );
};

export default Booklets;