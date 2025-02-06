export interface DriveFolder {
  id: string;
  name: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
}

export interface DriveFoldersResponse extends ApiResponse {
  folders?: DriveFolder[];
}

export async function listFolders(): Promise<DriveFoldersResponse> {
  const response = await fetch('/api/drive/folders');

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}