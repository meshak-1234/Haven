import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserSettings } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Migrate any existing empathia_token to the new haven_token key (one-time, non-destructive)
  const _legacyToken = localStorage.getItem('empathia_token');
  if (_legacyToken && !localStorage.getItem('haven_token')) {
    localStorage.setItem('haven_token', _legacyToken);
    localStorage.removeItem('empathia_token');
  }

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('haven_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('haven_token')) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('haven_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('haven_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    // Refresh to get full settings
    await refreshUser();
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await api.register({ email, password: pass, full_name: name });
    localStorage.setItem('haven_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('haven_token');
    setToken(null);
    setUser(null);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = await api.updateSettings(newSettings);
    if (user) {
      setUser({ ...user, settings: updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
