import type { ProcessingResult } from '../../types/processing';
import { TOKEN_STORAGE_KEYS } from '../../constants/auth';
import { handleApiError } from '../../utils/error';

export async function processFile(file: File): Promise<ProcessingResult> {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/process/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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