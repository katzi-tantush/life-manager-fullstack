import React, { createContext, useContext } from 'react';
import { useDrive } from '../hooks/useDrive';
import type { DriveFile } from '../types/drive';

interface DriveContextType {
  uploading: boolean;
  uploadedFile: DriveFile | null;
  uploadError: string | null;
  handleUpload: (file: File) => Promise<boolean>;
}

const DriveContext = createContext<DriveContextType | null>(null);

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const drive = useDrive();

  return (
    <DriveContext.Provider value={{
      uploading: drive.uploading,
      uploadedFile: drive.uploadedFile,
      uploadError: drive.uploadError,
      handleUpload: drive.handleUpload
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