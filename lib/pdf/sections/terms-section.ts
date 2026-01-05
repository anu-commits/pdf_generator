/**
 * Terms & Conditions Section Renderer
 *
 * Renders terms and conditions as a bullet list
 */

import { PDFPage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_COLORS, LUXURY_SPACING } from '../../config/luxury-design-config';
import { drawBulletList } from '../layout-primitives';

export interface TermsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  terms: string[];
}

/**
 * Render terms and conditions section
 * Returns the Y position after rendering
 */
export function renderTermsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: TermsSectionOptions
): number {
  const { startX, startY, maxWidth, terms } = options;

  let currentY = startY;

  // Draw "Terms and Conditions" header in gold (matching Figma design - serif font, larger size)
  page.drawText('Terms and Conditions', {
    x: startX,
    y: currentY,
    size: 36,
    font: fonts.heading, // Times New Roman from Figma
    color: LUXURY_COLORS.gold
  });

  currentY -= 70; // Space between header and first bullet (matching Figma)

  // Draw bullet list
  if (terms.length > 0) {
    currentY = drawBulletList(
      page,
      terms,
      startX,
      currentY,
      maxWidth,
      fonts.body,
      12, // 12px from Figma
      {
        bulletColor: LUXURY_COLORS.gold, // Golden brown bullets
        textColor: LUXURY_COLORS.textDark,
        bulletSize: 8, // Larger bullets to match design
        bulletIndent: 30, // 30px indent from bullet to text
        lineHeight: 1.64, // Line height from Figma
        itemSpacing: 18 // Spacing between items
      }
    );
  } else {
    // No terms
    page.drawText('No terms and conditions specified', {
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
