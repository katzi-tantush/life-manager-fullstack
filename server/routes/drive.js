import { Router } from 'express';
import multer from 'multer';
import { userAuthMiddleware } from '../middleware/auth.js';
import { listFolders, uploadFile } from '../services/drive.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/folders', userAuthMiddleware, async (req, res) => {
  try {
    const folders = await listFolders();
    res.json({
      status: 'success',
      folders
    });
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch folders: ' + error.message
    });
  }
});

router.post('/upload', userAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    const file = await uploadFile(req.file);
    res.json({
      status: 'success',
      file
    });
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload file: ' + error.message
    });
  }
});

export default router;