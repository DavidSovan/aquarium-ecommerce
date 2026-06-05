import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aquarium_token');
    if (token) {
      authService.getMe()
        .then(res => {
          const u = res.data;
          if (!['admin', 'staff', 'driver'].includes(u.role)) {
            localStorage.removeItem('aquarium_token');
            setUser(null);
          } else {
            setUser(u);
          }
        })
        .catch(() => {
          localStorage.removeItem('aquarium_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('aquarium_token', res.data.access_token);
    const me = await authService.getMe();
    if (!['admin', 'staff', 'driver'].includes(me.data.role)) {
      localStorage.removeItem('aquarium_token');
      throw new Error('Unauthorized: Driver or Admin access required');
    }
    setUser(me.data);
    return me.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aquarium_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
