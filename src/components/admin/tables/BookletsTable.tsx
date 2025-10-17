import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { bookletAPI } from '../../../utils/api';

/**
 * Booklets Table Component
 * Displays all booklets created by users
 */

interface Booklet {
  id: string;
  title: string;
  versions: string[];
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  questionCount: number;
  downloadCount: number;
}

export const BookletsTable: React.FC = () => {
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [filteredBooklets, setFilteredBooklets] = useState<Booklet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Booklet>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch booklets from API
  useEffect(() => {
    const fetchBooklets = async () => {
      setIsLoading(true);
      try {
        const response = await bookletAPI.getBooklets();
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedBooklets: Booklet[] = response.data.map((booklet: any) => ({
            id: booklet.id.toString(),
            title: booklet.name,
            versions: booklet.versions,
            createdAt: new Date(booklet.created_at),
            createdBy: {
              id: booklet.test?.user?.id?.toString() || '',
              name: booklet.test?.user?.name || 'Bilinmeyen',
              email: booklet.test?.user?.email || ''
            },
            questionCount: booklet.question_count || 0,
            downloadCount: booklet.download_count || 0
          }));
        
          setBooklets(transformedBooklets);
          setFilteredBooklets(transformedBooklets);
        }
      } catch (error) {
        console.error('Error fetching booklets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooklets();
  }, []);

  // Filter and sort booklets
  useEffect(() => {
    let result = [...booklets];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(booklet => 
        booklet.title.toLowerCase().includes(lowerSearchTerm) ||
        booklet.createdBy.name.toLowerCase().includes(lowerSearchTerm)
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
      
      return 0;
    });
    
    setFilteredBooklets(result);
  }, [booklets, searchTerm, sortField, sortDirection]);

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof Booklet) => {
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
   * Delete booklet
   */
  const handleDeleteBooklet = (bookletId: string) => {
    if (window.confirm('Bu kitapçığı silmek istediğinizden emin misiniz?')) {
      // TODO: Implement delete booklet API call
    }
  };

  /**
   * Format date
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  /**
   * Preview booklet
   */
  const handlePreviewBooklet = (bookletId: string) => {
    alert(`Kitapçık önizleme: ${bookletId}`);
  };

  /**
   * Download booklet
   */
  const handleDownloadBooklet = (bookletId: string) => {
    alert(`Kitapçık indirme: ${bookletId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitapçık Yönetimi</h2>
          <p className="text-gray-600">Tüm kitapçıkları görüntüleyin ve yönetin</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Toplam: {filteredBooklets.length} kitapçık
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Kitapçık adı veya öğretmen adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Booklets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Kitapçıklar yükleniyor...</span>
          </div>
        ) : filteredBooklets.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Kitapçık bulunamadı</h3>
            <p className="mt-1 text-gray-500">Arama kriterlerinize uygun kitapçık bulunamadı.</p>
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
                      <span>Kitapçık Adı</span>
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span>Versiyonlar</span>
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
                {filteredBooklets.map(booklet => (
                  <tr key={booklet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booklet.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {booklet.versions.map(version => (
                          <span key={version} className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {version}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booklet.createdBy.name}</div>
                      <div className="text-sm text-gray-500">{booklet.createdBy.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booklet.questionCount} soru
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booklet.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booklet.downloadCount} kez
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handlePreviewBooklet(booklet.id)}
                        >
                          <Eye className="mr-1.5 h-3 w-3 text-gray-400" />
                          Önizle
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleDownloadBooklet(booklet.id)}
                        >
                          <Download className="mr-1.5 h-3 w-3 text-gray-400" />
                          İndir
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleDeleteBooklet(booklet.id)}
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