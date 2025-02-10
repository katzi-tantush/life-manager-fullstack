import { useState, useCallback } from 'react';
import type { AuthResponse } from '../types/auth';
import { verifyToken } from '../services/api/auth';
import { config } from '../services/config';
import { isAllowedEmail } from '../utils/auth';
import { getStoredToken, setStoredToken, removeStoredToken } from '../utils/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentialResponse: any) => {
    try {
      // Clear any existing tokens first
      removeStoredToken();
      
      // Validate credential response
      if (!credentialResponse?.credential) {
        throw new Error('Invalid credential response');
      }

      // Store token immediately to ensure it's available for subsequent requests
      setStoredToken(credentialResponse.credential);

      // Verify token with backend
      const response = await verifyToken(credentialResponse.credential);
      
      if (response.status === 'success' && response.email) {
        if (isAllowedEmail(response.email)) {
          setIsAuthenticated(true);
          setUserEmail(response.email);
          setError(null);
          return true;
        } else {
          removeStoredToken();
          setError('Unauthorized email address');
        }
      } else {
        removeStoredToken();
        setError(response.message || 'Failed to verify token');
      }
    } catch (err) {
      removeStoredToken();
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    removeStoredToken();
    setIsAuthenticated(false);
    setUserEmail(null);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        logout();
        return false;
      }

      const response = await verifyToken(token);
      if (response.status === 'success' && response.email) {
        if (isAllowedEmail(response.email)) {
          setIsAuthenticated(true);
          setUserEmail(response.email);
          setError(null);
          return true;
        }
      }
      logout();
    } catch (err) {
      console.error('Auth check error:', err);
      logout();
    }
    return false;
  }, [logout]);

  return {
    isAuthenticated,
    userEmail,
    error,
    login,
    logout,
    checkAuth,
  };
}