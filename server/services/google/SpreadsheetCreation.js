import { getGoogleApiService } from './base.js';
import { getDriveService } from './drive.js';

export class SpreadsheetCreation {
  constructor() {
    this.service = getGoogleApiService();
    this.driveService = getDriveService();
    this.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ];
  }

  async getClient() {
    return this.service.getClient('sheets', 'v4', this.scopes);
  }

  async createSpreadsheet(title, folderId) {
    // ... (same as before)
  }
}

let spreadsheetCreationInstance = null;
export function getSpreadsheetCreation() {
  if (!spreadsheetCreationInstance) {
      spreadsheetCreationInstance = new SpreadsheetCreation();
  }
  return spreadsheetCreationInstance;
}