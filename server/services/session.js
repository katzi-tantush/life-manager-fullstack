import { v4 as uuidv4 } from 'uuid';

// In-memory session store
const sessions = new Map();

// Clean up expired sessions periodically
const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const SESSION_TTL = 1000 * 60 * 60 * 24; // 24 hours

function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastAccessed > SESSION_TTL) {
      sessions.delete(sessionId);
    }
  }
}

setInterval(cleanupSessions, CLEANUP_INTERVAL);

export async function createSession(userData) {
  try {
    const sessionId = uuidv4();
    const sessionData = {
      id: sessionId,
      userId: userData.sub,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };

    sessions.set(sessionId, sessionData);
    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

export async function getSession(sessionId) {
  try {
    const session = sessions.get(sessionId);
    if (!session) return null;

    // Update last accessed time
    session.lastAccessed = Date.now();
    sessions.set(sessionId, session);

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId) {
  try {
    sessions.delete(sessionId);
  } catch (error) {
    console.error('Failed to delete session:', error);
    throw error;
  }
}

export async function refreshSession(sessionId) {
  try {
    const session = await getSession(sessionId);
    if (!session) return null;

    // Create new session ID
    const newSessionId = uuidv4();
    
    // Store session with new ID
    session.id = newSessionId;
    session.lastAccessed = Date.now();
    sessions.set(newSessionId, session);

    // Delete old session
    await deleteSession(sessionId);

    return newSessionId;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    throw error;
  }
}