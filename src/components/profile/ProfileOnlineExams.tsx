import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Copy, Power, PowerOff, BarChart3, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OnlineExamSummary, ProfileFilters } from '../../types/profile';
import { profileAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Online Sınavlar Bileşeni
 * Online sınav yönetimi ve durum kontrolü
 */

export const ProfileOnlineExams: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProfileFilters>({
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [exams, setExams] = useState<OnlineExamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch online exams from API
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getOnlineExams({
          search: filters.searchTerm,
        });
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedExams: OnlineExamSummary[] = response.data.map((exam: any) => ({
            id: exam.id.toString(),
            title: exam.title,
            isActive: exam.is_active || false,
            participantCount: exam.participant_count || 0,
            createdAt: new Date(exam.created_at),
            startDate: exam.start_date ? new Date(exam.start_date) : undefined,
            endDate: exam.end_date ? new Date(exam.end_date) : undefined,
            averageScore: exam.average_score
          }));
          
          setExams(transformedExams);
        }
      } catch (error) {
        console.error('Error fetching online exams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [filters.searchTerm]);

  /**
   * Sınavları filtrele
   */
  const filteredExams = exams.filter(exam => {
    const matchesSearch = !filters.searchTerm || 
      exam.title.toLowerCase().includes(filters.searchTerm!.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
      case 'name':
        return a.title.localeCompare(b.title) * order;
      default:
        return 0;
    }
  });

  /**
   * Sınav durumunu getir
   */
  const getExamStatus = (exam: OnlineExamSummary) => {
    if (!exam.isActive) {
      return { label: 'Kapalı', color: 'bg-red-100 text-red-800' };
    }
    
    const now = new Date();
    if (exam.startDate && exam.endDate) {
      if (now < exam.startDate) {
        return { label: 'Başlamadı', color: 'bg-yellow-100 text-yellow-800' };
      } else if (now > exam.endDate) {
        return { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' };
      } else {
        return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
      }
    }
    
    return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
  };

  /**
   * Sınav durumunu değiştir
   */
  const toggleExamStatus = async (exam: OnlineExamSummary) => {
    const action = exam.isActive ? 'kapatmak' : 'açmak';
    if (window.confirm(`"${exam.title}" sınavını ${action} istediğinizden emin misiniz?`)) {
      try {
        // In a real implementation, this would call toggleExamStatus API
        // await onlineExamAPI.toggleExamStatus(exam.id);
        
        // Update local state
        setExams(prev => 
          prev.map(e => 
            e.id === exam.id 
              ? { ...e, isActive: !e.isActive }
              : e
          )
        );
        
        alert(`Sınav başarıyla ${exam.isActive ? 'kapatıldı' : 'açıldı'}!`);
      } catch (error) {
        console.error('Exam status toggle error:', error);
        alert('Sınav durumu değiştirilirken hata oluştu.');
      }
    }
  };

  /**
   * View exam results
   */
  const handleViewResults = (exam: OnlineExamSummary) => {
    // Generate results HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${exam.title} - Sonuçlar</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-value { font-size: 2rem; font-weight: bold; color: #1e40af; }
          .stat-label { color: #64748b; margin-top: 5px; }
          .info-section { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${exam.title}</h1>
          <p>Sınav Sonuçları Raporu</p>
        </div>
        
        <div class="info-section">
          <h3>Sınav Bilgileri</h3>
          <p><strong>Oluşturulma:</strong> ${exam.createdAt.toLocaleDateString('tr-TR')}</p>
          ${exam.startDate ? `<p><strong>Başlangıç:</strong> ${exam.startDate.toLocaleDateString('tr-TR')}</p>` : ''}
          ${exam.endDate ? `<p><strong>Bitiş:</strong> ${exam.endDate.toLocaleDateString('tr-TR')}</p>` : ''}
          <p><strong>Durum:</strong> ${exam.isActive ? 'Aktif' : 'Kapalı'}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${exam.participantCount}</div>
            <div class="stat-label">Toplam Katılımcı</div>
          </div>
          ${exam.averageScore ? `
            <div class="stat-card">
              <div class="stat-value">${exam.averageScore.toFixed(1)}%</div>
              <div class="stat-label">Ortalama Başarı</div>
            </div>
          ` : ''}
          <div class="stat-card">
            <div class="stat-value">${exam.isActive ? 'Aktif' : 'Kapalı'}</div>
            <div class="stat-label">Sınav Durumu</div>
          </div>
        </div>
        
        ${exam.participantCount === 0 ? `
          <div style="text-align: center; padding: 40px; color: #64748b;">
            <p>Henüz katılımcı bulunmuyor.</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    const resultsWindow = window.open('', '_blank');
    if (resultsWindow) {
      resultsWindow.document.write(htmlContent);
      resultsWindow.document.close();
    } else {
      alert('Popup engelleyici nedeniyle sonuçlar açılamadı. Lütfen popup engelleyiciyi devre dışı bırakın.');
    }
  };

  /**
   * Copy exam
   */
  const handleCopyExam = (exam: OnlineExamSummary) => {
    const newTitle = prompt('Kopyalanan sınav için yeni başlık girin:', `${exam.title} (Kopya)`);
    if (newTitle && newTitle.trim()) {
      // In a real implementation, this would call an API to duplicate the exam
      const newExam: OnlineExamSummary = {
        ...exam,
        id: `exam_copy_${Date.now()}`,
        title: newTitle.trim(),
        isActive: false,
        participantCount: 0,
        createdAt: new Date(),
        averageScore: undefined
      };
      
      setExams(prev => [newExam, ...prev]);
      alert('Sınav başarıyla kopyalandı!');
    }
  };

  /**
   * Delete exam
   */
  const handleDeleteExam = async (exam: OnlineExamSummary) => {
    if (window.confirm(`"${exam.title}" sınavını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        // In a real implementation, this would call delete API
        // await onlineExamAPI.deleteOnlineExam(exam.id);
        
        // Update local state
        setExams(prev => prev.filter(e => e.id !== exam.id));
        alert('Sınav başarıyla silindi!');
      } catch (error) {
        console.error('Exam delete error:', error);
        alert('Sınav silinirken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  /**
   * Navigate to online exam creator
   */
  const handleCreateOnlineExam = () => {
    navigate('/online-exam');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Sınavlar</h2>
          <p className="text-gray-600">Online sınavlarınızı yönetin ve sonuçları takip edin</p>
        </div>
        <Button
          onClick={handleCreateOnlineExam}
          icon={Plus}
        >
          Yeni Online Sınav
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Sınav ara..."
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

      {/* Exams List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Online sınavlar yükleniyor...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.searchTerm ? 'Sınav bulunamadı' : 'Henüz online sınav yok'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm 
              ? 'Arama kriterlerinize uygun sınav bulunamadı'
              : 'İlk online sınavınızı oluşturmak için başlayın'
            }
          </p>
          <Button
            onClick={handleCreateOnlineExam}
            icon={Plus}
          >
            Yeni Online Sınav Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            
            return (
              <div
                key={exam.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Exam Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {exam.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{exam.participantCount} katılımcı</span>
                          {exam.averageScore && (
                            <>
                              <span>•</span>
                              <span>Ortalama: {exam.averageScore.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Exam Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Oluşturulma:</span>
                        <div className="font-medium text-gray-900">{exam.createdAt.toLocaleDateString('tr-TR')}</div>
                      </div>
                      {exam.startDate && (
                        <div>
                          <span className="text-sm text-gray-600">Başlangıç:</span>
                          <div className="font-medium text-gray-900">{exam.startDate.toLocaleDateString('tr-TR')}</div>
                        </div>
                      )}
                      {exam.endDate && (
                        <div>
                          <span className="text-sm text-gray-600">Bitiş:</span>
                          <div className="font-medium text-gray-900">{exam.endDate.toLocaleDateString('tr-TR')}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Katılımcı:</span>
                        <div className="font-medium text-gray-900">{exam.participantCount} kişi</div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    {exam.averageScore && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Ortalama Başarı:</span>
                          <span className="font-medium">{exam.averageScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              exam.averageScore >= 80 ? 'bg-green-500' :
                              exam.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(exam.averageScore, 100)}%` }}
                          ></div>
                        </div>
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
                      icon={BarChart3}
                      onClick={() => handleViewResults(exam)}
                    >
                      Sonuçları Gör
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Copy}
                      onClick={() => handleCopyExam(exam)}
                    >
                      Sınavı Kopyala
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={exam.isActive ? PowerOff : Power}
                      onClick={() => toggleExamStatus(exam)}
                      className={exam.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {exam.isActive ? 'Kapat' : 'Aç'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteExam(exam)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {filteredExams.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{exams.length}</div>
              <div className="text-sm text-gray-600">Toplam Sınav</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {exams.filter(exam => exam.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Aktif Sınav</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {exams.reduce((sum, exam) => sum + exam.participantCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Katılımcı</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {exams.filter(exam => exam.averageScore).length > 0 
                  ? (exams.filter(exam => exam.averageScore).reduce((sum, exam) => sum + (exam.averageScore || 0), 0) / 
                     exams.filter(exam => exam.averageScore).length).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="text-sm text-gray-600">Genel Ortalama</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};