import React, { useState } from 'react';
import { Archive, Search, Filter, Plus, Eye, Trash2, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTestArchive } from '../../hooks/useTestArchive';
import { ArchivedTest } from '../../types/booklet';

/**
 * Test Arşivi Bileşeni
 * Kaydedilmiş testleri görüntüleme ve yönetme
 */

interface TestArchiveProps {
  onSelectTest?: (test: ArchivedTest) => void;
  onCreateNewTest?: () => void;
}

export const TestArchive: React.FC<TestArchiveProps> = ({
  onSelectTest,
  onCreateNewTest
}) => {
  const { archivedTests, isLoading, deleteTest, getPopularTags } = useTestArchive();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const popularTags = getPopularTags();

  /**
   * Testleri filtreleme
   */
  const filteredTests = archivedTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.metadata.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.metadata.className?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => test.tags.includes(tag));

    return matchesSearch && matchesTags;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return a.name.localeCompare(b.name);
  });

  /**
   * Etiket seçimi
   */
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  /**
   * Test silme
   */
  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Bu testi silmek istediğinizden emin misiniz?')) {
      await deleteTest(testId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 rounded-lg p-2">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Arşivi</h2>
            <p className="text-gray-600">Kaydedilmiş testlerinizi görüntüleyin ve yönetin</p>
          </div>
        </div>

        {onCreateNewTest && (
          <Button onClick={onCreateNewTest} icon={Plus}>
            Yeni Test Oluştur
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Test adı, ders veya sınıf ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Tarihe göre</option>
              <option value="name">İsme göre</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        {popularTags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Popüler Etiketler:</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-2">Yükleniyor...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedTags.length > 0 ? 'Test bulunamadı' : 'Henüz test yok'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedTags.length > 0 
                ? 'Arama kriterlerinize uygun test bulunamadı'
                : 'İlk testinizi oluşturmak için başlayın'
              }
            </p>
            {onCreateNewTest && (
              <Button onClick={onCreateNewTest} icon={Plus}>
                Yeni Test Oluştur
              </Button>
            )}
          </div>
        ) : (
          filteredTests.map(test => (
            <div key={test.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {test.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Ders:</span> {test.metadata.courseName || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Sınıf:</span> {test.metadata.className || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Soru Sayısı:</span> {test.questions.length}
                    </div>
                    <div>
                      <span className="font-medium">Tarih:</span> {test.createdAt.toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  {test.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {test.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {onSelectTest && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => onSelectTest(test)}
                    >
                      Görüntüle
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => alert('Test indirme özelliği yakında eklenecek')}
                  >
                    İndir
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteTest(test.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredTests.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{archivedTests.length}</div>
              <div className="text-sm text-gray-600">Toplam Test</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {archivedTests.reduce((sum, test) => sum + test.questions.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Soru</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{popularTags.length}</div>
              <div className="text-sm text-gray-600">Etiket</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredTests.length}
              </div>
              <div className="text-sm text-gray-600">Filtrelenmiş</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};