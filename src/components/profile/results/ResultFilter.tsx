import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../ui/Input';
import { ProfileFilters } from '../../../types/profile';

/**
 * Result Filter Component
 * Provides search and sorting controls for results
 */

interface ResultFilterProps {
  filters: ProfileFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProfileFilters>>;
}

export const ResultFilter: React.FC<ResultFilterProps> = ({
  filters,
  setFilters
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Öğrenci adı, sınav adı veya e-posta ara..."
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            leftIcon={<Search size={16} />}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Tarihe göre</option>
              <option value="name">Öğrenci adına göre</option>
            </select>
          </div>
          
          <button
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  );
};