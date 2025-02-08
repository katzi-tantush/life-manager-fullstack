import React, { createContext, useContext } from 'react';
import { useErrorHandling } from '../hooks/useErrorHandling';

interface ErrorContextType {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: unknown) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const errorHandling = useErrorHandling();

  return (
    <ErrorContext.Provider value={errorHandling}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}