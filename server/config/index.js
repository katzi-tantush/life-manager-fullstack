import { validateOAuthConfig } from './oauth.js';
import { validateServiceAccountConfig } from './service-account.js';

export function validateAllConfigs() {
  validateOAuthConfig();
  validateServiceAccountConfig();
}

export { oauthConfig } from './oauth.js';
export { serviceAccountConfig, getDriveFolderIds } from './service-account.js';