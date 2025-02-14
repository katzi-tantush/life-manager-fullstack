import { useCallback } from 'react';
import { useSheetData } from './useSheetData';

export function useSheetOperations() {
  const { writeData } = useSheetData();

  const writeSampleData = useCallback(async () => {
    const sampleData = [
      ['Name', 'Age', 'Active', 'Join Date'],
      ['John Doe', 30, true, new Date().toISOString()],
      ['Jane Smith', 25, false, new Date().toISOString()],
      ['Bob Johnson', 45, true, new Date().toISOString()]
    ];

    return writeData('Sheet1', sampleData);
  }, [writeData]);

  return {
    writeSampleData
  };
}