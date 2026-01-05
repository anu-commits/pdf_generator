/**
 * Hero Section Renderer
 *
 * Renders full-page hero image for the cover page
 */

import { PDFPage, PDFImage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_LAYOUT } from '../../config/luxury-design-config';

export interface HeroSectionOptions {
  heroImage?: PDFImage;
}

/**
 * Render hero image filling the entire page
 * Returns the Y position after rendering (not used for full page)
 */
export function renderHeroSection(
  page: PDFPage,
  fonts: FontFamily,
  options: HeroSectionOptions
): number {
  const { heroImage } = options;

  // Draw hero image filling entire page if provided
  if (heroImage) {
    const pageWidth = LUXURY_LAYOUT.page.width;
    const pageHeight = LUXURY_LAYOUT.page.height;

    // Calculate aspect ratio to fill entire page while maintaining aspect ratio
    const imgDims = heroImage.scale(1);
    const scale = Math.max(
      pageWidth / imgDims.width,
      pageHeight / imgDims.height
    );

    const scaledWidth = imgDims.width * scale;
    const scaledHeight = imgDims.height * scale;

    // Center image on page
    const imageX = (pageWidth - scaledWidth) / 2;
    const imageY = (pageHeight - scaledHeight) / 2;

    page.drawImage(heroImage, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight
    });
  }

  // Return 0 since this is a full-page image
  return 0;
}
