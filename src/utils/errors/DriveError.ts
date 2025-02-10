export class DriveError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'DriveError';
    }
  }
  
  export class DriveApiError extends DriveError {
    constructor(message: string) {
      super(message, 'DRIVE_API_ERROR');
      this.name = 'DriveApiError';
    }
  }
  
  export class FileUploadError extends DriveError {
    constructor(message: string) {
      super(message, 'FILE_UPLOAD_ERROR');
      this.name = 'FileUploadError';
    }
  }