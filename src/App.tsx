import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppLayout } from './components/layout/AppLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { LoginForm } from './components/auth/LoginForm';
import { Hub } from './components/layout/Hub';
import { FileUpload } from './components/drive/FileUpload';
import { ImageUpload } from './components/drive/ImageUpload';
import { SheetsTest } from './components/sheets/SheetsTest';
import { useAuthContext } from './context/AuthContext';
import { useDriveContext } from './context/DriveContext';
import { DriveProvider } from './context/DriveContext';

if (!import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID) {
  throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
}

function TestArea() {
  const { handleUpload, uploading, uploadedFile, uploadError } = useDriveContext();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Test Area</h2>
        <button
          onClick={() => window.location.hash = ''}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Hub
        </button>
      </div>
      <FileUpload
        onUpload={handleUpload}
        uploading={uploading}
        uploadedFile={uploadedFile}
        error={uploadError}
      />
      <ImageUpload />
      <SheetsTest />
    </div>
  );
}

function AuthenticatedApp() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Listen for hash changes
  React.useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <DriveProvider>
      <AuthenticatedLayout>
        {currentHash === '#test' ? <TestArea /> : <Hub />}
      </AuthenticatedLayout>
    </DriveProvider>
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

  return <AuthenticatedApp />;
}

function AppWithProviders() {
  return (
    <AppLayout>
      <App />
    </AppLayout>
  );
}

export default AppWithProviders;