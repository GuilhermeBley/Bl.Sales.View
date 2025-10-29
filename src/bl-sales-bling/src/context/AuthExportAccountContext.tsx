import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../model/auth';
import { AuthContextExportAccountType } from '../model/AuthContextExportAccountType';
import LocalStorageManager from '../services/localStorageService'
import { OrderExportConfig } from '../model/OrderExportConfig';

const AuthExportAccountContext = createContext<AuthContextExportAccountType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface LocalStoreDataModel {
  user: User | undefined,
  config: OrderExportConfig | undefined,
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
  const [config, setConfig] = useState<OrderExportConfig>({ defaultSituacaoId: undefined, defaultStoreId: undefined });
  const [loading, setLoading] = useState<boolean>(true);
  const localStorageManager = new LocalStorageManager<LocalStoreDataModel>('user-settings-export-account');

  // Check for existing token on app start
  useEffect(() => {
    const storageResult = localStorageManager.get();
    if (storageResult) {
      
      if (storageResult.user) setUser(storageResult.user);
      if (storageResult.config) setConfig(storageResult.config);
    }
    setLoading(false);
  }, []);

  const loginExportAccount = (profile: string, key: string): void => {
    // Save token to localStorage
    let user: User = { profile, key };
    localStorageManager.set({ user, config })
    setUser(user);
  };

  const setExportConfig = (storeId: number | undefined, situacaoId: number | undefined): void => {
    let conf: OrderExportConfig = { 
      defaultSituacaoId: situacaoId,
      defaultStoreId: storeId
    };
    localStorageManager.set({ user: userExportAccount ?? undefined, config: conf })
    setConfig(conf)
  }

  const logoutExportAccount = (): void => {
    // Remove token from localStorage
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const value: AuthContextExportAccountType = {
    userExportAccount,
    loginExportAccount,
    logoutExportAccount,
    setExportConfig,
    isAuthenticated: !!userExportAccount,
    loading,
    config: config
  };

  return (
    <AuthExportAccountContext.Provider value={value}>
      {children}
    </AuthExportAccountContext.Provider>
  );
};