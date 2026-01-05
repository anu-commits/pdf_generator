'use client';

import React from 'react';
import { BankDetails } from '@/lib/types/itinerary';
import CharacterLimitInput from './CharacterLimitInput';

interface BankDetailsInputProps {
  bankDetails: BankDetails;
  onChange: (bankDetails: BankDetails) => void;
}

/**
 * Component for managing bank details for payment
 */
export default function BankDetailsInput({
  bankDetails,
  onChange
}: BankDetailsInputProps) {
  const handleUpdate = (field: keyof BankDetails, value: string) => {
    onChange({
      ...bankDetails,
      [field]: value
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-gray-700 mb-4">
        Bank Details
      </label>

      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CharacterLimitInput
            label="Account Name"
            value={bankDetails.accountName}
            onChange={(value) => handleUpdate('accountName', value)}
            maxLength={100}
            placeholder="Account holder name"
            required
          />

          <CharacterLimitInput
            label="Account Number"
            value={bankDetails.accountNumber}
            onChange={(value) => handleUpdate('accountNumber', value)}
            maxLength={50}
            placeholder="Bank account number"
            required
          />

          <CharacterLimitInput
            label="Bank Name"
            value={bankDetails.bankName}
            onChange={(value) => handleUpdate('bankName', value)}
            maxLength={100}
            placeholder="Name of the bank"
            required
          />

          <CharacterLimitInput
            label="SWIFT Code"
            value={bankDetails.swiftCode}
            onChange={(value) => handleUpdate('swiftCode', value)}
            maxLength={20}
            placeholder="BIC/SWIFT code"
            required
          />

          <div className="md:col-span-2">
            <CharacterLimitInput
              label="IBAN (Optional)"
              value={bankDetails.iban || ''}
              onChange={(value) => handleUpdate('iban', value)}
              maxLength={50}
              placeholder="International Bank Account Number"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Bank details will be displayed in the PDF for payment instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
