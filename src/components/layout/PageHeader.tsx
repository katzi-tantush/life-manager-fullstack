import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { UserProfile } from '../auth/UserProfile';

export function PageHeader() {
  const { userEmail, logout } = useAuthContext();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Google Drive Manager</h1>
      <UserProfile email={userEmail || ''} onLogout={logout} />
    </div>
  );
}