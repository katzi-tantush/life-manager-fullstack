export class AuthError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export class TokenExpiredError extends AuthError {
    constructor() {
      super('Authentication token has expired', 'TOKEN_EXPIRED');
      this.name = 'TokenExpiredError';
    }
  }
  
  export class UnauthorizedError extends AuthError {
    constructor() {
      super('Unauthorized access', 'UNAUTHORIZED');
      this.name = 'UnauthorizedError';
    }
  }
  
  export class InvalidTokenError extends AuthError {
    constructor() {
      super('Invalid authentication token', 'INVALID_TOKEN');
      this.name = 'InvalidTokenError';
    }
  }