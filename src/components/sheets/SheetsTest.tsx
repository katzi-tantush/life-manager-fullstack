import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { readSheetData, writeSheetData } from '../../services/api/sheets';

interface SpreadsheetData {
  values?: any[][];
}

export function SheetsTest() {
  const [loading, setLoading] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWrite = async () => {
    try {
      setLoading(true);
      setError(null);

      const sampleData = [
        ['Name', 'Age', 'Active', 'Join Date'],
        ['John Doe', 30, true, new Date().toISOString()],
        ['Jane Smith', 25, false, new Date().toISOString()],
        ['Bob Johnson', 45, true, new Date().toISOString()]
      ];

      const response = await writeSheetData(
        'Sheet1',
        sampleData
      );

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      setSpreadsheetData({
        values: sampleData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write data');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await readSheetData('Sheet1!A1:Z1000');
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }

      setSpreadsheetData({
        values: response.values
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Google Sheets Test Area</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleWrite}
              disabled={loading}
              loading={loading}
              variant="secondary"
            >
              Write Sample Data
            </Button>

            <Button
              onClick={handleRead}
              disabled={loading}
              loading={loading}
              variant="secondary"
            >
              Read Sheet Data
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          {spreadsheetData?.values && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sheet Data</h3>
              <div className="bg-gray-50 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {spreadsheetData.values[0]?.map((header: string, i: number) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {spreadsheetData.values.slice(1).map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}