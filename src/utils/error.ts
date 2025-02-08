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