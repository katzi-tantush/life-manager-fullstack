export const AUTH_ERRORS = {
    INVALID_TOKEN: 'Invalid authentication token',
    EXPIRED_TOKEN: 'Token has expired',
    UNAUTHORIZED: 'Unauthorized access',
    MISSING_TOKEN: 'Missing authentication token',
    SERVER_ERROR: 'Authentication server error'
  };
  
  export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
  
  export const AUTH_ENDPOINTS = {
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  };