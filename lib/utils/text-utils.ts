/**
 * Text Utilities for PDF Generation
 *
 * Helper functions for measuring text dimensions and performing text wrapping.
 * These utilities are essential for calculating how much space text will occupy
 * in the PDF and ensuring text doesn't overflow designated areas.
 */

import { PDFFont, PDFPage } from 'pdf-lib';
import { TextMeasurement } from '@/lib/types/itinerary';

/**
 * Measure the width of text in points using a specific font and size
 *
 * @param text - The text to measure
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @returns Width in points
 */
export function measureTextWidth(text: string, font: PDFFont, fontSize: number): number {
  return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Measure the height of a single line of text
 *
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param lineHeight - Line height multiplier (default: 1.2)
 * @returns Height in points
 */
export function measureLineHeight(font: PDFFont, fontSize: number, lineHeight: number = 1.2): number {
  return fontSize * lineHeight;
}

/**
 * Wrap text to fit within a maximum width, breaking at word boundaries
 *
 * @param text - The text to wrap
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param maxWidth - Maximum width in points
 * @returns Array of text lines that fit within maxWidth
 */
export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  // Handle empty text
  if (!text || text.trim() === '') {
    return [''];
  }

  // Split text into paragraphs (preserve explicit line breaks)
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  paragraphs.forEach((paragraph) => {
    // Handle empty paragraphs
    if (paragraph.trim() === '') {
      lines.push('');
      return;
    }

    // Split paragraph into words
    const words = paragraph.split(' ');
    let currentLine = '';

    words.forEach((word, index) => {
      // Try adding the word to the current line
      const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
      const testWidth = measureTextWidth(testLine, font, fontSize);

      if (testWidth <= maxWidth) {
        // Word fits - add it to current line
        currentLine = testLine;
      } else {
        // Word doesn't fit
        if (currentLine !== '') {
          // Push current line and start new line with the word
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is longer than maxWidth - force it on its own line
          // This prevents infinite loops with very long words
          lines.push(word);
          currentLine = '';
        }
      }
    });

    // Add remaining text
    if (currentLine !== '') {
      lines.push(currentLine);
    }
  });

  return lines;
}

/**
 * Wrap text and limit to a maximum number of lines
 * Useful for preventing text overflow in fixed-height areas
 *
 * @param text - The text to wrap
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param maxWidth - Maximum width in points
 * @param maxLines - Maximum number of lines
 * @param ellipsis - Whether to add "..." if text is truncated
 * @returns Array of text lines (truncated if necessary)
 */
export function wrapTextWithLimit(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  maxLines: number,
  ellipsis: boolean = true
): string[] {
  const wrappedLines = wrapText(text, font, fontSize, maxWidth);

  if (wrappedLines.length <= maxLines) {
    return wrappedLines;
  }

  // Truncate to maxLines
  const truncated = wrappedLines.slice(0, maxLines);

  // Add ellipsis to last line if requested
  if (ellipsis && truncated.length > 0) {
    const lastLine = truncated[truncated.length - 1];
    const ellipsisText = '...';
    const ellipsisWidth = measureTextWidth(ellipsisText, font, fontSize);

    // Try to fit ellipsis on the last line
    let fittedText = lastLine;
    while (
      measureTextWidth(fittedText + ellipsisText, font, fontSize) > maxWidth &&
      fittedText.length > 0
    ) {
      fittedText = fittedText.slice(0, -1).trim();
    }

    truncated[truncated.length - 1] = fittedText + ellipsisText;
  }

  return truncated;
}

/**
 * Calculate the total height needed for wrapped text
 *
 * @param text - The text to measure
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param maxWidth - Maximum width in points
 * @param lineHeight - Line height multiplier (default: 1.2)
 * @returns Total height in points
 */
export function calculateTextHeight(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  lineHeight: number = 1.2
): number {
  const lines = wrapText(text, font, fontSize, maxWidth);
  const lineHeightPoints = measureLineHeight(font, fontSize, lineHeight);
  return lines.length * lineHeightPoints;
}

/**
 * Get full text measurement including width, height, and wrapped lines
 *
 * @param text - The text to measure
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param maxWidth - Maximum width in points
 * @param lineHeight - Line height multiplier (default: 1.2)
 * @returns TextMeasurement object with all metrics
 */
export function measureText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  lineHeight: number = 1.2
): TextMeasurement {
  const lines = wrapText(text, font, fontSize, maxWidth);
  const lineHeightPoints = measureLineHeight(font, fontSize, lineHeight);
  const height = lines.length * lineHeightPoints;

  // Calculate actual width (longest line)
  let width = 0;
  lines.forEach((line) => {
    const lineWidth = measureTextWidth(line, font, fontSize);
    if (lineWidth > width) {
      width = lineWidth;
    }
  });

  return {
    width,
    height,
    lines,
  };
}

/**
 * Truncate text to fit within specific dimensions
 *
 * @param text - The text to truncate
 * @param font - PDFFont object
 * @param fontSize - Font size in points
 * @param maxWidth - Maximum width in points
 * @param maxHeight - Maximum height in points
 * @param lineHeight - Line height multiplier (default: 1.2)
 * @returns Truncated text that fits within dimensions
 */
export function truncateTextToFit(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number = 1.2
): string {
  const lineHeightPoints = measureLineHeight(font, fontSize, lineHeight);
  const maxLines = Math.floor(maxHeight / lineHeightPoints);

  const lines = wrapTextWithLimit(text, font, fontSize, maxWidth, maxLines, true);
  return lines.join('\n');
}

/**
 * Format currency for display
 *
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: $)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date range for display
 *
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted date range (e.g., "Dec 20 - Dec 27, 2024")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  } catch (error) {
    // If date parsing fails, return as-is
    return `${startDate} - ${endDate}`;
  }
}

/**
 * Split text into bullet points for lists
 *
 * @param text - Text with line breaks or bullet points
 * @returns Array of bullet point items
 */
export function splitIntoBullets(text: string): string[] {
  // Split by newlines and filter empty lines
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove existing bullet characters if present
      return line.replace(/^[•\-\*]\s*/, '');
    });
}

/**
 * Add bullet points to text lines
 *
 * @param lines - Array of text lines
 * @param bulletChar - Bullet character to use (default: •)
 * @returns Array of lines with bullets prepended
 */
export function addBulletPoints(lines: string[], bulletChar: string = '•'): string[] {
  return lines.map((line) => `${bulletChar} ${line}`);
}

/**
 * Validate text length against character limit
 *
 * @param text - Text to validate
 * @param limit - Character limit
 * @returns True if text is within limit
 */
export function validateTextLength(text: string, limit: number): boolean {
  return text.length <= limit;
}

/**
 * Get remaining characters for a text input
 *
 * @param text - Current text
 * @param limit - Character limit
 * @returns Number of characters remaining
 */
export function getRemainingChars(text: string, limit: number): number {
  return Math.max(0, limit - text.length);
}

/**
 * Calculate percentage of character limit used
 *
 * @param text - Current text
 * @param limit - Character limit
 * @returns Percentage (0-100)
 */
export function getCharLimitPercentage(text: string, limit: number): number {
  return Math.min(100, (text.length / limit) * 100);
}
