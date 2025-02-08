import type { DriveFoldersResponse, DriveUploadResponse } from '../../types/drive';

export async function listFolders(): Promise<DriveFoldersResponse> {
  const token = localStorage.getItem('googleToken');
  const response = await fetch('/api/drive/folders', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<DriveUploadResponse> {
  const token = localStorage.getItem('googleToken');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/drive/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}