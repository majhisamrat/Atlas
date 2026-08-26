export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization_name?: string;
  department?: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  name?: string;
  password?: string;
  organization_name?: string;
  department?: string;
}

export interface GoogleAuthRequest {
  id_token: string;
  organization_name?: string;
  department?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  organization_id: string;
  email_verified: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  department: string | null;
  auth_provider: string;
  email_verified: boolean;
  status: string;
}
