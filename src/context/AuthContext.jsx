import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext({
  user: null,
  token: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  adminLogin: async () => {},
});

const safeLS = {
  get: (k) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { window.localStorage.setItem(k, v); } catch {} },
  del: (k) => { try { window.localStorage.removeItem(k); } catch {} },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => safeLS.get('ag_token'));
  const [isAdmin, setIsAdmin] = useState(() => !!safeLS.get('ag_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauth = () => {
      setToken(null);
      setUser(null);
      safeLS.del('ag_token');
    };
    window.addEventListener('ag:unauthorized', handleUnauth);
    return () => window.removeEventListener('ag:unauthorized', handleUnauth);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else if (res.status === 401) {
        // Token is invalid or expired — clear session
        logout();
      }
      // Any other status (5xx, etc.) — keep session, might be a transient server error
    } catch {
      // Network error (server down, timeout) — keep session, do not log user out
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    setUser(data.user);
    safeLS.set('ag_token', data.token);
    if (data.refresh_token) safeLS.set('ag_refresh_token', data.refresh_token);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      safeLS.set('ag_token', data.token);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    safeLS.del('ag_token');
    safeLS.del('ag_refresh_token');
  };

  const adminLogin = async (key) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/verify-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid admin key');
    safeLS.set('ag_admin_token', data.token);
    setIsAdmin(true);
    return data;
  };

  const adminLogout = () => {
    safeLS.del('ag_admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAdmin,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      adminLogin,
      adminLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
