import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../model/auth';
import { AuthContextExportAccountType } from '../model/AuthContextExportAccountType';
import LocalStorageManager from '../services/localStorageService'

const AuthExportAccountContext = createContext<AuthContextExportAccountType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuthExportAccount = (): AuthContextExportAccountType => {
  const context = useContext(AuthExportAccountContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProviderExportAccount: React.FC<AuthProviderProps> = ({ children }) => {
  const [userExportAccount, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const localStorageManager = new LocalStorageManager<User>('user-settings-export-account');

  // Check for existing token on app start
  useEffect(() => {
    const user = localStorageManager.get();
    if (user) {
      // In a real app, you might validate the token with your backend
      setUser(user);
    }
    setLoading(false);
  }, []);

  const loginExportAccount = (profile: string, key: string): void => {
    // Save token to localStorage
    let user: User = { profile, key };
    localStorageManager.set(user)
    setUser(user);
  };

  const logoutExportAccount = (): void => {
    // Remove token from localStorage
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const value: AuthContextExportAccountType = {
    userExportAccount,
    loginExportAccount,
    logoutExportAccount,
    isAuthenticated: !!userExportAccount,
    loading
  };

  return (
    <AuthExportAccountContext.Provider value={value}>
      {children}
    </AuthExportAccountContext.Provider>
  );
};