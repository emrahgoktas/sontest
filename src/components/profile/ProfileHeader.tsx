import React from 'react';

/**
 * Profile Header Component
 * Displays the title and description for the profile management section
 */

const ProfileHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Yönetimi</h1>
      <p className="text-gray-600">
        Hesabınızı yönetin ve tüm içeriklerinize erişin
      </p>
    </div>
  );
};

export default ProfileHeader;