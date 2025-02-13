import React from 'react';
import { FileText, Image, TestTube } from 'lucide-react';
import { Card } from '../ui/Card';

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  onClick?: () => void;
}

export function Hub() {
  const features: Feature[] = [
    {
      name: 'Document Processing',
      description: 'Upload and process documents with OCR and text extraction',
      icon: <FileText className="w-6 h-6" />,
      comingSoon: true
    },
    {
      name: 'Image Analysis',
      description: 'Analyze images using advanced computer vision',
      icon: <Image className="w-6 h-6" />,
      comingSoon: true
    },
    {
      name: 'Test Area',
      description: 'Test and experiment with Google Drive and Sheets integration',
      icon: <TestTube className="w-6 h-6" />,
      onClick: () => window.location.hash = '#test'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Google Drive Manager
        </h1>
        <p className="text-lg text-gray-600">
          A powerful tool for managing and processing your Google Drive content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.name}
            className={`
              relative overflow-hidden transition-all duration-300
              ${feature.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
            `}
            onClick={!feature.comingSoon ? feature.onClick : undefined}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-blue-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
              {feature.comingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}