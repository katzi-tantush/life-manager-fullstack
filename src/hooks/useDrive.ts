import { useState, useCallback } from 'react';
import type { DriveFolder, DriveFile } from '../types/drive';
import { listFolders, uploadFile } from '../services/api/drive';
import { validateFileSize, validateFileName } from '../utils/validation';
import { formatError } from '../utils/error';

export function useDrive() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DriveFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listFolders();
      if (result.status === 'success' && result.folders) {
        setFolders(result.folders);
      } else {
        setError(result.message || 'Failed to fetch folders');
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

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
    folders,
    loading,
    error,
    uploading,
    uploadedFile,
    uploadError,
    fetchFolders,
    handleUpload,
  };
}