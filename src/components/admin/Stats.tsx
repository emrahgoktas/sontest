import React, { useState, useEffect } from 'react';
import { Users, FileText, BookOpen, Monitor, Download, Clock, Award, TrendingUp } from 'lucide-react';

/**
 * Stats Component
 * Displays system-wide statistics and analytics
 */

interface SystemStats {
  userStats: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    activeUsers: number;
    newUsersThisMonth: number;
    premiumUsers: number;
  };
  contentStats: {
    totalTests: number;
    totalBooklets: number;
    totalOnlineExams: number;
    totalQuestions: number;
    testsCreatedThisMonth: number;
    averageQuestionsPerTest: number;
  };
  usageStats: {
    totalDownloads: number;
    totalExamParticipants: number;
    averageTestScore: number;
    mostActiveTeacher: string;
    mostPopularTest: string;
    averageSessionDuration: number;
  };
}

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Fetch stats (mock data for now)
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockStats: SystemStats = {
          userStats: {
            totalUsers: 1250,
            totalTeachers: 850,
            totalStudents: 380,
            activeUsers: 720,
            newUsersThisMonth: 85,
            premiumUsers: 210
          },
          contentStats: {
            totalTests: 3450,
            totalBooklets: 1280,
            totalOnlineExams: 620,
            totalQuestions: 42500,
            testsCreatedThisMonth: 320,
            averageQuestionsPerTest: 12.3
          },
          usageStats: {
            totalDownloads: 8750,
            totalExamParticipants: 12400,
            averageTestScore: 72.5,
            mostActiveTeacher: 'Ahmet Öğretmen',
            mostPopularTest: 'Matematik 1. Dönem Sınavı',
            averageSessionDuration: 28.5
          }
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-lg text-gray-600">İstatistikler yükleniyor...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">İstatistikler yüklenemedi</h3>
        <p className="mt-1 text-gray-500">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistem İstatistikleri</h2>
          <p className="text-gray-600">Platformun genel kullanım istatistikleri ve analizleri</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
              timeRange === 'week' 
                ? 'bg-blue-50 text-blue-700 z-10' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Haftalık
          </button>
          <button
            type="button"
            className={`relative -ml-px inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
              timeRange === 'month' 
                ? 'bg-blue-50 text-blue-700 z-10' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Aylık
          </button>
          <button
            type="button"
            className={`relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
              timeRange === 'year' 
                ? 'bg-blue-50 text-blue-700 z-10' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('year')}
          >
            Yıllık
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kullanıcı İstatistikleri</h3>
              <p className="text-sm text-gray-500">Kullanıcı sayıları ve dağılımları</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Kullanıcı</span>
              <span className="text-lg font-semibold text-gray-900">{stats.userStats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Öğretmen</span>
              <span className="text-lg font-semibold text-blue-600">{stats.userStats.totalTeachers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Öğrenci</span>
              <span className="text-lg font-semibold text-green-600">{stats.userStats.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aktif Kullanıcı</span>
              <span className="text-lg font-semibold text-purple-600">{stats.userStats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Yeni Kullanıcı (Bu Ay)</span>
              <span className="text-lg font-semibold text-orange-600">{stats.userStats.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Premium Kullanıcı</span>
              <span className="text-lg font-semibold text-yellow-600">{stats.userStats.premiumUsers}</span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">İçerik İstatistikleri</h3>
              <p className="text-sm text-gray-500">Test ve soru istatistikleri</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Test</span>
              <span className="text-lg font-semibold text-gray-900">{stats.contentStats.totalTests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Kitapçık</span>
              <span className="text-lg font-semibold text-blue-600">{stats.contentStats.totalBooklets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Online Sınav</span>
              <span className="text-lg font-semibold text-green-600">{stats.contentStats.totalOnlineExams}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Soru</span>
              <span className="text-lg font-semibold text-purple-600">{stats.contentStats.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bu Ay Oluşturulan Test</span>
              <span className="text-lg font-semibold text-orange-600">{stats.contentStats.testsCreatedThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ortalama Soru/Test</span>
              <span className="text-lg font-semibold text-yellow-600">{stats.contentStats.averageQuestionsPerTest}</span>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kullanım İstatistikleri</h3>
              <p className="text-sm text-gray-500">Platform kullanım verileri</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam İndirme</span>
              <span className="text-lg font-semibold text-gray-900">{stats.usageStats.totalDownloads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sınav Katılımcıları</span>
              <span className="text-lg font-semibold text-blue-600">{stats.usageStats.totalExamParticipants}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ortalama Test Puanı</span>
              <span className="text-lg font-semibold text-green-600">{stats.usageStats.averageTestScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Aktif Öğretmen</span>
              <span className="text-lg font-semibold text-purple-600">{stats.usageStats.mostActiveTeacher}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Popüler Test</span>
              <span className="text-sm font-semibold text-orange-600 text-right">{stats.usageStats.mostPopularTest}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ort. Oturum Süresi</span>
              <span className="text-lg font-semibold text-yellow-600">{stats.usageStats.averageSessionDuration} dk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Teachers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Aktif Öğretmenler</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">A</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Ahmet Öğretmen</div>
                  <div className="text-xs text-gray-500">85 test oluşturuldu</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">1.</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">Z</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Zeynep Öğretmen</div>
                  <div className="text-xs text-gray-500">72 test oluşturuldu</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">2.</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">M</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Mehmet Öğretmen</div>
                  <div className="text-xs text-gray-500">68 test oluşturuldu</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-700" />
                <span className="text-sm font-medium text-gray-900">3.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Popüler Testler</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Matematik 1. Dönem Sınavı</div>
                  <div className="text-xs text-gray-500">Ahmet Öğretmen</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">245</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Türkçe Paragraf Testi</div>
                  <div className="text-xs text-gray-500">Ayşe Öğretmen</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">198</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Fizik Kuvvet ve Hareket</div>
                  <div className="text-xs text-gray-500">Ali Öğretmen</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Aktivite</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-700">Yeni Kullanıcılar</div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">+85</div>
            <div className="text-xs text-blue-600 mt-1">Geçen aya göre %12 artış</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-green-700">Oluşturulan Testler</div>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">+320</div>
            <div className="text-xs text-green-600 mt-1">Geçen aya göre %8 artış</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-700">Sınav Katılımcıları</div>
              <Monitor className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">+1,250</div>
            <div className="text-xs text-purple-600 mt-1">Geçen aya göre %15 artış</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-orange-700">Ortalama Oturum</div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-800">28.5 dk</div>
            <div className="text-xs text-orange-600 mt-1">Geçen aya göre %5 artış</div>
          </div>
        </div>
      </div>
    </div>
  );
};