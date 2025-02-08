import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppLayout } from './components/layout/AppLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { LoginForm } from './components/auth/LoginForm';
import { FileUpload } from './components/drive/FileUpload';
import { FolderList } from './components/drive/FolderList';
import { ErrorAlert } from './components/common/ErrorAlert';
import { useAuthContext } from './context/AuthContext';
import { useDriveContext } from './context/DriveContext';

if (!import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID) {
  throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
}

function DriveManager() {
  const { handleUpload, uploading, uploadedFile, uploadError, folders, loading, error } = useDriveContext();

  return (
    <AuthenticatedLayout>
      <FileUpload
        onUpload={handleUpload}
        uploading={uploading}
        uploadedFile={uploadedFile}
        error={uploadError}
      />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
        <FolderList folders={folders} loading={loading} />
      </div>

      {error && <ErrorAlert message={error} />}
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

  return <DriveManager />;
}

function AppWithProviders() {
  return (
    <AppLayout>
      <App />
    </AppLayout>
  );
}

export default AppWithProviders;