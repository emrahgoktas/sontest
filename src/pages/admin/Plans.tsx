import React, { useState, useEffect } from 'react';
import { Crown, Zap, Star, Users, Sparkles, Clock, ArrowUp, Check, X } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/Button';

/**
 * Plans Management Page
 * Displays and manages subscription plans
 */

interface PlanStats {
  free: {
    count: number;
    percentage: number;
    growth: number;
  };
  pro: {
    count: number;
    percentage: number;
    growth: number;
  };
  premium: {
    count: number;
    percentage: number;
    growth: number;
  };
  aiUsage: {
    total: number;
    available: number;
    percentage: number;
  };
}

export const Plans: React.FC = () => {
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<'free' | 'pro' | 'premium' | null>(null);

  // Fetch plan stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockStats: PlanStats = {
          free: {
            count: 850,
            percentage: 68,
            growth: 5.2
          },
          pro: {
            count: 280,
            percentage: 22.4,
            growth: 12.8
          },
          premium: {
            count: 120,
            percentage: 9.6,
            growth: 18.5
          },
          aiUsage: {
            total: 10000,
            available: 3500,
            percentage: 65
          }
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching plan stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  /**
   * Open edit modal
   */
  const handleEditPlan = (plan: 'free' | 'pro' | 'premium') => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  /**
   * Close edit modal
   */
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingPlan(null);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Plan Yönetimi" description="Abonelik planlarını yönetin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-lg text-gray-600">Yükleniyor...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Plan Yönetimi" description="Abonelik planlarını yönetin">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">İstatistikler yüklenemedi</h3>
          <p className="mt-1 text-gray-500">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Plan Yönetimi" description="Abonelik planlarını yönetin">
      {/* Plan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Free Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ücretsiz Plan</h3>
                <p className="text-sm text-gray-500">Temel özellikler</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditPlan('free')}
            >
              Düzenle
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kullanıcı Sayısı</span>
              <span className="text-lg font-semibold text-gray-900">{stats.free.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Yüzde</span>
              <span className="text-lg font-semibold text-gray-900">{stats.free.percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Büyüme (Aylık)</span>
              <span className="flex items-center text-lg font-semibold text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                {stats.free.growth}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Özellikler</span>
              <span className="text-gray-900">5 test / 1 kitapçık</span>
            </div>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pro Plan</h3>
                <p className="text-sm text-gray-500">Gelişmiş özellikler</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditPlan('pro')}
            >
              Düzenle
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kullanıcı Sayısı</span>
              <span className="text-lg font-semibold text-gray-900">{stats.pro.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Yüzde</span>
              <span className="text-lg font-semibold text-gray-900">{stats.pro.percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Büyüme (Aylık)</span>
              <span className="flex items-center text-lg font-semibold text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                {stats.pro.growth}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Özellikler</span>
              <span className="text-gray-900">Sınırsız test / kitapçık</span>
            </div>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Premium Plan</h3>
                <p className="text-sm text-gray-500">Tüm özellikler + AI</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditPlan('premium')}
            >
              Düzenle
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kullanıcı Sayısı</span>
              <span className="text-lg font-semibold text-gray-900">{stats.premium.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Yüzde</span>
              <span className="text-lg font-semibold text-gray-900">{stats.premium.percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Büyüme (Aylık)</span>
              <span className="flex items-center text-lg font-semibold text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                {stats.premium.growth}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Özellikler</span>
              <span className="text-gray-900">Sınırsız + AI Test Oluşturma</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Usage Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Kullanım İstatistikleri</h3>
              <p className="text-sm text-gray-500">Premium kullanıcılar için AI kullanım limitleri</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Toplam AI Kredisi</span>
              <Sparkles className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.aiUsage.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Tüm premium kullanıcılar için</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Kullanılabilir Kredi</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.aiUsage.available.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Kalan kullanılabilir kredi</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Kullanım Oranı</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.aiUsage.percentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Toplam kredinin kullanım oranı</div>
          </div>
        </div>
        
        {/* AI Usage Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">AI Kredi Kullanımı</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.aiUsage.total - stats.aiUsage.available} / {stats.aiUsage.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full" 
              style={{ width: `${stats.aiUsage.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Plan Features Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Plan Özellikleri Karşılaştırması</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Özellik
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-500 mr-1" />
                    Ücretsiz
                  </div>
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-500 mr-1" />
                    Pro
                  </div>
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center">
                    <Crown className="w-4 h-4 text-purple-500 mr-1" />
                    Premium
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Test Oluşturma
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  5 test
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Kitapçık Oluşturma
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  1 kitapçık
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Online Sınav
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  2 sınav
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Sınırsız
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI Test Oluşturma
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Gelişmiş Temalar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Depolama
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  100MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  5GB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  20GB
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Öncelikli Destek
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fiyat
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Ücretsiz
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  29₺/ay
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  49₺/ay
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPlan === 'free' && 'Ücretsiz Plan Düzenle'}
              {editingPlan === 'pro' && 'Pro Plan Düzenle'}
              {editingPlan === 'premium' && 'Premium Plan Düzenle'}
            </h3>
            
            <div className="space-y-4">
              {/* Plan Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Oluşturma Limiti
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingPlan === 'free' ? 5 : 0}
                />
                {editingPlan !== 'free' && (
                  <p className="text-xs text-gray-500 mt-1">0 = Sınırsız</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kitapçık Oluşturma Limiti
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={editingPlan === 'free' ? 1 : 0}
                />
                {editingPlan !== 'free' && (
                  <p className="text-xs text-gray-500 mt-1">0 = Sınırsız</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depolama Limiti (MB)
                </label>
                <input
                  type="number"
                  min="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={
                    editingPlan === 'free' ? 100 : 
                    editingPlan === 'pro' ? 5000 : 
                    20000
                  }
                />
              </div>
              
              {editingPlan === 'premium' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Kredi Limiti
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={100}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺/ay)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={
                    editingPlan === 'free' ? 0 : 
                    editingPlan === 'pro' ? 29 : 
                    49
                  }
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  alert('Plan güncellendi!');
                  handleCloseModal();
                }}
              >
                Planı Güncelle
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Plans;