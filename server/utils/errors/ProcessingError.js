export class ImageProcessingError extends Error {
    constructor(message) {
      super(message);
      this.name = "ImageProcessingError";
    }
  }