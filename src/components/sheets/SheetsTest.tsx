import React from 'react';
import { Card } from '../ui/Card';
import { SheetControls } from './SheetControls';
import { SheetDataDisplay } from './SheetDataDisplay';
import { useSheetData } from '../../hooks/useSheetData';
import { useSheetOperations } from '../../hooks/useSheetOperations';

export function SheetsTest() {
  const { data, loading, error, readData } = useSheetData();
  const { writeSampleData } = useSheetOperations();

  const handleRead = async () => {
    await readData('Sheet1!A1:Z1000');
  };

  const handleWrite = async () => {
    await writeSampleData();
    await handleRead(); // Refresh data after writing
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Google Sheets Test Area
          </h2>
        </div>
        
        <div className="space-y-6">
          <SheetControls
            onWrite={handleWrite}
            onRead={handleRead}
            loading={loading}
          />
          
          <SheetDataDisplay data={data} error={error} />
        </div>
      </div>
    </Card>
  );
}