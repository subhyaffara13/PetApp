import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { API_URL } from '../config/api';
const AUTH_STORAGE_KEY = 'petsos_auth_v2';

export type UserRole = 'customer' | 'clinic_admin' | 'store_merchant' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface StoredAuth {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  oauthLogin: (name: string, email: string, avatar?: string, role?: UserRole) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: (user: User) => void;
  showAuthModal: boolean;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
  redirectPath: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe Base64URL JWT payload decoding with Unicode support
function decodeJwtPayload(token: string): any {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredAuth(auth: StoredAuth) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {}
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedAuth, setStoredAuth] = useState<StoredAuth | null>(loadStoredAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const user = storedAuth?.user ?? null;
  const accessToken = storedAuth?.accessToken ?? null;

  // Attach Axios bearer token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (storedAuth?.accessToken) {
        config.headers.Authorization = `Bearer ${storedAuth.accessToken}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [storedAuth?.accessToken]);

  function buildStoredAuth(accessToken: string, refreshToken: string, fallbackUser?: Partial<User>): StoredAuth {
    const payload = decodeJwtPayload(accessToken) || {};
    const user: User = {
      id: payload.sub || fallbackUser?.id || `user-${Date.now()}`,
      name: payload.name || fallbackUser?.name || 'Pet Parent',
      email: payload.email || fallbackUser?.email || '',
      avatar: payload.avatar || fallbackUser?.avatar || '',
      role: payload.role || fallbackUser?.role || 'customer',
    };
    return { user, accessToken, refreshToken };
  }

  // Auto-refresh if access token is expired or close to expiry
  useEffect(() => {
    if (!storedAuth) return;
    const payload = decodeJwtPayload(storedAuth.accessToken);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now() - 60_000; // refresh 1 min before expiry
    if (expiresInMs <= 0) {
      // Already expired — try refresh immediately
      silentRefresh();
      return;
    }
    const timer = setTimeout(silentRefresh, expiresInMs);
    return () => clearTimeout(timer);
  }, [storedAuth?.accessToken]);

  const silentRefresh = useCallback(async () => {
    if (!storedAuth?.refreshToken) return;
    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: storedAuth.refreshToken });
      const updated = buildStoredAuth(res.data.accessToken, res.data.refreshToken);
      setStoredAuth(updated);
      saveStoredAuth(updated);
    } catch {
      // Refresh token expired — force re-login
      setStoredAuth(null);
      clearStoredAuth();
    }
  }, [storedAuth?.refreshToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const auth = buildStoredAuth(res.data.accessToken, res.data.refreshToken);
      setStoredAuth(auth);
      saveStoredAuth(auth);
      setShowAuthModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      const auth = buildStoredAuth(res.data.accessToken, res.data.refreshToken);
      setStoredAuth(auth);
      saveStoredAuth(auth);
      setShowAuthModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (name: string, email: string, avatar?: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/oauth-login`, { name, email, avatar, role });
      const auth = buildStoredAuth(res.data.accessToken, res.data.refreshToken);
      setStoredAuth(auth);
      saveStoredAuth(auth);
      setShowAuthModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!storedAuth?.user) return;
    try {
      if (storedAuth.accessToken) {
        await axios.patch(`${API_URL}/auth/profile`, data, {
          headers: { Authorization: `Bearer ${storedAuth.accessToken}` },
        });
      }
      const updatedUser: User = { ...storedAuth.user, ...data };
      const updatedAuth: StoredAuth = { ...storedAuth, user: updatedUser };
      setStoredAuth(updatedAuth);
      saveStoredAuth(updatedAuth);
    } catch (err) {
      console.warn('Failed to persist profile update to backend', err);
      const updatedUser: User = { ...storedAuth.user, ...data };
      const updatedAuth: StoredAuth = { ...storedAuth, user: updatedUser };
      setStoredAuth(updatedAuth);
      saveStoredAuth(updatedAuth);
    }
  };

  const logout = async () => {
    try {
      if (storedAuth?.accessToken) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${storedAuth.accessToken}` },
        });
      }
    } catch { /* ignore logout errors */ }
    setStoredAuth(null);
    clearStoredAuth();
  };

  const openAuthModal = (path?: string) => {
    if (path) setRedirectPath(path);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => setShowAuthModal(false);

  // Stores a local (non-API) user session for guest / demo flows
  const setDemoUser = (demoUser: User) => {
    setStoredAuth({ user: demoUser, accessToken: '', refreshToken: '' });
    saveStoredAuth({ user: demoUser, accessToken: '', refreshToken: '' });
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      oauthLogin,
      updateUserProfile,
      logout,
      setDemoUser,
      showAuthModal,
      openAuthModal,
      closeAuthModal,
      redirectPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
