import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "admin" | "editor";
}

interface AuthContextValue {
  isAdmin: boolean;
  isChecking: boolean;
  isConfigured: boolean;
  bootstrapRequired: boolean;
  configError: string | null;
  user: AdminUser | null;
  canManageUsers: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [bootstrapRequired, setBootstrapRequired] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await api.admin.session();
      if (res.ok) {
        setIsAdmin(res.data.authenticated);
        setIsConfigured(res.data.configured);
        setBootstrapRequired(res.data.bootstrapRequired);
        setUser(res.data.user ?? null);
        setConfigError(null);
      } else {
        setIsAdmin(false);
        setIsConfigured(false);
        setBootstrapRequired(false);
        setUser(null);
        setConfigError(res.error ?? "No se pudo conectar con el servidor.");
      }
      setIsChecking(false);
    })();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const res = await api.admin.login({ username, password });
    if (!res.ok) return false;
    setIsAdmin(true);
    const sessionRes = await api.admin.session();
    if (sessionRes.ok && sessionRes.data.user) setUser(sessionRes.data.user);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await api.admin.logout();
    setIsAdmin(false);
    setUser(null);
  }, []);

  const canManageUsers = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ isAdmin, isChecking, isConfigured, bootstrapRequired, configError, user, canManageUsers, login, logout }}
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
