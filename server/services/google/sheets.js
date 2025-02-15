import { getSpreadsheetOperations } from './SpreadsheetOperations.js';
import { getSpreadsheetCreation } from './SpreadsheetCreation.js';

export class GoogleSheetsService {
  constructor() {
    this.operations = getSpreadsheetOperations();
    this.creation = getSpreadsheetCreation();
  }

  async createSpreadsheet(title, folderId) {
    return this.creation.createSpreadsheet(title, folderId);
  }

  async readSpreadsheetRange(spreadsheetId, range) {
    return this.operations.readSpreadsheetRange(spreadsheetId, range);
  }

  async writeSpreadsheetRange(spreadsheetId, range, values) {
    return this.operations.writeSpreadsheetRange(spreadsheetId, range, values);
  }

  formatError(error) {
    return this.operations.formatError(error);
  }
}

let instance = null;

export function getGoogleSheetsService() {
  if (!instance) {
    instance = new GoogleSheetsService();
  }
  return instance;
}