/**
 * Bank Details Section Renderer
 *
 * Renders bank information with gold bar header and gray rows
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { BankDetails } from '../../types/itinerary';
import { LUXURY_COLORS, LUXURY_LAYOUT } from '../../config/luxury-design-config';

export interface BankDetailsSectionOptions {
  startX: number;
  startY: number;
  bankDetails: BankDetails;
  textColor?: any;
  maxWidth?: number;
}

/**
 * Render bank details section with bar layout
 * Returns the Y position after rendering
 */
export function renderBankDetailsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: BankDetailsSectionOptions
): number {
  const { startX, startY, bankDetails, maxWidth } = options;

  const sectionWidth = maxWidth || LUXURY_LAYOUT.content.width; // Use content width for equal margins
  const rowHeight = 28; // Compact rows to fit on page

  let currentY = startY;

  // Draw "Bank Details" heading in gold
  page.drawText('Bank Details', {
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

  // Define bank details rows
  const rows = [
    { label: 'Account Name', value: bankDetails.accountName || '-' },
    { label: 'Account Number', value: bankDetails.accountNumber || '-' },
    { label: 'Bank Name', value: bankDetails.bankName || '-' },
    { label: 'SWIFT Code', value: bankDetails.swiftCode || '-' }
  ];

  if (bankDetails.iban) {
    rows.push({ label: 'IBAN', value: bankDetails.iban });
  }

  // Use dark text color for rows (since they have light gray backgrounds)
  const rowTextColor = rgb(0.2, 0.2, 0.2); // Dark gray for readability

  // Draw gray rows with alternating colors
  rows.forEach((row, index) => {
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
      size: 11,
      font: fonts.body,
      color: rowTextColor
    });

    // Draw value (right-aligned)
    const valueWidth = fonts.bodyBold.widthOfTextAtSize(row.value, 11);
    page.drawText(row.value, {
      x: startX + sectionWidth - 20 - valueWidth,
      y: currentY - rowHeight / 2 - 5,
      size: 11,
      font: fonts.bodyBold,
      color: rowTextColor
    });

    currentY -= rowHeight;
  });

  currentY -= 35;

  return currentY;
}
