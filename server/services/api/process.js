import { ProcessingError } from '../../utils/errors/index.js';

export async function processFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/process/file', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new ProcessingError('Failed to process file', 'PROCESSING_ERROR');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ProcessingError) {
      throw error;
    }
    throw new ProcessingError(
      error instanceof Error ? error.message : 'Unknown processing error',
      'PROCESSING_ERROR'
    );
  }
}