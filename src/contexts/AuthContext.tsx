import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AuthContextValue {
  isAdmin: boolean;
  isChecking: boolean;
  isConfigured: boolean;
  bootstrapRequired: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [bootstrapRequired, setBootstrapRequired] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await api.admin.session();
      if (res.ok) {
        setIsAdmin(res.data.authenticated);
        setIsConfigured(res.data.configured);
        setBootstrapRequired(res.data.bootstrapRequired);
      } else {
        setIsAdmin(false);
        setIsConfigured(false);
        setBootstrapRequired(false);
      }
      setIsChecking(false);
    })();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const res = await api.admin.login({ username, password });
    if (!res.ok) return false;
    setIsAdmin(true);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await api.admin.logout();
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAdmin, isChecking, isConfigured, bootstrapRequired, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
