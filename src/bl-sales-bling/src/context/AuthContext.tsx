import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../model/auth';

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

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      // In a real app, you might validate the token with your backend
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = (token: string): void => {
    // Save token to localStorage
    localStorage.setItem('userToken', token);
    setUser({ token });
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