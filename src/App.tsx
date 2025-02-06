import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Upload, Folder } from 'lucide-react';
import type { ServiceAccountCredentials, ApiResponse, DriveFolder } from './services/api';
import { testConnection, listFolders } from './services/api';

function App() {
  const [credentials, setCredentials] = useState<Partial<ServiceAccountCredentials>>({
    type: 'service_account',
    project_id: '',
    private_key_id: '',
    private_key: '',
    client_email: '',
    client_id: '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setResponse(null);
    setFolders([]);
    setFolderError(null);
    setIsValidated(false);
    
    if (file) {
      if (file.type !== 'application/json') {
        setFileError('Please upload a JSON file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.type !== 'service_account') {
            setFileError('Invalid service account file. Please upload a Google service account JSON key file.');
            return;
          }
          setCredentials(json);
        } catch (error) {
          setFileError('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setFolders([]);
    setFolderError(null);
    setIsValidated(false);
    try {
      const result = await testConnection(credentials as ServiceAccountCredentials);
      setResponse(result);
      if (result.status === 'success') {
        setIsValidated(true);
        console.log('Validation successful, setting isValidated to true');
      }
    } catch (error) {
      setResponse({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListFolders = async () => {
    setLoadingFolders(true);
    setFolderError(null);
    try {
      const result = await listFolders('11HMY8a0IYs2i04A_UPsLww6P-ppmBB1r');
      if (result.status === 'success' && result.folders) {
        setFolders(result.folders);
      } else {
        setFolderError(result.message);
      }
    } catch (error) {
      setFolderError(error instanceof Error ? error.message : 'Failed to fetch folders');
    } finally {
      setLoadingFolders(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Service Account Validator</h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Upload your Google service account JSON key file. You can download this from the Google Cloud Console 
                    under "IAM & Admin" → "Service Accounts" → "Keys".
                  </p>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Service Account JSON Key File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/json"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Service account JSON key file</p>
              </div>
            </div>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.project_id}
                  onChange={(e) => setCredentials({...credentials, project_id: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={credentials.client_email}
                  onChange={(e) => setCredentials({...credentials, client_email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  pattern=".*\.gserviceaccount\.com$"
                  title="Must be a valid service account email (ending with .gserviceaccount.com)"
                />
                <p className="mt-1 text-sm text-gray-500">Must end with .gserviceaccount.com</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Private Key <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={credentials.private_key}
                  onChange={(e) => setCredentials({...credentials, private_key: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key here&#10;-----END PRIVATE KEY-----"
                />
                <p className="mt-1 text-sm text-gray-500">Must include BEGIN and END markers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Private Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.private_key_id}
                  onChange={(e) => setCredentials({...credentials, private_key_id: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.client_id}
                  onChange={(e) => setCredentials({...credentials, client_id: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Certificate URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={credentials.client_x509_cert_url}
                  onChange={(e) => setCredentials({...credentials, client_x509_cert_url: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  pattern="https://.*googleapis\.com/.*"
                  title="Must be a valid googleapis.com URL"
                />
                <p className="mt-1 text-sm text-gray-500">Must be a valid googleapis.com URL</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Validating...
                </>
              ) : (
                'Validate Credentials'
              )}
            </button>
          </form>

          {response && (
            <div className={`mt-4 p-4 rounded-md ${
              response.status === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {response.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    response.status === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {response.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isValidated && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Drive Folders</h2>
              <button
                onClick={handleListFolders}
                disabled={loadingFolders}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loadingFolders ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Loading folders...
                  </>
                ) : (
                  <>
                    <Folder className="h-4 w-4 mr-2" />
                    List Folders
                  </>
                )}
              </button>

              {folderError && (
                <div className="mb-4 p-4 rounded-md bg-red-50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{folderError}</p>
                    </div>
                  </div>
                </div>
              )}

              {folders.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="divide-y divide-gray-200">
                    {folders.map((folder) => (
                      <li key={folder.id} className="py-3 flex items-center">
                        <Folder className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{folder.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;