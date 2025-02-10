export const oauthConfig = {
  clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID,
  allowedEmails: ['eitankatzenell@gmail.com', 'yekelor@gmail.com'],
  tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
  sessionCookie: {
    name: 'sessionId',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
};

export function validateOAuthConfig() {
  const required = ['VITE_GOOGLE_WEB_CLIENT_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required OAuth environment variables: ${missing.join(', ')}`);
  }
}