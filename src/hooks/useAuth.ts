import { useState, useCallback } from 'react';
import type { AuthResponse } from '../types/auth';
import { verifyToken, logout as apiLogout } from '../services/api/auth';
import { isAllowedEmail } from '../utils/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error('Invalid credential response');
      }

      const response = await verifyToken(credentialResponse.credential);
      
      if (response.status === 'success' && response.email) {
        if (isAllowedEmail(response.email)) {
          setIsAuthenticated(true);
          setUserEmail(response.email);
          setError(null);
          return true;
        } else {
          setError('Unauthorized email address');
        }
      } else {
        setError(response.message || 'Failed to verify token');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      setIsAuthenticated(false);
      setUserEmail(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.email) {
          setIsAuthenticated(true);
          setUserEmail(data.email);
          return true;
        }
      }
      
      setIsAuthenticated(false);
      setUserEmail(null);
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setUserEmail(null);
    }
    return false;
  }, []);

  return {
    isAuthenticated,
    userEmail,
    error,
    login,
    logout,
    checkAuth,
  };
}