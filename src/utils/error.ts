import { AUTH_ERRORS } from '../constants/auth';

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('Network') || error.message.includes('network'));
}

export function isDriveError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Drive');
}

export function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    // Handle specific API error cases
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new Error(AUTH_ERRORS.UNAUTHORIZED);
    }
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return new Error(AUTH_ERRORS.UNAUTHORIZED);
    }
    if (error.message.includes('404')) {
      return new Error('Resource not found');
    }
    if (error.message.includes('429')) {
      return new Error('Too many requests. Please try again later.');
    }
    if (error.message.includes('500')) {
      return new Error('Server error. Please try again later.');
    }
    
    // Return the original error if no specific case matches
    return error;
  }
  
  // Handle non-Error objects
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  // Default error for unknown cases
  return new Error('An unexpected error occurred');
}

export function isAuthError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('auth') ||
    error.message.includes('token') ||
    error.message.includes('unauthorized') ||
    error.message.includes('unauthenticated')
  );
}