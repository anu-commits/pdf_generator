'use client';

import React, { useState } from 'react';
import CharacterLimitInput from './CharacterLimitInput';

interface ListBuilderProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  characterLimit?: number;
  required?: boolean;
  helperText?: string;
}

/**
 * List builder component for managing bullet point lists
 * Used for inclusions, exclusions, terms, etc.
 */
export default function ListBuilder({
  label,
  items,
  onChange,
  placeholder = 'Enter item...',
  maxItems = 20,
  characterLimit = 200,
  required = false,
  helperText
}: ListBuilderProps) {
  const [currentInput, setCurrentInput] = useState('');

  const handleAddItem = () => {
    if (currentInput.trim() && items.length < maxItems) {
      onChange([...items, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = value;
    onChange(updatedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helperText && (
        <p className="text-sm text-gray-500 mb-3">{helperText}</p>
      )}

      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-amber-600 mt-3 flex-shrink-0">•</span>
              <CharacterLimitInput
                value={item}
                onChange={(value) => handleUpdateItem(index, value)}
                maxLength={characterLimit}
                placeholder={placeholder}
                className="flex-grow"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="mt-2 text-red-500 hover:text-red-700 flex-shrink-0 px-2 py-1"
                aria-label="Remove item"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item input */}
      {items.length < maxItems && (
        <div className="flex items-start gap-2">
          <span className="text-amber-600 mt-3 flex-shrink-0">•</span>
          <CharacterLimitInput
            value={currentInput}
            onChange={setCurrentInput}
            maxLength={characterLimit}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!currentInput.trim()}
            className="mt-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
      )}

      {/* Items counter */}
      <p className="mt-2 text-xs text-gray-500">
        {items.length} / {maxItems} items
        {items.length >= maxItems && ' (Maximum reached)'}
      </p>
    </div>
  );
}
