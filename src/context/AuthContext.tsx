import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const savedUser = localStorage.getItem('skillbridge_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, userType: 'client' | 'freelancer') => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('skillbridge_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password && u.userType === userType);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('skillbridge_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (userData: any) => {
    const users = JSON.parse(localStorage.getItem('skillbridge_users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === userData.email)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      profile: {}
    };

    users.push(newUser);
    localStorage.setItem('skillbridge_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('skillbridge_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillbridge_user');
  };

  const updateProfile = (profileData: any) => {
    if (user) {
      const updatedUser = { ...user, profile: { ...user.profile, ...profileData } };
      setUser(updatedUser);
      localStorage.setItem('skillbridge_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('skillbridge_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], profile: updatedUser.profile };
        localStorage.setItem('skillbridge_users', JSON.stringify(users));
      }
    }
  };

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