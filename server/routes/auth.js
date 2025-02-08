import { Router } from 'express';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = Router();

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await verifyGoogleToken(token);
    
    res.json({
      status: 'success',
      email: user.email
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed: ' + error.message
    });
  }
});

export default router;