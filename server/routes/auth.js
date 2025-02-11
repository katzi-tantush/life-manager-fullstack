import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { oauthConfig } from '../config/oauth.js';
import { createSession, deleteSession } from '../services/session.js';
import { AUTH_ERRORS } from '../constants/auth.js';
import { AUTH_TYPES } from '../constants/auth.js';

const router = Router();
const userAuthClient = new OAuth2Client({
  clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID
});

// User Authentication Routes
router.post('/verify', async (req, res) => {
  try {
    const { credential, type } = req.body;
    
    // Ensure we're handling user authentication
    if (type !== AUTH_TYPES.OAUTH) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid authentication type'
      });
    }

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: AUTH_ERRORS.INVALID_TOKEN
      });
    }

    try {
      const ticket = await userAuthClient.verifyIdToken({
        idToken: credential,
        audience: process.env.VITE_GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        return res.status(400).json({
          status: 'error',
          message: AUTH_ERRORS.INVALID_TOKEN
        });
      }

      if (!oauthConfig.allowedEmails.includes(payload.email)) {
        return res.status(403).json({
          status: 'error',
          message: AUTH_ERRORS.UNAUTHORIZED
        });
      }

      const sessionId = await createSession({
        ...payload,
        authType: AUTH_TYPES.OAUTH
      });

      res.cookie('sessionId', sessionId, oauthConfig.sessionCookie);

      res.json({
        status: 'success',
        email: payload.email,
        authType: AUTH_TYPES.OAUTH
      });
    } catch (verifyError) {
      console.error('Token verification error:', {
        error: verifyError,
        credentialPresent: !!credential
      });

      if (verifyError.message.includes('Token used too late')) {
        return res.status(401).json({
          status: 'error',
          message: AUTH_ERRORS.EXPIRED_TOKEN
        });
      }

      res.status(401).json({
        status: 'error',
        message: AUTH_ERRORS.INVALID_TOKEN
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      status: 'error',
      message: AUTH_ERRORS.SERVER_ERROR
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
      message: AUTH_ERRORS.SERVER_ERROR
    });
  }
});

export default router;