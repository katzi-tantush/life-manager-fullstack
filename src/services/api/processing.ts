import type { ProcessingResult } from '../../types/processing';
import { AUTH_ENDPOINTS } from '../../constants/auth';
import { handleApiError } from '../../utils/error';

export async function processFile(file: File): Promise<ProcessingResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/process/file', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process file');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}