import { Router } from 'express';
import { userAuthMiddleware } from '../middleware/auth.js';
import { getGoogleSheetsService } from '../services/google/index.js';
import { getGoogleServiceConfig } from '../config/service-account.js';

const router = Router();
const sheetsService = getGoogleSheetsService();

router.get('/read', userAuthMiddleware, async (req, res) => {
  try {
    const { range } = req.query;
    const { testSpreadsheetId } = getGoogleServiceConfig();

    if (!range) {
      return res.status(400).json({
        status: 'error',
        message: 'Range parameter is required'
      });
    }

    const result = await sheetsService.readSpreadsheetRange(testSpreadsheetId, range);
    res.json(result);
  } catch (error) {
    console.error('Spreadsheet read error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/write', userAuthMiddleware, async (req, res) => {
  try {
    const { data, range } = req.body;
    const { testSpreadsheetId } = getGoogleServiceConfig();

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

    const result = await sheetsService.writeSpreadsheetRange(testSpreadsheetId, range, data);
    res.json(result);
  } catch (error) {
    console.error('Spreadsheet write error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;