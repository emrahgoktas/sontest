import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { testAPI } from '../../../utils/api';

/**
 * Tests Table Component
 * Displays all tests created by users
 */

interface Test {
  id: string;
  title: string;
  lesson: string;
  createdAt: Date;
  questionCount: number;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  downloadCount: number;
  isPublic: boolean;
}

export const TestsTable: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Test>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const response = await testAPI.getTests();
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedTests: Test[] = response.data.map((test: any) => ({
            id: test.id.toString(),
            title: test.title,
            lesson: test.lesson,
            createdAt: new Date(test.created_at),
            questionCount: test.question_count || 0,
            createdBy: {
              id: test.user?.id?.toString() || '',
              name: test.user?.name || 'Bilinmeyen',
              email: test.user?.email || ''
            },
            downloadCount: test.download_count || 0,
            isPublic: test.is_public || false
          }));
        
          setTests(transformedTests);
          setFilteredTests(transformedTests);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Get unique lessons for filter
  const uniqueLessons = Array.from(new Set(tests.map(test => test.lesson))).sort();

  // Filter and sort tests
  useEffect(() => {
    let result = [...tests];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(test => 
        test.title.toLowerCase().includes(lowerSearchTerm) ||
        test.createdBy.name.toLowerCase().includes(lowerSearchTerm) ||
        test.lesson.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply lesson filter
    if (selectedLesson !== 'all') {
      result = result.filter(test => test.lesson === selectedLesson);
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
      
      return 0;
    });
    
    setFilteredTests(result);
  }, [tests, searchTerm, sortField, sortDirection, selectedLesson]);

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof Test) => {
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
   * Delete test
   */
  const handleDeleteTest = (testId: string) => {
    if (window.confirm('Bu testi silmek istediğinizden emin misiniz?')) {
      // TODO: Implement delete test API call
    }
  };

  /**
   * Format date
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  /**
   * Preview test
   */
  const handlePreviewTest = (testId: string) => {
    alert(`Test önizleme: ${testId}`);
  };

  /**
   * Download test
   */
  const handleDownloadTest = (testId: string) => {
    alert(`Test indirme: ${testId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Yönetimi</h2>
          <p className="text-gray-600">Tüm testleri görüntüleyin ve yönetin</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Toplam: {filteredTests.length} test
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Test adı, öğretmen adı veya ders ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Lesson Filter */}
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Dersler</option>
              {uniqueLessons.map(lesson => (
                <option key={lesson} value={lesson}>{lesson}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Testler yükleniyor...</span>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Test bulunamadı</h3>
            <p className="mt-1 text-gray-500">Arama kriterlerinize uygun test bulunamadı.</p>
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
                      <span>Test Adı</span>
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lesson')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Ders</span>
                      {sortField === 'lesson' && (
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('questionCount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Soru</span>
                      {sortField === 'questionCount' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tarih</span>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('downloadCount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>İndirme</span>
                      {sortField === 'downloadCount' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{test.title}</div>
                        {test.isPublic && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Herkese Açık
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{test.lesson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.createdBy.name}</div>
                      <div className="text-sm text-gray-500">{test.createdBy.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.questionCount} soru
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(test.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.downloadCount} kez
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handlePreviewTest(test.id)}
                        >
                          <Eye className="mr-1.5 h-3 w-3 text-gray-400" />
                          Önizle
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleDownloadTest(test.id)}
                        >
                          <Download className="mr-1.5 h-3 w-3 text-gray-400" />
                          İndir
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleDeleteTest(test.id)}
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