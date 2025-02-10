import type { AuthResponse } from '../../types/auth';

export async function verifyToken(token: string): Promise<AuthResponse> {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ token }),
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
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}