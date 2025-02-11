import { OAuth2Client } from 'google-auth-library';
import { oauthConfig } from '../config/oauth.js';
import { AUTH_ERRORS, AUTH_TYPES } from '../constants/auth.js';

const userAuthClient = new OAuth2Client({
  clientId: process.env.VITE_GOOGLE_WEB_CLIENT_ID
});

function extractUserToken(authHeader) {
  if (!authHeader) {
    throw new Error(AUTH_ERRORS.MISSING_TOKEN);
  }

  const trimmedHeader = authHeader.trim();
  if (!trimmedHeader.startsWith('Bearer ')) {
    throw new Error(AUTH_ERRORS.INVALID_TOKEN);
  }

  const token = trimmedHeader.slice(7).trim();
  if (!token) {
    throw new Error(AUTH_ERRORS.MISSING_TOKEN);
  }

  return token;
}

export async function verifyUserToken(credential) {
  try {
    if (!process.env.VITE_GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_WEB_CLIENT_ID environment variable');
    }

    if (!credential || typeof credential !== 'string') {
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }

    try {
      const ticket = await userAuthClient.verifyIdToken({
        idToken: credential,
        audience: process.env.VITE_GOOGLE_WEB_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error(AUTH_ERRORS.INVALID_TOKEN);
      }

      if (!oauthConfig.allowedEmails.includes(payload.email)) {
        throw new Error(AUTH_ERRORS.UNAUTHORIZED);
      }

      return {
        ...payload,
        authType: AUTH_TYPES.OAUTH
      };
    } catch (verifyError) {
      console.error('Token verification error:', {
        error: verifyError.message,
        credentialLength: credential?.length
      });
      
      if (verifyError.message.includes('expired')) {
        throw new Error(AUTH_ERRORS.EXPIRED_TOKEN);
      }
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

export function userAuthMiddleware(req, res, next) {
  try {
    let token;
    try {
      token = extractUserToken(req.headers.authorization);
    } catch (extractError) {
      return res.status(401).json({
        status: 'error',
        message: extractError.message
      });
    }

    verifyUserToken(token)
      .then(user => {
        req.user = {
          email: user.email,
          name: user.name,
          picture: user.picture,
          sub: user.sub,
          authType: user.authType
        };
        next();
      })
      .catch(error => {
        console.error('Auth middleware error:', {
          message: error.message,
          stack: error.stack
        });
        
        const status = error.message === AUTH_ERRORS.EXPIRED_TOKEN ? 401 : 
                      error.message === AUTH_ERRORS.UNAUTHORIZED ? 403 : 401;
        
        res.status(status).json({
          status: 'error',
          message: error.message || AUTH_ERRORS.INVALID_TOKEN,
          code: error.message === AUTH_ERRORS.EXPIRED_TOKEN ? 'TOKEN_EXPIRED' :
                error.message === AUTH_ERRORS.UNAUTHORIZED ? 'UNAUTHORIZED' : 'AUTH_FAILED'
        });
      });
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: AUTH_ERRORS.SERVER_ERROR,
      code: 'INTERNAL_ERROR'
    });
  }
}