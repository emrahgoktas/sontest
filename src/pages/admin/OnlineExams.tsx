import React from 'react';
import { AdminLayout } from './AdminLayout';
import { OnlineExamsTable } from '../../components/admin/tables/OnlineExamsTable';

/**
 * Online Exams Management Page
 * Displays and manages all online exams in the system
 */

export const OnlineExams: React.FC = () => {
  return (
    <AdminLayout 
      title="Online Sınav Yönetimi" 
      description="Tüm online sınavları görüntüleyin ve yönetin"
    >
      <OnlineExamsTable />
    </AdminLayout>
  );
};

export default OnlineExams;