/**
 * Luxury Travel PDF Design Configuration
 *
 * This file defines the complete design system for the luxury travel PDF template,
 * including colors, typography, spacing, and layout specifications.
 * All values are extracted from the custom design images provided.
 */

import { RGB, rgb } from "pdf-lib"

/**
 * Color palette for luxury design
 * RGB values are in 0-1 range for pdf-lib
 */
export const LUXURY_COLORS = {
  // Background colors
  darkBackground: rgb(0.08, 0.08, 0.08), // #141414 (near-black)
  cardBackground: rgb(0.12, 0.12, 0.12), // #1E1E1E (dark gray)
  lightBackground: rgb(0.95, 0.95, 0.95), // #F2F2F2 (light gray)
  white: rgb(1, 1, 1), // #FFFFFF

  // Gold accent (primary brand color - extracted from design)
  gold: rgb(0.72, 0.53, 0.18), // #B8860B (dark goldenrod)
  lightGold: rgb(0.85, 0.75, 0.45), // #D9BF73 (lighter gold)
  darkGold: rgb(0.6, 0.42, 0.12), // #996B1F (darker gold)

  // Text colors
  textPrimary: rgb(1, 1, 1), // White text
  textSecondary: rgb(0.85, 0.85, 0.85), // Light gray text
  textMuted: rgb(0.6, 0.6, 0.6), // Medium gray text
  textDark: rgb(0.2, 0.2, 0.2), // Dark text (for light backgrounds)

  // Accent colors
  accentBlue: rgb(0.4, 0.7, 0.9), // Blue for special elements
  success: rgb(0.2, 0.7, 0.3), // Green
  warning: rgb(0.9, 0.6, 0.2), // Orange
  error: rgb(0.9, 0.2, 0.2), // Red

  // Borders and dividers
  borderLight: rgb(0.3, 0.3, 0.3), // Dark gray border
  borderGold: rgb(0.72, 0.53, 0.18), // Gold border
  divider: rgb(0.25, 0.25, 0.25), // Subtle divider
} as const

/**
 * Typography system
 * Uses standard PDF fonts as fallback, with option for custom fonts
 */
export const LUXURY_FONTS = {
  // Headings - serif for luxury feel
  heading: "Times-Roman",
  headingBold: "Times-Bold",
  headingItalic: "Times-Italic",

  // Body - sans-serif for readability
  body: "Helvetica",
  bodyBold: "Helvetica-Bold",
  bodyItalic: "Helvetica-Oblique",

  // Monospace for reference numbers
  mono: "Courier",
  monoBold: "Courier-Bold",
} as const

/**
 * Font sizes (in points)
 */
export const LUXURY_FONT_SIZES = {
  // Logo and branding
  logo: 18,
  companyName: 16,

  // Page titles
  pageTitle: 28,
  pageTitleLarge: 36,

  // Section titles
  sectionTitle: 22,
  sectionSubtitle: 18,

  // Card and component titles
  cardTitle: 16,
  cardSubtitle: 14,

  // Body text
  body: 11,
  bodyLarge: 13,
  bodySmall: 9,

  // Special elements
  price: 24,
  priceLabel: 12,
  caption: 8,
  label: 10,

  // Table text
  tableHeader: 12,
  tableBody: 10,

  // Footer
  footer: 9,
} as const

/**
 * Spacing and layout system (in points)
 */
export const LUXURY_SPACING = {
  // Page margins
  pageMargin: 40,
  pageMarginTop: 50,
  pageMarginBottom: 40,

  // Section spacing
  sectionGap: 30, // Space between major sections
  sectionPadding: 20, // Internal section padding
  subsectionGap: 15, // Space between subsections

  // Component spacing
  componentGap: 12, // Space between components
  elementGap: 8, // Space between small elements
  lineGap: 5, // Space between lines

  // Card spacing
  cardPadding: 20,
  cardGap: 15,

  // Grid spacing
  columnGap: 15,
  rowGap: 12,
} as const

/**
 * Layout dimensions
 */
export const LUXURY_LAYOUT = {
  // Page dimensions (A4)
  page: {
    width: 595.28, // 210mm / 8.27 inches
    height: 841.89, // 297mm / 11.69 inches
  },

  // Page margins
  pageMargin: 40,
  pageMarginTop: 50,
  pageMarginBottom: 40,

  // Content area (after margins)
  content: {
    width: 515.28, // 595.28 - (40 * 2)
    height: 751.89, // 841.89 - (50 + 40)
    startX: 40,
    startY: 40,
  },

  // Header
  header: {
    height: 80,
    logoSize: 60,
  },

  // Itinerary day images
  dayImage: {
    width: 520, // Full width minus small margins
    height: 200,
    borderRadius: 8, // Note: pdf-lib doesn't support border-radius
  },

  // Hotel card images
  hotelCard: {
    width: 250, // Width of hotel card
    height: 350, // Total card height
    imageWidth: 250,
    imageHeight: 180,
    infoBoxHeight: 150,
  },

  // Gold information boxes
  infoBox: {
    padding: 15,
    borderWidth: 2,
    minHeight: 80,
  },

  // Flight table
  table: {
    rowHeight: 40,
    headerHeight: 45,
    cellPadding: 10,
    borderWidth: 1,
  },

  // Pricing summary
  pricingBox: {
    width: 300,
    padding: 20,
    rowHeight: 30,
  },

  // Bank details box
  bankDetailsBox: {
    width: 400,
    padding: 20,
    minHeight: 120,
  },

  // Bullet points
  bullet: {
    size: 6,
    indent: 15,
    spacing: 8,
  },

  // Icons
  icon: {
    small: 12,
    medium: 16,
    large: 20,
  },
} as const

/**
 * Card styles for hotel cards
 */
export const HOTEL_CARD_STYLES = {
  // Card dimensions
  width: 250,
  height: 300,
  spacing: 15, // Space between cards

  // Image section
  image: {
    width: 250,
    height: 180,
  },

  // Info section (gold box)
  infoSection: {
    height: 150,
    padding: 15,
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
  },

  // Text layout
  titleSize: LUXURY_FONT_SIZES.cardTitle,
  labelSize: LUXURY_FONT_SIZES.label,
  valueSize: LUXURY_FONT_SIZES.body,
  lineHeight: 1.4,
} as const

/**
 * Itinerary section styles
 */
export const ITINERARY_STYLES = {
  // Day card with image
  dayCard: {
    imageWidth: 520,
    imageHeight: 200,
    overlayOpacity: 0.6,
    textPadding: 20,
  },

  // Day number badge
  dayBadge: {
    size: 50,
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
    fontSize: LUXURY_FONT_SIZES.cardTitle,
  },

  // Title on image
  titleOnImage: {
    fontSize: LUXURY_FONT_SIZES.sectionSubtitle,
    color: LUXURY_COLORS.white,
    maxWidth: 480,
  },

  // Activities text below image
  activities: {
    fontSize: LUXURY_FONT_SIZES.body,
    color: LUXURY_COLORS.textDark,
    maxWidth: 520,
    lineHeight: 1.5,
  },

  // Spacing
  spacing: 25, // Space between day entries
} as const

/**
 * Flight table styles
 */
export const FLIGHT_TABLE_STYLES = {
  // Column widths (must sum to content width: 532)
  columns: {
    flight: 120, // Flight number & cabin
    departure: 150, // Departure info
    icon: 40, // Plane icon
    arrival: 150, // Arrival info
    duration: 72, // Duration
  },

  // Header
  header: {
    height: 45,
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
    fontSize: LUXURY_FONT_SIZES.tableHeader,
    fontWeight: "bold",
  },

  // Body rows
  row: {
    height: 40,
    backgroundColor: LUXURY_COLORS.white,
    alternateBackgroundColor: LUXURY_COLORS.lightBackground,
    textColor: LUXURY_COLORS.textDark,
    fontSize: LUXURY_FONT_SIZES.tableBody,
    borderColor: LUXURY_COLORS.borderLight,
    borderWidth: 0.5,
  },

  // Padding
  cellPadding: 10,
} as const

/**
 * Pricing summary styles
 */
export const PRICING_STYLES = {
  // Container
  box: {
    width: 400,
    padding: 20,
    backgroundColor: LUXURY_COLORS.white,
    borderColor: LUXURY_COLORS.gold,
    borderWidth: 2,
  },

  // Header
  header: {
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
    fontSize: LUXURY_FONT_SIZES.sectionSubtitle,
    padding: 15,
  },

  // Row
  row: {
    height: 30,
    fontSize: LUXURY_FONT_SIZES.body,
    textColor: LUXURY_COLORS.textDark,
  },

  // Total row
  totalRow: {
    height: 40,
    fontSize: LUXURY_FONT_SIZES.cardTitle,
    fontWeight: "bold",
    backgroundColor: LUXURY_COLORS.lightBackground,
    textColor: LUXURY_COLORS.textDark,
  },
} as const

/**
 * Bank details box styles
 */
export const BANK_DETAILS_STYLES = {
  box: {
    width: 450,
    padding: 20,
    backgroundColor: LUXURY_COLORS.white,
    borderColor: LUXURY_COLORS.gold,
    borderWidth: 2,
  },

  header: {
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
    fontSize: LUXURY_FONT_SIZES.sectionSubtitle,
    padding: 15,
  },

  content: {
    padding: 15,
    fontSize: LUXURY_FONT_SIZES.body,
    textColor: LUXURY_COLORS.textDark,
    lineHeight: 1.6,
  },

  label: {
    fontSize: LUXURY_FONT_SIZES.bodySmall,
    color: LUXURY_COLORS.textMuted,
  },

  value: {
    fontSize: LUXURY_FONT_SIZES.body,
    fontWeight: "bold",
    color: LUXURY_COLORS.textDark,
  },
} as const

/**
 * Button styles (for "Book with Us" CTA)
 */
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: LUXURY_COLORS.gold,
    textColor: LUXURY_COLORS.white,
    fontSize: LUXURY_FONT_SIZES.body,
    padding: 12,
    borderRadius: 4,
    minWidth: 120,
  },
} as const

/**
 * Branding styles
 */
export const BRANDING_STYLES = {
  logo: {
    maxWidth: 150,
    maxHeight: 60,
  },

  companyName: {
    fontSize: LUXURY_FONT_SIZES.logo,
    fontWeight: "bold",
    color: LUXURY_COLORS.gold,
    font: LUXURY_FONTS.headingBold,
  },

  tagline: {
    fontSize: LUXURY_FONT_SIZES.caption,
    color: LUXURY_COLORS.textSecondary,
    font: LUXURY_FONTS.bodyItalic,
  },
} as const

/**
 * Helper function to create semi-transparent overlay for text on images
 */
export function createOverlayColor(baseColor: RGB, opacity: number): RGB {
  return rgb(
    baseColor.red * opacity,
    baseColor.green * opacity,
    baseColor.blue * opacity
  )
}

/**
 * Helper to get contrasting text color based on background
 */
export function getContrastingTextColor(backgroundColor: RGB): RGB {
  // Calculate relative luminance
  const luminance =
    0.2126 * backgroundColor.red +
    0.7152 * backgroundColor.green +
    0.0722 * backgroundColor.blue

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? LUXURY_COLORS.textDark : LUXURY_COLORS.white
}

/**
 * Calculate Y position from top of page
 * pdf-lib uses bottom-left origin, this helper converts from top
 */
export function yFromTop(
  yFromTop: number,
  pageHeight: number = LUXURY_LAYOUT.page.height
): number {
  return pageHeight - yFromTop
}

/**
 * Page background types
 */
export type PageBackgroundType = "dark" | "light" | "white"

/**
 * Get background color for page type
 */
export function getPageBackgroundColor(type: PageBackgroundType): RGB {
  switch (type) {
    case "dark":
      return LUXURY_COLORS.darkBackground
    case "light":
      return LUXURY_COLORS.lightBackground
    case "white":
      return LUXURY_COLORS.white
  }
}
