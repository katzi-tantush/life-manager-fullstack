import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { createSheet, readSheetData, writeSheetData } from '../../services/api/sheets';

export function SheetsTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const title = `Test Sheet ${new Date().toISOString()}`;
      const response = await createSheet(title);
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWrite = async () => {
    if (!result?.spreadsheetId) {
      setError('Please create a sheet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const testData = [
        ['Name', 'Age', 'Active', 'Join Date'],
        ['John Doe', 30, true, new Date().toISOString()],
        ['Jane Smith', 25, false, new Date().toISOString()]
      ];

      const response = await writeSheetData(
        result.spreadsheetId,
        'Data!A1:D3',
        testData
      );

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      setResult({ ...result, writeResult: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestRead = async () => {
    if (!result?.spreadsheetId) {
      setError('Please create a sheet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await readSheetData(result.spreadsheetId, 'Data!A1:D1000');
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }

      setResult({ ...result, readResult: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Google Sheets Test Area</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleCreateSheet}
              disabled={loading}
              loading={loading}
            >
              Create Test Sheet
            </Button>

            <Button
              onClick={handleTestWrite}
              disabled={loading || !result?.spreadsheetId}
              loading={loading}
              variant="secondary"
            >
              Write Test Data
            </Button>

            <Button
              onClick={handleTestRead}
              disabled={loading || !result?.spreadsheetId}
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

          {result && (
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}