export const oauthConfig = {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
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
    const required = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required OAuth environment variables: ${missing.join(', ')}`);
    }
  }