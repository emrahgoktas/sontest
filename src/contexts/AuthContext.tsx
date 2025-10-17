import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Computed values for compatibility
  const isAdmin = user?.role === 'admin';
  const currentUser = user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('userInfo');
          }
        } catch (error) {
          console.warn('Auth check failed, clearing tokens:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('userInfo');
        }
      }
    } catch (error) {
      console.warn('Auth status check error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await registerUser({
        name,
        email,
        password,
        password_confirmation: password,
        role
      });
      if (response.success && response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          return true;
        }
        return false;
      } catch (error) {
        console.warn('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
        return false;
      }
    } catch (error) {
      console.warn('Check auth error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentStep');
    setUser(null);
    logoutUser().catch(() => {
      // Ignore logout errors
    });
  };

  const value: AuthContextType = {
    user,
    currentUser,
    isAdmin,
    loading,
    login,
    register,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};