import { processImage } from './imageProcessor.js';

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

export async function processFile(file) {
  try {
    // Validate file type
    if (!file || !file.mimetype) {
      throw new Error('Invalid file');
    }

    // Check if file is a supported image type
    if (SUPPORTED_IMAGE_TYPES.includes(file.mimetype)) {
      return await processImage(file);
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('File processing error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}