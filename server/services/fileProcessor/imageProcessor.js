import { ImageAnnotatorClient } from '@google-cloud/vision';
import heicConvert from 'heic-convert';
import sharp from 'sharp';
import { serviceAccountConfig } from '../../config/service-account.js';

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

async function convertHeicToJpeg(buffer) {
  try {
    const jpegBuffer = await heicConvert({
      buffer,
      format: 'JPEG',
      quality: 0.9
    });
    return jpegBuffer;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error('Failed to convert HEIC image');
  }
}

async function optimizeImage(buffer, mimeType) {
  try {
    const image = sharp(buffer);
    
    // Resize if image is too large (keeping aspect ratio)
    const metadata = await image.metadata();
    if (metadata.width > 4096 || metadata.height > 4096) {
      image.resize(4096, 4096, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to JPEG if not already
    if (mimeType !== 'image/jpeg') {
      image.jpeg({ quality: 90 });
    }

    return await image.toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

export async function processImage(file) {
  try {
    const client = getVisionClient();
    let processedBuffer = file.buffer;

    // Handle HEIC format
    if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif') {
      processedBuffer = await convertHeicToJpeg(file.buffer);
    }

    // Optimize image
    processedBuffer = await optimizeImage(processedBuffer, file.mimetype);
    
    // Convert buffer to base64 for Vision API
    const content = processedBuffer.toString('base64');
    
    // Perform text detection
    const [result] = await client.textDetection({
      image: { content }
    });

    const textAnnotations = result.textAnnotations;
    
    return {
      status: 'success',
      result: {
        type: 'image',
        mimeType: file.mimetype,
        fileName: file.originalname,
        extractedText: textAnnotations?.[0]?.description || '',
        textBlocks: textAnnotations?.slice(1).map(annotation => ({
          text: annotation.description,
          confidence: annotation.confidence,
          boundingBox: annotation.boundingPoly?.vertices
        })) || []
      }
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
}