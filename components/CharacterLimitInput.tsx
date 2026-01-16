'use client';

/**
 * Character Limit Input Component
 *
 * Reusable input/textarea component with character count display
 * and visual warnings as the limit is approached.
 */

import React from 'react';
import { getCharLimitPercentage, getRemainingChars } from '@/lib/utils/text-utils';

interface CharacterLimitInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  characterLimit?: number;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date';
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength?: number;
}

export default function CharacterLimitInput({
  value,
  onChange,
  label,
  characterLimit = 100,
  multiline = false,
  rows = 4,
  placeholder,
  required = false,
  type = 'text',
  className,
  onKeyPress,
  maxLength,
}: CharacterLimitInputProps) {
  const finalCharacterLimit = maxLength || characterLimit;
  const remaining = getRemainingChars(value, finalCharacterLimit);
  const percentage = getCharLimitPercentage(value, finalCharacterLimit);

  // Color coding based on usage
  const getCounterColor = () => {
    if (percentage >= 100) return 'text-red-600 font-semibold';
    if (percentage >= 80) return 'text-orange-500 font-semibold';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // Border color based on usage
  const getBorderColor = () => {
    if (percentage >= 100) return 'border-red-500 focus:border-red-600';
    if (percentage >= 80) return 'border-orange-400 focus:border-orange-500';
    return 'border-gray-300 focus:border-primary-500';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce character limit
    if (newValue.length <= finalCharacterLimit) {
      onChange(newValue);
    }
  };

  const inputClasses = `
    w-full px-4 py-2 border rounded-lg
    ${getBorderColor()}
    focus:outline-none focus:ring-2 focus:ring-primary-200
    transition-colors duration-200
    ${className || ''}
  `;

  return (
    <div className={label ? "mb-4" : ""}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span
            className={`text-xs ${getCounterColor()}`}
            title={`${percentage.toFixed(0)}% of limit used`}
          >
            {remaining} / {finalCharacterLimit}
          </span>
        </div>
      )}

      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={inputClasses}
            maxLength={finalCharacterLimit}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            required={required}
            className={inputClasses}
            maxLength={finalCharacterLimit}
          />
        )}

        {/* Show character counter inline when no label */}
        {!label && (
          <span
            className={`absolute right-3 top-2 text-xs ${getCounterColor()}`}
            title={`${percentage.toFixed(0)}% of limit used`}
          >
            {remaining}
          </span>
        )}
      </div>

      {percentage >= 80 && (
        <p className="mt-1 text-xs text-orange-600">
          {percentage >= 100
            ? 'Character limit reached'
            : 'Approaching character limit'}
        </p>
      )}
    </div>
  );
}
