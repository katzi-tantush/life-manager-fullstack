import { google } from 'googleapis';

export class GoogleApiService {
  constructor() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('Missing required Google service account credentials');
    }

    this.credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
    };

    this.clients = new Map();
  }

  getAuthClient(scopes) {
    try {
      return new google.auth.GoogleAuth({
        credentials: this.credentials,
        scopes
      });
    } catch (error) {
      console.error('Failed to create auth client:', error);
      throw new Error('Authentication initialization failed');
    }
  }

  async getClient(apiName, version, scopes) {
    const cacheKey = `${apiName}-${version}`;

    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey);
    }

    try {
      const auth = this.getAuthClient(scopes);
      const client = google[apiName]({ version, auth });
      this.clients.set(cacheKey, client);
      return client;
    } catch (error) {
      console.error(`Failed to initialize ${apiName} client:`, error);
      throw new Error(`Failed to initialize ${apiName} service`);
    }
  }

  validateCredentials() {
    if (!this.credentials.client_email || !this.credentials.private_key) {
      throw new Error('Invalid service account credentials');
    }
  }

  clearClients() {
    this.clients.clear();
  }
}

// Singleton instance
let instance = null;

export function getGoogleApiService() {
  if (!instance) {
    instance = new GoogleApiService();
  }
  return instance;
}