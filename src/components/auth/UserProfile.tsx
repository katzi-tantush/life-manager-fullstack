import React from 'react';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  email: string;
  onLogout: () => void;
}

export function UserProfile({ email, onLogout }: UserProfileProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">{email}</span>
      <button
        onClick={onLogout}
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}