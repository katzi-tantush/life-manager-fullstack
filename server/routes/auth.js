import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';
import { createSession, deleteSession } from '../services/session.js';

const router = Router();
const client = new OAuth2Client(process.env.VITE_GOOGLE_WEB_CLIENT_ID);

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate request
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token format'
      });
    }

    // Validate environment
    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      console.error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    try {
      // Verify token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid token: No email found'
        });
      }

      // Check allowed emails
      if (!config.allowedEmails.includes(payload.email)) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized email address'
        });
      }

      // Create session
      const sessionId = await createSession(payload);

      // Set session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Success response
      res.json({
        status: 'success',
        email: payload.email
      });
    } catch (verifyError) {
      console.error('Token verification error:', {
        error: verifyError,
        tokenPresent: !!token,
        clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID ? 'present' : 'missing'
      });

      if (verifyError.message.includes('Token used too late')) {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired'
        });
      }

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

router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await deleteSession(sessionId);
      res.clearCookie('sessionId');
    }
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to logout'
    });
  }
});

export default router;