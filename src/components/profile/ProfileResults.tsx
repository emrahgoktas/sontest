import React from 'react';

interface ProfileResultsProps {
  className?: string;
}

export const ProfileResults: React.FC<ProfileResultsProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sınav Sonuçları
      </h3>
      <div className="text-center py-8 text-gray-500">
        <p>Henüz sınav sonucu bulunmuyor.</p>
      </div>
    </div>
  );
};

export default ProfileResults;