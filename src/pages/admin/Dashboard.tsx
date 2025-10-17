import React, { useState, useEffect } from 'react';
import { Users, FileText, BookOpen, Monitor, Sparkles, TrendingUp } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { adminAPI } from '../../utils/api';

/**
 * Admin Dashboard Page
 * Shows overview statistics and charts
 */

interface DashboardStats {
  users: {
    total: number;
    free: number;
    pro: number;
    premium: number;
    newThisWeek: number;
  };
  content: {
    totalTests: number;
    totalBooklets: number;
    totalAITests: number;
    totalQuestions: number;
  };
  activity: {
    dailyActiveUsers: number[];
    testCreation: number[];
    dates: string[];
  };
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await adminAPI.getDashboardStats();
        
        if (response.success) {
          setStats(response.data);
        } else {
          // Fallback to basic stats if API doesn't return full data
          const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
          });
          
          const fallbackStats: DashboardStats = {
            users: {
              total: 0,
              free: 0,
              pro: 0,
              premium: 0,
              newThisWeek: 0
            },
            content: {
              totalTests: 0,
              totalBooklets: 0,
              totalAITests: 0,
              totalQuestions: 0
            },
            activity: {
              dailyActiveUsers: [0, 0, 0, 0, 0, 0, 0],
              testCreation: [0, 0, 0, 0, 0, 0, 0],
              dates
            }
          };
        
          setStats(fallbackStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set empty stats on error
        setStats({
          users: { total: 0, free: 0, pro: 0, premium: 0, newThisWeek: 0 },
          content: { totalTests: 0, totalBooklets: 0, totalAITests: 0, totalQuestions: 0 },
          activity: { dailyActiveUsers: [], testCreation: [], dates: [] }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard" description="Sistem genel bakış ve istatistikler">
        <div className="text-center mb-4">
          <p className="text-green-600 font-medium">Admin girişi başarılı! Veriler yükleniyor...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-lg text-gray-600">Yükleniyor...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard" description="Sistem genel bakış ve istatistikler">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">İstatistikler yüklenemedi</h3>
          <p className="mt-1 text-gray-500">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" description="Sistem genel bakış ve istatistikler">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.users.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 font-medium">+{stats.users.newThisWeek}</span>
              <span className="text-gray-500 ml-1">bu hafta</span>
            </div>
            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Free</span>
                <span className="font-medium">{stats.users.free}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Pro</span>
                <span className="font-medium">{stats.users.pro}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Premium</span>
                <span className="font-medium">{stats.users.premium}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Test</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.totalTests}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 font-medium">+{stats.activity.testCreation[6]}</span>
              <span className="text-gray-500 ml-1">bugün</span>
            </div>
            <div>
              <span className="text-gray-500">Toplam Soru:</span>
              <span className="font-medium ml-1">{stats.content.totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Total Booklets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kitapçık</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.totalBooklets}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 font-medium">+28</span>
              <span className="text-gray-500 ml-1">bu hafta</span>
            </div>
            <div>
              <span className="text-gray-500">Ortalama:</span>
              <span className="font-medium ml-1">4 versiyon</span>
            </div>
          </div>
        </div>

        {/* AI Generated Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI ile Oluşturulan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.totalAITests}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 font-medium">+15</span>
              <span className="text-gray-500 ml-1">bu hafta</span>
            </div>
            <div>
              <span className="text-gray-500">Toplam:</span>
              <span className="font-medium ml-1">{Math.round(stats.content.totalAITests / stats.content.totalTests * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Son 7 Gün Aktivitesi</h3>
            <p className="text-sm text-gray-500">Günlük aktif kullanıcı ve test oluşturma sayıları</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Aktif Kullanıcı</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Test Oluşturma</span>
            </div>
          </div>
        </div>
        
        {/* Chart (simplified representation) */}
        <div className="h-64 relative">
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
            {stats.activity.dates.map((date, index) => (
              <div key={index} className="text-xs text-gray-500">{date}</div>
            ))}
          </div>
          
          {/* Chart bars - simplified representation */}
          <div className="absolute inset-0 bottom-6 flex items-end justify-between px-4">
            {stats.activity.dailyActiveUsers.map((value, index) => {
              const height = (value / Math.max(...stats.activity.dailyActiveUsers)) * 70;
              const testHeight = (stats.activity.testCreation[index] / Math.max(...stats.activity.testCreation)) * 70;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1 w-8">
                  {/* User bar */}
                  <div 
                    className="w-4 bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  
                  {/* Test bar */}
                  <div 
                    className="w-4 bg-green-500 rounded-t"
                    style={{ height: `${testHeight}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute top-0 left-0 bottom-6 flex flex-col justify-between">
            <div className="text-xs text-gray-500">{Math.max(...stats.activity.dailyActiveUsers)}</div>
            <div className="text-xs text-gray-500">{Math.round(Math.max(...stats.activity.dailyActiveUsers) / 2)}</div>
            <div className="text-xs text-gray-500">0</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Dağılımı</h3>
          
          <div className="space-y-4">
            {/* Free Users */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Ücretsiz</span>
                <span className="text-sm font-medium text-gray-900">{stats.users.free}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(stats.users.free / stats.users.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Pro Users */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Pro</span>
                <span className="text-sm font-medium text-gray-900">{stats.users.pro}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.users.pro / stats.users.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Premium Users */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Premium</span>
                <span className="text-sm font-medium text-gray-900">{stats.users.premium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats.users.premium / stats.users.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
              <div className="text-lg font-semibold text-gray-900">{stats.users.total}</div>
            </div>
          </div>
        </div>

        {/* Top Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Öne Çıkan İstatistikler</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Günlük Aktif Kullanıcı</div>
                  <div className="text-xs text-gray-500">Son 24 saat</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">{stats.activity.dailyActiveUsers[6]}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Günlük Oluşturulan Test</div>
                  <div className="text-xs text-gray-500">Son 24 saat</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">{stats.activity.testCreation[6]}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Aktif Online Sınav</div>
                  <div className="text-xs text-gray-500">Şu anda devam eden</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">18</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">AI Kullanım Oranı</div>
                  <div className="text-xs text-gray-500">Premium kullanıcılar</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">68%</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;