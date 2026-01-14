import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, updateProfile as apiUpdateProfile, uploadAvatar as apiUploadAvatar } from '../api/auth.js';

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; name: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const result = await getMe();
    if (result.success && result.data) {
      setUser(result.data as User);
    }
    setIsLoading(false);
  };

  const login = async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    if (result.success && result.data) {
      setUser(result.data.user as User);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (data: { username: string; name: string; password: string }) => {
    const result = await apiRegister(data);
    if (result.success && result.data) {
      setUser(result.data.user as User);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const updateProfile = async (updates: { name?: string }) => {
    const result = await apiUpdateProfile(updates);
    if (result.success && result.data) {
      setUser(result.data as User);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const uploadAvatar = async (file: File) => {
    const result = await apiUploadAvatar(file);
    if (result.success) {
      const meResult = await getMe();
      if (meResult.success && meResult.data) {
        setUser(meResult.data as User);
      }
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
      }}
    >
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
