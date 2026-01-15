import { useState, useEffect, useCallback } from 'react';
import { api, AuthTokens, User } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const userData = await api.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('auth_tokens');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const tokens = await api.login(username, password);
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    await checkAuth();
  };

  const register = async (username: string, full_name: string, password: string) => {
    await api.register(username, full_name, password);
  };

  const logout = () => {
    localStorage.removeItem('auth_tokens');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, isLoading, login, register, logout, refetch: checkAuth };
};
