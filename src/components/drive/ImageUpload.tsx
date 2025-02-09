import React, { useState } from 'react';
import { Upload, Loader2, FileText } from 'lucide-react';
import { ErrorAlert } from '../common/ErrorAlert';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { processFile } from '../../services/api/process';

interface ImageProcessingResult {
  extractedText: string;
  textBlocks: Array<{
    text: string;
    confidence: number;
    boundingBox: Array<{ x: number; y: number }>;
  }>;
}

export function ImageUpload() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);
      setResult(null);

      const response = await processFile(file);
      if (response.status === 'success' && response.result) {
        setResult(response.result);
      } else {
        setError(response.message || 'Failed to process image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Process Image</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {processing ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, WebP
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  disabled={processing}
                />
              </label>
            </div>

            {result && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Extracted Text
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{result.extractedText}</p>
                </div>
              </div>
            )}

            {error && <ErrorAlert message={error} />}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}