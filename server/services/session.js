import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

let redisClient;

export async function initializeRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    await redisClient.connect();
    
    console.log('Redis client connected successfully');
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    throw error;
  }
}

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

    // Store session with 24-hour expiration
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      { EX: 24 * 60 * 60 }
    );

    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

export async function getSession(sessionId) {
  try {
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    
    // Update last accessed time
    session.lastAccessed = Date.now();
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      { EX: 24 * 60 * 60 }
    );

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId) {
  try {
    await redisClient.del(`session:${sessionId}`);
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
    await redisClient.set(
      `session:${newSessionId}`,
      JSON.stringify({
        ...session,
        id: newSessionId,
        lastAccessed: Date.now()
      }),
      { EX: 24 * 60 * 60 }
    );

    // Delete old session
    await deleteSession(sessionId);

    return newSessionId;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    throw error;
  }
}