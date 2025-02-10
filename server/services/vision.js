import { ImageAnnotatorClient } from '@google-cloud/vision';
import { serviceAccountConfig } from '../config/service-account.js';

let visionClient = null;

function getVisionClient() {
  if (!visionClient) {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    };

    visionClient = new ImageAnnotatorClient({ 
      credentials,
      scopes: serviceAccountConfig.scopes
    });
  }
  return visionClient;
}

export async function detectText(imageBuffer) {
  try {
    const client = getVisionClient();
    const content = imageBuffer.toString('base64');
    
    const [result] = await client.textDetection({
      image: { content }
    });

    return {
      status: 'success',
      textAnnotations: result.textAnnotations
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      status: 'error',
      message: 'Failed to process image',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}