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
    throw new Error('Missing uploads folder ID in DRIVE_DATA_JSON configuration');
  }

  try {
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

    return {
      status: 'success',
      file: response.data
    };
  } catch (error) {
    console.error('Drive API error:', error);
    return {
      status: 'error',
      message: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}