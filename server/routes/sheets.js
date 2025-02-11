import { Router } from 'express';
import { userAuthMiddleware } from '../middleware/auth.js';
import { createSheet, readSheetData, writeSheetData } from '../services/sheets.js';

const router = Router();

router.post('/create', userAuthMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    const result = await createSheet(title);
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

    const result = await readSheetData(spreadsheetId, range);
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
    const { data, schema } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format'
      });
    }

    if (!schema) {
      return res.status(400).json({
        status: 'error',
        message: 'Schema is required'
      });
    }

    const result = await writeSheetData(spreadsheetId, data, schema);
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