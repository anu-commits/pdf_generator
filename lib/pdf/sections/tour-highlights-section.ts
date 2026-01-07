/**
 * Tour Highlights Section Renderer
 *
 * Renders the tour highlights list with gold bullet points
 */

import { PDFPage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_COLORS, LUXURY_FONT_SIZES } from '../../config/luxury-design-config';
import { drawBulletList } from '../layout-primitives';

export interface TourHighlightsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  highlights: string[];
  textColor?: any;
}

/**
 * Render tour highlights section
 * Returns the Y position after rendering
 */
export function renderTourHighlightsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: TourHighlightsSectionOptions
): number {
  const { startX, startY, maxWidth, highlights, textColor = LUXURY_COLORS.textDark } = options;

  let currentY = startY;

  // Draw "Tour Highlights" header in gold
  page.drawText('Tour Highlights', {
    x: startX,
    y: currentY,
    size: 22,
    font: fonts.headingBold,
    color: LUXURY_COLORS.gold
  });

  currentY -= 40;

  // Draw bullet list
  if (highlights.length > 0) {
    currentY = drawBulletList(
      page,
      highlights,
      startX + 20,
      currentY,
      maxWidth - 40,
      fonts.body,
      LUXURY_FONT_SIZES.body,
      {
        bulletColor: LUXURY_COLORS.gold,
        textColor: textColor,
        bulletSize: 6,
        bulletIndent: 15,
        lineHeight: 1.5,
        itemSpacing: 10
      }
    );
  } else {
    page.drawText('No tour highlights specified', {
      x: startX + 20,
      y: currentY,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
    currentY -= LUXURY_FONT_SIZES.body * 1.5;
  }

  currentY -= 30;

  return currentY;
}
