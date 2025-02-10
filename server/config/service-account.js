export const serviceAccountConfig = {
    email: process.env.GOOGLE_SA_EMAIL,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/cloud-vision'
    ],
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID
  };
  
  export function validateServiceAccountConfig() {
    const required = [
      'GOOGLE_SA_EMAIL',
      'GOOGLE_SA_PRIVATE_KEY',
      'GOOGLE_DRIVE_FOLDER_ID'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required service account environment variables: ${missing.join(', ')}`);
    }
  }