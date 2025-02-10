export class ProcessingError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'ProcessingError';
    }
  }
  
  export class ImageProcessingError extends ProcessingError {
    constructor(message: string) {
      super(message, 'IMAGE_PROCESSING_ERROR');
      this.name = 'ImageProcessingError';
    }
  }
  
  export class VisionApiError extends ProcessingError {
    constructor(message: string) {
      super(message, 'VISION_API_ERROR');
      this.name = 'VisionApiError';
    }
  }