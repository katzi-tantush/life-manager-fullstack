import { useState, useCallback } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import type { TokenPayload } from 'google-auth-library';
import { verifyUserCredential, logout as apiLogout } from '../services/api/auth';
import { TOKEN_STORAGE_KEYS, AUTH_ERRORS } from '../constants/auth';
import { handleApiError } from '../utils/error';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (response: CredentialResponse) => {
    try {
      if (!response?.credential) {
        throw new Error(AUTH_ERRORS.INVALID_TOKEN);
      }

      const authResponse = await verifyUserCredential(response.credential);
      
      if (authResponse.status === 'success' && authResponse.email) {
        setIsAuthenticated(true);
        setUserEmail(authResponse.email);
        setError(null);
        localStorage.setItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN, response.credential);
        return true;
      } else {
        setError(authResponse.message || AUTH_ERRORS.UNAUTHORIZED);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(handleApiError(err).message);
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      setIsAuthenticated(false);
      setUserEmail(null);
      setError(null);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    } catch (err) {
      console.error('Logout error:', err);
      setError(handleApiError(err).message);
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
      localStorage.removeItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setUserEmail(null);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
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