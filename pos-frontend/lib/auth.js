'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!localStorage.getItem('token')) return setLoading(false);
    try { setUser(await api('/auth/me')); } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return <Ctx.Provider value={{ user, setUser, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
