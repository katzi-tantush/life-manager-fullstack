import { google } from 'googleapis';
import { z } from 'zod';
import { format } from 'date-fns';
import { getDriveFolderIds } from '../config/service-account.js';

let sheetsClient = null;

// Schema validation for metadata
const MetadataSchema = z.object({
  entityName: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'date']),
    required: z.boolean().optional(),
    defaultValue: z.any().optional()
  })),
  createdAt: z.date(),
  updatedAt: z.date()
});

function initializeSheetsClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Missing Google service account credentials');
  }

  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

function getSheetsClient() {
  if (!sheetsClient) {
    sheetsClient = initializeSheetsClient();
  }
  return sheetsClient;
}

export async function createSheet(title) {
  const sheets = getSheetsClient();
  const { googleSheetsDbId } = getDriveFolderIds();

  try {
    // Create a new sheet
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
      }
    });

    const spreadsheetId = response.data.spreadsheetId;

    // Initialize metadata
    const metadata = {
      entityName: title,
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Metadata!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[JSON.stringify(metadata)]]
      }
    });

    return {
      status: 'success',
      spreadsheetId,
      metadata
    };
  } catch (error) {
    console.error('Failed to create sheet:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

export async function readSheetData(spreadsheetId, range = 'Data!A1:Z1000') {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const data = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] || null;
      });
      return item;
    });

    return {
      status: 'success',
      headers,
      data
    };
  } catch (error) {
    console.error('Failed to read sheet data:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

export async function writeSheetData(spreadsheetId, data, schema) {
  const sheets = getSheetsClient();

  try {
    // Validate schema
    const validationResult = MetadataSchema.safeParse(schema);
    if (!validationResult.success) {
      throw new Error('Invalid schema: ' + JSON.stringify(validationResult.error));
    }

    // Prepare headers and rows
    const headers = schema.fields.map(field => field.name);
    const rows = data.map(item => {
      return headers.map(header => {
        const field = schema.fields.find(f => f.name === header);
        const value = item[header];

        // Handle type conversion
        switch (field.type) {
          case 'date':
            return value ? format(new Date(value), 'yyyy-MM-dd') : '';
          case 'boolean':
            return value ? 'TRUE' : 'FALSE';
          default:
            return value?.toString() || '';
        }
      });
    });

    // Write headers if sheet is empty
    const currentData = await readSheetData(spreadsheetId);
    if (!currentData.headers || currentData.headers.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Data!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });
    }

    // Write data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Data!A2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows
      }
    });

    return {
      status: 'success',
      rowCount: rows.length
    };
  } catch (error) {
    console.error('Failed to write sheet data:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}