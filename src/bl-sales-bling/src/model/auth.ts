export interface User {
  profile: string,
  key: string,
}

export interface AuthContextType {
  user: User | null;
  login: (profile: string, key: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}