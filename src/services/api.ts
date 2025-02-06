export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
}

export interface DriveFoldersResponse extends ApiResponse {
  folders?: DriveFolder[];
}

export interface DriveUploadResponse extends ApiResponse {
  file?: DriveFile;
}

export async function listFolders(): Promise<DriveFoldersResponse> {
  const response = await fetch('/api/drive/folders');

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<DriveUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/drive/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}