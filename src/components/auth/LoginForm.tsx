import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ErrorAlert } from '../common/ErrorAlert';

interface LoginFormProps {
  onSuccess: (credentialResponse: any) => void;
  error: string | null;
}

export function LoginForm({ onSuccess, error }: LoginFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google Drive Manager
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in with your Google account
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={() => {
                console.error('Login Failed');
              }}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              width={280}
            />
          </div>
          
          {error && (
            <div className="mt-4">
              <ErrorAlert message={error} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}