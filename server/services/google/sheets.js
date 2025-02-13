import { getGoogleApiService } from './base.js';
import { getDriveService } from './drive.js';

export class SheetsService {
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

  async createSheet(title, folderId) {
    try {
      const sheets = await this.getClient();
      
      // First create the spreadsheet without folder specification
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title },
          sheets: [
            {
              properties: {
                title: 'Data',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 26
                }
              }
            },
            {
              properties: {
                title: 'Metadata',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10
                }
              }
            }
          ]
        },
        fields: 'spreadsheetId,sheets,properties'
      });

      const spreadsheetId = response.data.spreadsheetId;

      // If a folder ID is provided, move the spreadsheet to that folder
      if (folderId) {
        await this.driveService.moveFile(spreadsheetId, folderId);
      }

      return {
        status: 'success',
        spreadsheetId: spreadsheetId,
        sheets: response.data.sheets
      };
    } catch (error) {
      console.error('Sheets creation error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  async readSheet(spreadsheetId, range) {
    try {
      const sheets = await this.getClient();
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      return {
        status: 'success',
        values: response.data.values
      };
    } catch (error) {
      console.error('Sheets read error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  async writeSheet(spreadsheetId, range, values) {
    try {
      const sheets = await this.getClient();
      
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });

      return {
        status: 'success',
        updatedCells: response.data.updatedCells
      };
    } catch (error) {
      console.error('Sheets write error:', error);
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
        return 'Insufficient permissions to access this spreadsheet';
      }
      if (code === 404) {
        return 'Spreadsheet not found';
      }
      return message;
    }
    return error.message;
  }
}

// Singleton instance
let instance = null;

export function getSheetsService() {
  if (!instance) {
    instance = new SheetsService();
  }
  return instance;
}