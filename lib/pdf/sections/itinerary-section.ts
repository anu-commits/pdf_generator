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
import {
  drawWrappedText,
  sanitizeTextForPdf,
  PageManager,
  calculateWrappedTextHeight,
} from "../layout-primitives"

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
    size: 36,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold,
  })

  currentY -= 60

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
 * Calculate the required height for an itinerary day
 * Used for accurate pagination decisions
 */
export function calculateItineraryDayHeight(
  day: ItineraryDay,
  fonts: FontFamily,
  hasImage: boolean
): number {
  const leftColumnWidth = 216
  const imageHeight = 223

  // Gold bar + spacing: 20 + 25 = 45
  let height = 45

  // Title: 20
  height += 20

  // Calculate text content height
  let textHeight = 0

  if (day.subheadings && day.subheadings.length > 0) {
    for (const subheading of day.subheadings) {
      textHeight += 15 // Subheading title
      if (subheading.description) {
        const words = subheading.description.split(" ")
        let lineCount = 1
        let currentLineWidth = 0
        const fontSize = 10
        const lineHeight = 1.99

        for (const word of words) {
          const wordWidth = fonts.body.widthOfTextAtSize(word + " ", fontSize)
          if (currentLineWidth + wordWidth > leftColumnWidth) {
            lineCount++
            currentLineWidth = wordWidth
          } else {
            currentLineWidth += wordWidth
          }
        }
        textHeight += lineCount * fontSize * lineHeight
      }
      textHeight += 15 // Spacing after subheading
    }
  } else if (day.activities) {
    const words = day.activities.split(" ")
    let lineCount = 1
    let currentLineWidth = 0
    const fontSize = 10
    const lineHeight = 1.99

    for (const word of words) {
      const wordWidth = fonts.body.widthOfTextAtSize(word + " ", fontSize)
      if (currentLineWidth + wordWidth > leftColumnWidth) {
        lineCount++
        currentLineWidth = wordWidth
      } else {
        currentLineWidth += wordWidth
      }
    }
    textHeight += lineCount * fontSize * lineHeight
  }

  // Hotel name if exists
  if (day.hotel) {
    textHeight += 25
  }

  // Add spacing after text
  textHeight += 10

  // Total height is max of text column and image column
  const contentHeight = Math.max(textHeight, hasImage ? imageHeight : 0)

  // Add bottom spacing (31 after content + 35 after divider)
  height += contentHeight + 66

  return height
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
  textColor: any = LUXURY_COLORS.textDark, // Default text color
  minY: number = 0 // Minimum Y position to prevent overflow (0 = no check)
): { currentY: number; goldBarY: number; overflowed: boolean } {
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

  // Vertical line X position (aligned with left edge of gold bar)
  const verticalLineX = barX

  // Two-column layout matching Figma design
  const textIndent = 27 // Space from gold bar to text (matching Figma: 71-44=27)
  const leftColumnWidth = 216 // Text column width from Figma
  const rightColumnWidth = 225 // Image column width from Figma
  const columnGap = 26 // Gap between columns (313-287=26)

  // Left column: Day title and description (offset from vertical line)
  const leftX = x + textIndent
  let leftY = currentY

  // Draw day title (just the title, not the day number)
  page.drawText(sanitizeTextForPdf(day.title), {
    x: leftX,
    y: leftY,
    size: 10, // Updated to 10px from Figma
    font: fonts.bodyBold,
    color: textColor,
  })

  leftY -= 20 // Space below title

  // Draw subheadings if they exist, otherwise draw activities
  if (day.subheadings && day.subheadings.length > 0) {
    // Render each subheading with its description
    for (const subheading of day.subheadings) {
      // Draw subheading title (bold)
      page.drawText(sanitizeTextForPdf(subheading.title), {
        x: leftX,
        y: leftY,
        size: 10,
        font: fonts.bodyBold,
        color: textColor,
      })

      leftY -= 15 // Space below subheading title

      // Draw subheading description
      if (subheading.description) {
        leftY = drawWrappedText(
          page,
          subheading.description,
          leftX,
          leftY,
          leftColumnWidth,
          fonts.body,
          10,
          {
            color: textColor,
            lineHeight: 1.99,
            minY: minY, // Pass minY to prevent overflow
          }
        )
      }

      leftY -= 15 // Space before next subheading
    }
  } else {
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
          minY: minY, // Pass minY to prevent overflow
        }
      )
    }
  }

  leftY -= 10 // Space before hotel name

  // Draw hotel name at bottom (if exists in day data) - matching Figma uppercase style
  if (day.hotel) {
    page.drawText(sanitizeTextForPdf(day.hotel).toUpperCase(), {
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

  // Draw the vertical line from top to bottom of content (if requested)
  if (drawVerticalLine) {
    const verticalLineTopY = y // Start from near the top (below heading)
    const verticalLineEndY = currentY - 30 - barHeight
    page.drawLine({
      start: { x: verticalLineX, y: verticalLineTopY },
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

  // Check if content overflowed (hit the minY boundary)
  const overflowed = minY > 0 && currentY <= minY

  // Always return object with gold bar position and overflow status
  return { currentY, goldBarY: barY, overflowed }
}

/**
 * Helper function to render text that switches from narrow to full width at image boundary
 * Returns the final Y position after rendering
 */
function renderTextWithDynamicWidth(
  pageManager: PageManager,
  text: string,
  x: number,
  font: any,
  fontSize: number,
  textColor: any,
  narrowWidth: number,
  fullWidth: number,
  imageBottomY: number,
  imagePageRef: PDFPage
): number {
  const lineHeight = 1.99
  const lineSpacing = fontSize * lineHeight
  const words = text.split(" ")

  let currentY = pageManager.getY()
  let currentLine = ""

  for (const word of words) {
    // Determine current width based on position
    const isAboveImage = pageManager.getPage() === imagePageRef && currentY > imageBottomY
    const currentWidth = isAboveImage ? narrowWidth : fullWidth

    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)

    if (testWidth > currentWidth && currentLine) {
      // Draw current line
      pageManager.getPage().drawText(currentLine, {
        x,
        y: currentY,
        size: fontSize,
        font,
        color: textColor,
      })

      currentY -= lineSpacing
      pageManager.setY(currentY)

      // Start new line with current word
      currentLine = word

      // Check if we need a new page
      if (currentY < 80) {
        pageManager.createNewPage()
        currentY = pageManager.getY()
      }
    } else {
      currentLine = testLine
    }
  }

  // Draw remaining text
  if (currentLine) {
    pageManager.getPage().drawText(currentLine, {
      x,
      y: currentY,
      size: fontSize,
      font,
      color: textColor,
    })
    currentY -= lineSpacing
  }

  return currentY
}

/**
 * Render itinerary day with proper pagination support using PageManager
 * This function handles page breaks mid-content when text is too long
 * Each day starts on its own page (except if it's the first day and we're already on a fresh page)
 */
export function renderPaginatedItineraryDay(
  pageManager: PageManager,
  fonts: FontFamily,
  day: ItineraryDay,
  image: PDFImage | undefined,
  startX: number,
  maxWidth: number,
  textColor: any = LUXURY_COLORS.white,
  isLastDay: boolean = false,
  drawHeader: () => void,
  isFirstDay: boolean = false
): { goldBarY: number } {
  // Layout constants
  const barWidth = 75
  const barHeight = 20
  const barIndent = 10
  const textIndent = 27
  const leftColumnWidth = 216
  const rightColumnWidth = 225
  const columnGap = 26
  const imageHeight = 223

  const barX = startX + barIndent
  const leftX = startX + textIndent
  const rightX = startX + textIndent + leftColumnWidth + columnGap
  const verticalLineX = barX // Gold line aligned with left edge of gold bar

  // Each day gets its own page (unless it's the first day which already has a fresh page with header)
  if (!isFirstDay) {
    pageManager.createNewPage()
    drawHeader()
  }

  // Draw gold bar
  const goldBarY = pageManager.getY() - barHeight
  const goldBarPage = pageManager.getPage() // Store reference to the page with the gold bar
  goldBarPage.drawRectangle({
    x: barX,
    y: goldBarY,
    width: barWidth,
    height: barHeight,
    color: LUXURY_COLORS.gold,
  })

  // Track the starting Y for the vertical gold line
  const verticalLineStartY = goldBarY

  // Draw "Day X" text on gold bar
  const dayText = `Day ${day.dayNumber}`
  const dayTextWidth = fonts.bodyBold.widthOfTextAtSize(dayText, 9)
  pageManager.getPage().drawText(dayText, {
    x: barX + (barWidth - dayTextWidth) / 3,
    y: goldBarY + 7,
    size: 9,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.white,
  })

  pageManager.moveDown(barHeight + 25)

  // Track where the image should be drawn (on the first page of this day)
  const imagePageRef = pageManager.getPage()
  const imageStartY = pageManager.getY()

  // Draw day title
  pageManager.getPage().drawText(sanitizeTextForPdf(day.title), {
    x: leftX,
    y: pageManager.getY(),
    size: 10,
    font: fonts.bodyBold,
    color: textColor,
  })
  pageManager.moveDown(20)

  // Calculate the Y position where we can use full width (below the image)
  const imageBottomY = imageStartY - imageHeight
  // Full width for text (when not alongside image)
  const fullTextWidth = leftColumnWidth + columnGap + rightColumnWidth

  // Helper to get current text width based on Y position
  const getCurrentTextWidth = () => {
    // If we're still on the image page and above the image bottom, use narrow column
    if (pageManager.getPage() === imagePageRef && pageManager.getY() > imageBottomY) {
      return leftColumnWidth
    }
    // Otherwise use full width
    return fullTextWidth
  }

  // Draw subheadings or activities with pagination
  if (day.subheadings && day.subheadings.length > 0) {
    for (const subheading of day.subheadings) {
      // Get current text width
      const currentTextWidth = getCurrentTextWidth()

      // Calculate height needed for this subheading
      const titleHeight = 15
      const descHeight = subheading.description
        ? calculateWrappedTextHeight(
            subheading.description,
            currentTextWidth,
            fonts.body,
            10,
            1.99
          )
        : 0
      const totalSubheadingHeight = titleHeight + descHeight + 15

      // Check if we need a new page
      if (pageManager.checkAndCreateNewPage(totalSubheadingHeight)) {
        drawHeader()
        // Draw continuation indicator
        pageManager.getPage().drawText(`Day ${day.dayNumber} (continued)`, {
          x: leftX,
          y: pageManager.getY(),
          size: 10,
          font: fonts.bodyBold,
          color: LUXURY_COLORS.gold,
        })
        pageManager.moveDown(25)
      }

      // Draw subheading title
      pageManager.getPage().drawText(sanitizeTextForPdf(subheading.title), {
        x: leftX,
        y: pageManager.getY(),
        size: 10,
        font: fonts.bodyBold,
        color: textColor,
      })
      pageManager.moveDown(15)

      // Draw subheading description with width that changes at image boundary
      if (subheading.description) {
        const descText = sanitizeTextForPdf(subheading.description)
        pageManager.setY(
          renderTextWithDynamicWidth(
            pageManager,
            descText,
            leftX,
            fonts.body,
            10,
            textColor,
            leftColumnWidth,
            fullTextWidth,
            imageBottomY,
            imagePageRef
          )
        )
      }

      pageManager.moveDown(15)
    }
  } else if (day.activities) {
    // For activities, render with dynamic width that expands below image
    const activitiesText = sanitizeTextForPdf(day.activities)
    pageManager.setY(
      renderTextWithDynamicWidth(
        pageManager,
        activitiesText,
        leftX,
        fonts.body,
        10,
        textColor,
        leftColumnWidth,
        fullTextWidth,
        imageBottomY,
        imagePageRef
      )
    )
  }

  pageManager.moveDown(10)

  // Draw hotel name if exists
  if (day.hotel) {
    // Check if we need space for hotel name
    if (pageManager.checkAndCreateNewPage(30)) {
      drawHeader()
    }

    pageManager.getPage().drawText(sanitizeTextForPdf(day.hotel).toUpperCase(), {
      x: leftX,
      y: pageManager.getY(),
      size: 10,
      font: fonts.bodyBold,
      color: textColor,
    })
    pageManager.moveDown(15)
  }

  // Draw image on the first page where this day started
  if (image) {
    const imgDims = image.scale(1)
    const scale = Math.min(
      rightColumnWidth / imgDims.width,
      imageHeight / imgDims.height
    )
    const scaledWidth = imgDims.width * scale
    const scaledHeight = imgDims.height * scale

    imagePageRef.drawImage(image, {
      x: rightX,
      y: imageStartY - scaledHeight,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  // Ensure we're below the image area if we're still on the same page
  if (pageManager.getPage() === imagePageRef && pageManager.getY() > imageBottomY) {
    pageManager.setY(imageBottomY)
  }

  pageManager.moveDown(31)

  // Draw horizontal divider (not for last day)
  if (!isLastDay) {
    const dividerStartX = startX + textIndent - 2
    const dividerEndX = startX + textIndent + leftColumnWidth + columnGap + rightColumnWidth
    pageManager.getPage().drawLine({
      start: { x: dividerStartX, y: pageManager.getY() },
      end: { x: dividerEndX, y: pageManager.getY() },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
  }

  pageManager.moveDown(35)

  // Draw the vertical gold line from gold bar to bottom of content
  // If content stayed on one page, draw to current Y
  // If content overflowed, draw to bottom of first page
  let verticalLineEndY: number
  if (pageManager.getPage() === goldBarPage) {
    // Still on the same page - draw to current position
    verticalLineEndY = pageManager.getY() + 35
  } else {
    // Content overflowed to new page - draw to bottom margin of first page
    verticalLineEndY = 60 // marginBottom
  }

  goldBarPage.drawLine({
    start: { x: verticalLineX, y: verticalLineStartY },
    end: { x: verticalLineX, y: verticalLineEndY },
    thickness: 1,
    color: LUXURY_COLORS.gold,
  })

  return { goldBarY }
}
