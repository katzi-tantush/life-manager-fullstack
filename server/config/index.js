export { oauthConfig, validateOAuthConfig } from './oauth.js';
export { serviceAccountConfig, validateServiceAccountConfig } from './service-account.js';

export function validateAllConfigs() {
  validateOAuthConfig();
  validateServiceAccountConfig();
}