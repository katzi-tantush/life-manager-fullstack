import React from 'react';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  email: string;
  onLogout: () => void;
}

export function UserProfile({ email, onLogout }: UserProfileProps) {
  return (
    <div className="user-profile">
      <span className="user-email">{email}</span>
      <button
        onClick={onLogout}
        className="logout-button"
        aria-label="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}