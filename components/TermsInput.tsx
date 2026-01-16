'use client';

import React from 'react';
import { TermsConditions } from '@/lib/types/itinerary';

interface TermsInputProps {
  terms: TermsConditions;
  onChange: (terms: TermsConditions) => void;
}

/**
 * Component for managing terms and conditions
 */
export default function TermsInput({
  terms,
  onChange
}: TermsInputProps) {
  const handleUpdate = (field: keyof TermsConditions, value: string) => {
    onChange({
      ...terms,
      [field]: value
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-gray-700 mb-4">
        Terms & Conditions
      </label>

      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Policy <span className="text-red-500">*</span>
          </label>
          <textarea
            value={terms.cancellationPolicy}
            onChange={(e) => handleUpdate('cancellationPolicy', e.target.value)}
            placeholder="Describe the cancellation policy..."
            rows={6}
            maxLength={10000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {terms.cancellationPolicy.length} / 10000 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms <span className="text-red-500">*</span>
          </label>
          <textarea
            value={terms.paymentTerms}
            onChange={(e) => handleUpdate('paymentTerms', e.target.value)}
            placeholder="Describe payment terms and conditions..."
            rows={6}
            maxLength={10000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {terms.paymentTerms.length} / 10000 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Insurance <span className="text-red-500">*</span>
          </label>
          <textarea
            value={terms.travelInsurance}
            onChange={(e) => handleUpdate('travelInsurance', e.target.value)}
            placeholder="Information about travel insurance requirements..."
            rows={5}
            maxLength={10000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {terms.travelInsurance.length} / 10000 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Liability Disclaimer <span className="text-red-500">*</span>
          </label>
          <textarea
            value={terms.liabilityDisclaimer}
            onChange={(e) => handleUpdate('liabilityDisclaimer', e.target.value)}
            placeholder="Liability disclaimer and legal terms..."
            rows={6}
            maxLength={10000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {terms.liabilityDisclaimer.length} / 10000 characters
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> These terms will be displayed on a dedicated page in the PDF. You can write detailed terms as needed.
          </p>
        </div>
      </div>
    </div>
  );
}
