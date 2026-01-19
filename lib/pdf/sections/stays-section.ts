/**
 * Hotel Stays Section Renderer
 *
 * Renders hotel cards with images and gold information boxes
 * Supports pagination - creates new pages when cards overflow
 */

import { PDFDocument, PDFPage, PDFImage, RGB } from "pdf-lib"
import { FontFamily } from "../font-loader"
import { HotelStay } from "../../types/itinerary"
import {
  LUXURY_COLORS,
  LUXURY_FONT_SIZES,
  HOTEL_CARD_STYLES,
  LUXURY_SPACING,
  LUXURY_LAYOUT,
} from "../../config/luxury-design-config"
import {
  drawSectionHeader,
  drawRectangle,
  formatDate,
  drawPageBackground,
} from "../layout-primitives"
import { drawImage } from "../../utils/image-utils"

export interface StaysSectionOptions {
  startX: number
  startY: number
  maxWidth: number
  hotels: HotelStay[]
  hotelImages: Map<number, PDFImage[]> // Map of hotel index to embedded images
  pdfDoc: PDFDocument // Required for pagination
  backgroundColor: RGB // Background color for new pages
}

/**
 * Render hotel stays section with pagination
 * Creates new pages when hotels overflow
 */
export function renderStaysSection(
  page: PDFPage,
  fonts: FontFamily,
  options: StaysSectionOptions
): number {
  const {
    startX,
    startY,
    maxWidth,
    hotels,
    hotelImages,
    pdfDoc,
    backgroundColor,
  } = options

  let currentPage = page
  let currentY = startY

  // Draw section header (simple gold text)
  currentPage.drawText("Our Stays", {
    x: startX,
    y: currentY,
    size: 36,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold,
  })

  currentY -= 60

  if (hotels.length === 0) {
    currentPage.drawText("No hotels added", {
      x: startX + 20,
      y: currentY,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted,
    })
    return currentY - LUXURY_FONT_SIZES.body * 2
  }

  // Calculate cards per row (2 cards side by side)
  const cardWidth = HOTEL_CARD_STYLES.width
  const cardSpacing = HOTEL_CARD_STYLES.spacing
  const cardsPerRow = Math.floor(
    (maxWidth + cardSpacing) / (cardWidth + cardSpacing)
  )
  const cardHeight = HOTEL_CARD_STYLES.height

  let cardX = startX
  let cardY = currentY
  let cardCount = 0

  hotels.forEach((hotel, hotelIndex) => {
    // Check if we need a new page before rendering this card
    const rowHeight = cardHeight + cardSpacing
    const bottomMargin = 60

    // Check if next row would go below bottom margin
    if (cardCount % cardsPerRow === 0 && cardCount > 0) {
      // Starting a new row, check if it fits
      const nextRowY = cardY - rowHeight
      if (nextRowY < bottomMargin) {
        // Create new page
        currentPage = pdfDoc.addPage([
          LUXURY_LAYOUT.page.width,
          LUXURY_LAYOUT.page.height,
        ])
        drawPageBackground(currentPage, backgroundColor)

        // Reset Y position for new page
        currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

        // Draw "Our Stays" header on new page
        currentPage.drawText("Our Stays", {
          x: startX,
          y: currentY,
          size: 36,
          font: fonts.headingBold,
          color: LUXURY_COLORS.gold,
        })

        currentY -= 60
        cardY = currentY
        cardX = startX
      }
    }

    // Get embedded images for this hotel
    const images = hotelImages.get(hotelIndex) || []
    const primaryImage = images[0] // Use first image as primary

    // Draw hotel card
    renderHotelCard(currentPage, fonts, hotel, primaryImage, cardX, cardY)

    // Move to next position
    cardCount++
    if (cardCount % cardsPerRow === 0) {
      // Move to next row
      cardX = startX
      cardY -= cardHeight + cardSpacing
    } else {
      // Move to next column
      cardX += cardWidth + cardSpacing
    }
  })

  // Calculate final Y position based on last card position
  // If we ended mid-row, account for that
  if (cardCount % cardsPerRow !== 0) {
    cardY -= cardHeight + cardSpacing
  }

  currentY = cardY - LUXURY_SPACING.sectionGap

  return currentY
}

/**
 * Render individual hotel card
 */
/**
 * Render individual hotel card
 */
function renderHotelCard(
  page: PDFPage,
  fonts: FontFamily,
  hotel: HotelStay,
  image: PDFImage | undefined,
  x: number,
  y: number
): void {
  const cardWidth = HOTEL_CARD_STYLES.width
  const cardHeight = HOTEL_CARD_STYLES.height

  // CHANGE: Calculate equal height for both sections (50/50 split)
  const splitHeight = cardHeight / 2
  const actualImageHeight = splitHeight
  const infoHeight = splitHeight

  // Draw card border
  drawRectangle(page, x, y - cardHeight, cardWidth, cardHeight, {
    borderColor: LUXURY_COLORS.borderLight,
    borderWidth: 1,
  })

  // Draw hotel image (top half)
  if (image) {
    drawImage(
      page,
      image,
      x,
      y - actualImageHeight,
      cardWidth,
      actualImageHeight
    )
  } else {
    // Placeholder for missing image
    drawRectangle(
      page,
      x,
      y - actualImageHeight,
      cardWidth,
      actualImageHeight,
      {
        fillColor: LUXURY_COLORS.lightBackground,
      }
    )

    page.drawText("No Image", {
      x: x + cardWidth / 2 - 30,
      y: y - actualImageHeight / 2,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted,
    })
  }

  // Draw gold information box (bottom half)
  drawRectangle(page, x, y - cardHeight, cardWidth, infoHeight, {
    fillColor: HOTEL_CARD_STYLES.infoSection.backgroundColor,
  })

  // Draw hotel information
  const padding = 15

  // Calculate starting position from top of gold box
  const goldBoxTop = y - actualImageHeight // Start exactly where image ends
  const hotelNameSize = 14
  let textY = goldBoxTop - padding - hotelNameSize

  // Hotel name
  const nameMaxWidth = cardWidth - (padding * 2);
  const nameLineHeight = 18; // Control spacing between name lines here
  
  // Logic to wrap text manually (pdf-lib doesn't wrap automatically)
  const words = hotel.name.split(' ');
  let line = '';
  const lines: string[] = [];
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const testWidth = fonts.headingBold.widthOfTextAtSize(testLine, hotelNameSize);
    
    // If line gets too long, push it and start a new one
    if (testWidth > nameMaxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Draw lines Left Aligned
  lines.forEach((l) => {
    page.drawText(l, {
      x: x + padding, // <--- Left Aligned (Fixed position)
      y: textY,
      size: hotelNameSize,
      font: fonts.headingBold,
      color: HOTEL_CARD_STYLES.infoSection.textColor,
    });
    
    textY -= nameLineHeight; // Move down for next line
  });

  // Add extra gap after the name block before details start
  textY -= 10;

  // Check-in / Check-out / Details
  const infoSize = 10
  const lineSpacing = 12

  const checkInText = `Check In: ${formatDate(hotel.checkIn)}`
  page.drawText(checkInText, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
  })

  textY -= lineSpacing

  const checkOutText = `Check Out: ${formatDate(hotel.checkOut)}`
  page.drawText(checkOutText, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
  })

  textY -= lineSpacing

  // Number of Rooms
  page.drawText(`No. Of Room: ${hotel.numberOfRooms}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
  })

  textY -= lineSpacing

  // Meal plan
  page.drawText(`Meal Plan: ${hotel.mealPlan}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
  })

  textY -= lineSpacing

  // Room Category
  page.drawText(`Room Category: ${hotel.roomCategory}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
  })
}
