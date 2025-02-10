import { Router } from 'express';
import multer from 'multer';
import { processFile } from '../services/fileProcessor/index.js';
import { userAuthMiddleware } from '../middleware/auth.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = Router();

router.post('/file', userAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided'
      });
    }

    console.log('Processing file request:', {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    const result = await processFile(req.file);
    
    if (result.status === 'error') {
      console.error('File processing failed:', result.message);
      return res.status(500).json(result);
    }
    
    console.log('File processing successful:', {
      filename: req.file.originalname,
      extractedTextLength: result.result?.extractedText?.length,
      blockCount: result.result?.textBlocks?.length
    });

    res.json(result);
  } catch (error) {
    console.error('Processing route error:', {
      error: error.message,
      stack: error.stack,
      filename: req?.file?.originalname
    });

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;