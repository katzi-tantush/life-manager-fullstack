import React, { useState, useEffect } from 'react';
import { Folder, AlertCircle, Loader2, Upload, ExternalLink } from 'lucide-react';
import type { DriveFolder, DriveFile } from './services/api';
import { listFolders, uploadFile } from './services/api';

function App() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DriveFile | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await listFolders();
        if (result.status === 'success' && result.folders) {
          setFolders(result.folders);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch folders');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setUploadedFile(null);
      
      const result = await uploadFile(file);
      if (result.status === 'success' && result.file) {
        setUploadedFile(result.file);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Drive Manager</h1>

          {/* File Upload Section */}
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
                  onChange={handleFileUpload}
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

            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Folders Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                {folders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No folders found</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {folders.map((folder) => (
                      <li key={folder.id} className="py-3 flex items-center">
                        <Folder className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{folder.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;