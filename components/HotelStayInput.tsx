'use client';

import React, { useState } from 'react';
import { HotelStay } from '@/lib/types/itinerary';
import CharacterLimitInput from './CharacterLimitInput';
import DatePicker from './DatePicker';
import { fileToBase64, validateImage } from '@/lib/utils/image-utils';

interface HotelStayInputProps {
  hotels: HotelStay[];
  onChange: (hotels: HotelStay[]) => void;
  maxHotels?: number;
  maxImagesPerHotel?: number;
}

/**
 * Component for managing hotel stays with image galleries
 */
export default function HotelStayInput({
  hotels,
  onChange,
  maxHotels = 100, // No practical limit
  maxImagesPerHotel = 1
}: HotelStayInputProps) {
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});

  const handleAddHotel = () => {
    if (hotels.length < maxHotels) {
      onChange([
        ...hotels,
        {
          name: '',
          checkIn: '',
          checkOut: '',
          numberOfRooms: '',
          mealPlan: '',
          roomCategory: '',
          images: []
        }
      ]);
    }
  };

  const handleRemoveHotel = (index: number) => {
    onChange(hotels.filter((_, i) => i !== index));
    const newErrors = { ...uploadErrors };
    delete newErrors[index];
    setUploadErrors(newErrors);
  };

  const handleUpdateHotel = (index: number, field: keyof HotelStay, value: any) => {
    const updatedHotels = [...hotels];
    (updatedHotels[index] as any)[field] = value;
    onChange(updatedHotels);
  };

  const handleImageUpload = async (hotelIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const hotel = hotels[hotelIndex];
    if (hotel.images.length >= maxImagesPerHotel) {
      setUploadErrors({
        ...uploadErrors,
        [hotelIndex]: `Maximum ${maxImagesPerHotel} images allowed per hotel`
      });
      return;
    }

    const file = files[0];

    // Validate
    const validation = validateImage(file);
    if (!validation.isValid) {
      setUploadErrors({
        ...uploadErrors,
        [hotelIndex]: Object.values(validation.errors).join(', ')
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      handleUpdateHotel(hotelIndex, 'images', [...hotel.images, base64]);

      // Clear error
      const newErrors = { ...uploadErrors };
      delete newErrors[hotelIndex];
      setUploadErrors(newErrors);
    } catch (error) {
      setUploadErrors({
        ...uploadErrors,
        [hotelIndex]: 'Failed to process image'
      });
    }
  };

  const handleRemoveImage = (hotelIndex: number, imageIndex: number) => {
    const hotel = hotels[hotelIndex];
    const updatedImages = hotel.images.filter((_, i) => i !== imageIndex);
    handleUpdateHotel(hotelIndex, 'images', updatedImages);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-lg font-semibold text-gray-700">
          Hotels / Stays
        </label>
        {hotels.length < maxHotels && (
          <button
            type="button"
            onClick={handleAddHotel}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm"
          >
            + Add Hotel
          </button>
        )}
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-3">No hotels added yet</p>
          <button
            type="button"
            onClick={handleAddHotel}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Add First Hotel
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {hotels.map((hotel, hotelIndex) => (
            <div
              key={hotelIndex}
              className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm relative"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveHotel(hotelIndex)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                aria-label="Remove hotel"
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

              <h3 className="font-semibold text-gray-700 mb-4">
                Hotel {hotelIndex + 1}
              </h3>

              {/* Hotel Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CharacterLimitInput
                  label="Hotel Name"
                  value={hotel.name}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'name', value)}
                  maxLength={100}
                  placeholder="e.g., Lemontree Hotel, Vietnam"
                  required
                />

                <CharacterLimitInput
                  label="Room Category"
                  value={hotel.roomCategory}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'roomCategory', value)}
                  maxLength={50}
                  placeholder="e.g., Deluxe Room"
                  required
                />

                <DatePicker
                  label="Check-in Date"
                  value={hotel.checkIn}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'checkIn', value)}
                  required
                />

                <DatePicker
                  label="Check-out Date"
                  value={hotel.checkOut}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'checkOut', value)}
                  required
                />

                <CharacterLimitInput
                  label="Number of Rooms"
                  value={hotel.numberOfRooms}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'numberOfRooms', value)}
                  maxLength={20}
                  placeholder="e.g., No. Of Room: 2"
                  required
                />

                <CharacterLimitInput
                  label="Meal Plan"
                  value={hotel.mealPlan}
                  onChange={(value) => handleUpdateHotel(hotelIndex, 'mealPlan', value)}
                  maxLength={50}
                  placeholder="e.g., Breakfast included"
                  required
                />
              </div>

              {/* Hotel Image */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hotel Image {hotel.images.length > 0 ? '(1 uploaded)' : '(Optional)'}
                </label>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotel.images.map((image, imageIndex) => (
                    <div key={imageIndex} className="relative">
                      <img
                        src={image}
                        alt={`Hotel ${hotelIndex + 1} Image ${imageIndex + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(hotelIndex, imageIndex)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
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

                  {/* Add image button */}
                  {hotel.images.length < maxImagesPerHotel && (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-xs text-gray-500 mt-2">Add Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleImageUpload(hotelIndex, e.target.files)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {uploadErrors[hotelIndex] && (
                  <p className="mt-2 text-sm text-red-600">{uploadErrors[hotelIndex]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        {hotels.length} / {maxHotels} hotels added
      </p>
    </div>
  );
}
