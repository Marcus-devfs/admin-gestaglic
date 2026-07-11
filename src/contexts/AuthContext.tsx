"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  admin: AdminProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PUBLIC = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setAuthToken(null);
    setAdmin(null);
    router.push("/login");
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data: loginData } = await api.post("/user/login", { email, password });
      if (!loginData.token) return "Credenciais inválidas";

      setAuthToken(loginData.token);
      localStorage.setItem("admin_token", loginData.token);

      const { data: me } = await api.get("/admin/me");
      setAdmin(me);
      return null;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { msg?: string } } };
      if (axiosErr.response?.status === 403) {
        setAuthToken(null);
        localStorage.removeItem("admin_token");
        return "Acesso restrito a administradores";
      }
      return "E-mail ou senha incorretos";
    }
  }, []);

  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setAuthToken(token);
        const { data } = await api.get("/admin/me");
        setAdmin(data);
      } catch {
        localStorage.removeItem("admin_token");
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC.includes(pathname);
    if (!admin && !isPublic) router.replace("/login");
    else if (admin && pathname === "/login") router.replace("/");
  }, [admin, loading, pathname, router]);

  const value = useMemo(
    () => ({ admin, loading, login, logout }),
    [admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth within AuthProvider");
  return ctx;
}
