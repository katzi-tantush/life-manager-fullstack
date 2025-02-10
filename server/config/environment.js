export const config = {
    allowedEmails: ['eitankatzenell@gmail.com', 'yekelor@gmail.com'],
    oauth: {
      tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
      sessionCookie: {
        name: 'sessionId',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    },
    serviceAccount: {
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/cloud-vision'
      ]
    }
  };
  
  export function validateEnvironment() {
    const requiredVars = [
      'GOOGLE_WEB_CLIENT_ID',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_KEY',
      'GOOGLE_DRIVE_FOLDER_ID'
    ];
  
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }