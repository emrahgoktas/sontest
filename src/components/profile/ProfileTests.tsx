import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, BookOpen, Monitor, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SavedTest, ProfileFilters } from '../../types/profile';
import { profileAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Kayıtlı Testler Bileşeni
 * Liste görünümü ile test yönetimi
 */

export const ProfileTests: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProfileFilters>({
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [tests, setTests] = useState<SavedTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        // First try to get tests from API
        try {
          const response = await profileAPI.getTests({
            search: filters.searchTerm,
          });
          
          if (response.success) {
            // Transform API data to match component interface
            const apiTests: SavedTest[] = response.data.map((test: any) => ({
              id: test.id.toString(),
              name: test.title,
              metadata: {
                testName: test.title,
                className: test.class_name,
                courseName: test.lesson,
                teacherName: test.teacher_name,
                questionSpacing: test.question_spacing || 5
              },
              questions: [], // Questions will be loaded separately if needed
              theme: test.theme || 'classic',
              createdAt: new Date(test.created_at),
              updatedAt: new Date(test.updated_at),
              tags: test.tags || [],
              isPublic: test.is_public || false,
              downloadCount: test.download_count || 0
            }));
            
            // Also get locally saved tests (including PDF uploads)
            const localTests = getLocalSavedTests();
            
            // Combine API tests and local tests
            const allTests = [...apiTests, ...localTests];
            setTests(allTests);
            return;
          }
        } catch (apiError) {
          console.warn('API tests fetch failed, using local storage:', apiError);
        }
        
        // Fallback to local storage only
        const localTests = getLocalSavedTests();
        setTests(localTests);
        
      } catch (error) {
        console.error('Error fetching tests:', error);
        // Even if everything fails, try to show local tests
        try {
          const localTests = getLocalSavedTests();
          setTests(localTests);
        } catch (localError) {
          console.error('Local tests also failed:', localError);
          setTests([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [filters.searchTerm]);

  /**
   * Get locally saved tests including PDF uploads
   */
  const getLocalSavedTests = (): SavedTest[] => {
    try {
      const savedTests = JSON.parse(localStorage.getItem('savedTests') || '[]');
      return savedTests.map((test: any) => ({
        ...test,
        createdAt: new Date(test.createdAt),
        updatedAt: new Date(test.updatedAt || test.createdAt),
        // Add source indicator for external PDFs
        isExternalPDF: test.tags?.includes('pdf-upload') || false
      }));
    } catch (error) {
      console.error('Error loading local tests:', error);
      return [];
    }
  };
  /**
   * Testleri filtrele
   */
  const filteredTests = (tests || []).filter(test => {
    const matchesSearch = !filters.searchTerm || 
      test.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
      test.metadata.courseName?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
      test.metadata.className?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
      (test.tags || []).some(tag => tag.toLowerCase().includes(filters.searchTerm!.toLowerCase()));

    return matchesSearch;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
      case 'name':
        return a.name.localeCompare(b.name) * order;
      default:
        return 0;
    }
  });

  /**
   * Tema adını getir
   */
  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'classic': return 'Klasik';
      case 'deneme-sinavi': return 'Deneme Sınavı';
      case 'yazili-sinav': return 'Yazılı Sınav';
      case 'yaprak-test': return 'Yaprak Test';
      case 'tyt-2024': return 'TYT 2024';
      default: return theme;
    }
  };

  /**
   * Navigate to test creator (PDF cropping)
   */
  const handleCreateNewTest = () => {
    navigate('/action-selection');
  };

  /**
   * Preview test
   */
  const handlePreviewTest = (test: SavedTest) => {
    // Validate test data before preview
    if (!test || !test.id) {
      alert('Test verisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    if (!test.questions || test.questions.length === 0) {
      alert('Bu testte soru bulunmuyor. Önizleme yapılamaz.');
      return;
    }

    console.log('🔍 Previewing test:', { id: test.id, name: test.name, questionCount: test.questions.length });

    // Generate HTML preview for the test
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${test.name} - Önizleme</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .test-info { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .questions-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
          .question { break-inside: avoid; margin-bottom: 20px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 8px; }
          .question-number { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
          .question-image { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
          @media print { body { margin: 0; padding: 15px; } .question { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${test.name}</h1>
          <p>Test Önizlemesi</p>
        </div>
        <div class="test-info">
          <p><strong>Ders:</strong> ${test.metadata.courseName || '-'}</p>
          <p><strong>Sınıf:</strong> ${test.metadata.className || '-'}</p>
          <p><strong>Öğretmen:</strong> ${test.metadata.teacherName || '-'}</p>
          <p><strong>Soru Sayısı:</strong> ${test.questions.length}</p>
          <p><strong>Tema:</strong> ${getThemeName(test.theme)}</p>
          <p><strong>Oluşturulma:</strong> ${test.createdAt.toLocaleDateString('tr-TR')}</p>
        </div>
        <div class="questions-container">
          ${test.questions.slice(0, 10).map((question, index) => `
            <div class="question">
              <div class="question-number">${index + 1}.</div>
              <img src="${question.imageData}" alt="Soru ${index + 1}" class="question-image">
              <p style="margin-top: 10px; font-size: 12px; color: #666;">Doğru Cevap: ${question.correctAnswer}</p>
            </div>
          `).join('')}
          ${test.questions.length > 10 ? `
            <div style="text-align: center; padding: 20px; color: #666;">
              +${test.questions.length - 10} soru daha...
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Popup engelleyici nedeniyle önizleme açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
    }
  };

  /**
   * Download test PDF
   */
  const handleDownloadPDF = async (test: SavedTest) => {
    // Validate test data before PDF generation
    if (!test || !test.id) {
      alert('Test verisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    if (!test.questions || test.questions.length === 0) {
      alert('Bu testte soru bulunmuyor. PDF oluşturulamaz.');
      return;
    }

    if (!test.metadata) {
      alert('Test metadata bilgisi eksik. PDF oluşturulamaz.');
      return;
    }

    console.log('📄 Generating PDF for test:', { id: test.id, name: test.name, questionCount: test.questions.length });

    try {
      // Import PDF generation utilities
      const { generateThemedTestPDF } = await import('../../utils/pdf/themedCore');
      
      // Generate PDF with test theme
      const pdfBytes = await generateThemedTestPDF(test.metadata, test.questions, {
        theme: test.theme as any,
        includeAnswerKey: true
      });
      
      // Create download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${test.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF successfully downloaded for test:', test.id);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF indirme sırasında hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  /**
   * Create booklet from test
   */
  const handleCreateBooklet = (test: SavedTest) => {
    // Validate test data before booklet creation
    if (!test || !test.id) {
      alert('Test verisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    if (!test.questions || test.questions.length === 0) {
      alert('Bu testte soru bulunmuyor. Kitapçık oluşturulamaz.');
      return;
    }

    if (!test.metadata) {
      alert('Test metadata bilgisi eksik. Kitapçık oluşturulamaz.');
      return;
    }

    console.log('📚 Creating booklet for test:', { id: test.id, name: test.name, questionCount: test.questions.length });

    // Save test data for booklet creation
    localStorage.setItem('bookletSourceTest', JSON.stringify({
      id: test.id,
      name: test.name,
      metadata: test.metadata,
      questions: test.questions,
      theme: test.theme
    }));
    
    alert(`✅ Kitapçık oluşturma için "${test.name}" testi hazırlandı. Kitapçık oluşturucu özelliği yakında eklenecek.`);
  };

  /**
   * Convert to online exam
   */
  const handleConvertToOnlineExam = (test: SavedTest) => {
    // Validate test data before online exam conversion
    if (!test || !test.id) {
      alert('Test verisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    if (!test.questions || test.questions.length === 0) {
      alert('Bu testte soru bulunmuyor. Online sınav oluşturulamaz.');
      return;
    }

    if (!test.metadata) {
      alert('Test metadata bilgisi eksik. Online sınav oluşturulamaz.');
      return;
    }

    console.log('💻 Converting test to online exam:', { id: test.id, name: test.name, questionCount: test.questions.length });

    // Save test data for online exam creation
    try {
      const sourceTestData = {
        id: test.id,
        name: test.name,
        metadata: test.metadata,
        questions: test.questions.slice(0, 10) // Limit to 10 questions to avoid quota
      };
      
      localStorage.setItem('onlineExamSourceTest', JSON.stringify(sourceTestData));
      console.log('💾 Test data saved for online exam conversion');
    } catch (storageError) {
      console.warn('⚠️ localStorage save failed, using direct navigation');
    }
    
    // Navigate to online exam creator
    navigate('/online-exam');
  };

  /**
   * Delete test
   */
  const handleDeleteTest = async (test: SavedTest) => {
    // Validate test data before deletion
    if (!test || !test.id) {
      alert('Test verisi bulunamadı. Silme işlemi yapılamaz.');
      return;
    }

    console.log('🗑️ Deleting test:', { id: test.id, name: test.name });

    if (window.confirm(`"${test.name}" testini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        // In a real implementation, this would call deleteTest API
        // await deleteTest(test.id);
        
        // For now, remove from local state
        setTests(prev => prev.filter(t => t.id !== test.id));
        
        // Also remove from localStorage if exists
        try {
          const savedTests = JSON.parse(localStorage.getItem('savedTests') || '[]');
          const updatedTests = savedTests.filter((t: any) => t.id !== test.id);
          localStorage.setItem('savedTests', JSON.stringify(updatedTests));
        } catch (localError) {
          console.warn('localStorage update failed during deletion');
        }
        
        console.log('✅ Test successfully deleted:', test.id);
        alert(`"${test.name}" testi başarıyla silindi!`);
      } catch (error) {
        console.error('Test delete error:', error);
        alert('Test silinirken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kayıtlı Testler</h2>
          <p className="text-gray-600">Oluşturduğunuz testleri yönetin ve paylaşın</p>
        </div>
        <Button
          onClick={handleCreateNewTest}
          icon={Plus}
        >
          Yeni Test
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Test ara (ad, ders, sınıf, etiket)..."
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

      {/* Tests List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Testler yükleniyor...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchTerm ? 'Test bulunamadı' : 'Henüz test yok'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm 
              ? 'Arama kriterlerinize uygun test bulunamadı'
              : 'İlk testinizi oluşturmak için başlayın'
            }
          </p>
          <Button
            onClick={handleCreateNewTest}
            icon={Plus}
          >
            Yeni Test Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Test Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {test.name}
                        {(test as any).isExternalPDF && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Dışarıdan Yüklenen PDF
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{test.metadata.courseName}</span>
                        <span>•</span>
                        <span>{test.metadata.className}</span>
                        <span>•</span>
                        <span>{test.questions.length} soru</span>
                        <span>•</span>
                        <span>{getThemeName(test.theme)}</span>
                        {(test as any).isExternalPDF && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">PDF Kaynağı</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {test.isPublic && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Herkese Açık
                      </span>
                    )}
                  </div>

                  {/* Test Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Öğretmen:</span>
                      <div className="font-medium text-gray-900">{test.metadata?.teacherName || '-'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Oluşturulma:</span>
                      <div className="font-medium text-gray-900">
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Son Güncelleme:</span>
                      <div className="font-medium text-gray-900">
                        {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString('tr-TR') : 
                         test.createdAt ? new Date(test.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">İndirme:</span>
                      <div className="font-medium text-gray-900">{test.downloadCount || 0} kez</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {test.tags && test.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {test.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handlePreviewTest(test)}
                  >
                    Önizle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadPDF(test)}
                  >
                    PDF İndir
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteTest(test)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredTests.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{tests?.length || 0}</div>
              <div className="text-sm text-gray-600">Toplam Test</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tests?.reduce((sum, test) => sum + (test.questions?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Soru</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {tests?.reduce((sum, test) => sum + (test.downloadCount || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam İndirme</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {tests?.filter(test => test.isPublic).length || 0}
              </div>
              <div className="text-sm text-gray-600">Herkese Açık</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};