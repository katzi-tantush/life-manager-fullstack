import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ErrorAlert } from '../common/ErrorAlert';

interface LoginFormProps {
  onSuccess: (credentialResponse: any) => void;
  error: string | null;
}

export function LoginForm({ onSuccess, error }: LoginFormProps) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Google Drive Manager</h1>
        <div className="login-description">
          <p>Please sign in with your Google account</p>
          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={() => error}
            />
          </div>
          {error && <ErrorAlert message={error} />}
        </div>
      </div>
    </div>
  );
}