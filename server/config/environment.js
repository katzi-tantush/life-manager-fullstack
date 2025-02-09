export const config = {
    allowedEmails: ['eitankatzenell@gmail.com', 'yekelor@gmail.com']
  };
  
  export function validateEnvironment() {
    const requiredVars = [
      'VITE_GOOGLE_WEB_CLIENT_ID',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_KEY',
      'GOOGLE_DRIVE_FOLDER_ID'
    ];
  
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }