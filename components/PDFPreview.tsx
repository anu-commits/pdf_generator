'use client';

/**
 * PDF Preview Component
 *
 * Displays generated PDF in an iframe with download option.
 */

import React from 'react';

interface PDFPreviewProps {
  pdfUrl: string | null;
  onClose: () => void;
}

export default function PDFPreview({ pdfUrl, onClose }: PDFPreviewProps) {
  if (!pdfUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">PDF Preview</h2>
          <div className="flex gap-3">
            <a
              href={pdfUrl}
              download
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* PDF Iframe */}
        <div className="flex-1 p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-full border border-gray-300 rounded-lg"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}
