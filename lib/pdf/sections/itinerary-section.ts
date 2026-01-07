/**
 * Itinerary Section Renderer
 *
 * Renders day-by-day itinerary with full-page layout (each day on separate page):
 * - Gold bar header
 * - Day title
 * - Activities description
 * - Day image (full width if available)
 */

import { PDFPage, PDFImage, rgb } from "pdf-lib"
import { FontFamily } from "../font-loader"
import { ItineraryDay } from "../../types/itinerary"
import {
  LUXURY_COLORS,
  LUXURY_FONT_SIZES,
} from "../../config/luxury-design-config"
import { drawWrappedText } from "../layout-primitives"

export interface ItinerarySectionOptions {
  startX: number
  startY: number
  maxWidth: number
  days: ItineraryDay[]
  dayImages: Map<number, PDFImage> // Map of day number to embedded image
}

/**
 * Render itinerary section with heading
 * Returns the Y position after rendering
 */
export function renderItinerarySection(
  page: PDFPage,
  fonts: FontFamily,
  options: ItinerarySectionOptions
): number {
  const { startX, startY, maxWidth, days, dayImages } = options

  let currentY = startY

  // Draw "Itinerary" section header in gold
  page.drawText("Itinerary", {
    x: startX,
    y: currentY,
    size: 22,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold,
  })

  currentY -= 40

  // Track the first gold bar position for continuous vertical line
  let firstGoldBarY: number | null = null
  const verticalLineX = startX + 10 // X position of the vertical line (gold bar left edge)

  // Render each day
  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    const dayImage = dayImages.get(day.dayNumber)
    const isLastDay = i === days.length - 1

    const result = renderItineraryDay(
      page,
      fonts,
      day,
      dayImage,
      startX,
      currentY,
      maxWidth,
      false, // Don't draw individual vertical lines
      isLastDay
    )

    // Capture first gold bar position
    if (firstGoldBarY === null) {
      firstGoldBarY = result.goldBarY
    }

    currentY = result.currentY
  }

  // Draw continuous vertical line from first gold bar to end of all content
  if (firstGoldBarY !== null) {
    page.drawLine({
      start: { x: verticalLineX, y: firstGoldBarY },
      end: { x: verticalLineX, y: currentY + 35 },
      thickness: 1,
      color: LUXURY_COLORS.gold,
    })
  }

  currentY -= 30

  return currentY
}

/**
 * Render individual day entry with 2-column layout (text left, image right)
 * Returns the Y position after rendering
 *
 * EXPORTED for use in field-mapper for separate page rendering
 */
export function renderItineraryDay(
  page: PDFPage,
  fonts: FontFamily,
  day: ItineraryDay,
  image: PDFImage | undefined,
  x: number,
  y: number,
  maxWidth: number,
  drawVerticalLine: boolean = true, // Whether to draw vertical line (for backwards compatibility)
  isLastDay: boolean = false,
  textColor: any = LUXURY_COLORS.textDark // Default text color
): { currentY: number; goldBarY: number } {
  let currentY = y

  // Gold bar header (75px wide, 15px height)
  const barWidth = 75
  const barHeight = 20
  const barIndent = 10 // Move bar to the right (adjusted for alignment)
  const barX = x + barIndent

  // Draw gold bar
  const barY = currentY - barHeight
  page.drawRectangle({
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    color: LUXURY_COLORS.gold,
  })

  // Overlay "Day X" text on the gold bar in white
  const dayText = `Day ${day.dayNumber}`
  const dayTextWidth = fonts.bodyBold.widthOfTextAtSize(dayText, 9)
  page.drawText(dayText, {
    x: barX + (barWidth - dayTextWidth) / 3, // Center text on bar
    y: barY + 7, // Vertically center on 15px bar
    size: 9,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.white,
  })

  currentY -= barHeight + 25

  // Store the vertical line start position (will draw it later after we know the end position)
  // Align vertical line with the left edge of the gold bar
  const verticalLineX = barX // Vertical line at the left edge of gold bar
  const verticalLineStartY = barY // Start from bottom of gold bar

  // Two-column layout matching Figma design
  const textIndent = 27 // Space from gold bar to text (matching Figma: 71-44=27)
  const leftColumnWidth = 216 // Text column width from Figma
  const rightColumnWidth = 225 // Image column width from Figma
  const columnGap = 26 // Gap between columns (313-287=26)

  // Left column: Day title and description (offset from vertical line)
  const leftX = x + textIndent
  let leftY = currentY

  // Draw day title (just the title, not the day number)
  page.drawText(day.title, {
    x: leftX,
    y: leftY,
    size: 10, // Updated to 10px from Figma
    font: fonts.bodyBold,
    color: textColor,
  })

  leftY -= 20 // Space below title

  // Draw activities description (matching Figma: 10px font, 1.99 line height)
  if (day.activities) {
    leftY = drawWrappedText(
      page,
      day.activities,
      leftX,
      leftY,
      leftColumnWidth,
      fonts.body,
      10, // Updated to 10px from Figma
      {
        color: textColor,
        lineHeight: 1.99, // Updated to 1.99 from Figma
      }
    )
  }

  leftY -= 10 // Space before hotel name

  // Draw hotel name at bottom (if exists in day data) - matching Figma uppercase style
  if (day.hotel) {
    page.drawText(day.hotel.toUpperCase(), {
      x: leftX,
      y: leftY,
      size: 10, // Updated to 10px from Figma
      font: fonts.bodyBold,
      color: textColor,
    })
    leftY -= 15
  }

  // Right column: Image (matching Figma: 225x223px)
  const rightX = x + textIndent + leftColumnWidth + columnGap
  const imageY = currentY
  const imageHeight = 223 // Height from Figma

  if (image) {
    const imageMaxWidth = rightColumnWidth
    const imageMaxHeight = imageHeight

    // Calculate image dimensions to fit
    const imgDims = image.scale(1)
    const scale = Math.min(
      imageMaxWidth / imgDims.width,
      imageMaxHeight / imgDims.height
    )

    const scaledWidth = imgDims.width * scale
    const scaledHeight = imgDims.height * scale

    // Draw image
    page.drawImage(image, {
      x: rightX,
      y: imageY - scaledHeight,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  // Use the lower of the two columns
  currentY = Math.min(leftY, imageY - imageHeight)
  currentY -= 31 // Space after content

  // Draw the vertical line from the gold bar down through the content (if requested)
  if (drawVerticalLine) {
    const verticalLineEndY = currentY - 30 - barHeight
    page.drawLine({
      start: { x: verticalLineX, y: verticalLineStartY },
      end: { x: verticalLineX, y: verticalLineEndY },
      thickness: 1,
      color: LUXURY_COLORS.gold,
    })
  }

  // Draw horizontal divider line at the bottom (matching Figma) - but not for last day
  if (!isLastDay) {
    const dividerStartX = x + textIndent - 2 // Start slightly before text
    const dividerEndX =
      x + textIndent + leftColumnWidth + columnGap + rightColumnWidth
    page.drawLine({
      start: { x: dividerStartX, y: currentY },
      end: { x: dividerEndX, y: currentY },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8), // Light gray divider
    })
  }

  currentY -= 35 // Space after divider for next entry

  // Always return object with gold bar position
  return { currentY, goldBarY: barY }
}
