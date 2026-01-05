/**
 * Text Renderer for PDF Generation
 *
 * Handles rendering text at specific coordinates on PDF pages with support
 * for wrapping, alignment, and multi-line text.
 */

import { PDFPage, PDFFont, RGB, rgb } from 'pdf-lib';
import { FieldConfig } from '@/lib/types/itinerary';
import {
  wrapText,
  wrapTextWithLimit,
  measureLineHeight,
  measureTextWidth,
} from '@/lib/utils/text-utils';
import { COLORS, LINE_HEIGHTS } from '@/lib/config/pdf-config';

/**
 * Render text at a specific position on the page
 *
 * @param page - PDF page to draw on
 * @param text - Text to render
 * @param config - Field configuration with position and styling
 * @param font - PDF font to use
 * @param color - Text color (default: black)
 * @returns Y position after the last line of text
 */
export function renderText(
  page: PDFPage,
  text: string,
  config: FieldConfig,
  font: PDFFont,
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): number {
  if (!text || text.trim() === '') {
    return config.y;
  }

  const lineHeight = config.lineHeight || LINE_HEIGHTS.normal;
  const lineHeightPoints = measureLineHeight(font, config.fontSize, lineHeight);

  // Wrap text if maxLines is specified
  let lines: string[];
  if (config.maxLines) {
    lines = wrapTextWithLimit(
      text,
      font,
      config.fontSize,
      config.maxWidth,
      config.maxLines,
      true // Add ellipsis if truncated
    );
  } else {
    lines = wrapText(text, font, config.fontSize, config.maxWidth);
  }

  // Render each line
  let currentY = config.y;

  lines.forEach((line, index) => {
    if (!line) {
      // Skip empty lines but still advance Y position
      currentY -= lineHeightPoints;
      return;
    }

    // Calculate X position based on alignment
    let xPosition = config.x;
    if (config.alignment === 'center') {
      const textWidth = measureTextWidth(line, font, config.fontSize);
      xPosition = config.x - textWidth / 2;
    } else if (config.alignment === 'right') {
      const textWidth = measureTextWidth(line, font, config.fontSize);
      xPosition = config.x - textWidth;
    }

    // Draw the text
    page.drawText(line, {
      x: xPosition,
      y: currentY,
      size: config.fontSize,
      font: font,
      color: color,
    });

    // Move Y position down for next line
    currentY -= lineHeightPoints;
  });

  // Return Y position after last line
  return currentY;
}

/**
 * Render multi-line text with automatic wrapping
 *
 * @param page - PDF page to draw on
 * @param text - Text to render (may contain line breaks)
 * @param config - Field configuration
 * @param font - PDF font
 * @param color - Text color
 * @returns Y position after the last line
 */
export function renderMultiLineText(
  page: PDFPage,
  text: string,
  config: FieldConfig,
  font: PDFFont,
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): number {
  return renderText(page, text, config, font, color);
}

/**
 * Render a label and value pair (e.g., "Client Name: John Doe")
 *
 * @param page - PDF page to draw on
 * @param label - Label text (e.g., "Client Name:")
 * @param value - Value text (e.g., "John Doe")
 * @param labelConfig - Configuration for label
 * @param valueConfig - Configuration for value
 * @param labelFont - Font for label (usually bold)
 * @param valueFont - Font for value (usually regular)
 * @param color - Text color
 * @returns Y position after rendering
 */
export function renderLabelValuePair(
  page: PDFPage,
  label: string,
  value: string,
  labelConfig: FieldConfig,
  valueConfig: FieldConfig,
  labelFont: PDFFont,
  valueFont: PDFFont,
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): number {
  // Render label
  renderText(page, label, labelConfig, labelFont, color);

  // Render value (return its final Y position)
  return renderText(page, value, valueConfig, valueFont, color);
}

/**
 * Render a bullet list
 *
 * @param page - PDF page to draw on
 * @param items - Array of items to render as bullets
 * @param config - Field configuration
 * @param font - PDF font
 * @param bulletChar - Bullet character (default: •)
 * @param color - Text color
 * @returns Y position after the last item
 */
export function renderBulletList(
  page: PDFPage,
  items: string[],
  config: FieldConfig,
  font: PDFFont,
  bulletChar: string = '•',
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): number {
  if (!items || items.length === 0) {
    return config.y;
  }

  const lineHeight = config.lineHeight || LINE_HEIGHTS.normal;
  const lineHeightPoints = measureLineHeight(font, config.fontSize, lineHeight);
  const bulletWidth = measureTextWidth(bulletChar + ' ', font, config.fontSize);

  let currentY = config.y;

  items.forEach((item) => {
    if (!item || item.trim() === '') {
      return;
    }

    // Draw bullet
    page.drawText(bulletChar, {
      x: config.x,
      y: currentY,
      size: config.fontSize,
      font: font,
      color: color,
    });

    // Wrap item text (adjusted for bullet indentation)
    const itemConfig: FieldConfig = {
      ...config,
      x: config.x + bulletWidth,
      maxWidth: config.maxWidth - bulletWidth,
      y: currentY,
    };

    currentY = renderText(page, item, itemConfig, font, color);

    // Add small spacing between items
    currentY -= lineHeightPoints * 0.2;
  });

  return currentY;
}

/**
 * Calculate the total height needed for text rendering
 * (useful for multi-page calculations)
 *
 * @param text - Text to measure
 * @param config - Field configuration
 * @param font - PDF font
 * @returns Height in points
 */
export function calculateRenderedTextHeight(
  text: string,
  config: FieldConfig,
  font: PDFFont
): number {
  if (!text || text.trim() === '') {
    return 0;
  }

  const lineHeight = config.lineHeight || LINE_HEIGHTS.normal;
  const lineHeightPoints = measureLineHeight(font, config.fontSize, lineHeight);

  let lines: string[];
  if (config.maxLines) {
    lines = wrapTextWithLimit(
      text,
      font,
      config.fontSize,
      config.maxWidth,
      config.maxLines,
      false
    );
  } else {
    lines = wrapText(text, font, config.fontSize, config.maxWidth);
  }

  return lines.length * lineHeightPoints;
}

/**
 * Render centered title text
 *
 * @param page - PDF page to draw on
 * @param title - Title text
 * @param y - Y position
 * @param font - PDF font
 * @param fontSize - Font size
 * @param pageWidth - Page width for centering
 * @param color - Text color
 */
export function renderCenteredTitle(
  page: PDFPage,
  title: string,
  y: number,
  font: PDFFont,
  fontSize: number,
  pageWidth: number,
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): void {
  const textWidth = measureTextWidth(title, font, fontSize);
  const x = (pageWidth - textWidth) / 2;

  page.drawText(title, {
    x,
    y,
    size: fontSize,
    font: font,
    color: color,
  });
}

/**
 * Render right-aligned text
 *
 * @param page - PDF page to draw on
 * @param text - Text to render
 * @param x - Right edge X position
 * @param y - Y position
 * @param font - PDF font
 * @param fontSize - Font size
 * @param color - Text color
 */
export function renderRightAlignedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  color: RGB = rgb(COLORS.black.r, COLORS.black.g, COLORS.black.b)
): void {
  const textWidth = measureTextWidth(text, font, fontSize);
  const xPosition = x - textWidth;

  page.drawText(text, {
    x: xPosition,
    y,
    size: fontSize,
    font: font,
    color: color,
  });
}
