import { google } from 'googleapis';
import { Readable } from 'stream';

let driveClient = null;

function initializeDriveClient() {
  const requiredVars = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const credentials = {
    type: 'service_account',
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
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
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
    orderBy: 'name'
  });

  return response.data.files;
}

export async function uploadFile(file) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

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

  return response.data;
}