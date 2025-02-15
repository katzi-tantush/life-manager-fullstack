import { getGoogleApiService } from './base.js';

export class SpreadsheetOperations {
  constructor() {
    this.service = getGoogleApiService();
    this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  }

  async getClient() {
    return this.service.getClient('sheets', 'v4', this.scopes);
  }

  async readSpreadsheetRange(spreadsheetId, range) {
    // ... (same as before)
  }

  async writeSpreadsheetRange(spreadsheetId, range, values) {
    // ... (same as before)
  }

  formatError(error) {
    // ... (same as before)
  }
}

let spreadsheetOperationsInstance = null;
export function getSpreadsheetOperations() {
  if (!spreadsheetOperationsInstance) {
      spreadsheetOperationsInstance = new SpreadsheetOperations();
  }
  return spreadsheetOperationsInstance;
}