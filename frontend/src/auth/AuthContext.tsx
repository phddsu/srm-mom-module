import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { client } from '../api/client';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('srm_token');
    const u = localStorage.getItem('srm_user');
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { /* ignore */ }
    }
    if (t && u) { refreshUser(); }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await client.post('/api/auth/login', { username, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('srm_token', t);
    localStorage.setItem('srm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    refreshUser();
    return u as User;
  };

  const refreshUser = async () => {
    try {
      const res = await client.get('/api/user/me');
      const stored = JSON.parse(localStorage.getItem('srm_user') || '{}');
      const merged = { ...stored, avatarUrl: res.data.avatarUrl };
      localStorage.setItem('srm_user', JSON.stringify(merged));
      setUser(merged as User);
    } catch { /* ignore */ }
  };

  const logout = () => {
    localStorage.removeItem('srm_token');
    localStorage.removeItem('srm_user');
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}