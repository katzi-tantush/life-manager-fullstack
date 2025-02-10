export interface OAuthToken {
    type: 'oauth';
    value: string;
    expiresAt: number;
  }
  
  export interface ServiceAccountCredentials {
    type: 'service_account';
    email: string;
    privateKey: string;
  }
  
  export interface GoogleUserProfile {
    email: string;
    name?: string;
    picture?: string;
    sub: string;
  }
  
  export interface TokenVerificationResult {
    valid: boolean;
    user?: GoogleUserProfile;
    error?: string;
  }