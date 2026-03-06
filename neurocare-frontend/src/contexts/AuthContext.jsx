import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nc_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('nc_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('nc_token');
          localStorage.removeItem('nc_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('nc_token', newToken);
    localStorage.setItem('nc_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
