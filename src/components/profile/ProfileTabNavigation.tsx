import React from 'react';
import { User, Image, FileText, BookOpen, Monitor, BarChart3 } from 'lucide-react';
import { ProfileTab } from '../../types/profile';

/**
 * Profile Tab Navigation Component
 * Handles tab selection for profile management
 */

interface ProfileTabNavigationProps {
  tabs: Array<{
    id: ProfileTab;
    label: string;
    icon: React.ElementType;
    color: string;
  }>;
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
}

const ProfileTabNavigation: React.FC<ProfileTabNavigationProps> = ({
  tabs,
  activeTab,
  setActiveTab
}) => {
  /**
   * Tab rengini getir
   */
  const getTabColor = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue': return 'border-blue-500 text-blue-600 bg-blue-50';
        case 'green': return 'border-green-500 text-green-600 bg-green-50';
        case 'purple': return 'border-purple-500 text-purple-600 bg-purple-50';
        case 'orange': return 'border-orange-500 text-orange-600 bg-orange-50';
        case 'teal': return 'border-teal-500 text-teal-600 bg-teal-50';
        case 'red': return 'border-red-500 text-red-600 bg-red-50';
        default: return 'border-blue-500 text-blue-600 bg-blue-50';
      }
    }
    return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  return (
    <div className="border-b border-gray-200 mb-8">
      {/* Desktop Tabs */}
      <nav className="hidden md:flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${getTabColor(tab.color, isActive)}
              `}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors duration-200
                  ${isActive ? '' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as ProfileTab)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProfileTabNavigation;