import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const client = new OAuth2Client(process.env.VITE_GOOGLE_WEB_CLIENT_ID);

function extractToken(authHeader) {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  // Remove any extra whitespace
  const trimmedHeader = authHeader.trim();

  // Check for Bearer prefix
  if (!trimmedHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization format. Must be Bearer token');
  }

  // Extract and clean the token
  const token = trimmedHeader.slice(7).trim();
  if (!token) {
    throw new Error('Token is empty');
  }

  return token;
}

export async function verifyGoogleToken(token) {
  try {
    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
    }

    // Verify it's a string token from Google OAuth
    if (!token || typeof token !== 'string' || token.length < 50) {
      throw new Error('Invalid token format');
    }

    try {
      const ticket = await client.verifyIdToken({
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
      console.error('Token verification error:', {
        error: verifyError.message,
        tokenPresent: !!token,
        tokenLength: token?.length
      });
      throw verifyError;
    }
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

export function authMiddleware(req, res, next) {
  try {
    let token;
    try {
      token = extractToken(req.headers.authorization);
    } catch (extractError) {
      return res.status(401).json({
        status: 'error',
        message: extractError.message
      });
    }

    verifyGoogleToken(token)
      .then(user => {
        req.user = {
          email: user.email,
          name: user.name,
          picture: user.picture,
          sub: user.sub
        };
        next();
      })
      .catch(error => {
        console.error('Auth middleware error:', {
          message: error.message,
          stack: error.stack
        });
        
        const status = error.message.includes('expired') ? 401 : 
                      error.message.includes('Unauthorized') ? 403 : 401;
        
        res.status(status).json({
          status: 'error',
          message: error.message || 'Authentication failed',
          code: error.message.includes('expired') ? 'TOKEN_EXPIRED' :
                error.message.includes('Unauthorized') ? 'UNAUTHORIZED' : 'AUTH_FAILED'
        });
      });
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication',
      code: 'INTERNAL_ERROR'
    });
  }
}