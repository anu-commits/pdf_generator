'use client';

/**
 * Itinerary Day Input Component
 *
 * Component for entering a single day's activities in the itinerary.
 * Includes day number display and remove button.
 */

import React from 'react';
import { ItineraryDay } from '@/lib/types/itinerary';
import CharacterLimitInput from './CharacterLimitInput';
import ImageUploadInput from './ImageUploadInput';

interface ItineraryDayInputProps {
  day: ItineraryDay;
  onChange: (day: ItineraryDay) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function ItineraryDayInput({
  day,
  onChange,
  onRemove,
  canRemove,
}: ItineraryDayInputProps) {
  const handleTitleChange = (value: string) => {
    onChange({
      ...day,
      title: value,
    });
  };

  const handleActivitiesChange = (value: string) => {
    onChange({
      ...day,
      activities: value,
    });
  };

  const handleImageChange = (base64Image: string | null) => {
    onChange({
      ...day,
      image: base64Image || undefined,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-amber-700">
          Day {day.dayNumber}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
            title="Remove this day"
          >
            Remove Day
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Day Title */}
        <CharacterLimitInput
          value={day.title || ''}
          onChange={handleTitleChange}
          label="Day Title"
          characterLimit={100}
          placeholder="e.g., Arrive Cairo, Egypt"
          required={true}
        />

        {/* Day Image */}
        <ImageUploadInput
          label="Day Image (Optional)"
          value={day.image}
          onChange={handleImageChange}
          helperText="Upload a representative image for this day (will be displayed in the PDF)"
        />

        {/* Activities */}
        <CharacterLimitInput
          value={day.activities}
          onChange={handleActivitiesChange}
          label="Activities & Description"
          characterLimit={400}
          multiline={true}
          rows={4}
          placeholder="Describe the day's activities, locations, meals, etc."
          required={true}
        />
      </div>
    </div>
  );
}
