import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Printer, Trash2, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BookletSummary, ProfileFilters } from '../../types/profile';
import { profileAPI } from '../../utils/api';

/**
 * Kitapçıklar Bileşeni
 * Liste görünümü ile kitapçık yönetimi
 */

export const ProfileBooklets: React.FC = () => {
  const [filters, setFilters] = useState<ProfileFilters>({
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [booklets, setBooklets] = useState<BookletSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch booklets from API
  useEffect(() => {
    const fetchBooklets = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getBooklets({
          search: filters.searchTerm,
        });
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedBooklets: BookletSummary[] = response.data.map((booklet: any) => ({
            id: booklet.id.toString(),
            testName: booklet.name,
            versions: booklet.versions,
            createdAt: new Date(booklet.created_at),
            downloadCount: booklet.download_count || 0,
            totalQuestions: booklet.question_count || 0
          }));
          
          setBooklets(transformedBooklets);
        }
      } catch (error) {
        console.error('Error fetching booklets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooklets();
  }, [filters.searchTerm]);

  /**
   * Kitapçıkları filtrele
   */
  const filteredBooklets = booklets.filter(booklet => {
    const matchesSearch = !filters.searchTerm || 
      booklet.testName.toLowerCase().includes(filters.searchTerm!.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
      case 'name':
        return a.testName.localeCompare(b.testName) * order;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitapçıklar</h2>
          <p className="text-gray-600">Oluşturduğunuz kitapçık versiyonlarını yönetin</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredBooklets.length} kitapçık seti
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Kitapçık ara..."
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
                <option value="name">İsme göre</option>
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

      {/* Booklets List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Kitapçıklar yükleniyor...</p>
        </div>
      ) : filteredBooklets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchTerm ? 'Kitapçık bulunamadı' : 'Henüz kitapçık yok'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm 
              ? 'Arama kriterlerinize uygun kitapçık bulunamadı'
              : 'İlk kitapçığınızı oluşturmak için test oluşturun'
            }
          </p>
          <Button
            onClick={() => alert('Yeni test oluşturma özelliği yakında!')}
          >
            Yeni Test Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBooklets.map((booklet) => (
            <div
              key={booklet.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Booklet Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booklet.testName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{booklet.versions.length} versiyon</span>
                        <span>•</span>
                        <span>{booklet.totalQuestions} soru</span>
                        <span>•</span>
                        <span>{booklet.downloadCount} indirme</span>
                      </div>
                    </div>
                  </div>

                  {/* Versions */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 mb-2 block">Kitapçık Versiyonları:</span>
                    <div className="flex flex-wrap gap-2">
                      {booklet.versions.map((version) => (
                        <span
                          key={version}
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {version}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booklet Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Oluşturulma:</span>
                      <div className="font-medium text-gray-900">{booklet.createdAt.toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Toplam Soru:</span>
                      <div className="font-medium text-gray-900">{booklet.totalQuestions}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">İndirme Sayısı:</span>
                      <div className="font-medium text-gray-900">{booklet.downloadCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => alert('Kitapçık önizleme özelliği yakında!')}
                  >
                    PDF Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => alert('PDF indirme özelliği yakında!')}
                  >
                    PDF İndir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => alert('Yazdırma özelliği yakında!')}
                  >
                    Yazdır
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => alert('Kitapçık silme özelliği yakında!')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Sil
                  </Button>
                </div>
              </div>

              {/* Version Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {booklet.versions.map((version) => (
                    <div key={version} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        Kitapçık {version}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {booklet.totalQuestions} soru
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => alert(`Kitapçık ${version} önizleme özelliği yakında!`)}
                          className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Önizle
                        </button>
                        <button
                          onClick={() => alert(`Kitapçık ${version} indirme özelliği yakında!`)}
                          className="w-full text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          İndir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredBooklets.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{booklets.length}</div>
              <div className="text-sm text-gray-600">Kitapçık Seti</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {booklets.reduce((sum, booklet) => sum + booklet.versions.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Versiyon</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {booklets.reduce((sum, booklet) => sum + booklet.totalQuestions, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Soru</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {booklets.reduce((sum, booklet) => sum + booklet.downloadCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam İndirme</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};