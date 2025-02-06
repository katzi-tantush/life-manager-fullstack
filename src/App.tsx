import React, { useState, useEffect } from 'react';
import { Folder, AlertCircle, Loader2 } from 'lucide-react';
import type { DriveFolder } from './services/api';
import { listFolders } from './services/api';

function App() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Drive Folders</h1>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
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
  );
}

export default App