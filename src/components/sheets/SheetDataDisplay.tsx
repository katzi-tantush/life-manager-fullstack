import React from 'react';
import { SheetDataGrid } from './SheetDataGrid';
import { ErrorAlert } from '../common/ErrorAlert';

interface SheetDataDisplayProps {
  data: {
    headers: string[];
    rows: any[][];
  } | null;
  error: string | null;
}

export function SheetDataDisplay({ data, error }: SheetDataDisplayProps) {
  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Sheet Data</h3>
      <SheetDataGrid headers={data.headers} rows={data.rows} />
    </div>
  );
}