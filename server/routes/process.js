import { Router } from 'express';
import multer from 'multer';
import { processFile } from '../services/fileProcessor/index.js';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    const result = await processFile(req.file);
    
    res.json({
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;