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
      body: JSON.stringify({ token }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      if (response.status === 502) {
        throw new Error('Server is temporarily unavailable. Please try again in a moment.');
      }
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    // Parse response
    const data = await response.json();
    
    // Validate response structure
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