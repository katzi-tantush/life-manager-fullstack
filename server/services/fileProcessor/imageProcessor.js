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
    console.log('Converting HEIC to JPEG...');
    const jpegBuffer = await heicConvert({
      buffer,
      format: 'JPEG',
      quality: 0.9
    });
    console.log('HEIC conversion successful');
    return jpegBuffer;
  } catch (error) {
    console.error('HEIC conversion error:', {
      error: error.message,
      stack: error.stack,
      bufferSize: buffer.length
    });
    throw new Error('Failed to convert HEIC image: ' + error.message);
  }
}

async function optimizeImage(buffer, mimeType) {
  try {
    console.log('Optimizing image...', { mimeType });
    const image = sharp(buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    console.log('Image metadata:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      isProgressive: metadata.isProgressive,
      hasProfile: metadata.hasProfile,
      hasAlpha: metadata.hasAlpha
    });

    // Resize if image is too large (keeping aspect ratio)
    if (metadata.width > 4096 || metadata.height > 4096) {
      console.log('Resizing large image...');
      image.resize(4096, 4096, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to JPEG if not already
    if (mimeType !== 'image/jpeg') {
      console.log('Converting to JPEG format...');
      image.jpeg({ quality: 90 });
    }

    const optimizedBuffer = await image.toBuffer();
    console.log('Image optimization successful', {
      originalSize: buffer.length,
      optimizedSize: optimizedBuffer.length
    });

    return optimizedBuffer;
  } catch (error) {
    console.error('Image optimization error:', {
      error: error.message,
      stack: error.stack,
      mimeType,
      bufferSize: buffer.length
    });
    throw new Error('Failed to optimize image: ' + error.message);
  }
}

export async function processImage(file) {
  try {
    console.log('Starting image processing...', {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

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
    console.log('Sending to Vision API...', {
      contentLength: content.length
    });
    
    // Configure text detection
    const request = {
      image: { content },
      imageContext: {
        languageHints: ['en', 'he'], // Add Hebrew language hint
        textDetectionParams: {
          enableTextDetectionConfidenceScore: true
        }
      }
    };

    // Perform text detection
    const [result] = await client.textDetection(request);
    console.log('Vision API response received', {
      hasAnnotations: !!result.textAnnotations,
      annotationCount: result.textAnnotations?.length
    });

    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.warn('No text detected in image');
      return {
        status: 'success',
        result: {
          type: 'image',
          mimeType: file.mimetype,
          fileName: file.originalname,
          extractedText: '',
          textBlocks: []
        }
      };
    }

    const textAnnotations = result.textAnnotations;
    console.log('Processing text annotations...', {
      mainText: textAnnotations[0]?.description?.substring(0, 100) + '...',
      blockCount: textAnnotations.length - 1
    });

    return {
      status: 'success',
      result: {
        type: 'image',
        mimeType: file.mimetype,
        fileName: file.originalname,
        extractedText: textAnnotations[0]?.description || '',
        textBlocks: textAnnotations.slice(1).map(annotation => ({
          text: annotation.description,
          confidence: annotation.confidence,
          boundingBox: annotation.boundingPoly?.vertices
        }))
      }
    };
  } catch (error) {
    console.error('Image processing error:', {
      error: error.message,
      stack: error.stack,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

    return {
      status: 'error',
      message: 'Failed to process image: ' + error.message
    };
  }
}