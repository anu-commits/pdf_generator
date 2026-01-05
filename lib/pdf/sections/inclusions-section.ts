/**
 * Inclusions Section Renderer
 *
 * Renders the inclusions list with gold bullet points
 */

import { PDFPage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_COLORS, LUXURY_FONT_SIZES, LUXURY_SPACING } from '../../config/luxury-design-config';
import { drawBulletList } from '../layout-primitives';

export interface InclusionsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  inclusions: string[];
}

/**
 * Render inclusions section
 * Returns the Y position after rendering
 */
export function renderInclusionsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: InclusionsSectionOptions
): number {
  const { startX, startY, maxWidth, inclusions } = options;

  let currentY = startY;

  // Draw "Inclusions" header in gold (matching Figma design - serif font, larger size)
  page.drawText('Inclusions', {
    x: startX,
    y: currentY,
    size: 36,
    font: fonts.heading, // Times New Roman from Figma
    color: LUXURY_COLORS.gold
  });

  // Add spacing after header
  currentY -= 60;

  // Draw bullet list
  if (inclusions.length > 0) {
    currentY = drawBulletList(
      page,
      inclusions,
      startX + 20,
      currentY,
      maxWidth - 40,
      fonts.body,
      LUXURY_FONT_SIZES.body,
      {
        bulletColor: LUXURY_COLORS.gold,
        textColor: LUXURY_COLORS.textDark,
        bulletSize: 6,
        bulletIndent: 15,
        lineHeight: 1.5,
        itemSpacing: 10
      }
    );
  } else {
    // No inclusions
    page.drawText('No inclusions specified', {
      x: startX + 20,
      y: currentY,
      size: LUXURY_FONT_SIZES.body,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
    currentY -= LUXURY_FONT_SIZES.body * 1.5;
  }

  // Add bottom spacing
  currentY -= LUXURY_SPACING.sectionGap;

  return currentY;
}
