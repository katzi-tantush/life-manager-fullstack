import { google } from 'googleapis';
import { Readable } from 'stream';
import { serviceAccountConfig } from '../config/service-account.js';

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

export async function listFolders() {
  const drive = getDriveServiceClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!folderId) {
    throw new Error('Missing Google Drive folder ID');
  }

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
      orderBy: 'name'
    });

    return {
      status: 'success',
      folders: response.data.files
    };
  } catch (error) {
    console.error('Drive API error:', error);
    return {
      status: 'error',
      message: 'Failed to fetch folders: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

export async function uploadFile(file) {
  const drive = getDriveServiceClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error('Missing Google Drive folder ID');
  }

  try {
    const fileMetadata = {
      name: file.originalname,
      parents: [folderId]
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