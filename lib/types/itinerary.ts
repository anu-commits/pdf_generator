/**
 * TypeScript Interfaces for Travel Itinerary PDF Generator
 *
 * These interfaces define the structure of all data used throughout the application,
 * from form inputs to PDF generation.
 */

/**
 * Single day entry in the itinerary with image support
 */
export interface ItineraryDay {
  dayNumber: number;
  title: string;           // e.g., "Arrive Cairo, Egypt"
  activities: string;
  image?: string;          // Base64 encoded image data
  hotel?: string;          // Hotel name to display at bottom of day
}

/**
 * Flight information
 */
export interface FlightDetails {
  flightNumber: string;
  departure: {
    airport: string;
    date: string;
    time: string;
  };
  arrival: {
    airport: string;
    date: string;
    time: string;
  };
  duration: string;        // e.g., "4 hr and 5 min"
  cabin: string;           // Economy, Business, First Class
}

/**
 * Hotel stay with image gallery support
 */
export interface HotelStay {
  name: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: string;
  mealPlan: string;
  roomCategory: string;
  images: string[];        // Base64 encoded image data (multiple images)
}

/**
 * Legacy hotel interface - kept for backwards compatibility during migration
 * @deprecated Use HotelStay instead
 */
export interface HotelDetails {
  name: string;
  checkIn: string;
  address: string;
}

/**
 * Bank details for payment
 */
export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
  iban?: string;
}

/**
 * Pricing breakdown
 */
export interface PricingDetails {
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
}

/**
 * Terms and conditions
 */
export interface TermsConditions {
  cancellationPolicy: string;
  paymentTerms: string;
  travelInsurance: string;
  liabilityDisclaimer: string;
}

/**
 * Basic Details for the trip
 */
export interface BasicDetails {
  duration?: string;          // e.g., "8 Days"
  groupSize?: string;         // e.g., "2-10 people"
  destinations?: string;      // e.g., "Egypt, Cairo"
  guide?: string;             // e.g., "Professional Guide"
  accommodation?: string;     // e.g., "5-Star Hotels"
  visaRequired?: string;      // e.g., "Yes" or "Required"
}

/**
 * Main itinerary data structure
 * This matches the form inputs and is sent to the PDF generation API
 */
export interface ItineraryData {
  // Client Information
  clientName: string;
  destination: string;
  travelDates: {
    start: string;
    end: string;
  };
  bookingRef: string;

  // Day-by-day itinerary with images
  days: ItineraryDay[];

  // Flights (multiple flights supported)
  flights: FlightDetails[];

  // Hotel stays (multiple hotels with image galleries)
  hotels: HotelStay[];

  // Inclusions and exclusions (arrays for bullet points)
  inclusions: string[];
  exclusions: string[];

  // Enhanced pricing
  pricing: PricingDetails;

  // Bank details for payment
  bankDetails: BankDetails;

  // Terms and conditions
  terms: TermsConditions;

  // Terms and conditions as bullet list (new format matching Figma design)
  termsList?: string[];

  // Contact information
  contactInfo: string;

  // Branding (optional)
  companyName?: string;
  logo?: string;            // Base64 encoded logo image

  // New design fields
  heroImage?: string;       // Base64 encoded hero/cover image
  whyChooseUs?: string[];   // Array of reasons/benefits
  basicDetails?: BasicDetails; // Basic trip information grid
  tourHighlights?: string[]; // Array of tour highlight bullet points

  // Legacy fields - kept for backwards compatibility during migration
  /** @deprecated Use hotels array instead */
  hotel?: HotelDetails;
  /** @deprecated Use pricing.total instead */
  totalPrice?: number;
}

/**
 * Field configuration for PDF coordinate mapping
 * Defines exact position, size, and styling for each text field in the PDF
 */
export interface FieldConfig {
  x: number;              // X coordinate (pixels from left edge)
  y: number;              // Y coordinate (pixels from bottom edge in pdf-lib)
  maxWidth: number;       // Maximum text width before wrapping (pixels)
  fontSize: number;       // Font size in points
  fontName: 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Courier';
  alignment?: 'left' | 'center' | 'right';
  maxLines?: number;      // Maximum number of lines for multi-line fields
  characterLimit?: number; // Frontend validation - max characters allowed
  lineHeight?: number;    // Line height multiplier (default: 1.2)
}

/**
 * Section configuration for PDF layout
 * Groups related fields into logical sections
 */
export interface SectionConfig {
  name: string;           // Section name (for documentation)
  startY: number;         // Section start Y position (from bottom)
  height: number;         // Section height in pixels
  fields: Record<string, FieldConfig>;
}

/**
 * Page content distribution for multi-page support
 * Used by the multi-page handler to determine what content goes on each page
 */
export interface PageContent {
  pageNumber: number;
  sections: PageSection[];
}

/**
 * Individual section placement on a page
 */
export interface PageSection {
  type: 'header' | 'clientInfo' | 'itineraryDay' | 'hotel' | 'inclusions' | 'pricing' | 'footer' | 'continuationHeader' |
        'flights' | 'stays' | 'exclusions' | 'bankDetails' | 'terms' | 'cover';
  data: any;
  yPosition: number;
}

/**
 * Text measurement result
 * Used for calculating text wrapping and spacing
 */
export interface TextMeasurement {
  width: number;
  height: number;
  lines: string[];
}

/**
 * API request/response types
 */
export interface GeneratePDFRequest {
  itineraryData: ItineraryData;
}

export interface GeneratePDFResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
