import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, LoginDto, RegisterDto, UpdateProfileDto } from '@roleforge/shared';
import { api } from '../api/client';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  loginWithGoogle: (googlePayload: { email: string; name?: string; avatar?: string; googleId?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('roleforge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('roleforge_token');
    setToken(null);
    setUser(null);
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      // If user is already populated from register/login, skip redundant fetch
      if (user) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get<IUser>('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to restore session:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token, logout, user]);

  // Listen to 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (credentials: LoginDto) => {
    const response = await api.post<{ token: string; user: IUser }>('/auth/login', credentials);
    localStorage.setItem('roleforge_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const register = async (data: RegisterDto) => {
    const response = await api.post<{ token: string; user: IUser }>('/auth/register', data);
    localStorage.setItem('roleforge_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const loginWithGoogle = async (googlePayload: {
    email: string;
    name?: string;
    avatar?: string;
    googleId?: string;
  }) => {
    const response = await api.post<{ token: string; user: IUser }>('/auth/google', googlePayload);
    localStorage.setItem('roleforge_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    const response = await api.put<IUser>('/auth/profile', data);
    setUser(response.data);
  };

  const deleteAccount = async () => {
    await api.delete('/auth/account');
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        deleteAccount,
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

