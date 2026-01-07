/**
 * Exclusions Section Renderer
 *
 * Renders the exclusions list with bullet points
 */

import { PDFPage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_COLORS, LUXURY_SPACING } from '../../config/luxury-design-config';
import { drawBulletList } from '../layout-primitives';

export interface ExclusionsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  exclusions: string[];
  textColor?: any;
}

/**
 * Render exclusions section
 * Returns the Y position after rendering
 */
export function renderExclusionsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: ExclusionsSectionOptions
): number {
  const { startX, startY, maxWidth, exclusions, textColor = LUXURY_COLORS.textDark } = options;

  let currentY = startY;

  // Draw "Exclusions" header in gold (matching Figma design - serif font, larger size)
  page.drawText('Exclusions', {
    x: startX,
    y: currentY,
    size: 36,
    font: fonts.heading, // Times New Roman from Figma
    color: LUXURY_COLORS.gold
  });

  currentY -= 70; // Space between header and first bullet (matching Figma)

  // Draw bullet list
  if (exclusions.length > 0) {
    currentY = drawBulletList(
      page,
      exclusions,
      startX,
      currentY,
      maxWidth,
      fonts.body,
      12, // 12px from Figma
      {
        bulletColor: LUXURY_COLORS.gold, // Golden brown bullets
        textColor: textColor,
        bulletSize: 8, // Larger bullets to match design
        bulletIndent: 30, // 30px indent from bullet to text
        lineHeight: 1.64, // Line height from Figma
        itemSpacing: 18 // Spacing between items
      }
    );
  } else {
    // No exclusions
    page.drawText('No exclusions specified', {
      x: startX + 30,
      y: currentY,
      size: 12,
      font: fonts.bodyItalic,
      color: LUXURY_COLORS.textMuted
    });
    currentY -= 20;
  }

  // Add bottom spacing
  currentY -= LUXURY_SPACING.sectionGap;

  return currentY;
}
