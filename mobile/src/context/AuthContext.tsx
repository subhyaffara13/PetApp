import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApi, setAuthHeader } from '../services/api';

export type PortalMode = 'customer' | 'clinic' | 'store';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'veterinarian' | 'store_merchant' | 'animal_shelter' | 'pet_sitter';
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
  isVerified?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  portalMode: PortalMode;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setPortalMode: (mode: PortalMode) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  portalMode: 'customer',
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  setPortalMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr_subhy_1',
    name: 'Subhy Affara',
    email: 'subhyaffara@gmail.com',
    role: 'veterinarian',
    practiceType: 'mobile_vet',
    isVerified: true,
  });
  const [token, setToken] = useState<string | null>('demo_mobile_jwt_token');
  const [portalMode, setPortalMode] = useState<PortalMode>('customer');

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await AuthApi.login(email, pass);
      if (res?.accessToken) {
        setToken(res.accessToken);
        setAuthHeader(res.accessToken);
        if (res.user) {
          setUser({
            id: res.user.id || res.user._id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role || 'customer',
            practiceType: res.user.practiceType,
            isVerified: res.user.isVerified,
          });
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthHeader(null);
    setPortalMode('customer');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        portalMode,
        isAuthenticated: !!user,
        login,
        logout,
        setPortalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
