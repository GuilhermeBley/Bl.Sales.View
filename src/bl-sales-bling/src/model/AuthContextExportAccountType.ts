import { User } from "./auth";

export interface AuthContextExportAccountType {
  userExportAccount: User | null;
  loginExportAccount: (profile: string, key: string) => void;
  logoutExportAccount: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}