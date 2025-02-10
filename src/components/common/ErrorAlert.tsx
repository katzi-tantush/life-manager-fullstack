import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="error-alert">
      <AlertCircle className="error-icon h-5 w-5" />
      <p className="error-message">{message}</p>
    </div>
  );
}