import React from 'react';
import { Info } from 'lucide-react';

/**
 * Header Section Component
 * Displays the page title and question count information
 */

interface HeaderSectionProps {
  questionsCount: number;
  currentPage: number;
  totalPages: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  questionsCount,
  currentPage,
  totalPages
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Yüksek Kaliteli Soru Kırpma</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">
          {questionsCount} soru kırpıldı
        </span>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center space-x-2 text-blue-700">
            <Info size={16} />
            <span className="text-sm font-medium">
              Sayfa {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};