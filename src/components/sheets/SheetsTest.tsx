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

      const testSchema = {
        entityName: 'TestEntity',
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number' },
          { name: 'isActive', type: 'boolean' },
          { name: 'joinDate', type: 'date' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const testData = [
        { name: 'John Doe', age: 30, isActive: true, joinDate: new Date() },
        { name: 'Jane Smith', age: 25, isActive: false, joinDate: new Date() }
      ];

      const response = await writeSheetData(result.spreadsheetId, testData, testSchema);
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
      const response = await readSheetData(result.spreadsheetId);
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
          <div className="flex space-x-4">
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
            >
              Write Test Data
            </Button>

            <Button
              onClick={handleTestRead}
              disabled={loading || !result?.spreadsheetId}
              loading={loading}
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
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}