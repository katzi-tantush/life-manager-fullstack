import { useState, useCallback } from 'react';
import type { AuthResponse } from '../types/auth';
import { verifyToken } from '../services/api/auth';
import { config } from '../services/config';
import { isAllowedEmail } from '../utils/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentialResponse: any) => {
    try {
      const response = await verifyToken(credentialResponse.credential);
      if (response.status === 'success' && response.email) {
        if (isAllowedEmail(response.email)) {
          localStorage.setItem('googleToken', credentialResponse.credential);
          setIsAuthenticated(true);
          setUserEmail(response.email);
          setError(null);
          return true;
        } else {
          setError('Unauthorized email address');
        }
      } else {
        setError('Failed to verify token');
      }
    } catch (err) {
      setError('Authentication failed');
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('googleToken');
    setIsAuthenticated(false);
    setUserEmail(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('googleToken');
    if (token) {
      try {
        const response = await verifyToken(token);
        if (response.status === 'success' && response.email) {
          if (isAllowedEmail(response.email)) {
            setIsAuthenticated(true);
            setUserEmail(response.email);
            return true;
          }
        }
        logout();
      } catch {
        logout();
      }
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