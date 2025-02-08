import type { DriveFile, DriveFolder } from '../types/drive';

export function sortFoldersByName(folders: DriveFolder[]): DriveFolder[] {
  return [...folders].sort((a, b) => a.name.localeCompare(b.name));
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}