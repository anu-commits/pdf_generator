/**
 * Flights Section Renderer
 *
 * Renders flight information in a clean table layout matching the design
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { FlightDetails } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_FONT_SIZES } from '../../config/luxury-design-config';
import { formatDate, formatTime } from '../layout-primitives';

export interface FlightsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  flights: FlightDetails[];
}

/**
 * Render flights section
 * Returns the Y position after rendering
 */
export function renderFlightsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: FlightsSectionOptions
): number {
  const { startX, startY, maxWidth, flights } = options;

  let currentY = startY;

  // Draw "Flights" header in gold (matching Figma design - serif font, larger size)
  page.drawText('Flights', {
    x: startX,
    y: currentY,
    size: 36,
    font: fonts.heading, // Times New Roman from Figma
    color: LUXURY_COLORS.gold
  });

  currentY -= 30;

  if (flights.length === 0) {
    page.drawText('No flights added', {
      x: startX + 20,
      y: currentY,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
    return currentY - 40;
  }

  // Table configuration matching the design
  const tableStartX = startX;
  const columnWidths = [140, 120, 40, 100, 120]; // Departure&Arrivals, Departure, Icon, Duration, Arrival
  const headerHeight = 30;
  const rowHeight = 60;

  // Draw table header background (light gray)
  page.drawRectangle({
    x: tableStartX,
    y: currentY - headerHeight,
    width: maxWidth,
    height: headerHeight,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1
  });

  // Draw header text
  let headerX = tableStartX + 10;
  page.drawText('Departure & Arrivals', {
    x: headerX,
    y: currentY - 20,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  headerX += columnWidths[0];
  page.drawText('Departure', {
    x: headerX,
    y: currentY - 20,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  headerX += columnWidths[1] + columnWidths[2]; // Skip icon column
  page.drawText('Duration', {
    x: headerX,
    y: currentY - 20,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  headerX += columnWidths[3];
  page.drawText('Arrival', {
    x: headerX,
    y: currentY - 20,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  currentY -= headerHeight;

  // Draw flight rows
  flights.forEach((flight, index) => {
    const isAlternate = index % 2 === 1;
    const rowColor = isAlternate ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1);

    // Draw row background
    page.drawRectangle({
      x: tableStartX,
      y: currentY - rowHeight,
      width: maxWidth,
      height: rowHeight,
      color: rowColor,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    });

    let colX = tableStartX + 10;
    let textY = currentY - 18;

    // Column 1: Flight number and airline
    page.drawText(flight.flightNumber, {
      x: colX,
      y: textY,
      size: 11,
      font: fonts.bodyBold,
      color: LUXURY_COLORS.textDark
    });
    page.drawText(flight.cabin, {
      x: colX,
      y: textY - 15,
      size: 9,
      font: fonts.body,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Column 2: Departure city, date, time
    colX += columnWidths[0];
    const depCity = flight.departure.airport;
    const depDateTime = `${formatDate(flight.departure.date)} ${formatTime(flight.departure.time)}`;

    page.drawText(depCity, {
      x: colX,
      y: textY,
      size: 10,
      font: fonts.bodyBold,
      color: LUXURY_COLORS.textDark
    });
    page.drawText(depDateTime, {
      x: colX,
      y: textY - 15,
      size: 9,
      font: fonts.body,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Column 3: Arrow icon
    colX += columnWidths[1];
    page.drawText('->', {
      x: colX + 10,
      y: textY - 8,
      size: 14,
      font: fonts.body,
      color: rgb(0.6, 0.6, 0.6)
    });

    // Column 4: Duration
    colX += columnWidths[2];
    page.drawText(flight.duration, {
      x: colX,
      y: textY - 8,
      size: 10,
      font: fonts.body,
      color: LUXURY_COLORS.textDark
    });

    // Column 5: Arrival city, date, time
    colX += columnWidths[3];
    const arrCity = flight.arrival.airport;
    const arrDateTime = `${formatDate(flight.arrival.date)} ${formatTime(flight.arrival.time)}`;

    page.drawText(arrCity, {
      x: colX,
      y: textY,
      size: 10,
      font: fonts.bodyBold,
      color: LUXURY_COLORS.textDark
    });
    page.drawText(arrDateTime, {
      x: colX,
      y: textY - 15,
      size: 9,
      font: fonts.body,
      color: rgb(0.5, 0.5, 0.5)
    });

    currentY -= rowHeight;
  });

  currentY -= 30;

  return currentY;
}
