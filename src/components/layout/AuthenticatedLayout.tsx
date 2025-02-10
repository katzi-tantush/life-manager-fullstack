import React from 'react';
import { PageHeader } from './PageHeader';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <PageHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}