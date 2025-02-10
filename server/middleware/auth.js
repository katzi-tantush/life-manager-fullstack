import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const client = new OAuth2Client();

export async function verifyGoogleToken(token) {
  try {
    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
    }

    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    // Initialize with the correct client ID
    const oauth2Client = new OAuth2Client(process.env.VITE_GOOGLE_WEB_CLIENT_ID);

    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('No payload received from token verification');
      }

      if (!payload.email) {
        throw new Error('No email found in token payload');
      }

      if (!config.allowedEmails.includes(payload.email)) {
        throw new Error('Unauthorized email address');
      }

      return payload;
    } catch (verifyError) {
      if (verifyError.message.includes('Token used too late')) {
        throw new Error('Token has expired. Please sign in again.');
      }
      throw new Error(`Token verification failed: ${verifyError.message}`);
    }
  } catch (error) {
    console.error('Token verification error:', {
      message: error.message,
      tokenPresent: !!token,
      clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID ? 'present' : 'missing'
    });
    throw error;
  }
}

export function authMiddleware(req, res, next) {
  try {
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
          message: error.message,
          stack: error.stack,
          headerPresent: !!req.headers.authorization
        });
        
        res.status(401).json({
          status: 'error',
          message: error.message || 'Authentication failed'
        });
      });
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
}