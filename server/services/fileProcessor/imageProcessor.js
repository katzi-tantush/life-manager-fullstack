import { ImageAnnotatorClient } from '@google-cloud/vision';

let visionClient = null;

function getVisionClient() {
  if (!visionClient) {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('Missing Google Cloud Vision credentials');
    }

    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    };

    visionClient = new ImageAnnotatorClient({ credentials });
  }
  return visionClient;
}

export async function processImage(file) {
  try {
    const client = getVisionClient();

    // Convert buffer to base64
    const content = file.buffer.toString('base64');
    
    // Perform text detection
    const [result] = await client.textDetection({
      image: { content }
    });

    const textAnnotations = result.textAnnotations;
    
    return {
      type: 'image',
      mimeType: file.mimetype,
      fileName: file.originalname,
      extractedText: textAnnotations?.[0]?.description || '',
      textBlocks: textAnnotations?.slice(1).map(annotation => ({
        text: annotation.description,
        confidence: annotation.confidence,
        boundingBox: annotation.boundingPoly?.vertices
      })) || []
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image: ' + error.message);
  }
}