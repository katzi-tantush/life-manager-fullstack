import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Google OAuth client for token verification
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// Allowed email addresses
const ALLOWED_EMAILS = ['eitankatzenell@gmail.com', 'yekelor@gmail.com'];

// Middleware to verify Google token
const verifyGoogleToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_WEB_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !ALLOWED_EMAILS.includes(payload.email)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized email address'
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// API Routes
const apiRouter = express.Router();

let driveClient = null;

// Initialize Google Drive client with environment variables
const initializeDriveClient = () => {
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
};

// Initialize the drive client on startup
try {
  driveClient = initializeDriveClient();
  console.log('Successfully initialized Google Drive client');
} catch (error) {
  console.error('Failed to initialize Google Drive client:', error.message);
}

// Verify Google token
apiRouter.post('/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_WEB_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email || !ALLOWED_EMAILS.includes(email)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized email address'
      });
    }

    res.json({
      status: 'success',
      email
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed: ' + error.message
    });
  }
});

// Protected routes
apiRouter.get('/drive/folders', verifyGoogleToken, async (req, res) => {
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

apiRouter.post('/drive/upload', verifyGoogleToken, upload.single('file'), async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(500).json({
        status: 'error',
        message: 'Google Drive client not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId]
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer)
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    res.json({
      status: 'success',
      file: {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink
      }
    });
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload file: ' + error.message
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