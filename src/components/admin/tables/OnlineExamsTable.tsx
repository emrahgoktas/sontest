import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Play, Pause, Trash2, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { onlineExamAPI } from '../../../utils/api';

/**
 * Online Exams Table Component
 * Displays all online exams created by users
 */

interface OnlineExam {
  id: string;
  title: string;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  questionCount: number;
  participantCount: number;
  isActive: boolean;
  averageScore?: number;
}

export const OnlineExamsTable: React.FC = () => {
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<OnlineExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof OnlineExam>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await onlineExamAPI.getOnlineExams();
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedExams: OnlineExam[] = response.data.map((exam: any) => ({
            id: exam.id.toString(),
            title: exam.title,
            createdAt: new Date(exam.created_at),
            startDate: exam.start_date ? new Date(exam.start_date) : undefined,
            endDate: exam.end_date ? new Date(exam.end_date) : undefined,
            createdBy: {
              id: exam.user?.id?.toString() || '',
              name: exam.user?.name || 'Bilinmeyen',
              email: exam.user?.email || ''
            },
            questionCount: exam.test?.question_count || 0,
            participantCount: exam.participant_count || 0,
            isActive: exam.is_active || false,
            averageScore: exam.average_score
          }));
        
          setExams(transformedExams);
          setFilteredExams(transformedExams);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Filter and sort exams
  useEffect(() => {
    let result = [...exams];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(exam => 
        exam.title.toLowerCase().includes(lowerSearchTerm) ||
        exam.createdBy.name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(exam => 
        statusFilter === 'active' ? exam.isActive : !exam.isActive
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc'
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      
      return 0;
    });
    
    setFilteredExams(result);
  }, [exams, searchTerm, sortField, sortDirection, statusFilter]);

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof OnlineExam) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  /**
   * Delete exam
   */
  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
      // TODO: Implement delete exam API call
    }
  };

  /**
   * Toggle exam status
   */
  const handleToggleStatus = (examId: string) => {
    // TODO: Implement toggle status API call
  };

  /**
   * Format date
   */
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  /**
   * View exam details
   */
  const handleViewExam = (examId: string) => {
    alert(`Sınav detayları: ${examId}`);
  };

  /**
   * View exam results
   */
  const handleViewResults = (examId: string) => {
    alert(`Sınav sonuçları: ${examId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Sınav Yönetimi</h2>
          <p className="text-gray-600">Tüm online sınavları görüntüleyin ve yönetin</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Toplam: {filteredExams.length} sınav
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Sınav adı veya öğretmen adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">İnaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Sınavlar yükleniyor...</span>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Sınav bulunamadı</h3>
            <p className="mt-1 text-gray-500">Arama kriterlerinize uygun sınav bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Sınav Adı</span>
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span>Oluşturan</span>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span>Tarih Aralığı</span>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('participantCount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Katılımcı</span>
                      {sortField === 'participantCount' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Durum</span>
                      {sortField === 'isActive' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span>Ortalama</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      <div className="text-xs text-gray-500">{exam.questionCount} soru</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.createdBy.name}</div>
                      <div className="text-sm text-gray-500">{exam.createdBy.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.startDate && exam.endDate ? (
                          <>
                            {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                          </>
                        ) : (
                          'Tarih belirlenmemiş'
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Oluşturulma: {formatDate(exam.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.participantCount} kişi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.isActive ? 'Aktif' : 'İnaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.averageScore ? (
                        <span className={`font-medium ${
                          exam.averageScore >= 80 ? 'text-green-600' :
                          exam.averageScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {exam.averageScore.toFixed(1)}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleViewExam(exam.id)}
                        >
                          <Eye className="mr-1.5 h-3 w-3 text-gray-400" />
                          Görüntüle
                        </button>
                        {exam.participantCount > 0 && (
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => handleViewResults(exam.id)}
                          >
                            <BarChart3 className="mr-1.5 h-3 w-3 text-gray-400" />
                            Sonuçlar
                          </button>
                        )}
                        <button
                          type="button"
                          className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            exam.isActive
                              ? 'border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50'
                              : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                          }`}
                          onClick={() => handleToggleStatus(exam.id)}
                        >
                          {exam.isActive ? (
                            <>
                              <Pause className="mr-1.5 h-3 w-3" />
                              Durdur
                            </>
                          ) : (
                            <>
                              <Play className="mr-1.5 h-3 w-3" />
                              Aktifleştir
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
                          <Trash2 className="mr-1.5 h-3 w-3" />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};