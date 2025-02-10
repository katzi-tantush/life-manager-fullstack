import type { DriveFoldersResponse, DriveUploadResponse } from '../../types/drive';
import { TOKEN_STORAGE_KEYS } from '../../constants/auth';
import { handleApiError } from '../../utils/error';

export async function listFolders(): Promise<DriveFoldersResponse> {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/drive/folders', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure we have an array of folders
    if (data.status === 'success' && Array.isArray(data.folders)) {
      return data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Drive API error:', error);
    throw handleApiError(error);
  }
}

export async function uploadFile(file: File): Promise<DriveUploadResponse> {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.OAUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/drive/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}