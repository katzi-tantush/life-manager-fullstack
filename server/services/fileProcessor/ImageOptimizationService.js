import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { ImageProcessingError } from '../../utils/errors/ProcessingError.js';

export class ImageOptimizationService {
  async convertHeicToJpeg(buffer) {
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
      throw new ImageProcessingError('Failed to convert HEIC image: ' + error.message);
    }
  }

  async optimizeImage(buffer, mimeType) {
    try {
      console.log('Optimizing image...', { mimeType });
      const image = sharp(buffer);
      
      const metadata = await image.metadata();
      console.log('Image metadata:', metadata);

      if (metadata.width > 4096 || metadata.height > 4096) {
        console.log('Resizing large image...');
        image.resize(4096, 4096, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

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
      throw new ImageProcessingError('Failed to optimize image: ' + error.message);
    }
  }
}

export function getImageOptimizationService() {
  return new ImageOptimizationService();
}