import React, { createContext, useContext, useEffect } from 'react';
import { useDrive } from '../hooks/useDrive';
import type { DriveFolder, DriveFile } from '../types/drive';

interface DriveContextType {
  folders: DriveFolder[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadedFile: DriveFile | null;
  uploadError: string | null;
  handleUpload: (file: File) => Promise<boolean>;
  refreshFolders: () => Promise<void>;
}

const DriveContext = createContext<DriveContextType | null>(null);

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const drive = useDrive();

  useEffect(() => {
    drive.fetchFolders();
  }, [drive]);

  return (
    <DriveContext.Provider value={{
      ...drive,
      uploadError: drive.uploadError,
      refreshFolders: drive.fetchFolders
    }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDriveContext() {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error('useDriveContext must be used within a DriveProvider');
  }
  return context;
}