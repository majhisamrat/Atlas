import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '@/api/auth';
import type { UserProfile, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('AuthContext mounted, token:', !!token, token?.substring(0, 20) + '...');
    if (token) {
      authApi
        .getMe()
        .then((profile) => {
          console.log('Got user profile:', profile);
          setUser(profile);
        })
        .catch((err) => {
          console.error('Failed to get profile:', err);
          localStorage.removeItem('access_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    const profile = await authApi.getMe();
    setUser(profile);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    const profile = await authApi.getMe();
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
