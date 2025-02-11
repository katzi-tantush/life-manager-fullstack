import { google } from 'googleapis';
import { Readable } from 'stream';
import { getDriveFolderIds } from '../config/service-account.js';

let driveServiceClient = null;

function initializeDriveServiceClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Missing Google service account credentials');
  }

  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  return google.drive({ version: 'v3', auth });
}

export function getDriveServiceClient() {
  if (!driveServiceClient) {
    driveServiceClient = initializeDriveServiceClient();
  }
  return driveServiceClient;
}

export async function uploadFile(file) {
  const drive = getDriveServiceClient();
  const { uploadsFolderId } = getDriveFolderIds();

  if (!uploadsFolderId) {
    console.error('Upload failed: Missing uploads folder ID');
    return {
      status: 'error',
      message: 'Drive configuration error: Missing uploads folder ID'
    };
  }

  try {
    console.log('Uploading file to Drive...', {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folderId: uploadsFolderId
    });

    const fileMetadata = {
      name: file.originalname,
      parents: [uploadsFolderId]
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    console.log('File uploaded successfully:', {
      fileId: response.data.id,
      filename: response.data.name
    });

    return {
      status: 'success',
      file: response.data
    };
  } catch (error) {
    console.error('Drive API error:', {
      error: error.message,
      stack: error.stack,
      filename: file.originalname,
      folderId: uploadsFolderId
    });

    // Check for specific Drive API errors
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('insufficient permissions')) {
      return {
        status: 'error',
        message: 'Service account does not have permission to upload to this folder'
      };
    }
    if (errorMessage.includes('quota')) {
      return {
        status: 'error',
        message: 'Drive storage quota exceeded'
      };
    }
    if (errorMessage.includes('rate limit')) {
      return {
        status: 'error',
        message: 'Drive API rate limit exceeded. Please try again later'
      };
    }

    return {
      status: 'error',
      message: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}