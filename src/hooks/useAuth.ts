import { useState, useCallback } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { verifyUserCredential, logout as apiLogout } from '../services/api/auth';
import { TOKEN_STORAGE_KEYS, AUTH_ERRORS } from '../constants/auth';
import { handleApiError } from '../utils/error';
import { refreshToken } from '../services/api/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTokenRefresh = useCallback(async () => {
    try {
      const response = await refreshToken();
      if (response.status === 'success' && response.token) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN, response.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh error:', err);
      return false;
    }
  }, []);

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
      const error = handleApiError(err);
      
      // If token expired, try to refresh
      if (error.message === AUTH_ERRORS.EXPIRED_TOKEN) {
        const refreshed = await handleTokenRefresh();
        if (refreshed) {
          setError(null);
          return true;
        }
      }
      
      setError(error.message);
    }
    return false;
  }, [handleTokenRefresh]);

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
      const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
      if (!token) {
        return false;
      }

      const authResponse = await verifyUserCredential(token);
      if (authResponse.status === 'success' && authResponse.email) {
        setIsAuthenticated(true);
        setUserEmail(authResponse.email);
        return true;
      }

      // If verification fails, try to refresh token
      const refreshed = await handleTokenRefresh();
      if (refreshed) {
        return true;
      }

      // If refresh fails, clear auth state
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
  }, [handleTokenRefresh]);

  return {
    isAuthenticated,
    userEmail,
    error,
    login,
    logout,
    checkAuth,
  };
}