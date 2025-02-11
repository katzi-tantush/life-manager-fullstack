export const serviceAccountConfig = {
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/cloud-vision'
  ]
};

function parseDriveConfig() {
  try {
    if (!process.env.DRIVE_DATA_JSON) {
      throw new Error('Missing DRIVE_DATA_JSON environment variable');
    }
    return JSON.parse(process.env.DRIVE_DATA_JSON);
  } catch (error) {
    throw new Error(`Invalid DRIVE_DATA_JSON format: ${error.message}`);
  }
}

export function getDriveFolderIds() {
  const driveConfig = parseDriveConfig();
  return {
    mainFolderId: driveConfig.mainFolderId,
    uploadsFolderId: driveConfig.uploadsFolderId,
    googleSheetsDbId: driveConfig.googleSheetsDbId
  };
}

export function validateServiceAccountConfig() {
  const required = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_KEY',
    'DRIVE_DATA_JSON'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required service account environment variables: ${missing.join(', ')}`);
  }

  // Validate JSON structure
  try {
    const { mainFolderId, uploadsFolderId, googleSheetsDbId } = getDriveFolderIds();
    if (!mainFolderId || !uploadsFolderId || !googleSheetsDbId) {
      throw new Error('Missing required folder IDs in DRIVE_DATA_JSON');
    }
  } catch (error) {
    throw new Error(`Invalid DRIVE_DATA_JSON: ${error.message}`);
  }
}