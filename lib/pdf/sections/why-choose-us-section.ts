/**
 * Why Choose Us Section Renderer
 *
 * Renders a hardcoded full-page Why Choose Us image
 */

import { PDFPage, PDFImage } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_LAYOUT } from '../../config/luxury-design-config';

export interface WhyChooseUsSectionOptions {
  whyChooseUsImage?: PDFImage;
}

/**
 * Render why choose us page with hardcoded full-page image
 * Returns the Y position after rendering (0 since this is full-page)
 */
export function renderWhyChooseUsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: WhyChooseUsSectionOptions
): number {
  const { whyChooseUsImage } = options;

  const pageWidth = LUXURY_LAYOUT.page.width;
  const pageHeight = LUXURY_LAYOUT.page.height;

  // If a hardcoded image is provided, render it full-page
  if (whyChooseUsImage) {
    const imgDims = whyChooseUsImage.scale(1);
    const scale = Math.max(
      pageWidth / imgDims.width,
      pageHeight / imgDims.height
    );

    const scaledWidth = imgDims.width * scale;
    const scaledHeight = imgDims.height * scale;

    // Center image on page
    const imageX = (pageWidth - scaledWidth) / 2;
    const imageY = (pageHeight - scaledHeight) / 2;

    page.drawImage(whyChooseUsImage, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight,
    });
  } else {
    // If no image provided, render a placeholder message
    const placeholderText = 'Why Choose Us page - Hardcoded image not yet provided';
    const textWidth = fonts.body.widthOfTextAtSize(placeholderText, 14);

    page.drawText(placeholderText, {
      x: (pageWidth - textWidth) / 2,
      y: pageHeight / 2,
      size: 14,
      font: fonts.body,
      color: { red: 0.5, green: 0.5, blue: 0.5 },
    });
  }

  // Return 0 since this is a full-page design
  return 0;
}
