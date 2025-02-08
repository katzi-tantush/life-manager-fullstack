import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { ErrorProvider } from '../../context/ErrorContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorProvider>
  );
}