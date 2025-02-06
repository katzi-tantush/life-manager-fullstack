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

// API Routes
const apiRouter = express.Router();

const serviceAccountSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string().min(1, "Project ID is required"),
  private_key_id: z.string().min(1, "Private key ID is required"),
  private_key: z.string()
    .min(1, "Private key is required")
    .includes("-----BEGIN PRIVATE KEY-----", "Private key must be in PEM format")
    .includes("-----END PRIVATE KEY-----", "Private key must be in PEM format"),
  client_email: z.string()
    .email("Invalid client email format")
    .endsWith('.gserviceaccount.com', "Client email must be a service account email"),
  client_id: z.string().min(1, "Client ID is required"),
  auth_uri: z.string()
    .url("Invalid auth URI")
    .startsWith('https://accounts.google.com/', "Invalid auth URI domain"),
  token_uri: z.string()
    .url("Invalid token URI")
    .startsWith('https://oauth2.googleapis.com/', "Invalid token URI domain"),
  auth_provider_x509_cert_url: z.string()
    .url("Invalid auth provider cert URL")
    .startsWith('https://www.googleapis.com/', "Invalid auth provider cert URL domain"),
  client_x509_cert_url: z.string()
    .url("Invalid client cert URL")
    .includes('googleapis.com', "Invalid client cert URL domain")
});

let driveClient = null;

apiRouter.post('/test-connection', async (req, res) => {
  try {
    console.log('Received credentials:', {
      ...req.body,
      private_key: req.body.private_key ? '[REDACTED]' : undefined
    });
    
    const credentials = serviceAccountSchema.parse(req.body);
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    // Create Drive client
    driveClient = google.drive({ version: 'v3', auth });
    
    res.json({ 
      status: 'success', 
      message: `Successfully validated service account for project ${credentials.project_id}`
    });
  } catch (error) {
    console.error('Validation error:', error);
    
    res.status(400).json({ 
      status: 'error', 
      message: error instanceof z.ZodError 
        ? 'Validation errors: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Failed to validate service account credentials'
    });
  }
});

apiRouter.get('/drive/folders/:folderId', async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(400).json({
        status: 'error',
        message: 'Please validate your service account credentials first'
      });
    }

    const folderId = req.params.folderId;
    
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});