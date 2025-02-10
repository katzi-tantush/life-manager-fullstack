export interface Session {
    id: string;
    userId: string;
    email: string;
    name?: string;
    picture?: string;
    createdAt: number;
    lastAccessed: number;
  }
  
  export interface SessionResponse {
    status: 'success' | 'error';
    message?: string;
    session?: Session;
  }