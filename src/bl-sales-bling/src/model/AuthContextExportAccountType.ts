import { User } from "./auth";
import { OrderExportConfig } from "./OrderExportConfig";

export interface AuthContextExportAccountType {
  userExportAccount: User | null;
  loginExportAccount: (profile: string, key: string) => void;
  logoutExportAccount: () => void;
  setExportConfig: (storeId: number | undefined, situacaoId: number | undefined) => void;
  isAuthenticated: boolean;
  loading: boolean;
  config: OrderExportConfig;
}