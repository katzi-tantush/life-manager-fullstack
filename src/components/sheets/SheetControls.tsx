import React from 'react';
import { Button } from '../ui/Button';

interface SheetControlsProps {
  onWrite: () => Promise<void>;
  onRead: () => Promise<void>;
  loading: boolean;
}

export function SheetControls({ onWrite, onRead, loading }: SheetControlsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={onWrite}
        disabled={loading}
        loading={loading}
        variant="secondary"
      >
        Write Sample Data
      </Button>

      <Button
        onClick={onRead}
        disabled={loading}
        loading={loading}
        variant="secondary"
      >
        Read Sheet Data
      </Button>
    </div>
  );
}