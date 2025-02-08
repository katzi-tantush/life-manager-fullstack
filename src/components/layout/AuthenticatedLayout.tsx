import React from 'react';
import { PageHeader } from './PageHeader';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <PageHeader />
          {children}
        </div>
      </div>
    </div>
  );
}