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

  if (!Array.isArray(folders)) {
    console.error('Folders prop is not an array:', folders);
    return (
      <div className="text-center py-4 text-gray-500">
        Unable to load folders
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {folders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No folders found
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {folders.map((folder) => (
            <li 
              key={folder.id}
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <Folder className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-900">{folder.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}