import { getGoogleApiService } from './base.js';
import { getDriveService } from './drive.js';

export class GoogleSheetsService {
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
    try {
      const sheets = await this.getClient();
      
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

      if (folderId) {
        await this.driveService.moveFile(spreadsheetId, folderId);
      }

      return {
        status: 'success',
        spreadsheetId: spreadsheetId,
        sheets: response.data.sheets
      };
    } catch (error) {
      console.error('Spreadsheet creation error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  async readSpreadsheetRange(spreadsheetId, range) {
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
      console.error('Spreadsheet read error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  async writeSpreadsheetRange(spreadsheetId, range, values) {
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
      console.error('Spreadsheet write error:', error);
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

let instance = null;

export function getGoogleSheetsService() {
  if (!instance) {
    instance = new GoogleSheetsService();
  }
  return instance;
}