/**
 * PDF Layout Primitives
 *
 * Low-level drawing functions for creating complex layouts in PDFs.
 * These primitives are used by section renderers to build the luxury design.
 */

import { PDFPage, PDFFont, RGB, rgb } from 'pdf-lib';
import { LUXURY_COLORS } from '../config/luxury-design-config';

/**
 * Draw a filled rectangle with optional border
 */
export function drawRectangle(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fillColor?: RGB;
    borderColor?: RGB;
    borderWidth?: number;
    opacity?: number;
  } = {}
): void {
  const {
    fillColor,
    borderColor,
    borderWidth = 1,
    opacity = 1.0
  } = options;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fillColor,
    borderColor: borderColor,
    borderWidth: borderColor ? borderWidth : 0,
    opacity
  });
}

/**
 * Draw a card with background and optional border
 */
export function drawCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    backgroundColor?: RGB;
    borderColor?: RGB;
    borderWidth?: number;
    opacity?: number;
  } = {}
): void {
  const {
    backgroundColor = LUXURY_COLORS.cardBackground,
    borderColor,
    borderWidth = 1,
    opacity = 1.0
  } = options;

  drawRectangle(page, x, y, width, height, {
    fillColor: backgroundColor,
    borderColor,
    borderWidth,
    opacity
  });
}

/**
 * Draw a gold accent box (for pricing, bank details, etc.)
 */
export function drawGoldBox(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    filled?: boolean;
    borderWidth?: number;
    opacity?: number;
  } = {}
): void {
  const {
    filled = false,
    borderWidth = 2,
    opacity = 1.0
  } = options;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: filled ? LUXURY_COLORS.gold : undefined,
    borderColor: LUXURY_COLORS.gold,
    borderWidth,
    opacity
  });
}

/**
 * Draw a table row with cells
 */
export function drawTableRow(
  page: PDFPage,
  x: number,
  y: number,
  columns: Array<{
    text: string;
    width: number;
    align?: 'left' | 'center' | 'right';
  }>,
  options: {
    height?: number;
    isHeader?: boolean;
    backgroundColor?: RGB;
    textColor?: RGB;
    font?: PDFFont;
    fontSize?: number;
    borderColor?: RGB;
    borderWidth?: number;
    cellPadding?: number;
  }
): void {
  const {
    height = 40,
    isHeader = false,
    backgroundColor = isHeader ? LUXURY_COLORS.gold : LUXURY_COLORS.white,
    textColor = isHeader ? LUXURY_COLORS.white : LUXURY_COLORS.textDark,
    font,
    fontSize = isHeader ? 12 : 10,
    borderColor = LUXURY_COLORS.borderLight,
    borderWidth = 0.5,
    cellPadding = 10
  } = options;

  // Draw row background
  if (backgroundColor) {
    drawRectangle(page, x, y, columns.reduce((sum, col) => sum + col.width, 0), height, {
      fillColor: backgroundColor
    });
  }

  // Draw cells and text
  let currentX = x;
  columns.forEach((column) => {
    // Draw cell border
    if (borderColor) {
      page.drawRectangle({
        x: currentX,
        y,
        width: column.width,
        height,
        borderColor,
        borderWidth
      });
    }

    // Draw text
    if (font && column.text) {
      const textWidth = font.widthOfTextAtSize(column.text, fontSize);
      let textX = currentX + cellPadding;

      // Handle alignment
      if (column.align === 'center') {
        textX = currentX + (column.width - textWidth) / 2;
      } else if (column.align === 'right') {
        textX = currentX + column.width - textWidth - cellPadding;
      }

      page.drawText(column.text, {
        x: textX,
        y: y + (height - fontSize) / 2,
        size: fontSize,
        font,
        color: textColor
      });
    }

    currentX += column.width;
  });
}

/**
 * Draw a horizontal divider line
 */
export function drawDivider(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  options: {
    color?: RGB;
    thickness?: number;
    opacity?: number;
  } = {}
): void {
  const {
    color = LUXURY_COLORS.divider,
    thickness = 1,
    opacity = 1.0
  } = options;

  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    color,
    thickness,
    opacity
  });
}

/**
 * Draw a bullet point
 */
export function drawBulletPoint(
  page: PDFPage,
  x: number,
  y: number,
  options: {
    size?: number;
    color?: RGB;
  } = {}
): void {
  const {
    size = 6,
    color = LUXURY_COLORS.gold
  } = options;

  page.drawCircle({
    x: x + size / 2,
    y: y + size / 2,
    size: size / 2,
    color
  });
}

/**
 * Draw text with word wrapping
 */
export function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  options: {
    color?: RGB;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
  } = {}
): number {
  const {
    color = LUXURY_COLORS.textDark,
    lineHeight = 1.4,
    align = 'left'
  } = options;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Build lines
  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  // Draw lines
  let currentY = y;
  const lineSpacing = fontSize * lineHeight;

  lines.forEach((line) => {
    let textX = x;

    if (align === 'center') {
      const textWidth = font.widthOfTextAtSize(line, fontSize);
      textX = x + (maxWidth - textWidth) / 2;
    } else if (align === 'right') {
      const textWidth = font.widthOfTextAtSize(line, fontSize);
      textX = x + maxWidth - textWidth;
    }

    page.drawText(line, {
      x: textX,
      y: currentY,
      size: fontSize,
      font,
      color
    });

    currentY -= lineSpacing;
  });

  // Return the final Y position after all lines
  return currentY;
}

/**
 * Draw a bullet list
 */
export function drawBulletList(
  page: PDFPage,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  options: {
    bulletColor?: RGB;
    textColor?: RGB;
    bulletSize?: number;
    bulletIndent?: number;
    lineHeight?: number;
    itemSpacing?: number;
  } = {}
): number {
  const {
    bulletColor = LUXURY_COLORS.gold,
    textColor = LUXURY_COLORS.textDark,
    bulletSize = 6,
    bulletIndent = 15,
    lineHeight = 1.4,
    itemSpacing = 8
  } = options;

  let currentY = y;

  items.forEach((item) => {
    // Draw bullet
    drawBulletPoint(page, x, currentY - bulletSize / 2, {
      size: bulletSize,
      color: bulletColor
    });

    // Draw text
    const textX = x + bulletIndent;
    const textMaxWidth = maxWidth - bulletIndent;

    currentY = drawWrappedText(
      page,
      item,
      textX,
      currentY,
      textMaxWidth,
      font,
      fontSize,
      {
        color: textColor,
        lineHeight
      }
    );

    currentY -= itemSpacing;
  });

  return currentY;
}

/**
 * Draw a section header
 */
export function drawSectionHeader(
  page: PDFPage,
  title: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  options: {
    fontSize?: number;
    backgroundColor?: RGB;
    textColor?: RGB;
    padding?: number;
    height?: number;
  } = {}
): number {
  const {
    fontSize = 22,
    backgroundColor = LUXURY_COLORS.gold,
    textColor = LUXURY_COLORS.white,
    padding = 15,
    height = 50
  } = options;

  // Draw background
  drawRectangle(page, x, y, width, height, {
    fillColor: backgroundColor
  });

  // Draw title text (centered vertically in the box)
  page.drawText(title, {
    x: x + padding,
    y: y + (height - fontSize) / 2,
    size: fontSize,
    font,
    color: textColor
  });

  return y - height;
}

/**
 * Draw a two-column layout
 */
export function drawTwoColumnLayout(
  page: PDFPage,
  leftContent: () => number,
  rightContent: () => number,
  x: number,
  y: number,
  width: number,
  options: {
    columnGap?: number;
  } = {}
): number {
  const {
    columnGap = 20
  } = options;

  const columnWidth = (width - columnGap) / 2;

  // Draw left column
  const leftEndY = leftContent();

  // Draw right column
  const rightEndY = rightContent();

  // Return the lower Y position
  return Math.min(leftEndY, rightEndY);
}

/**
 * Draw a label-value pair
 */
export function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  labelFont: PDFFont,
  valueFont: PDFFont,
  options: {
    labelSize?: number;
    valueSize?: number;
    labelColor?: RGB;
    valueColor?: RGB;
    spacing?: number;
  } = {}
): number {
  const {
    labelSize = 10,
    valueSize = 11,
    labelColor = LUXURY_COLORS.textMuted,
    valueColor = LUXURY_COLORS.textDark,
    spacing = 5
  } = options;

  // Draw label
  page.drawText(label, {
    x,
    y,
    size: labelSize,
    font: labelFont,
    color: labelColor
  });

  // Draw value below label
  const valueY = y - labelSize - spacing;
  page.drawText(value, {
    x,
    y: valueY,
    size: valueSize,
    font: valueFont,
    color: valueColor
  });

  return valueY - valueSize - spacing;
}

/**
 * Draw a semi-transparent overlay (for text on images)
 */
export function drawOverlay(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    color?: RGB;
    opacity?: number;
  } = {}
): void {
  const {
    color = LUXURY_COLORS.darkBackground,
    opacity = 0.6
  } = options;

  drawRectangle(page, x, y, width, height, {
    fillColor: color,
    opacity
  });
}

/**
 * Draw page background
 */
export function drawPageBackground(
  page: PDFPage,
  backgroundColor: RGB
): void {
  const { width, height } = page.getSize();

  drawRectangle(page, 0, 0, width, height, {
    fillColor: backgroundColor
  });
}

/**
 * Draw a simple icon placeholder (for plane icon in flights)
 */
export function drawPlaneIcon(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  color: RGB = LUXURY_COLORS.textMuted
): void {
  // Draw a simple right-pointing triangle as a plane icon
  const halfSize = size / 2;

  // This is a simplified representation
  page.drawLine({
    start: { x, y: y + halfSize },
    end: { x: x + size, y: y + halfSize },
    color,
    thickness: 2
  });

  // Arrow head
  page.drawLine({
    start: { x: x + size, y: y + halfSize },
    end: { x: x + size - size / 3, y: y + halfSize + size / 4 },
    color,
    thickness: 2
  });

  page.drawLine({
    start: { x: x + size, y: y + halfSize },
    end: { x: x + size - size / 3, y: y + halfSize - size / 4 },
    color,
    thickness: 2
  });
}

/**
 * Calculate text height for wrapped text
 */
export function calculateWrappedTextHeight(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  lineHeight: number = 1.4
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length * fontSize * lineHeight;
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    INR: '₹'
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `${start} - ${end}`;
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format time
 */
export function formatTime(timeString: string): string {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
