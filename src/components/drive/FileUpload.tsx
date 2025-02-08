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
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Any file type</p>
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
            <div className="flex items-center">
              <span className="text-green-700 font-medium">{uploadedFile.name}</span>
            </div>
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