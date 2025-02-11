export const AUTH_TYPES = Object.freeze({
    OAUTH: 'oauth',
    SERVICE_ACCOUNT: 'service_account'
  });
  
  export const AUTH_ERRORS = Object.freeze({
    INVALID_TOKEN: 'Invalid authentication token',
    EXPIRED_TOKEN: 'Token has expired',
    UNAUTHORIZED: 'Unauthorized access',
    MISSING_TOKEN: 'Missing authentication token',
    SERVER_ERROR: 'Authentication server error'
  });
  
  export const AUTH_COOKIE_OPTIONS = Object.freeze({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  export const AUTH_ENDPOINTS = Object.freeze({
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  });