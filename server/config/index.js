import { oauthConfig } from './oauth.js';
import { serviceAccountConfig } from './service-account.js';

export function validateOAuthConfig() {
  const required = ['VITE_GOOGLE_WEB_CLIENT_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required OAuth environment variables: ${missing.join(', ')}`);
  }
}

export function validateServiceAccountConfig() {
  const required = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required service account environment variables: ${missing.join(', ')}`);
  }
}

export function validateAllConfigs() {
  validateOAuthConfig();
  validateServiceAccountConfig();
}

export { oauthConfig, serviceAccountConfig };