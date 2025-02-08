import type { AllowedEmail } from '../services/config';

export interface AuthUser {
  email: AllowedEmail;
  name?: string;
  picture?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  email?: string;
}