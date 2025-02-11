import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppLayout } from './components/layout/AppLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { LoginForm } from './components/auth/LoginForm';
import { FileUpload } from './components/drive/FileUpload';
import { ImageUpload } from './components/drive/ImageUpload';
import { SheetsTest } from './components/sheets/SheetsTest';
import { useAuthContext } from './context/AuthContext';
import { useDriveContext } from './context/DriveContext';
import { DriveProvider } from './context/DriveContext';

if (!import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID) {
  throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
}

function DriveManager() {
  const { handleUpload, uploading, uploadedFile, uploadError } = useDriveContext();

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <FileUpload
          onUpload={handleUpload}
          uploading={uploading}
          uploadedFile={uploadedFile}
          error={uploadError}
        />

        <ImageUpload />

        <SheetsTest />
      </div>
    </AuthenticatedLayout>
  );
}

function App() {
  const { isAuthenticated, login, error } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID}>
        <LoginForm onSuccess={login} error={error} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <DriveProvider>
      <DriveManager />
    </DriveProvider>
  );
}

function AppWithProviders() {
  return (
    <AppLayout>
      <App />
    </AppLayout>
  );
}

export default AppWithProviders;