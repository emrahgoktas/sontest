import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfo } from '../types/wizard';

interface UserContextType {
  userInfo: UserInfo | null;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    // Load user info from localStorage on initialization
    const savedInfo = localStorage.getItem('userInfo');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        return {
          ...parsed,
          createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
          lastLoginAt: parsed.lastLoginAt ? new Date(parsed.lastLoginAt) : undefined
        };
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        return null;
      }
    }
    return null;
  });

  // Save user info to localStorage whenever it changes
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  const updateUserInfo = (info: Partial<UserInfo>) => {
    setUserInfo(prev => {
      if (!prev) {
        // If no previous user info, create a new one with defaults
        return {
          id: `user_${Date.now()}`,
          fullName: '',
          email: '',
          planType: 'free',
          createdAt: new Date(),
          ...info
        };
      }
      return { ...prev, ...info };
    });
  };

  const clearUserInfo = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, clearUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};