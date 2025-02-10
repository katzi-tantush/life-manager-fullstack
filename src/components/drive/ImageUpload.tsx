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
          <p className="mt-1 text-sm text-gray-500">
            Upload an image to extract text. Supports JPEG, PNG, WebP, and HEIC formats.
          </p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="relative flex flex-col items-center justify-center w-full h-32 sm:h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  {processing ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                        <span className="hidden sm:inline"> or drag and drop</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        JPEG, PNG, WebP, HEIC
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  disabled={processing}
                />
              </label>
            </div>

            {result && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Extracted Text
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-[300px] overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm sm:text-base">
                    {result.extractedText}
                  </p>
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