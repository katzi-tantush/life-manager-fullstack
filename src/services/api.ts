export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveFoldersResponse extends ApiResponse {
  folders?: DriveFolder[];
}

export async function testConnection(credentials: ServiceAccountCredentials): Promise<ApiResponse> {
  const response = await fetch(`/api/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function listFolders(folderId: string): Promise<DriveFoldersResponse> {
  const response = await fetch(`/api/drive/folders/${folderId}`);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}