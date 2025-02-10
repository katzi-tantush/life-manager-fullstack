export * from './AuthError';
export * from './DriveError';
export * from './ProcessingError';

export function isCustomError(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error;
}