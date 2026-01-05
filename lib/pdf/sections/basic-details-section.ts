/**
 * Basic Details Section Renderer
 *
 * Renders a grid of basic trip information with icons
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { BasicDetails } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_FONT_SIZES } from '../../config/luxury-design-config';

export interface BasicDetailsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  basicDetails: BasicDetails;
}

/**
 * Render basic details section with grid layout
 * Returns the Y position after rendering
 */
export function renderBasicDetailsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: BasicDetailsSectionOptions
): number {
  const { startX, startY, maxWidth, basicDetails } = options;

  let currentY = startY;

  // Draw "Basic Details" header in gold
  page.drawText('Basic Details', {
    x: startX,
    y: currentY,
    size: 22,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold
  });

  currentY -= 50;

  // Grid configuration
  const boxSize = 80;
  const boxSpacing = 10;
  const columns = 3;
  const rows = 2;

  // Define the grid items with icons and values
  const gridItems = [
    { icon: 'GRP', value: basicDetails.groupSize || '-', label: 'Group Size' },
    { icon: 'PER', value: basicDetails.duration || '-', label: 'Duration' },
    { icon: 'CAL', value: basicDetails.destinations || '-', label: 'Destinations' },
    { icon: 'GDE', value: basicDetails.guide || '-', label: 'Guide' },
    { icon: 'BED', value: basicDetails.accommodation || '-', label: 'Accommodation' },
    { icon: 'VIS', value: basicDetails.visaRequired || '-', label: 'Visa' }
  ];

  // Calculate starting X to center the grid
  const totalGridWidth = (boxSize * columns) + (boxSpacing * (columns - 1));
  const gridStartX = startX + (maxWidth - totalGridWidth) / 2;

  // Draw grid boxes
  let boxIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (boxIndex >= gridItems.length) break;

      const item = gridItems[boxIndex];
      const boxX = gridStartX + (col * (boxSize + boxSpacing));
      const boxY = currentY - (row * (boxSize + boxSpacing)) - boxSize;

      // Draw box border
      page.drawRectangle({
        x: boxX,
        y: boxY,
        width: boxSize,
        height: boxSize,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1
      });

      // Draw icon text (top portion of box)
      const iconText = item.icon;
      const iconWidth = fonts.bodyBold.widthOfTextAtSize(iconText, 10);
      page.drawText(iconText, {
        x: boxX + (boxSize - iconWidth) / 2,
        y: boxY + boxSize - 25,
        size: 10,
        font: fonts.bodyBold,
        color: LUXURY_COLORS.textMuted
      });

      // Draw value text (middle portion of box)
      const valueText = item.value.length > 10 ? item.value.substring(0, 10) + '...' : item.value;
      const valueWidth = fonts.body.widthOfTextAtSize(valueText, 9);
      page.drawText(valueText, {
        x: boxX + (boxSize - valueWidth) / 2,
        y: boxY + boxSize / 2,
        size: 9,
        font: fonts.body,
        color: LUXURY_COLORS.textDark
      });

      boxIndex++;
    }
  }

  currentY = currentY - (rows * (boxSize + boxSpacing)) - 40;

  return currentY;
}
