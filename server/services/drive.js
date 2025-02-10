import { google } from 'googleapis';
import { Readable } from 'stream';
import { serviceAccountConfig } from '../config/service-account.js';

let driveClient = null;

function initializeDriveClient() {
  const credentials = {
    type: 'service_account',
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scopes: serviceAccountConfig.scopes
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: serviceAccountConfig.scopes
  });

  return google.drive({ version: 'v3', auth });
}

export function getDriveClient() {
  if (!driveClient) {
    driveClient = initializeDriveClient();
  }
  return driveClient;
}

export async function listFolders() {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
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
      message: 'Failed to fetch folders',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function uploadFile(file) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

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
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}