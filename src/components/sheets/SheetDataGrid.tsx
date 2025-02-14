import React from 'react';

interface SheetDataGridProps {
  headers: string[];
  rows: any[][];
}

export function SheetDataGrid({ headers, rows }: SheetDataGridProps) {
  if (!headers.length && !rows.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-50 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, i) => (
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
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
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
  );
}