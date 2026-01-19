/**
 * Pricing Section Renderer
 *
 * Renders pricing breakdown with gold bar header and gray rows
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { PricingDetails } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_FONT_SIZES, LUXURY_LAYOUT } from '../../config/luxury-design-config';
import { formatCurrency } from '../layout-primitives';

export interface PricingSectionOptions {
  startX: number;
  startY: number;
  pricing: PricingDetails;
  textColor?: any;
  maxWidth?: number;
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
  const { startX, startY, pricing, textColor = LUXURY_COLORS.textDark, maxWidth } = options;

  const sectionWidth = maxWidth || LUXURY_LAYOUT.content.width; // Use content width for equal margins
  const rowHeight = 28; // Compact rows to fit on page

  let currentY = startY;

  // Draw "Pricing Summary" heading in gold
  page.drawText('Pricing Summary', {
    x: startX,
    y: currentY,
    size: 18,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold
  });

  currentY -= 30;

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

  // Use dark text color for rows (since they have light gray backgrounds)
  const rowTextColor = rgb(0.2, 0.2, 0.2); // Dark gray for readability

  // Draw gray rows with alternating colors
  rows.forEach((row, index) => {
    const isTotal = index === rows.length - 1;
    // Alternating gray colors - darker and lighter
    const rowColor = index % 2 === 0 ? rgb(0.85, 0.85, 0.85) : rgb(0.95, 0.95, 0.95);

    // Draw row background
    page.drawRectangle({
      x: startX,
      y: currentY - rowHeight,
      width: sectionWidth,
      height: rowHeight,
      color: rowColor
    });

    // Draw label (dark text for readability on light gray background)
    page.drawText(row.label, {
      x: startX + 20,
      y: currentY - rowHeight / 2 - 5,
      size: isTotal ? 12 : 11,
      font: row.isBold ? fonts.bodyBold : fonts.body,
      color: rowTextColor
    });

    // Draw value (right-aligned)
    const valueWidth = (row.isBold ? fonts.bodyBold : fonts.body).widthOfTextAtSize(
      row.value,
      isTotal ? 12 : 11
    );
    page.drawText(row.value, {
      x: startX + sectionWidth - 20 - valueWidth,
      y: currentY - rowHeight / 2 - 5,
      size: isTotal ? 12 : 11,
      font: row.isBold ? fonts.bodyBold : fonts.body,
      color: isTotal ? LUXURY_COLORS.gold : rowTextColor
    });

    currentY -= rowHeight;
  });

  currentY -= 20;

  return currentY;
}
