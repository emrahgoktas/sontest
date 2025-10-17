import React, { useState } from 'react';
import { User, Image, FileText, BookOpen, Monitor, BarChart3 } from 'lucide-react';
import { ProfileTab } from '../../types/profile';
import { UserInfo } from '../../types/wizard';
import { AppStep } from '../../types';
import ProfileHeader from './ProfileHeader';
import ProfileTabNavigation from './ProfileTabNavigation';
import ProfileTabContent from './ProfileTabContent';

/**
 * Ana Profil Tab Bileşeni
 * Tüm profil sekmelerini yönetir ve responsive tasarım sağlar
 */

interface ProfileTabsProps {
  userInfo: UserInfo;
  onUpdateUserInfo: (updatedInfo: UserInfo) => void;
  onNavigateToStep?: (step: AppStep) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  userInfo,
  onUpdateUserInfo,
  onNavigateToStep
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const tabs = [
    {
      id: 'overview' as ProfileTab,
      label: 'Üyelik Durumu',
      icon: User,
      color: 'blue'
    },
    {
      id: 'questions' as ProfileTab,
      label: 'Soru Görselleri',
      icon: Image,
      color: 'green'
    },
    {
      id: 'tests' as ProfileTab,
      label: 'Kayıtlı Testler',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 'booklets' as ProfileTab,
      label: 'Kitapçıklar',
      icon: BookOpen,
      color: 'orange'
    },
    {
      id: 'online-exams' as ProfileTab,
      label: 'Online Sınavlar',
      icon: Monitor,
      color: 'teal'
    },
    {
      id: 'results' as ProfileTab,
      label: 'Sınav Sonuçları',
      icon: BarChart3,
      color: 'red'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <ProfileHeader />

      {/* Tab Navigation */}
      <ProfileTabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tab Content */}
      <div className="min-h-[600px]">
        <ProfileTabContent
          activeTab={activeTab}
          userInfo={userInfo}
          onUpdateUserInfo={onUpdateUserInfo}
          onNavigateToStep={onNavigateToStep}
        />
      </div>
    </div>
  );
};