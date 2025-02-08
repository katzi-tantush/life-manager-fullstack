export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  export function validateFileName(fileName: string): boolean {
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    return !invalidChars.test(fileName);
  }
  
  export function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  }
  
  export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
  }
  
  export function validateFileType(file: File, allowedTypes: string[]): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return allowedTypes.includes(extension);
  }
  
  export function getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || '';
  }