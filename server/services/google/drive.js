import { Readable } from 'stream';
import { getGoogleApiService } from './base.js';

export class DriveService {
  constructor() {
    this.service = getGoogleApiService();
    this.scopes = ['https://www.googleapis.com/auth/drive.file'];
  }

  async getClient() {
    return this.service.getClient('drive', 'v3', this.scopes);
  }

  async uploadFile(file, folderId) {
    try {
      const drive = await this.getClient();
      
      const fileMetadata = {
        name: file.originalname,
        parents: folderId ? [folderId] : undefined
      };

      // Create a readable stream from the buffer
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      const media = {
        mimeType: file.mimetype,
        body: stream
      };

      console.log('Uploading file:', {
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        folderId
      });

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log('File uploaded successfully:', {
        id: response.data.id,
        name: response.data.name
      });

      return {
        status: 'success',
        file: response.data
      };
    } catch (error) {
      console.error('Drive upload error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  async moveFile(fileId, folderId) {
    try {
      const drive = await this.getClient();
      
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'parents'
      });

      await drive.files.update({
        fileId: fileId,
        addParents: folderId,
        removeParents: file.data.parents.join(','),
        fields: 'id, parents'
      });

      return {
        status: 'success'
      };
    } catch (error) {
      console.error('Drive move error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  formatError(error) {
    if (error.response) {
      const { code, message } = error.response.data.error;
      if (code === 403) {
        return 'Insufficient permissions to perform this action';
      }
      if (code === 404) {
        return 'File or folder not found';
      }
      return message;
    }
    return error.message;
  }
}

// Singleton instance
let instance = null;

export function getDriveService() {
  if (!instance) {
    instance = new DriveService();
  }
  return instance;
}