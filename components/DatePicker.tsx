'use client';

import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

/**
 * DatePicker component using react-calendar
 * Allows manual date entry or calendar selection
 */
export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert string date to Date object for calendar
  const dateValue = value ? new Date(value) : null;

  // Sync input value with prop value
  useEffect(() => {
    if (value) {
      setInputValue(formatDisplayDate(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  // Handle date selection from calendar
  const handleDateChange = (newValue: Value) => {
    if (newValue instanceof Date) {
      const formatted = formatToISO(newValue);
      onChange(formatted);
      setIsOpen(false);
    }
  };

  // Format Date to YYYY-MM-DD
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (e.g., "Jan 15, 2024")
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Parse manual input and update value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
  };

  // Validate and apply manual input on blur
  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange('');
      return;
    }

    // Try to parse the input as a date
    const parsed = new Date(inputValue);
    if (!isNaN(parsed.getTime())) {
      const formatted = formatToISO(parsed);
      onChange(formatted);
      setInputValue(formatDisplayDate(formatted));
    } else {
      // Reset to previous valid value if invalid
      setInputValue(value ? formatDisplayDate(value) : '');
    }
  };

  // Handle Enter key to apply date
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Select or type date"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <Calendar
            onChange={handleDateChange}
            value={dateValue}
            defaultActiveStartDate={new Date()}
            className="date-picker-calendar"
          />
        </div>
      )}
    </div>
  );
}
