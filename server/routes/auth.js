import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const router = Router();
const client = new OAuth2Client(process.env.VITE_GOOGLE_WEB_CLIENT_ID);

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error: Missing Google client ID'
      });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const email = payload?.email;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid token: No email found'
        });
      }

      if (!config.allowedEmails.includes(email)) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized email address'
        });
      }

      res.json({
        status: 'success',
        email
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
});

export default router;