import React from 'react';
import { Upload, Loader2, ExternalLink } from 'lucide-react';
import type { DriveFile } from '../../types/drive';
import { ErrorAlert } from '../common/ErrorAlert';

interface FileUploadProps {
  onUpload: (file: File) => Promise<boolean>;
  uploading: boolean;
  uploadedFile: DriveFile | null;
  error: string | null;
}

export function FileUpload({ onUpload, uploading, uploadedFile, error }: FileUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="upload-container">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
      <div className="flex items-center justify-center w-full">
        <label className="upload-zone">
          <div className="upload-content">
            {uploading ? (
              <Loader2 className="spinner spinner-md" />
            ) : (
              <>
                <Upload className="upload-icon" />
                <p className="upload-text">
                  <span className="font-semibold">Click to upload</span>
                  <span className="hidden sm:inline"> or drag and drop</span>
                </p>
                <p className="upload-formats">Any file type</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-green-700 font-medium">{uploadedFile.name}</span>
            <a
              href={uploadedFile.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-green-700 hover:text-green-800"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </a>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} />}
    </div>
  );
}