import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
  VerifyOTPRequest,
  GoogleAuthRequest,
  TokenResponse,
  UserProfile,
} from '@/types/auth';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<TokenResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/auth/login', data).then((r) => r.data),

  sendOtp: (data: SendOTPRequest) =>
    apiClient.post<{ success: boolean; message: string }>('/auth/send-otp', data).then((r) => r.data),

  verifyOtp: (data: VerifyOTPRequest) =>
    apiClient.post<TokenResponse>('/auth/verify-otp', data).then((r) => r.data),

  googleAuth: (data: GoogleAuthRequest) =>
    apiClient.post<TokenResponse>('/auth/google', data).then((r) => r.data),

  getMe: () => apiClient.get<UserProfile>('/auth/me').then((r) => r.data),
};
