import { google } from 'googleapis';
import { Readable } from 'stream';
import { serviceAccountConfig } from '../config/service-account.js';

let driveServiceClient = null;

function initializeDriveServiceClient() {
  const credentials = {
    type: 'service_account',
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scopes: serviceAccountConfig.scopes
  };

  const serviceAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: serviceAccountConfig.scopes
  });

  return google.drive({ version: 'v3', auth: serviceAuth });
}

export function getDriveServiceClient() {
  if (!driveServiceClient) {
    driveServiceClient = initializeDriveServiceClient();
  }
  return driveServiceClient;
}

export async function listFolders() {
  const driveService = getDriveServiceClient();
  const folderId = serviceAccountConfig.driveFolderId;
  
  try {
    const response = await driveService.files.list({
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
  const driveService = getDriveServiceClient();
  const folderId = serviceAccountConfig.driveFolderId;

  try {
    const fileMetadata = {
      name: file.originalname,
      parents: [folderId]
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };

    const response = await driveService.files.create({
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