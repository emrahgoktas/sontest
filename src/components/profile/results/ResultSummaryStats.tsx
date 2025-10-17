import React from 'react';
import { ExamResult } from '../../../types/profile';

/**
 * Result Summary Stats Component
 * Displays summary statistics for exam results
 */

interface ResultSummaryStatsProps {
  filteredResults: ExamResult[];
}

export const ResultSummaryStats: React.FC<ResultSummaryStatsProps> = ({
  filteredResults
}) => {
  if (filteredResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{filteredResults.length}</div>
          <div className="text-sm text-gray-600">Toplam Sonuç</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Ortalama Başarı</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...filteredResults.map(r => r.percentage))}%
          </div>
          <div className="text-sm text-gray-600">En Yüksek</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">
            {Math.min(...filteredResults.map(r => r.percentage))}%
          </div>
          <div className="text-sm text-gray-600">En Düşük</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {(filteredResults.reduce((sum, r) => sum + r.completionTime, 0) / filteredResults.length).toFixed(0)} dk
          </div>
          <div className="text-sm text-gray-600">Ortalama Süre</div>
        </div>
      </div>
    </div>
  );
};