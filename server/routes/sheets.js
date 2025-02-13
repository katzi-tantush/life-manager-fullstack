import { Router } from 'express';
import { userAuthMiddleware } from '../middleware/auth.js';
import { getSheetsService } from '../services/google/index.js';
import { getDriveFolderIds } from '../config/service-account.js';

const router = Router();
const sheetsService = getSheetsService();

router.post('/create', userAuthMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    // Ensure user is authenticated and has valid session
    if (!req.session || !req.session.email) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { googleSheetsDbId } = getDriveFolderIds();
    const result = await sheetsService.createSheet(title, googleSheetsDbId);
    res.json(result);
  } catch (error) {
    console.error('Sheet creation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.get('/:spreadsheetId/read', userAuthMiddleware, async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query;

    // Ensure user is authenticated and has valid session
    if (!req.session || !req.session.email) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const result = await sheetsService.readSheet(spreadsheetId, range || 'Data!A1:Z1000');
    res.json(result);
  } catch (error) {
    console.error('Sheet read error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/:spreadsheetId/write', userAuthMiddleware, async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { data, range = 'Data' } = req.body;

    // Ensure user is authenticated and has valid session
    if (!req.session || !req.session.email) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format'
      });
    }

    const result = await sheetsService.writeSheet(spreadsheetId, range, data);
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