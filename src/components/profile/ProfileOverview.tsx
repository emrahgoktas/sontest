import React, { useState, useEffect } from 'react';
import { Crown, Zap, Star, TrendingUp, Users, FileText, BookOpen, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserInfo, PlanType } from '../../types/wizard';
import { UsageStats } from '../../types/profile';
import { AppStep } from '../../types';
import { profileAPI } from '../../utils/api';

/**
 * Üyelik Durumu ve Genel Bakış Bileşeni
 * Kullanıcının plan bilgileri, kullanım istatistikleri ve özellikler
 */

interface ProfileOverviewProps {
  userInfo: UserInfo;
  onUpdateUserInfo: (updatedInfo: UserInfo) => void;
  onNavigateToStep?: (step: AppStep) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userInfo,
  onUpdateUserInfo,
  onNavigateToStep
}) => {
  const [usageStats, setUsageStats] = useState<UsageStats>({
    testsCreated: 0,
    questionsArchived: 0,
    bookletsGenerated: 0,
    onlineExamsCreated: 0,
    totalStudents: 0,
    storageUsed: 0,
    storageLimit: userInfo.planType === 'free' ? 100 : userInfo.planType === 'pro' ? 5000 : 20000
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch usage statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getStatistics();
        
        if (response.success) {
          setUsageStats({
            testsCreated: response.data.tests_created || 0,
            questionsArchived: response.data.questions_archived || 0,
            bookletsGenerated: response.data.booklets_generated || 0,
            onlineExamsCreated: response.data.online_exams_created || 0,
            totalStudents: response.data.total_students || 0,
            storageUsed: response.data.storage_used || 0,
            storageLimit: response.data.storage_limit || (userInfo.planType === 'free' ? 100 : userInfo.planType === 'pro' ? 5000 : 20000)
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userInfo.planType]);

  /**
   * Plan özelliklerini getir
   */
  const getPlanFeatures = (planType: PlanType) => {
    switch (planType) {
      case 'free':
        return {
          name: 'Ücretsiz Plan',
          icon: Star,
          color: 'green',
          features: [
            '5 test oluşturma',
            '1 kitapçık oluşturma',
            '2 online sınav',
            '100MB depolama',
            'Temel temalar'
          ],
          limits: {
            tests: 5,
            booklets: 1,
            onlineExams: 2
          }
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          icon: Zap,
          color: 'blue',
          features: [
            'Sınırsız test oluşturma',
            'Sınırsız kitapçık oluşturma',
            'Sınırsız online sınav',
            '5GB depolama',
            'Gelişmiş temalar',
            'Öncelikli destek'
          ],
          limits: {
            tests: 'unlimited',
            booklets: 'unlimited',
            onlineExams: 'unlimited'
          }
        };
      case 'premium':
        return {
          name: 'Premium Plan',
          icon: Crown,
          color: 'purple',
          features: [
            'Tüm Pro özellikler',
            'AI Test Oluşturma',
            '20GB depolama',
            'Özel temalar',
            'API erişimi',
            '7/24 destek'
          ],
          limits: {
            tests: 'unlimited',
            booklets: 'unlimited',
            onlineExams: 'unlimited'
          }
        };
      default:
        return getPlanFeatures('free');
    }
  };

  const planInfo = getPlanFeatures(userInfo.planType);
  const PlanIcon = planInfo.icon;

  /**
   * Kullanım yüzdesini hesapla
   */
  const getUsagePercentage = (used: number, limit: number | string) => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / (limit as number)) * 100, 100);
  };

  /**
   * Plan yükseltme
   */
  const handlePlanUpgrade = () => {
    alert('Plan yükseltme özelliği yakında eklenecek!');
  };

  return (
    <div className="space-y-8">
      {/* Plan Bilgileri */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-${planInfo.color}-100 rounded-lg flex items-center justify-center`}>
              <PlanIcon className={`w-6 h-6 text-${planInfo.color}-600`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{planInfo.name}</h2>
              <p className="text-gray-600">Mevcut üyelik planınız</p>
            </div>
          </div>

          {userInfo.planType !== 'premium' && (
            <Button
              onClick={handlePlanUpgrade}
              variant="outline"
              className={`border-${planInfo.color}-300 text-${planInfo.color}-600 hover:bg-${planInfo.color}-50`}
            >
              Planı Yükselt
            </Button>
          )}
        </div>

        {/* Plan Özellikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Plan Özellikleri</h3>
            <ul className="space-y-2">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <div className={`w-2 h-2 bg-${planInfo.color}-500 rounded-full mr-3`}></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Kullanım Durumu</h3>
            <div className="space-y-3">
              {/* Test Kullanımı */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Test Oluşturma</span>
                  <span className="font-medium">
                    {usageStats.testsCreated} / {planInfo.limits.tests === 'unlimited' ? '∞' : planInfo.limits.tests}
                  </span>
                </div>
                {planInfo.limits.tests !== 'unlimited' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${planInfo.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${getUsagePercentage(usageStats.testsCreated, planInfo.limits.tests)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Kitapçık Kullanımı */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Kitapçık Oluşturma</span>
                  <span className="font-medium">
                    {usageStats.bookletsGenerated} / {planInfo.limits.booklets === 'unlimited' ? '∞' : planInfo.limits.booklets}
                  </span>
                </div>
                {planInfo.limits.booklets !== 'unlimited' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${planInfo.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${getUsagePercentage(usageStats.bookletsGenerated, planInfo.limits.booklets)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Depolama Kullanımı */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Depolama</span>
                  <span className="font-medium">
                    {usageStats.storageUsed.toFixed(1)} MB / {(usageStats.storageLimit / 1000).toFixed(0)} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${planInfo.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${getUsagePercentage(usageStats.storageUsed, usageStats.storageLimit)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Oluşturulan Test</p>
              <p className="text-2xl font-bold text-gray-900">{usageStats.testsCreated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Arşivlenen Soru</p>
              <p className="text-2xl font-bold text-gray-900">{usageStats.questionsArchived}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kitapçık</p>
              <p className="text-2xl font-bold text-gray-900">{usageStats.bookletsGenerated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
              <p className="text-2xl font-bold text-gray-900">{usageStats.totalStudents}</p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Hızlı Eylemler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Eylemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onNavigateToStep && (
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => onNavigateToStep('upload')}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Yeni Test Oluştur</div>
                  <div className="text-sm text-gray-500">PDF'den soru kırparak</div>
                </div>
              </div>
            </Button>
          )}

          {onNavigateToStep && (
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => onNavigateToStep('upload')}
            >
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Online Sınav</div>
                  <div className="text-sm text-gray-500">İnteraktif sınav oluştur</div>
                </div>
              </div>
            </Button>
          )}

          {onNavigateToStep && (
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => onNavigateToStep('questions')}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Soru Arşivi</div>
                  <div className="text-sm text-gray-500">Kayıtlı sorulara eriş</div>
                </div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};