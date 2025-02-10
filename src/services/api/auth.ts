import type { AuthResponse, GoogleCredentialResponse } from '../../types/auth';
import { AUTH_ENDPOINTS, TOKEN_STORAGE_KEYS } from '../../constants/auth';
import { handleApiError } from '../../utils/error';

export async function verifyUserCredential(credential: string): Promise<AuthResponse> {
  try {
    if (!credential) {
      throw new Error('No user credential provided');
    }

    const response = await fetch(AUTH_ENDPOINTS.VERIFY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error('Server is temporarily unavailable. Please try again.');
      }
      if (response.status === 401) {
        throw new Error('User authentication failed. Please sign in again.');
      }
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
  } catch (error) {
    console.error('Logout error:', error);
    throw handleApiError(error);
  }
}