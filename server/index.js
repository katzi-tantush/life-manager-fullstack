import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// API Routes
const apiRouter = express.Router();

let driveClient = null;

// Initialize Google Drive client with environment variables
const initializeDriveClient = () => {
  if (!process.env.GOOGLE_PROJECT_ID || 
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
      !process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      !process.env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('Missing required Google service account environment variables');
  }

  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'), // Fix newlines if needed
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)}`
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return google.drive({ version: 'v3', auth });
};

// Initialize the drive client on startup
try {
  driveClient = initializeDriveClient();
  console.log('Successfully initialized Google Drive client');
} catch (error) {
  console.error('Failed to initialize Google Drive client:', error.message);
}

apiRouter.get('/drive/folders', async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(500).json({
        status: 'error',
        message: 'Google Drive client not initialized'
      });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const response = await driveClient.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
      orderBy: 'name'
    });

    res.json({
      status: 'success',
      folders: response.data.files
    });
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch folders: ' + error.message
    });
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});