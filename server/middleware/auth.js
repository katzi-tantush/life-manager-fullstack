import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export async function verifyGoogleToken(token) {
  try {
    if (!process.env.GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Missing GOOGLE_WEB_CLIENT_ID environment variable');
    }

    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('No payload received from token verification');
      }

      if (!payload.email) {
        throw new Error('No email found in token payload');
      }

      if (!config.allowedEmails.includes(payload.email)) {
        throw new Error(`Unauthorized email address: ${payload.email}`);
      }

      return payload;
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError);
      throw new Error(`Token verification failed: ${verifyError.message}`);
    }
  } catch (error) {
    console.error('Token verification error:', {
      error,
      tokenPresent: !!token,
      clientId: process.env.GOOGLE_WEB_CLIENT_ID ? 'present' : 'missing'
    });
    throw error;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'No authorization header provided'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authorization format. Must be Bearer token'
    });
  }

  const token = authHeader.split(' ')[1];

  verifyGoogleToken(token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Auth middleware error:', {
        error: error.message,
        stack: error.stack,
        headerPresent: !!req.headers.authorization
      });
      
      res.status(401).json({
        status: 'error',
        message: error.message || 'Authentication failed'
      });
    });
}