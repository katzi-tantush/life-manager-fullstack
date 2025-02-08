import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
const ALLOWED_EMAILS = ['eitankatzenell@gmail.com', 'yekelor@gmail.com'];

export async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_WEB_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !ALLOWED_EMAILS.includes(payload.email)) {
    throw new Error('Unauthorized email address');
  }

  return payload;
}

export function authMiddleware(req, res, next) {
  try {
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
        res.status(401).json({
          status: 'error',
          message: 'Authentication failed: ' + error.message
        });
      });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
}