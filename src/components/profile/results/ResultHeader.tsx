import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Result Header Component
 * Displays the header section with title and export buttons
 */

interface ResultHeaderProps {
  onDownloadPDFReport: () => void;
  onExportToExcel: () => void;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({
  onDownloadPDFReport,
  onExportToExcel
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sınav Sonuçları</h2>
        <p className="text-gray-600">Öğrenci performanslarını analiz edin ve raporlar oluşturun</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onDownloadPDFReport}
          icon={Download}
        >
          PDF Raporu
        </Button>
        <Button
          variant="outline"
          onClick={onExportToExcel}
          icon={FileSpreadsheet}
        >
          Excel Dışa Aktar
        </Button>
      </div>
    </div>
  );
};