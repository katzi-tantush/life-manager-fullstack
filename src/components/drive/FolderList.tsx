import React from 'react';
import { Folder } from 'lucide-react';
import type { DriveFolder } from '../../types/drive';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface FolderListProps {
  folders: DriveFolder[];
  loading: boolean;
}

export function FolderList({ folders, loading }: FolderListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="folder-list">
      {folders.length === 0 ? (
        <p className="folder-empty">No folders found</p>
      ) : (
        <ul className="folder-items">
          {folders.map((folder) => (
            <li key={folder.id} className="folder-item">
              <Folder className="folder-icon" />
              <span className="folder-name">{folder.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}