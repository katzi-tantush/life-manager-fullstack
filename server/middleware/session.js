import { getSession } from '../services/session.js';

export async function sessionMiddleware(req, res, next) {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        status: 'error',
        message: 'No session found'
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      // Clear invalid session cookie
      res.clearCookie('sessionId');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    // Attach session data to request
    req.session = session;
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}