import React from 'react';
import { AdminLayout } from './AdminLayout';
import { TestsTable } from '../../components/admin/tables/TestsTable';

/**
 * Tests Management Page
 * Displays and manages all tests in the system
 */

export const Tests: React.FC = () => {
  return (
    <AdminLayout 
      title="Test Yönetimi" 
      description="Tüm testleri görüntüleyin ve yönetin"
    >
      <TestsTable />
    </AdminLayout>
  );
};

export default Tests;