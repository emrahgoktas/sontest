import React from 'react';
import { ProfileOverview } from './ProfileOverview';
import { ProfileQuestions } from './ProfileQuestions';
import { ProfileTests } from './ProfileTests';
import { ProfileBooklets } from './ProfileBooklets';
import { ProfileOnlineExams } from './ProfileOnlineExams';
import { ProfileResults } from './ProfileResults';
import { ProfileTab } from '../../types/profile';
import { UserInfo } from '../../types/wizard';
import { AppStep } from '../../types';

/**
 * Profile Tab Content Component
 * Renders the content for the selected profile tab
 */

interface ProfileTabContentProps {
  activeTab: ProfileTab;
  userInfo: UserInfo;
  onUpdateUserInfo: (updatedInfo: UserInfo) => void;
  onNavigateToStep?: (step: AppStep) => void;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  activeTab,
  userInfo,
  onUpdateUserInfo,
  onNavigateToStep
}) => {
  /**
   * Aktif tab içeriğini render et
   */
  switch (activeTab) {
    case 'overview':
      return (
        <ProfileOverview
          userInfo={userInfo}
          onUpdateUserInfo={onUpdateUserInfo}
          onNavigateToStep={onNavigateToStep}
        />
      );
    case 'questions':
      return <ProfileQuestions onNavigateToStep={onNavigateToStep} />;
    case 'tests':
      return <ProfileTests />;
    case 'booklets':
      return <ProfileBooklets />;
    case 'online-exams':
      return <ProfileOnlineExams />;
    case 'results':
      return <ProfileResults />;
    default:
      return null;
  }
};

export default ProfileTabContent;