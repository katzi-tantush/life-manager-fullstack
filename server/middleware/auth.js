import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const client = new OAuth2Client();

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
      // Handle specific token errors
      if (verifyError.message.includes('Token used too late')) {
        throw new Error('Token has expired. Please sign in again.');
      }
      if (verifyError.message.includes('Invalid token signature')) {
        throw new Error('Invalid token signature. Please sign in again.');
      }
      if (verifyError.message.includes('Wrong number of segments')) {
        throw new Error('Malformed token. Please sign in again.');
      }
      throw new Error(`Token verification failed: ${verifyError.message}`);
    }
  } catch (error) {
    console.error('Token verification error:', {
      error: error.message,
      tokenPresent: !!token,
      clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID ? 'present' : 'missing'
    });
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
        // Store user info in request for downstream middleware/routes
        req.user = {
          email: user.email,
          name: user.name,
          picture: user.picture,
          sub: user.sub
        };
        next();
      })
      .catch(error => {
        // Log detailed error information
        console.error('Auth middleware error:', {
          message: error.message,
          stack: error.stack,
          headers: {
            authorization: req.headers.authorization ? 'present' : 'missing',
            contentType: req.headers['content-type']
          }
        });
        
        // Send appropriate error response
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