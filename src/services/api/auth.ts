import type { AuthResponse } from '../../types/auth';
import { AUTH_ENDPOINTS } from '../../constants/auth';

export async function verifyToken(credential: string): Promise<AuthResponse> {
  try {
    if (!credential) {
      throw new Error('No credential provided');
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
        throw new Error('Server is temporarily unavailable. Please try again in a moment.');
      }
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || typeof data.status !== 'string') {
      throw new Error('Invalid server response');
    }

    return data;
  } catch (error) {
    console.error('Auth error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}