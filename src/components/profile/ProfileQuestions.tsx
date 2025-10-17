import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Plus, Trash2, Tag, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SavedQuestion, ProfileFilters } from '../../types/profile';
import { AppStep } from '../../types';
import { profileAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Kaydedilen Soru Görselleri Bileşeni
 * Grid layout ile responsive tasarım
 */

interface ProfileQuestionsProps {
  onNavigateToStep?: (step: AppStep) => void;
}

export const ProfileQuestions: React.FC<ProfileQuestionsProps> = ({
  onNavigateToStep
}) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProfileFilters>({
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<SavedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getQuestions({
          search: filters.searchTerm,
        });
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedQuestions: SavedQuestion[] = response.data.map((question: any) => ({
            id: question.id.toString(),
            originalQuestionId: question.id.toString(),
            imageData: question.image_data || '',
            correctAnswer: question.correct_answer,
            tags: question.tags || [],
            sourceTest: question.test?.title || 'Bilinmeyen Test',
            pageNumber: 1,
            createdAt: new Date(question.created_at),
            usageCount: question.usage_count || 0,
            difficulty: question.difficulty,
            subject: question.subject
          }));
          
          setQuestions(transformedQuestions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [filters.searchTerm]);

  /**
   * Soruları filtrele
   */
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = !filters.searchTerm || 
      question.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
      question.sourceTest?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
      question.subject?.toLowerCase().includes(filters.searchTerm!.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
      case 'usage':
        return (a.usageCount - b.usageCount) * order;
      case 'name':
        return (a.sourceTest || '').localeCompare(b.sourceTest || '') * order;
      default:
        return 0;
    }
  });

  /**
   * Soru seçimi
   */
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  /**
   * Tümünü seç/seçimi kaldır
   */
  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  /**
   * Zorluk seviyesi rengi
   */
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Zorluk seviyesi etiketi
   */
  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmeyen';
    }
  };

  /**
   * Navigate to manual question editor
   */
  const handleAddQuestion = () => {
    navigate('/manual-question-editor');
  };

  /**
   * Preview question
   */
  const handlePreviewQuestion = (question: SavedQuestion) => {
    // Create HTML preview for the question
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soru Önizleme</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .question-container { border: 2px solid #e5e5e5; border-radius: 8px; padding: 20px; background: #fafafa; }
          .question-image { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; margin: 20px 0; }
          .question-info { background: #f0f9ff; padding: 15px; border-radius: 6px; margin-top: 20px; }
          .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
          .tag { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="question-container">
          <h2>Soru Önizlemesi</h2>
          <img src="${question.imageData}" alt="Soru Görseli" class="question-image">
          <div class="question-info">
            <p><strong>Doğru Cevap:</strong> ${question.correctAnswer}</p>
            <p><strong>Kaynak Test:</strong> ${question.sourceTest || 'Bilinmeyen'}</p>
            <p><strong>Kullanım Sayısı:</strong> ${question.usageCount} kez</p>
            <p><strong>Oluşturulma Tarihi:</strong> ${question.createdAt.toLocaleDateString('tr-TR')}</p>
            ${question.difficulty ? `<p><strong>Zorluk:</strong> ${getDifficultyLabel(question.difficulty)}</p>` : ''}
            ${question.subject ? `<p><strong>Ders:</strong> ${question.subject}</p>` : ''}
            ${question.tags.length > 0 ? `
              <div class="tags">
                <strong>Etiketler:</strong>
                ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
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
   * Add question to test
   */
  const handleAddToTest = (question: SavedQuestion) => {
    // Show modal to select which test to add to
    const testSelection = prompt('Bu soruyu hangi teste eklemek istiyorsunuz? (Test ID girin)');
    if (testSelection) {
      // In a real implementation, this would call an API
      alert(`Soru "${question.id}" test "${testSelection}"'e eklendi! (Bu özellik API entegrasyonu ile tamamlanacak)`);
      
      // Update usage count locally
      setQuestions(prev => 
        prev.map(q => 
          q.id === question.id 
            ? { ...q, usageCount: q.usageCount + 1 }
            : q
        )
      );
    }
  };

  /**
   * Delete question
   */
  const handleDeleteQuestion = (question: SavedQuestion) => {
    if (window.confirm(`"${question.sourceTest}" testinden bu soruyu silmek istediğinizden emin misiniz?`)) {
      // In a real implementation, this would call an API
      setQuestions(prev => prev.filter(q => q.id !== question.id));
      alert('Soru başarıyla silindi!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kaydedilen Soru Görselleri</h2>
          <p className="text-gray-600">Arşivlediğiniz soru görsellerini yönetin</p>
        </div>
        <Button
          onClick={handleAddQuestion}
          icon={Plus}
        >
          Soru Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Soru ara (etiket, test adı, ders)..."
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
                <option value="usage">Kullanıma göre</option>
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

        {/* Bulk Actions */}
        {selectedQuestions.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-sm text-blue-800">
              {selectedQuestions.length} soru seçildi
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Toplu teste ekleme özelliği yakında!')}
              >
                Teste Ekle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Toplu silme özelliği yakında!')}
                className="text-red-600 hover:text-red-700"
              >
                Sil
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Sorular yükleniyor...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchTerm ? 'Soru bulunamadı' : 'Henüz soru yok'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm 
              ? 'Arama kriterlerinize uygun soru bulunamadı'
              : 'İlk sorunuzu eklemek için test oluşturun'
            }
          </p>
          <Button
            onClick={() => onNavigateToStep && onNavigateToStep('upload')}
            icon={Plus}
          >
            Yeni Test Oluştur
          </Button>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedQuestions.length === filteredQuestions.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Tümünü seç</span>
            </label>
            <span className="text-sm text-gray-500">
              {filteredQuestions.length} soru gösteriliyor
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className={`
                  bg-white rounded-lg border-2 transition-all duration-200 overflow-hidden
                  ${selectedQuestions.includes(question.id)
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Selection Checkbox */}
                <div className="p-3 border-b border-gray-100">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => toggleQuestionSelection(question.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {question.sourceTest} - Sayfa {question.pageNumber}
                    </span>
                  </label>
                </div>

                {/* Question Image */}
                <div className="p-4">
                  <div className="bg-gray-100 rounded-lg p-2 mb-3">
                    <img
                      src={question.imageData}
                      alt={`Soru ${question.id}`}
                      className="w-full h-32 object-contain rounded"
                    />
                  </div>

                  {/* Question Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Doğru Cevap:</span>
                      <span className="font-medium text-gray-900">{question.correctAnswer}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Kullanım:</span>
                      <span className="font-medium text-gray-900">{question.usageCount} kez</span>
                    </div>

                    {question.difficulty && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Zorluk:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyLabel(question.difficulty)}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {question.createdAt.toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  {/* Tags */}
                  {question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          <Tag size={10} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{question.tags.length - 3} daha
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 p-3">
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => handlePreviewQuestion(question)}
                    >
                      Önizle
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleAddToTest(question)}
                      >
                        Teste Ekle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};