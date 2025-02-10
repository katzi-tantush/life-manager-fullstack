export interface OAuthConfig {
    clientId: string;
    allowedEmails: string[];
    tokenExpiration: number;
    sessionCookie: {
      name: string;
      maxAge: number;
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
  }
  
  export interface ServiceAccountConfig {
    email: string;
    scopes: string[];
    driveFolderId: string;
  }
  
  export interface AppConfig {
    oauth: OAuthConfig;
    serviceAccount: ServiceAccountConfig;
  }