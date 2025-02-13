import { Router } from 'express';
import { userAuthMiddleware } from '../middleware/auth.js';
import { getSheetsService } from '../services/google/index.js';
import { getDriveConfig } from '../config/service-account.js';

const router = Router();
const sheetsService = getSheetsService();

router.get('/read', userAuthMiddleware, async (req, res) => {
  try {
    const { range } = req.query;
    const { googleSheetsDbIdTest } = getDriveConfig();

    if (!range) {
      return res.status(400).json({
        status: 'error',
        message: 'Range parameter is required'
      });
    }

    const result = await sheetsService.readSheet(googleSheetsDbIdTest, range);
    res.json(result);
  } catch (error) {
    console.error('Sheet read error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/write', userAuthMiddleware, async (req, res) => {
  try {
    const { data, range } = req.body;
    const { googleSheetsDbIdTest } = getDriveConfig();

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format'
      });
    }

    if (!range) {
      return res.status(400).json({
        status: 'error',
        message: 'Range is required'
      });
    }

    const result = await sheetsService.writeSheet(googleSheetsDbIdTest, range, data);
    res.json(result);
  } catch (error) {
    console.error('Sheet write error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;