/**
 * Validation Utilities - Luxury Design Version
 *
 * Functions for validating form inputs and itinerary data
 * before PDF generation. Supports new data structure with images.
 */

import { ItineraryData, ValidationResult, FlightDetails, HotelStay } from '../types/itinerary';

/**
 * Validate itinerary data before PDF generation
 *
 * @param data - Itinerary data to validate
 * @returns Validation result with errors if any
 */
export function validateItineraryData(data: ItineraryData): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate required client information
  if (!data.clientName || data.clientName.trim() === '') {
    errors.clientName = 'Client name is required';
  }

  if (!data.destination || data.destination.trim() === '') {
    errors.destination = 'Destination is required';
  }

  if (!data.travelDates.start || !data.travelDates.end) {
    errors.travelDates = 'Travel dates are required';
  }

  if (!data.bookingRef || data.bookingRef.trim() === '') {
    errors.bookingRef = 'Booking reference is required';
  }

  // Validate dates
  if (data.travelDates.start && data.travelDates.end) {
    const startDate = new Date(data.travelDates.start);
    const endDate = new Date(data.travelDates.end);

    if (isNaN(startDate.getTime())) {
      errors.travelDatesStart = 'Invalid start date';
    }

    if (isNaN(endDate.getTime())) {
      errors.travelDatesEnd = 'Invalid end date';
    }

    if (startDate > endDate) {
      errors.travelDates = 'End date must be after start date';
    }
  }

  // Validate days array
  if (!data.days || data.days.length === 0) {
    errors.days = 'At least one day of itinerary is required';
  } else {
    data.days.forEach((day, index) => {
      // Title is optional - can be left empty
      if (!day.activities || day.activities.trim() === '') {
        errors[`day${index + 1}_activities`] = `Day ${index + 1} activities are required`;
      }
    });
  }

  // Validate flights (if provided)
  if (data.flights && data.flights.length > 0) {
    data.flights.forEach((flight, index) => {
      const flightErrors = validateFlight(flight);
      if (!flightErrors.isValid) {
        Object.entries(flightErrors.errors).forEach(([key, value]) => {
          errors[`flight${index + 1}_${key}`] = value;
        });
      }
    });
  }

  // Validate hotels (if provided)
  if (data.hotels && data.hotels.length > 0) {
    data.hotels.forEach((hotel, index) => {
      const hotelErrors = validateHotel(hotel);
      if (!hotelErrors.isValid) {
        Object.entries(hotelErrors.errors).forEach(([key, value]) => {
          errors[`hotel${index + 1}_${key}`] = value;
        });
      }
    });
  }

  // Validate pricing
  if (!data.pricing) {
    errors.pricing = 'Pricing information is required';
  } else {
    if (typeof data.pricing.subtotal !== 'number' || data.pricing.subtotal < 0) {
      errors.pricingSubtotal = 'Valid subtotal is required';
    }
    if (typeof data.pricing.total !== 'number' || data.pricing.total < 0) {
      errors.pricingTotal = 'Valid total is required';
    }
    if (!data.pricing.currency || data.pricing.currency.trim() === '') {
      errors.pricingCurrency = 'Currency is required';
    }
  }

  // Validate bank details (only if at least one field is filled)
  if (data.bankDetails) {
    const hasAnyBankDetail =
      data.bankDetails.accountName?.trim() ||
      data.bankDetails.accountNumber?.trim() ||
      data.bankDetails.bankName?.trim() ||
      data.bankDetails.swiftCode?.trim();

    if (hasAnyBankDetail) {
      if (!data.bankDetails.accountName || data.bankDetails.accountName.trim() === '') {
        errors.bankAccountName = 'Account name is required when providing bank details';
      }
      if (!data.bankDetails.accountNumber || data.bankDetails.accountNumber.trim() === '') {
        errors.bankAccountNumber = 'Account number is required when providing bank details';
      }
      if (!data.bankDetails.bankName || data.bankDetails.bankName.trim() === '') {
        errors.bankName = 'Bank name is required when providing bank details';
      }
      if (!data.bankDetails.swiftCode || data.bankDetails.swiftCode.trim() === '') {
        errors.swiftCode = 'SWIFT code is required when providing bank details';
      }
    }
  }

  // Validate terms (only if at least one field is filled)
  if (data.terms) {
    const hasAnyTerm =
      data.terms.cancellationPolicy?.trim() ||
      data.terms.paymentTerms?.trim() ||
      data.terms.travelInsurance?.trim() ||
      data.terms.liabilityDisclaimer?.trim();

    if (hasAnyTerm) {
      if (!data.terms.cancellationPolicy || data.terms.cancellationPolicy.trim() === '') {
        errors.cancellationPolicy = 'Cancellation policy is required when providing terms';
      }
      if (!data.terms.paymentTerms || data.terms.paymentTerms.trim() === '') {
        errors.paymentTerms = 'Payment terms are required when providing terms';
      }
      if (!data.terms.travelInsurance || data.terms.travelInsurance.trim() === '') {
        errors.travelInsurance = 'Travel insurance information is required when providing terms';
      }
      if (!data.terms.liabilityDisclaimer || data.terms.liabilityDisclaimer.trim() === '') {
        errors.liabilityDisclaimer = 'Liability disclaimer is required when providing terms';
      }
    }
  }

  // Validate contact info
  if (!data.contactInfo || data.contactInfo.trim() === '') {
    errors.contactInfo = 'Contact information is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate flight details
 */
export function validateFlight(flight: FlightDetails): ValidationResult {
  const errors: Record<string, string> = {};

  if (!flight.flightNumber || flight.flightNumber.trim() === '') {
    errors.flightNumber = 'Flight number is required';
  }

  if (!flight.departure.airport || flight.departure.airport.trim() === '') {
    errors.departureAirport = 'Departure airport is required';
  }

  if (!flight.departure.date || !isValidDate(flight.departure.date)) {
    errors.departureDate = 'Valid departure date is required';
  }

  if (!flight.departure.time) {
    errors.departureTime = 'Departure time is required';
  }

  if (!flight.arrival.airport || flight.arrival.airport.trim() === '') {
    errors.arrivalAirport = 'Arrival airport is required';
  }

  if (!flight.arrival.date || !isValidDate(flight.arrival.date)) {
    errors.arrivalDate = 'Valid arrival date is required';
  }

  if (!flight.arrival.time) {
    errors.arrivalTime = 'Arrival time is required';
  }

  if (!flight.duration || flight.duration.trim() === '') {
    errors.duration = 'Flight duration is required';
  }

  if (!flight.cabin || flight.cabin.trim() === '') {
    errors.cabin = 'Cabin class is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate hotel stay
 */
export function validateHotel(hotel: HotelStay): ValidationResult {
  const errors: Record<string, string> = {};

  if (!hotel.name || hotel.name.trim() === '') {
    errors.name = 'Hotel name is required';
  }

  if (!hotel.checkIn || !isValidDate(hotel.checkIn)) {
    errors.checkIn = 'Valid check-in date is required';
  }

  if (!hotel.checkOut || !isValidDate(hotel.checkOut)) {
    errors.checkOut = 'Valid check-out date is required';
  }

  if (hotel.checkIn && hotel.checkOut) {
    const checkIn = new Date(hotel.checkIn);
    const checkOut = new Date(hotel.checkOut);

    if (checkIn >= checkOut) {
      errors.dates = 'Check-out date must be after check-in date';
    }
  }

  if (!hotel.numberOfRooms || hotel.numberOfRooms.trim() === '') {
    errors.numberOfRooms = 'Number of rooms is required';
  }

  if (!hotel.mealPlan || hotel.mealPlan.trim() === '') {
    errors.mealPlan = 'Meal plan is required';
  }

  if (!hotel.roomCategory || hotel.roomCategory.trim() === '') {
    errors.roomCategory = 'Room category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a single field value
 *
 * @param value - Field value
 * @param fieldName - Name of the field
 * @param required - Whether the field is required
 * @param maxLength - Maximum character length
 * @returns Error message or null if valid
 */
export function validateField(
  value: string,
  fieldName: string,
  required: boolean = false,
  maxLength?: number
): string | null {
  if (required && (!value || value.trim() === '')) {
    return `${fieldName} is required`;
  }

  if (maxLength && value && value.length > maxLength) {
    return `${fieldName} exceeds maximum length of ${maxLength} characters`;
  }

  return null;
}

/**
 * Sanitize text input (remove potentially problematic characters)
 *
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // Remove control characters except newlines and tabs
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Check if a date is valid
 *
 * @param dateString - Date string to validate
 * @returns True if valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Sanitize itinerary data (recursively sanitize all text fields)
 */
export function sanitizeItineraryData(data: ItineraryData): ItineraryData {
  return {
    ...data,
    clientName: sanitizeText(data.clientName),
    destination: sanitizeText(data.destination),
    bookingRef: sanitizeText(data.bookingRef),
    companyName: data.companyName ? sanitizeText(data.companyName) : undefined,
    days: data.days.map(day => ({
      ...day,
      title: sanitizeText(day.title),
      activities: sanitizeText(day.activities),
    })),
    flights: data.flights ? data.flights.map(flight => ({
      ...flight,
      flightNumber: sanitizeText(flight.flightNumber),
      departure: {
        ...flight.departure,
        airport: sanitizeText(flight.departure.airport),
      },
      arrival: {
        ...flight.arrival,
        airport: sanitizeText(flight.arrival.airport),
      },
      duration: sanitizeText(flight.duration),
      cabin: sanitizeText(flight.cabin),
    })) : [],
    hotels: data.hotels ? data.hotels.map(hotel => ({
      ...hotel,
      name: sanitizeText(hotel.name),
      numberOfRooms: sanitizeText(hotel.numberOfRooms),
      mealPlan: sanitizeText(hotel.mealPlan),
      roomCategory: sanitizeText(hotel.roomCategory),
    })) : [],
    inclusions: data.inclusions ? data.inclusions.map(sanitizeText) : [],
    exclusions: data.exclusions ? data.exclusions.map(sanitizeText) : [],
    bankDetails: data.bankDetails ? {
      ...data.bankDetails,
      accountName: sanitizeText(data.bankDetails.accountName),
      accountNumber: sanitizeText(data.bankDetails.accountNumber),
      bankName: sanitizeText(data.bankDetails.bankName),
      swiftCode: sanitizeText(data.bankDetails.swiftCode),
      iban: data.bankDetails.iban ? sanitizeText(data.bankDetails.iban) : undefined,
    } : data.bankDetails,
    terms: data.terms ? {
      ...data.terms,
      cancellationPolicy: sanitizeText(data.terms.cancellationPolicy),
      paymentTerms: sanitizeText(data.terms.paymentTerms),
      travelInsurance: sanitizeText(data.terms.travelInsurance),
      liabilityDisclaimer: sanitizeText(data.terms.liabilityDisclaimer),
    } : data.terms,
    contactInfo: sanitizeText(data.contactInfo),
  };
}
