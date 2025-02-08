export interface DriveFolder {
    id: string;
    name: string;
  }
  
  export interface DriveFile {
    id: string;
    name: string;
    webViewLink: string;
  }
  
  export interface DriveFoldersResponse {
    status: 'success' | 'error';
    message?: string;
    folders?: DriveFolder[];
  }
  
  export interface DriveUploadResponse {
    status: 'success' | 'error';
    message?: string;
    file?: DriveFile;
  }