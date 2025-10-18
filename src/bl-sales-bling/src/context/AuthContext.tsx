import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../model/auth';
import LocalStorageManager from '../services/localStorageService'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const localStorageManager = new LocalStorageManager<User>('user-settings');

  // Check for existing token on app start
  useEffect(() => {
    const user = localStorageManager.get();
    if (user) {
      // In a real app, you might validate the token with your backend
      setUser(user);
    }
    setLoading(false);
  }, []);

  const login = (profile: string, key: string): void => {
    // Save token to localStorage
    let user: User = { profile, key };
    localStorageManager.set(user)
    setUser(user);
  };

  const logout = (): void => {
    // Remove token from localStorage
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};