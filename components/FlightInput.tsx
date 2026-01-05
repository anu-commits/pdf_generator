'use client';

import React from 'react';
import { FlightDetails } from '@/lib/types/itinerary';
import CharacterLimitInput from './CharacterLimitInput';

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
  const handleAddFlight = () => {
    if (flights.length < maxFlights) {
      onChange([
        ...flights,
        {
          flightNumber: '',
          departure: {
            airport: '',
            date: '',
            time: ''
          },
          arrival: {
            airport: '',
            date: '',
            time: ''
          },
          duration: '',
          cabin: 'Economy'
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flight Number */}
                <CharacterLimitInput
                  label="Flight Number"
                  value={flight.flightNumber}
                  onChange={(value) => handleUpdateFlight(index, 'flightNumber', value)}
                  maxLength={20}
                  placeholder="e.g., Thai AirAsia X XJ-2911"
                  required
                />

                {/* Cabin Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={flight.cabin}
                    onChange={(e) => handleUpdateFlight(index, 'cabin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              </div>

              {/* Departure and Arrival */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Departure */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 text-sm">Departure</h4>

                  <CharacterLimitInput
                    label="Airport"
                    value={flight.departure.airport}
                    onChange={(value) => handleUpdateFlight(index, 'departure.airport', value)}
                    maxLength={50}
                    placeholder="e.g., Delhi"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={flight.departure.date}
                      onChange={(e) => handleUpdateFlight(index, 'departure.date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

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

                {/* Arrival */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 text-sm">Arrival</h4>

                  <CharacterLimitInput
                    label="Airport"
                    value={flight.arrival.airport}
                    onChange={(value) => handleUpdateFlight(index, 'arrival.airport', value)}
                    maxLength={50}
                    placeholder="e.g., Bangkok"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={flight.arrival.date}
                      onChange={(e) => handleUpdateFlight(index, 'arrival.date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

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
