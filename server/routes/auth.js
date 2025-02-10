import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { oauthConfig } from '../config/oauth.js';
import { createSession, deleteSession, refreshSession } from '../services/session.js';
import { AUTH_ERRORS } from '../constants/auth.js';

const router = Router();
const userAuthClient = new OAuth2Client(process.env.VITE_GOOGLE_WEB_CLIENT_ID);

router.post('/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: AUTH_ERRORS.INVALID_TOKEN
      });
    }

    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      console.error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
      return res.status(500).json({
        status: 'error',
        message: AUTH_ERRORS.SERVER_ERROR
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

      const sessionId = await createSession(payload);

      res.cookie('sessionId', sessionId, oauthConfig.sessionCookie);

      res.json({
        status: 'success',
        email: payload.email,
        token: credential  // Include the token in the response
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

router.post('/refresh', async (req, res) => {
  try {
    const currentSessionId = req.cookies.sessionId;
    if (!currentSessionId) {
      return res.status(401).json({
        status: 'error',
        message: AUTH_ERRORS.MISSING_TOKEN
      });
    }

    const newSessionId = await refreshSession(currentSessionId);
    if (!newSessionId) {
      return res.status(401).json({
        status: 'error',
        message: AUTH_ERRORS.INVALID_TOKEN
      });
    }

    // Set new session cookie
    res.cookie('sessionId', newSessionId, oauthConfig.sessionCookie);

    // Generate new token
    const session = await getSession(newSessionId);
    const token = await userAuthClient.getToken(); // Get fresh token

    res.json({
      status: 'success',
      token: token.tokens.id_token // Include the new token in the response
    });
  } catch (error) {
    console.error('Session refresh error:', error);
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