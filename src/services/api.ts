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

export interface AuthResponse extends ApiResponse {
  email?: string;
}

export interface DriveFoldersResponse extends ApiResponse {
  folders?: DriveFolder[];
}

export interface DriveUploadResponse extends ApiResponse {
  file?: DriveFile;
}

export async function verifyToken(token: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      token,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID 
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

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