'use client';

/**
 * Itinerary Day Input Component
 *
 * Component for entering a single day's activities in the itinerary.
 * Includes day number display, subheadings support, and remove button.
 */

import React from 'react';
import { ItineraryDay, DaySubheading } from '@/lib/types/itinerary';
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

  const handleHotelChange = (value: string) => {
    onChange({
      ...day,
      hotel: value || undefined,
    });
  };

  const handleAddSubheading = () => {
    const subheadings = day.subheadings || [];
    if (subheadings.length < 3) {
      onChange({
        ...day,
        subheadings: [...subheadings, { title: '', description: '' }],
      });
    }
  };

  const handleRemoveSubheading = (index: number) => {
    const subheadings = day.subheadings || [];
    onChange({
      ...day,
      subheadings: subheadings.filter((_, i) => i !== index),
    });
  };

  const handleSubheadingChange = (index: number, field: keyof DaySubheading, value: string) => {
    const subheadings = day.subheadings || [];
    const updated = [...subheadings];
    updated[index] = { ...updated[index], [field]: value };
    onChange({
      ...day,
      subheadings: updated,
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
          characterLimit={10000}
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

        {/* Hotel Name */}
        <CharacterLimitInput
          value={day.hotel || ''}
          onChange={handleHotelChange}
          label="Hotel Name (Optional)"
          characterLimit={500}
          placeholder="e.g., Four Seasons Hotel Cairo at Nile Plaza"
          required={false}
        />

        {/* Activities (shown only if no subheadings) */}
        {(!day.subheadings || day.subheadings.length === 0) && (
          <CharacterLimitInput
            value={day.activities}
            onChange={handleActivitiesChange}
            label="Activities & Description"
            characterLimit={10000}
            multiline={true}
            rows={6}
            placeholder="Describe the day's activities, locations, meals, etc."
            required={true}
          />
        )}

        {/* Subheadings Section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Subheadings (Optional)
            </h4>
            {(!day.subheadings || day.subheadings.length < 3) && (
              <button
                type="button"
                onClick={handleAddSubheading}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1 rounded hover:bg-amber-50 transition-colors"
              >
                + Add Subheading
              </button>
            )}
          </div>

          {day.subheadings && day.subheadings.length > 0 && (
            <div className="space-y-4">
              {day.subheadings.map((subheading, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded p-4 bg-gray-50 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Subheading {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubheading(index)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <CharacterLimitInput
                    value={subheading.title}
                    onChange={(value) => handleSubheadingChange(index, 'title', value)}
                    label="Subheading Title"
                    characterLimit={5000}
                    placeholder="e.g., Morning, Afternoon, Evening"
                    required={false}
                  />

                  <CharacterLimitInput
                    value={subheading.description}
                    onChange={(value) => handleSubheadingChange(index, 'description', value)}
                    label="Description"
                    characterLimit={10000}
                    multiline={true}
                    rows={4}
                    placeholder="Describe the activities for this time period"
                    required={false}
                  />
                </div>
              ))}
            </div>
          )}

          {(!day.subheadings || day.subheadings.length === 0) && (
            <p className="text-xs text-gray-500 italic">
              Add up to 3 subheadings (e.g., Morning, Afternoon, Evening) to organize the day's activities
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
