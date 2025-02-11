import { useState, useCallback } from 'react';
import type { DriveFile } from '../types/drive';
import { uploadFile } from '../services/api/drive';
import { validateFileSize, validateFileName } from '../utils/validation';
import { formatError } from '../utils/error';

export function useDrive() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DriveFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!validateFileSize(file)) {
      setUploadError('File size exceeds maximum limit (10MB)');
      return false;
    }

    if (!validateFileName(file.name)) {
      setUploadError('Invalid file name');
      return false;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadedFile(null);
      
      const result = await uploadFile(file);
      if (result.status === 'success' && result.file) {
        setUploadedFile(result.file);
        return true;
      } else {
        setUploadError(result.message || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError(formatError(err));
    } finally {
      setUploading(false);
    }
    return false;
  }, []);

  return {
    uploading,
    uploadedFile,
    uploadError,
    handleUpload,
  };
}