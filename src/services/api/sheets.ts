import { handleApiError } from '../../utils/error';
import { TOKEN_STORAGE_KEYS } from '../../constants/auth';

export async function createSheet(title: string) {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/sheets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create sheet');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function readSheetData(spreadsheetId: string, range?: string) {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/sheets/${spreadsheetId}/read${range ? `?range=${range}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to read sheet data');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function writeSheetData(spreadsheetId: string, data: any[], schema: any) {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/sheets/${spreadsheetId}/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ data, schema }),
    });

    if (!response.ok) {
      throw new Error('Failed to write sheet data');
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}