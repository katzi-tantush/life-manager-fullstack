import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  error: string | null;
  login: (credentialResponse: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    auth.checkAuth();
  }, [auth]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}