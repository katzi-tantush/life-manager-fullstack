import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export async function verifyGoogleToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_WEB_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !config.allowedEmails.includes(payload.email)) {
      throw new Error('Unauthorized email address');
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Token verification failed');
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  verifyGoogleToken(token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Auth middleware error:', error);
      res.status(401).json({
        status: 'error',
        message: 'Authentication failed'
      });
    });
}