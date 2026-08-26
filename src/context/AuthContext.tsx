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
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(() => {
    const token = localStorage.getItem('access_token');
    console.log('AuthContext init, token:', !!token, token?.substring(0, 20) + '...');
    if (token) {
      setIsLoading(true);
      authApi
        .getMe()
        .then((profile) => {
          console.log('Got user profile:', profile);
          setUser(profile);
        })
        .catch((err) => {
          console.error('Failed to get profile:', err);
          // Still set user as authenticated if token exists, even if getMe fails
          setUser({ id: 'temp', name: 'User', email: '', organization_id: '', department: null, auth_provider: 'email', email_verified: false, status: 'active' });
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to get profile after login:', err);
      setUser({ id: 'temp', name: 'User', email: '', organization_id: '', department: null, auth_provider: 'email', email_verified: false, status: 'active' });
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to get profile after register:', err);
      setUser({ id: 'temp', name: 'User', email: '', organization_id: '', department: null, auth_provider: 'email', email_verified: false, status: 'active' });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    console.log('Refreshing auth...');
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await authApi.getMe();
        console.log('Auth refreshed, user:', profile);
        setUser(profile);
      } catch (err) {
        console.error('Failed to refresh auth:', err);
        setUser({ id: 'temp', name: 'User', email: '', organization_id: '', department: null, auth_provider: 'email', email_verified: false, status: 'active' });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshAuth }}
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
