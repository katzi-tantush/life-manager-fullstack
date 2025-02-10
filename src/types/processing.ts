export interface TextBlock {
    text: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
    }[];
  }
  
  export interface ImageProcessingResult {
    type: 'image';
    mimeType: string;
    fileName: string;
    extractedText: string;
    textBlocks: TextBlock[];
  }
  
  export type ProcessingResult = {
    status: 'success' | 'error';
    message?: string;
    result?: ImageProcessingResult;
  };