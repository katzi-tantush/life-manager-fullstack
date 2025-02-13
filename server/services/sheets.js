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

  // Update scopes to include both Sheets and Drive permissions
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
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
    console.log('Creating new sheet:', {
      title,
      parentFolderId: googleSheetsDbId
    });

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
    console.log('Sheet created successfully:', { spreadsheetId });

    // Move the sheet to the correct folder if a folder ID is provided
    if (googleSheetsDbId) {
      try {
        const drive = google.drive({ version: 'v3', auth: sheets.context._options.auth });
        
        // First, verify the folder exists and we have access
        await drive.files.get({
          fileId: googleSheetsDbId,
          fields: 'id, name'
        });

        // Move the file to the specified folder
        await drive.files.update({
          fileId: spreadsheetId,
          addParents: googleSheetsDbId,
          fields: 'id, parents'
        });
        
        console.log('Sheet moved to folder:', { folderId: googleSheetsDbId });
      } catch (moveError) {
        console.error('Error moving sheet to folder:', moveError);
        // Don't throw here - we still created the sheet successfully
      }
    }

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
    console.log('Reading sheet data:', { spreadsheetId, range });

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
    console.log('Writing sheet data:', {
      spreadsheetId,
      rowCount: data.length,
      schemaFields: schema.fields.length
    });

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
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Data!A1:1'
    });

    if (!currentData.data.values || currentData.data.values.length === 0) {
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