import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (credentialResponse: any) => void;
  error: string | null;
}

export function LoginForm({ onSuccess, error }: LoginFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Google Drive Manager</h1>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Please sign in with your Google account
            </p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onSuccess}
                onError={() => error}
              />
            </div>
            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}