import { useState, useCallback } from 'react';
import type { DriveFile } from '../types/drive';
import { uploadFile } from '../services/api/drive';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DriveFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadedFile(null);
      
      const result = await uploadFile(file);
      if (result.status === 'success' && result.file) {
        setUploadedFile(result.file);
        return true;
      } else {
        setError(result.message || 'Failed to upload file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
    return false;
  }, []);

  return {
    uploading,
    uploadedFile,
    error,
    handleUpload,
  };
}