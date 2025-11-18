'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { setCookie, deleteCookie } from './cookies';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'MODERATOR' | 'SUPER_ADMIN';
  isVerified: boolean;
  isActive: boolean;
  studentProfile?: any;
  companyProfile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response: any = await api.getMe();
      if (response?.success && response?.data) {
        setUser(response.data);
      }
    } catch (error) {
      // Try to refresh token
      try {
        await api.refreshToken();
        const response: any = await api.getMe();
        if (response?.success && response?.data) {
          setUser(response.data);
        }
      } catch {
        // User is not authenticated
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    const response: any = await api.login({ email, password, remember });
    
    if (response?.success && response?.data) {
      setUser(response.data.user);
      
      // Store tokens in cookies
      if (response.data.accessToken) {
        setCookie('access_token', response.data.accessToken, remember ? 30 : 1);
      }
      if (response.data.refreshToken) {
        setCookie('refresh_token', response.data.refreshToken, 7);
      }
      
      // Redirect based on role
      if (response.data.user.role === 'SUPER_ADMIN' || response.data.user.role === 'MODERATOR') {
        router.push('/admin');
      } else if (response.data.user.role === 'COMPANY') {
        router.push('/company/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const register = async (data: any) => {
    const response: any = await api.register(data);
    
    if (response?.success && response?.data) {
      setUser(response.data.user);
      
      // Store tokens in cookies
      if (response.data.accessToken) {
        setCookie('access_token', response.data.accessToken, data.remember ? 30 : 1);
      }
      if (response.data.refreshToken) {
        setCookie('refresh_token', response.data.refreshToken, 7);
      }
      
      // Redirect to profile completion
      router.push('/profile/complete');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      router.push('/');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
