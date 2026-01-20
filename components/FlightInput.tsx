'use client';

import React, { useRef } from 'react';
import { FlightDetails } from '@/lib/types/itinerary';
import CharacterLimitInput from './CharacterLimitInput';
import DatePicker from './DatePicker';

interface FlightInputProps {
  flights: FlightDetails[];
  onChange: (flights: FlightDetails[]) => void;
  maxFlights?: number;
}

/**
 * Component for managing flight details (multiple flights supported)
 */
export default function FlightInput({
  flights,
  onChange,
  maxFlights = 10
}: FlightInputProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAddFlight = () => {
    if (flights.length < maxFlights) {
      onChange([
        ...flights,
        {
          airlineName: '',
          airlineLogo: undefined,
          flightNumber: '',
          cabin: 'Economy',
          departure: {
            city: '',
            date: '',
            time: ''
          },
          arrival: {
            city: '',
            date: '',
            time: ''
          },
          duration: ''
        }
      ]);
    }
  };

  const handleRemoveFlight = (index: number) => {
    onChange(flights.filter((_, i) => i !== index));
  };

  const handleUpdateFlight = (index: number, field: string, value: string) => {
    const updatedFlights = [...flights];
    const flight = updatedFlights[index];

    if (field.startsWith('departure.')) {
      const subField = field.split('.')[1] as keyof typeof flight.departure;
      flight.departure[subField] = value;
    } else if (field.startsWith('arrival.')) {
      const subField = field.split('.')[1] as keyof typeof flight.arrival;
      flight.arrival[subField] = value;
    } else {
      (flight as any)[field] = value;
    }

    onChange(updatedFlights);
  };

  const handleLogoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const updatedFlights = [...flights];
      updatedFlights[index].airlineLogo = base64;
      onChange(updatedFlights);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (index: number) => {
    const updatedFlights = [...flights];
    updatedFlights[index].airlineLogo = undefined;
    onChange(updatedFlights);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-lg font-semibold text-gray-700">
          Flights
        </label>
        {flights.length < maxFlights && (
          <button
            type="button"
            onClick={handleAddFlight}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm"
          >
            + Add Flight
          </button>
        )}
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-3">No flights added yet</p>
          <button
            type="button"
            onClick={handleAddFlight}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Add First Flight
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {flights.map((flight, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm relative"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveFlight(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                aria-label="Remove flight"
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
                Flight {index + 1}
              </h3>

              {/* Airline Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Airline Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline Logo
                  </label>
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(index, file);
                    }}
                    className="hidden"
                  />
                  {flight.airlineLogo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={flight.airlineLogo}
                        alt="Airline logo"
                        className="h-10 w-auto object-contain border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm"
                    >
                      Upload Logo
                    </button>
                  )}
                </div>

                {/* Airline Name */}
                <CharacterLimitInput
                  label="Airline Name"
                  value={flight.airlineName}
                  onChange={(value) => handleUpdateFlight(index, 'airlineName', value)}
                  maxLength={50}
                  placeholder="e.g., Thai AirAsia X"
                  required
                />

                {/* Flight Number */}
                <CharacterLimitInput
                  label="Flight Number"
                  value={flight.flightNumber}
                  onChange={(value) => handleUpdateFlight(index, 'flightNumber', value)}
                  maxLength={20}
                  placeholder="e.g., XJ-231"
                  required
                />
              </div>

              {/* Cabin Class */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cabin Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={flight.cabin}
                  onChange={(e) => handleUpdateFlight(index, 'cabin', e.target.value)}
                  className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>

              {/* Departure and Arrival */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departure */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 text-sm border-b pb-1">Departure</h4>

                  <CharacterLimitInput
                    label="City"
                    value={flight.departure.city}
                    onChange={(value) => handleUpdateFlight(index, 'departure.city', value)}
                    maxLength={50}
                    placeholder="e.g., Delhi"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      label="Date"
                      value={flight.departure.date}
                      onChange={(value) => handleUpdateFlight(index, 'departure.date', value)}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={flight.departure.time}
                        onChange={(e) => handleUpdateFlight(index, 'departure.time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 text-sm border-b pb-1">Arrival</h4>

                  <CharacterLimitInput
                    label="City"
                    value={flight.arrival.city}
                    onChange={(value) => handleUpdateFlight(index, 'arrival.city', value)}
                    maxLength={50}
                    placeholder="e.g., Bangkok"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      label="Date"
                      value={flight.arrival.date}
                      onChange={(value) => handleUpdateFlight(index, 'arrival.date', value)}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={flight.arrival.time}
                        onChange={(e) => handleUpdateFlight(index, 'arrival.time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-4">
                <CharacterLimitInput
                  label="Duration"
                  value={flight.duration}
                  onChange={(value) => handleUpdateFlight(index, 'duration', value)}
                  maxLength={30}
                  placeholder="e.g., 4 hr and 5 min"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        {flights.length} / {maxFlights} flights added
      </p>
    </div>
  );
}
