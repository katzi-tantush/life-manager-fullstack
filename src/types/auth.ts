import type { TokenPayload } from 'google-auth-library';
import type { CredentialResponse } from '@react-oauth/google';

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  email?: string;
}

export type GoogleCredentialResponse = CredentialResponse;
export type GoogleTokenPayload = TokenPayload;