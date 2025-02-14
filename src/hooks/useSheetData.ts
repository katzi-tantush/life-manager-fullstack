import { useState } from 'react';
import { readSheetData, writeSheetData } from '../services/api/sheets';

interface SheetData {
  headers: string[];
  rows: any[][];
}

export function useSheetData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SheetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readData = async (range: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await readSheetData(range);
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }

      if (response.values) {
        setData({
          headers: response.values[0] || [],
          rows: response.values.slice(1) || []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read sheet data');
    } finally {
      setLoading(false);
    }
  };

  const writeData = async (range: string, values: any[][]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await writeSheetData(range, values);
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write sheet data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    readData,
    writeData
  };
}