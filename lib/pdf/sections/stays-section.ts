/**
 * Hotel Stays Section Renderer
 *
 * Renders hotel cards with images and gold information boxes
 */

import { PDFPage, PDFImage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { HotelStay } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_FONT_SIZES, HOTEL_CARD_STYLES, LUXURY_SPACING } from '../../config/luxury-design-config';
import { drawSectionHeader, drawRectangle, formatDate } from '../layout-primitives';
import { drawImage } from '../../utils/image-utils';

export interface StaysSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  hotels: HotelStay[];
  hotelImages: Map<number, PDFImage[]>; // Map of hotel index to embedded images
}

/**
 * Render hotel stays section
 * Returns the Y position after rendering
 */
export function renderStaysSection(
  page: PDFPage,
  fonts: FontFamily,
  options: StaysSectionOptions
): number {
  const { startX, startY, maxWidth, hotels, hotelImages } = options;

  let currentY = startY;

  // Draw section header (simple gold text)
  page.drawText('Our Stays', {
    x: startX,
    y: currentY,
    size: 22,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold
  });

  currentY -= 40;

  if (hotels.length === 0) {
    page.drawText('No hotels added', {
      x: startX + 20,
      y: currentY,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
    return currentY - LUXURY_FONT_SIZES.body * 2;
  }

  // Calculate cards per row (2 cards side by side)
  const cardWidth = HOTEL_CARD_STYLES.width;
  const cardSpacing = HOTEL_CARD_STYLES.spacing;
  const cardsPerRow = Math.floor((maxWidth + cardSpacing) / (cardWidth + cardSpacing));

  let cardX = startX;
  let cardY = currentY;
  let cardCount = 0;

  hotels.forEach((hotel, hotelIndex) => {
    // Get embedded images for this hotel
    const images = hotelImages.get(hotelIndex) || [];
    const primaryImage = images[0]; // Use first image as primary

    // Draw hotel card
    renderHotelCard(
      page,
      fonts,
      hotel,
      primaryImage,
      cardX,
      cardY
    );

    // Move to next position
    cardCount++;
    if (cardCount % cardsPerRow === 0) {
      // Move to next row
      cardX = startX;
      cardY -= HOTEL_CARD_STYLES.height + cardSpacing;
    } else {
      // Move to next column
      cardX += cardWidth + cardSpacing;
    }
  });

  // Calculate final Y position
  const rows = Math.ceil(hotels.length / cardsPerRow);
  currentY -= (rows * (HOTEL_CARD_STYLES.height + cardSpacing)) - cardSpacing;

  currentY -= LUXURY_SPACING.sectionGap;

  return currentY;
}

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
  const cardWidth = HOTEL_CARD_STYLES.width;
  const cardHeight = HOTEL_CARD_STYLES.height;
  const imageHeight = HOTEL_CARD_STYLES.image.height;
  const infoHeight = HOTEL_CARD_STYLES.infoSection.height;

  // Draw card border
  drawRectangle(
    page,
    x,
    y - cardHeight,
    cardWidth,
    cardHeight,
    {
      borderColor: LUXURY_COLORS.borderLight,
      borderWidth: 1
    }
  );

  // Draw hotel image (top part)
  if (image) {
    drawImage(
      page,
      image,
      x,
      y - imageHeight,
      cardWidth,
      imageHeight
    );
  } else {
    // Placeholder for missing image
    drawRectangle(
      page,
      x,
      y - imageHeight,
      cardWidth,
      imageHeight,
      {
        fillColor: LUXURY_COLORS.lightBackground
      }
    );

    page.drawText('No Image', {
      x: x + cardWidth / 2 - 30,
      y: y - imageHeight / 2,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
  }

  // Draw gold information box (bottom part)
  drawRectangle(
    page,
    x,
    y - cardHeight,
    cardWidth,
    infoHeight,
    {
      fillColor: HOTEL_CARD_STYLES.infoSection.backgroundColor
    }
  );

  // Draw hotel information
  const padding = 10;

  // Calculate starting position from top of gold box
  const goldBoxTop = y - cardHeight + infoHeight; // Top of the gold info section
  const hotelNameSize = 11;
  let textY = goldBoxTop - padding - hotelNameSize; // Start from top with padding

  // Hotel name (larger and bold)
  page.drawText(hotel.name, {
    x: x + padding,
    y: textY,
    size: hotelNameSize,
    font: fonts.bodyBold,
    color: HOTEL_CARD_STYLES.infoSection.textColor,
    maxWidth: cardWidth - padding * 2
  });

  textY -= 16;

  // Check-in / Check-out
  const infoSize = 8;
  const checkInText = `Check In: ${formatDate(hotel.checkIn)}`;
  page.drawText(checkInText, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor
  });

  textY -= 11;

  const checkOutText = `Check Out: ${formatDate(hotel.checkOut)}`;
  page.drawText(checkOutText, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor
  });

  textY -= 11;

  // Number of Rooms
  page.drawText(`Number of Rooms: ${hotel.numberOfRooms}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor
  });

  textY -= 11;

  // Meal plan
  page.drawText(`Meal Plan: ${hotel.mealPlan}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor
  });

  textY -= 11;

  // Room Category
  page.drawText(`Room Category: ${hotel.roomCategory}`, {
    x: x + padding,
    y: textY,
    size: infoSize,
    font: fonts.body,
    color: HOTEL_CARD_STYLES.infoSection.textColor
  });
}
