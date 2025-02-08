import type { AuthResponse } from '../../types/auth';

export async function verifyToken(token: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}