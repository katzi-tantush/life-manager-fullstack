import { getImageOptimizationService } from './ImageOptimizationService.js';
import { getVisionAPIService } from './VisionAPIService.js';
import { getImageValidationService } from './ImageValidationService.js';

const imageOptimizationService = getImageOptimizationService();
const visionAPIService = getVisionAPIService();
const imageValidationService = getImageValidationService();

export async function processImage(file) {
  try {
    console.log('Starting image processing...', {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

    // Validate image
    imageValidationService.validateImage(file);

    // Process image
    let processedBuffer = file.buffer;

    // Handle HEIC format
    if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif') {
      processedBuffer = await imageOptimizationService.convertHeicToJpeg(file.buffer);
    }

    // Optimize image
    processedBuffer = await imageOptimizationService.optimizeImage(processedBuffer, file.mimetype);
    
    // Detect text
    const textAnnotations = await visionAPIService.detectText(processedBuffer);

    if (textAnnotations.length === 0) {
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
      message: error.message
    };
  }
}