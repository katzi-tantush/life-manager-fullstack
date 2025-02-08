import type { AuthResponse } from '../../types/auth';

export async function verifyToken(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 502) {
        throw new Error('Server is unavailable. Please try again later.');
      }
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}