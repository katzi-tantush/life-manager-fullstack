import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VisionApiError } from '../../utils/errors/ProcessingError.js';
import { serviceAccountConfig } from '../../config/service-account.js';

export class VisionAPIService {
  constructor() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('Missing Google service account credentials');
    }

    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
    };

    this.client = new ImageAnnotatorClient({ 
      credentials,
      scopes: serviceAccountConfig.scopes
    });
  }

  async detectText(imageBuffer) {
    try {
      const content = imageBuffer.toString('base64');
      console.log('Sending to Vision API...', {
        contentLength: content.length
      });
      
      const request = {
        image: { content },
        imageContext: {
          languageHints: ['en', 'he'],
          textDetectionParams: {
            enableTextDetectionConfidenceScore: true
          }
        }
      };

      const [result] = await this.client.textDetection(request);
      console.log('Vision API response received', {
        hasAnnotations: !!result.textAnnotations,
        annotationCount: result.textAnnotations?.length
      });

      return result.textAnnotations || [];
    } catch (error) {
      console.error('Vision API error:', error);
      throw new VisionApiError('Failed to detect text: ' + error.message);
    }
  }
}

let instance = null;

export function getVisionAPIService() {
  if (!instance) {
    instance = new VisionAPIService();
  }
  return instance;
}