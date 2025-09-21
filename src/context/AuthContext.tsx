import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'freelancer';
  profile?: {
    skills?: string[];
    bio?: string;
    hourlyRate?: number;
    portfolio?: string[];
    company?: string;
    location?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'client' | 'freelancer') => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('skillbridge_token');
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('skillbridge_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: 'client' | 'freelancer') => {
    try {
      const response = await apiService.login({ email, password, userType });
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await apiService.updateProfile(profileData);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};