declare module '@react-oauth/google' {
  import { FC } from 'react';

  interface GoogleOAuthProviderProps {
    clientId: string;
    children: React.ReactNode;
  }

  interface CredentialResponse {
    credential?: string;
    clientId?: string;
    select_by?: string;
  }

  interface GoogleLoginProps {
    onSuccess?: (credentialResponse: CredentialResponse) => void;
    onError?: () => void;
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
  }

  export const GoogleOAuthProvider: FC<GoogleOAuthProviderProps>;
  export const GoogleLogin: FC<GoogleLoginProps>;
}