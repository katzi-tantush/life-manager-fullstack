import { handleApiError } from '../../utils/error';
import { TOKEN_STORAGE_KEYS } from '../../constants/auth';

export async function readSheetData(range: string) {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/sheets/read?range=${range}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to read sheet data');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function writeSheetData(range: string, values: any[][]) {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/sheets/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ data: values, range }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to write sheet data');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}