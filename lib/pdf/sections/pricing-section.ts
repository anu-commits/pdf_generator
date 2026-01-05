/**
 * Pricing Section Renderer
 *
 * Renders pricing breakdown with gold bar header and gray rows
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { PricingDetails } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_FONT_SIZES } from '../../config/luxury-design-config';
import { formatCurrency } from '../layout-primitives';

export interface PricingSectionOptions {
  startX: number;
  startY: number;
  pricing: PricingDetails;
}

/**
 * Render pricing section with bar layout
 * Returns the Y position after rendering
 */
export function renderPricingSection(
  page: PDFPage,
  fonts: FontFamily,
  options: PricingSectionOptions
): number {
  const { startX, startY, pricing } = options;

  const sectionWidth = 400;
  const rowHeight = 30;

  let currentY = startY;

  // Draw "Pricing Summary" heading in gold
  page.drawText('Pricing Summary', {
    x: startX,
    y: currentY,
    size: 18,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold
  });

  currentY -= 40;

  // Draw gold bar header
  page.drawRectangle({
    x: startX,
    y: currentY - rowHeight,
    width: sectionWidth,
    height: rowHeight,
    color: LUXURY_COLORS.gold
  });

  currentY -= rowHeight;

  // Define pricing rows with gray background
  const rows = [
    { label: 'Subtotal', value: formatCurrency(pricing.subtotal, pricing.currency) },
    { label: 'Taxes', value: formatCurrency(pricing.taxes, pricing.currency) },
    { label: 'Fees', value: formatCurrency(pricing.fees, pricing.currency) },
    { label: 'Total Amount', value: formatCurrency(pricing.total, pricing.currency), isBold: true }
  ];

  // Draw gray rows
  rows.forEach((row, index) => {
    const isTotal = index === rows.length - 1;
    const rowColor = isTotal ? rgb(0.9, 0.9, 0.9) : rgb(0.95, 0.95, 0.95);

    // Draw row background
    page.drawRectangle({
      x: startX,
      y: currentY - rowHeight,
      width: sectionWidth,
      height: rowHeight,
      color: rowColor
    });

    // Draw label
    page.drawText(row.label, {
      x: startX + 15,
      y: currentY - rowHeight / 2 - 4,
      size: isTotal ? 12 : 10,
      font: row.isBold ? fonts.bodyBold : fonts.body,
      color: LUXURY_COLORS.textDark
    });

    // Draw value (right-aligned)
    const valueWidth = (row.isBold ? fonts.bodyBold : fonts.body).widthOfTextAtSize(
      row.value,
      isTotal ? 12 : 10
    );
    page.drawText(row.value, {
      x: startX + sectionWidth - 15 - valueWidth,
      y: currentY - rowHeight / 2 - 4,
      size: isTotal ? 12 : 10,
      font: row.isBold ? fonts.bodyBold : fonts.body,
      color: isTotal ? LUXURY_COLORS.gold : LUXURY_COLORS.textDark
    });

    currentY -= rowHeight;
  });

  currentY -= 30;

  return currentY;
}
