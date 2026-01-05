/**
 * FIELD COORDINATES CONFIGURATION
 * ================================
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL FIELD POSITIONS IN THE PDF
 *
 * This file defines the exact position, size, font, and styling for every text field
 * that appears in the generated itinerary PDFs. Non-developers can modify this file
 * to adjust field positions, fonts, sizes, and character limits.
 *
 * COORDINATE SYSTEM:
 * - X: Distance from LEFT edge (0 = left edge, 612 = right edge)
 * - Y: Distance from BOTTOM edge (0 = bottom, 792 = top)
 * - Note: pdf-lib uses bottom-left as origin (0,0)
 *
 * HOW TO MODIFY:
 * 1. To move a field: Change the x and y values
 * 2. To resize text area: Change maxWidth
 * 3. To change font size: Change fontSize
 * 4. To change font style: Change fontName
 * 5. To adjust character limits: Change characterLimit
 *
 * EXAMPLE:
 * clientName: {
 *   x: 50,              // 50 pixels from left edge
 *   y: 680,             // 680 pixels from bottom (near top of page)
 *   maxWidth: 250,      // Text wraps after 250 pixels
 *   fontSize: 12,       // 12 point font
 *   fontName: 'Helvetica',
 *   characterLimit: 50  // Form prevents more than 50 characters
 * }
 */

import { FieldConfig, SectionConfig } from '@/lib/types/itinerary';
import { PDF_CONFIG, FONTS, FONT_SIZES } from './pdf-config';

/**
 * FIELD COORDINATE DEFINITIONS
 * All sections and their fields with exact positioning
 */
export const FIELD_COORDINATES: Record<string, SectionConfig> = {
  /**
   * HEADER SECTION
   * Logo and main title at the top of the page
   */
  header: {
    name: 'Header',
    startY: 712,  // From bottom of page
    height: 80,
    fields: {
      // Company logo position (image, not text)
      logo: {
        x: 50,
        y: 730,
        maxWidth: 100,
        fontSize: 0,
        fontName: 'Helvetica',
      },
      // Main page title "TRAVEL ITINERARY"
      title: {
        x: 306,           // Centered (page width 612 / 2 = 306)
        y: 745,           // Near top
        maxWidth: 300,
        fontSize: 24,
        fontName: 'Helvetica-Bold',
        alignment: 'center',
      },
    },
  },

  /**
   * CLIENT INFORMATION SECTION
   * Client details, destination, dates, and booking reference
   */
  clientInfo: {
    name: 'Client Information',
    startY: 592,  // Below header
    height: 120,
    fields: {
      // "Client Name:" label
      clientNameLabel: {
        x: 50,
        y: 690,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Client's full name
      clientName: {
        x: 50,
        y: 675,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 50,
      },
      // "Destination:" label
      destinationLabel: {
        x: 320,
        y: 690,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Destination (e.g., "Paris, France")
      destination: {
        x: 320,
        y: 675,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 50,
      },
      // "Travel Dates:" label
      travelDatesLabel: {
        x: 50,
        y: 650,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Travel dates (e.g., "Dec 20 - Dec 27, 2024")
      travelDates: {
        x: 50,
        y: 635,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 40,
      },
      // "Booking Reference:" label
      bookingRefLabel: {
        x: 320,
        y: 650,
        maxWidth: 120,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Booking reference number
      bookingRef: {
        x: 320,
        y: 635,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 20,
      },
    },
  },

  /**
   * ITINERARY DAYS SECTION
   * Day-by-day itinerary entries (dynamic, repeating)
   *
   * Note: This section is variable in height and may span multiple pages.
   * The coordinates here represent the STARTING position. Each day entry
   * will be placed sequentially below the previous one.
   */
  itineraryDays: {
    name: 'Day by Day Itinerary',
    startY: 300,  // Variable - adjusted at runtime based on content
    height: 0,    // Variable - calculated dynamically
    fields: {
      // Section header "DAY-BY-DAY ITINERARY"
      sectionHeader: {
        x: 50,
        y: 560,  // Starting position for section header
        maxWidth: 520,
        fontSize: 14,
        fontName: 'Helvetica-Bold',
      },
      // Day number (e.g., "Day 1", "Day 2")
      dayNumber: {
        x: 60,
        y: 0,  // Y position calculated dynamically for each day
        maxWidth: 40,
        fontSize: 12,
        fontName: 'Helvetica-Bold',
      },
      // Day activities description
      activities: {
        x: 110,
        y: 0,  // Y position calculated dynamically for each day
        maxWidth: 450,
        fontSize: 11,
        fontName: 'Helvetica',
        maxLines: 8,  // Maximum lines before overflow
        characterLimit: 400,  // Prevents excessive text
        lineHeight: 1.3,
      },
    },
  },

  /**
   * HOTEL DETAILS SECTION
   * Accommodation information
   */
  hotelDetails: {
    name: 'Hotel Details',
    startY: 150,  // Adjusted dynamically based on itinerary length
    height: 150,
    fields: {
      // Section header "HOTEL DETAILS"
      sectionHeader: {
        x: 50,
        y: 290,  // Adjusted dynamically
        maxWidth: 520,
        fontSize: 14,
        fontName: 'Helvetica-Bold',
      },
      // "Hotel Name:" label
      hotelNameLabel: {
        x: 50,
        y: 275,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Hotel name
      hotelName: {
        x: 50,
        y: 260,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 50,
      },
      // "Check-in:" label
      checkInLabel: {
        x: 320,
        y: 275,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Check-in date
      checkIn: {
        x: 320,
        y: 260,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 30,
      },
      // "Address:" label
      addressLabel: {
        x: 50,
        y: 240,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // Hotel address (multi-line)
      address: {
        x: 50,
        y: 225,
        maxWidth: 520,
        fontSize: 11,
        fontName: 'Helvetica',
        maxLines: 2,
        characterLimit: 150,
        lineHeight: 1.3,
      },
    },
  },

  /**
   * INCLUSIONS & EXCLUSIONS SECTION
   * What's included and not included in the package
   */
  inclusionsExclusions: {
    name: 'Inclusions & Exclusions',
    startY: 80,
    height: 140,
    fields: {
      // Section header "INCLUSIONS & EXCLUSIONS"
      sectionHeader: {
        x: 50,
        y: 210,  // Adjusted dynamically
        maxWidth: 520,
        fontSize: 14,
        fontName: 'Helvetica-Bold',
      },
      // "Included:" label
      inclusionsLabel: {
        x: 50,
        y: 195,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // List of inclusions (multi-line)
      inclusions: {
        x: 50,
        y: 180,
        maxWidth: 250,
        fontSize: 10,
        fontName: 'Helvetica',
        maxLines: 8,
        characterLimit: 400,
        lineHeight: 1.3,
      },
      // "Not Included:" label
      exclusionsLabel: {
        x: 320,
        y: 195,
        maxWidth: 100,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      // List of exclusions (multi-line)
      exclusions: {
        x: 320,
        y: 180,
        maxWidth: 250,
        fontSize: 10,
        fontName: 'Helvetica',
        maxLines: 8,
        characterLimit: 400,
        lineHeight: 1.3,
      },
    },
  },

  /**
   * PRICING SECTION
   * Total package price
   */
  pricing: {
    name: 'Pricing',
    startY: 50,
    height: 30,
    fields: {
      // "Total Price:" label
      totalPriceLabel: {
        x: 370,
        y: 70,
        maxWidth: 100,
        fontSize: 12,
        fontName: 'Helvetica-Bold',
        alignment: 'right',
      },
      // Total price amount (e.g., "$5,999")
      totalPrice: {
        x: 480,
        y: 70,
        maxWidth: 120,
        fontSize: 16,
        fontName: 'Helvetica-Bold',
        alignment: 'left',
        characterLimit: 15,
      },
    },
  },

  /**
   * FOOTER SECTION
   * Contact information and page numbers
   */
  footer: {
    name: 'Footer',
    startY: 0,
    height: 50,
    fields: {
      // Contact information (centered)
      contactInfo: {
        x: 306,
        y: 25,
        maxWidth: 500,
        fontSize: 9,
        fontName: 'Helvetica',
        alignment: 'center',
        characterLimit: 100,
      },
      // Page number (e.g., "Page 1 of 3")
      pageNumber: {
        x: 560,
        y: 25,
        maxWidth: 50,
        fontSize: 9,
        fontName: 'Helvetica',
        alignment: 'right',
      },
    },
  },
};

/**
 * HELPER FUNCTIONS FOR FIELD ACCESS
 */

/**
 * Get field configuration by section and field name
 * Throws error if field not found (helps catch typos during development)
 *
 * @param sectionName - Name of the section (e.g., 'clientInfo')
 * @param fieldName - Name of the field (e.g., 'clientName')
 * @returns Field configuration object
 */
export function getFieldConfig(sectionName: string, fieldName: string): FieldConfig {
  const section = FIELD_COORDINATES[sectionName];
  if (!section) {
    throw new Error(`Section '${sectionName}' not found in FIELD_COORDINATES`);
  }

  const field = section.fields[fieldName];
  if (!field) {
    throw new Error(`Field '${fieldName}' not found in section '${sectionName}'`);
  }

  return field;
}

/**
 * Get all character limits for form validation
 * Returns a flat object of field names to character limits
 *
 * @returns Object mapping field names to their character limits
 */
export function getCharacterLimits(): Record<string, number> {
  const limits: Record<string, number> = {};

  Object.entries(FIELD_COORDINATES).forEach(([sectionName, section]) => {
    Object.entries(section.fields).forEach(([fieldName, field]) => {
      if (field.characterLimit) {
        // Use dot notation for nested fields (e.g., "clientInfo.clientName")
        limits[`${sectionName}.${fieldName}`] = field.characterLimit;
      }
    });
  });

  return limits;
}

/**
 * VISUAL FIELD MAP (for reference)
 * =================================
 *
 * Page Layout (8.5" × 11" = 612 × 792 points):
 *
 * ┌─────────────────────────────────────────────────────┐
 * │                                                     │ ← Y: 792 (top)
 * │  [LOGO]          TRAVEL ITINERARY                  │
 * │                                                     │
 * ├─────────────────────────────────────────────────────┤ ← Y: 712
 * │  CLIENT INFORMATION                                 │
 * │  Name: [          ]  Destination: [          ]     │
 * │  Dates: [         ]  Booking Ref: [         ]      │
 * ├─────────────────────────────────────────────────────┤ ← Y: 592
 * │  DAY-BY-DAY ITINERARY                              │
 * │  ┌─────┬────────────────────────────────────────┐  │
 * │  │Day 1│ Activities...                          │  │
 * │  ├─────┼────────────────────────────────────────┤  │
 * │  │Day 2│ Activities...                          │  │
 * │  └─────┴────────────────────────────────────────┘  │
 * │                                                     │
 * ├─────────────────────────────────────────────────────┤
 * │  HOTEL DETAILS                                      │
 * │  Name: [          ]  Check-in: [          ]        │
 * │  Address: [                                  ]     │
 * ├─────────────────────────────────────────────────────┤
 * │  INCLUSIONS & EXCLUSIONS                           │
 * │  Included:          Not Included:                  │
 * │  • Item 1           • Item 1                       │
 * │  • Item 2           • Item 2                       │
 * ├─────────────────────────────────────────────────────┤
 * │              Total Price: $X,XXX                    │
 * ├─────────────────────────────────────────────────────┤
 * │        Contact: info@travelagency.com              │
 * │                                        Page 1 of 1  │
 * └─────────────────────────────────────────────────────┘
 * ↑                                                     ↑
 * X: 0 (left)                              X: 612 (right)
 * Y: 0 (bottom)
 */
