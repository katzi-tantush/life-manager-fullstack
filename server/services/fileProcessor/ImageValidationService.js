const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  export class ImageValidationService {
    validateImageType(mimeType) {
      return SUPPORTED_IMAGE_TYPES.includes(mimeType);
    }
  
    validateFileSize(size) {
      return size <= MAX_FILE_SIZE;
    }
  
    validateImage(file) {
      if (!file || !file.mimetype) {
        throw new Error('Invalid file');
      }
  
      if (!this.validateImageType(file.mimetype)) {
        throw new Error('Unsupported image type');
      }
  
      if (!this.validateFileSize(file.size)) {
        throw new Error('File size exceeds maximum limit (10MB)');
      }
  
      return true;
    }
  }
  
  export function getImageValidationService() {
    return new ImageValidationService();
  }