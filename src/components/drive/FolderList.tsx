import React from 'react';
import { Folder, Loader2 } from 'lucide-react';
import type { DriveFolder } from '../../types/drive';

interface FolderListProps {
  folders: DriveFolder[];
  loading: boolean;
}

export function FolderList({ folders, loading }: FolderListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
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
  );
}