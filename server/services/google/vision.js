import { ImageAnnotatorClient } from '@google-cloud/vision';
import { getGoogleApiService } from './base.js';

export class VisionService {
  constructor() {
    this.service = getGoogleApiService();
    this.scopes = ['https://www.googleapis.com/auth/cloud-vision'];
    this.client = null;
  }

  async getClient() {
    if (this.client) {
      return this.client;
    }

    try {
      this.client = new ImageAnnotatorClient({
        credentials: this.service.credentials,
        scopes: this.scopes
      });
      return this.client;
    } catch (error) {
      console.error('Vision client initialization error:', error);
      throw new Error('Failed to initialize Vision service');
    }
  }

  async detectText(imageBuffer) {
    try {
      const client = await this.getClient();
      
      const [result] = await client.textDetection({
        image: { content: imageBuffer.toString('base64') },
        imageContext: {
          languageHints: ['en', 'he']
        }
      });

      if (!result.textAnnotations || result.textAnnotations.length === 0) {
        return {
          status: 'success',
          result: {
            extractedText: '',
            textBlocks: []
          }
        };
      }

      return {
        status: 'success',
        result: {
          extractedText: result.textAnnotations[0].description,
          textBlocks: result.textAnnotations.slice(1).map(annotation => ({
            text: annotation.description,
            confidence: annotation.confidence,
            boundingBox: annotation.boundingPoly?.vertices
          }))
        }
      };
    } catch (error) {
      console.error('Vision API error:', error);
      return {
        status: 'error',
        message: this.formatError(error)
      };
    }
  }

  formatError(error) {
    if (error.details) {
      return error.details;
    }
    return error.message;
  }
}

// Singleton instance
let instance = null;

export function getVisionService() {
  if (!instance) {
    instance = new VisionService();
  }
  return instance;
}