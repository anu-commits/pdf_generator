/**
 * PDF Configuration Constants
 *
 * This file defines the core PDF document settings including page dimensions,
 * margins, fonts, colors, and spacing rules.
 *
 * IMPORTANT: These are foundational settings. Changing these values may require
 * adjustments to field coordinates in field-coordinates.ts
 */

/**
 * Page Dimensions
 * Standard US Letter size (8.5" × 11") at 72 DPI
 */
export const PDF_CONFIG = {
  // Page size in points (1 point = 1/72 inch)
  pageWidth: 612, // 8.5 inches × 72 = 612 points
  pageHeight: 792, // 11 inches × 72 = 792 points

  // Margins (in points)
  marginLeft: 40,
  marginRight: 40,
  marginTop: 40,
  marginBottom: 40,

  // Usable content area
  get contentWidth() {
    return this.pageWidth - this.marginLeft - this.marginRight
  },
  get contentHeight() {
    return this.pageHeight - this.marginTop - this.marginBottom
  },
} as const

/**
 * Font Configuration
 * Standard PDF fonts (no external font files needed)
 */
export const FONTS = {
  HELVETICA: "Helvetica",
  HELVETICA_BOLD: "Helvetica-Bold",
  TIMES_ROMAN: "Times-Roman",
  COURIER: "Courier",
} as const

/**
 * Default Font Sizes
 */
export const FONT_SIZES = {
  title: 24,
  sectionHeader: 14,
  label: 10,
  body: 12,
  small: 9,
} as const

/**
 * Colors (RGB values 0-1)
 */
export const COLORS = {
  black: { r: 0, g: 0, b: 0 },
  darkGray: { r: 0.2, g: 0.2, b: 0.2 },
  gray: { r: 0.5, g: 0.5, b: 0.5 },
  lightGray: { r: 0.8, g: 0.8, b: 0.8 },
  white: { r: 1, g: 1, b: 1 },
  primary: { r: 0.15, g: 0.33, b: 0.55 }, // Professional blue
  accent: { r: 0.85, g: 0.65, b: 0.13 }, // Gold accent
} as const

/**
 * Line Heights
 */
export const LINE_HEIGHTS = {
  tight: 1.0,
  normal: 1.2,
  relaxed: 1.5,
} as const

/**
 * Border and Line Styles
 */
export const STYLES = {
  borderWidth: 1,
  sectionBorderWidth: 0.5,
  lineSpacing: 5,
  sectionPadding: 10,
} as const

/**
 * Section Heights (in points)
 * These define the fixed layout structure of page 1
 */
export const SECTION_HEIGHTS = {
  header: 80,
  clientInfo: 120,
  hotel: 150,
  inclusions: 200,
  pricing: 30,
  footer: 50,

  // Itinerary section is variable - calculated based on content
  // On page 1: remaining space after fixed sections
  // On continuation pages: most of the page
  get page1ItinerarySpace() {
    return (
      PDF_CONFIG.contentHeight -
      (this.header +
        this.clientInfo +
        this.hotel +
        this.inclusions +
        this.pricing +
        this.footer)
    )
  },
  get continuationPageItinerarySpace() {
    return PDF_CONFIG.contentHeight - this.header - this.footer
  },
} as const

/**
 * Itinerary Day Entry Configuration
 */
export const ITINERARY_CONFIG = {
  dayNumberWidth: 50, // Width of the "Day X" column
  activitiesWidth: 450, // Width of the activities text column
  minDayHeight: 40, // Minimum height per day entry
  dayPadding: 8, // Padding inside each day box
  daySpacing: 5, // Space between day entries
} as const

/**
 * Helper Functions
 */

/**
 * Convert top-down Y coordinate to pdf-lib's bottom-up system
 * PDF-lib uses bottom-left as origin (0,0), but designers think top-down
 *
 * @param topY - Y coordinate from top of page
 * @returns Y coordinate from bottom of page (pdf-lib format)
 */
export function topToBottomY(topY: number): number {
  return PDF_CONFIG.pageHeight - topY
}

/**
 * Convert pdf-lib's bottom-up Y to top-down for debugging
 *
 * @param bottomY - Y coordinate from bottom of page (pdf-lib format)
 * @returns Y coordinate from top of page
 */
export function bottomToTopY(bottomY: number): number {
  return PDF_CONFIG.pageHeight - bottomY
}

/**
 * Calculate the Y position for the bottom of a section
 *
 * @param topY - Y position of the top of the section (from top of page)
 * @param height - Height of the section
 * @returns Y position of the bottom of the section (from bottom of page, pdf-lib format)
 */
export function sectionBottom(topY: number, height: number): number {
  return topToBottomY(topY + height)
}
