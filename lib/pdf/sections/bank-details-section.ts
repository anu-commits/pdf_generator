/**
 * Bank Details Section Renderer
 *
 * Renders bank information with gold bar header and gray rows
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { BankDetails } from '../../types/itinerary';
import { LUXURY_COLORS } from '../../config/luxury-design-config';

export interface BankDetailsSectionOptions {
  startX: number;
  startY: number;
  bankDetails: BankDetails;
  textColor?: any;
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
  const { startX, startY, bankDetails, textColor = LUXURY_COLORS.textDark } = options;

  const sectionWidth = 412; // Matching the design width
  const rowHeight = 35; // Slightly taller rows

  let currentY = startY;

  // Draw "Bank Details" heading in gold
  page.drawText('Bank Details', {
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

    // Draw label
    page.drawText(row.label, {
      x: startX + 20,
      y: currentY - rowHeight / 2 - 5,
      size: 11,
      font: fonts.body,
      color: textColor
    });

    // Draw value (right-aligned)
    const valueWidth = fonts.bodyBold.widthOfTextAtSize(row.value, 11);
    page.drawText(row.value, {
      x: startX + sectionWidth - 20 - valueWidth,
      y: currentY - rowHeight / 2 - 5,
      size: 11,
      font: fonts.bodyBold,
      color: textColor
    });

    currentY -= rowHeight;
  });

  currentY -= 30;

  return currentY;
}
