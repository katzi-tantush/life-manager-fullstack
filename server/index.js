import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'
);

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Google OAuth client for token verification
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// Allowed email addresses
const ALLOWED_EMAILS = ['eitankatzenell@gmail.com', 'yekelor@gmail.com'];

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT middleware with error handling
const requireAuth = expressjwt({
  secret: JWT_SECRET,
  algorithms: ['HS256']
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Auth Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    token: req.headers.authorization
  });
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
  next(err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// API Routes
const apiRouter = express.Router();

let driveClient = null;

// Initialize Google Drive client with environment variables
const initializeDriveClient = () => {
  if (!process.env.GOOGLE_PROJECT_ID || 
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
      !process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID) {
    throw new Error('Missing required Google service account environment variables');
  }

  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)}`
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

// Verify Google token and create session
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

    // Create session token with explicit algorithm
    const sessionToken = jwt.sign({ email }, JWT_SECRET, { 
      expiresIn: '1d',
      algorithm: 'HS256'
    });

    console.log('Created session token:', {
      email,
      tokenLength: sessionToken.length
    });

    res.json({
      status: 'success',
      email,
      token: sessionToken
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Protected routes
apiRouter.get('/drive/folders', requireAuth, async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(500).json({
        status: 'error',
        message: 'Google Drive client not initialized'
      });
    }

    console.log('Fetching folders for user:', req.auth?.email);

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