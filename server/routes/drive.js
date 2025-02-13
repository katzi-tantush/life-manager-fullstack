import { Router } from 'express';
import multer from 'multer';
import { userAuthMiddleware } from '../middleware/auth.js';
import { getDriveService } from '../services/google/index.js';
import { getDriveConfig } from '../config/service-account.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = Router();
const driveService = getDriveService();

router.post('/upload', userAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    const { uploadsFolderId } = getDriveConfig();
    const result = await driveService.uploadFile(req.file, uploadsFolderId);
    
    if (result.status === 'error') {
      return res.status(500).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to upload file'
    });
  }
});

export default router;