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

// JWT secret key - ensure this is set in environment variables
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment variables. Using default secret (not recommended for production)');
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT middleware with detailed configuration
const requireAuth = expressjwt({
  secret: JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth',
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      const token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token ? token.substring(0, 10) + '...' : 'none');
      return token;
    }
    return null;
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('Auth Error Details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      status: err.status,
      headers: req.headers,
      token: req.headers.authorization ? 'Present' : 'Missing',
    });
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: ' + err.message
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
  const requiredVars = {
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
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
    project_id: process.env.GOOGLE_PROJECT_ID,
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
    
    console.log('Verifying token for client ID:', process.env.GOOGLE_WEB_CLIENT_ID);
    
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

    // Create JWT token with necessary claims
    const jwtToken = jwt.sign(
      { 
        email,
        sub: payload.sub,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { 
        algorithm: 'HS256',
        expiresIn: '1d'
      }
    );

    console.log('Auth successful:', {
      email,
      tokenCreated: !!jwtToken
    });

    res.json({
      status: 'success',
      email,
      token: jwtToken
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
apiRouter.get('/drive/folders', requireAuth, async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(500).json({
        status: 'error',
        message: 'Google Drive client not initialized'
      });
    }

    console.log('Authenticated user:', req.auth?.email);

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