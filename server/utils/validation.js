export function validateFileType(file, allowedTypes) {
    if (!file || !file.mimetype) {
      return false;
    }
    return allowedTypes.includes(file.mimetype);
  }
  
  export function validateFileSize(file, maxSizeMB = 10) {
    if (!file || !file.size) {
      return false;
    }
    return file.size <= maxSizeMB * 1024 * 1024;
  }
  
  export function getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() || '';
  }