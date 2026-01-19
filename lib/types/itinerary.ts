/**
 * TypeScript Interfaces for Travel Itinerary PDF Generator
 *
 * These interfaces define the structure of all data used throughout the application,
 * from form inputs to PDF generation.
 */

/**
 * Subheading within a day (e.g., Morning, Afternoon, Evening)
 */
export interface DaySubheading {
  title: string;           // e.g., "Morning", "Afternoon", "Evening"
  description: string;     // Activities for this time period
}

/**
 * Single day entry in the itinerary with image support
 */
export interface ItineraryDay {
  dayNumber: number;
  title: string;           // e.g., "Arrive Cairo, Egypt"
  activities: string;      // Main activities text (kept for backwards compatibility)
  subheadings?: DaySubheading[];  // Optional subheadings (up to 3)
  image?: string;          // Base64 encoded image data
  hotel?: string;          // Hotel name to display at bottom of day
}

/**
 * Flight information
 */
export interface FlightDetails {
  airlineName: string;     // e.g., "Thai AirAsia X"
  airlineLogo?: string;    // Base64 encoded airline logo
  flightNumber: string;    // e.g., "XJ-231"
  cabin: string;           // Economy, Business, First Class
  departure: {
    city: string;          // e.g., "Delhi"
    date: string;          // e.g., "07-Feb-2026"
    time: string;          // e.g., "20:39"
  };
  arrival: {
    city: string;          // e.g., "Bangkok"
    date: string;          // e.g., "08-Feb-2026"
    time: string;          // e.g., "02:14"
  };
  duration: string;        // e.g., "4 hr and 5 min"
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
 * Consultant details for the trip
 */
export interface ConsultantDetails {
  name: string;
  email: string;
  phone: string;
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
  customerDetails?: string;   // e.g., Customer name or info
  totalPeople?: string;       // e.g., "5"
  adults?: string;            // e.g., "3"
  children?: string;          // e.g., "1"
  infants?: string;           // e.g., "1"
  travelDates?: string;       // e.g., "15-22 Mar 2024"
  destinationImage?: string;  // Base64 encoded destination photo
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

  // Consultant details
  consultantDetails?: ConsultantDetails;

  // Terms and conditions
  terms: TermsConditions;

  // Terms and conditions as bullet list (new format matching Figma design)
  termsList?: string[];

  // Contact information
  contactInfo: string;

  // Branding (optional)
  companyName?: string;
  logo?: string;            // Base64 encoded logo image

  // Social links and website (optional)
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    pinterest?: string;
    instagram?: string;
  };
  websiteUrl?: string;      // Website URL for "Book with Us" button

  // New design fields
  heroImage?: string;       // Base64 encoded hero/cover image
  whyChooseUsImage?: string; // Base64 encoded why choose us page image
  whyChooseUs?: string[];   // Array of reasons/benefits (deprecated - use whyChooseUsImage instead)
  basicDetails?: BasicDetails; // Basic trip information grid
  basicDetailsImage?: string; // Base64 encoded basic details page image
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
