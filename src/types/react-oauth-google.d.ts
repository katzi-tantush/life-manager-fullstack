declare module '@react-oauth/google' {
    import { FC, ReactNode } from 'react';
  
    interface GoogleOAuthProviderProps {
      clientId: string;
      children: ReactNode;
    }
  
    interface GoogleLoginProps {
      onSuccess?: (credentialResponse: any) => void;
      onError?: () => void;
    }
  
    export const GoogleOAuthProvider: FC<GoogleOAuthProviderProps>;
    export const GoogleLogin: FC<GoogleLoginProps>;
  }