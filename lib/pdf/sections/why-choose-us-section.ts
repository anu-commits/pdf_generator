/**
 * Why Choose Us Section Renderer
 *
 * Renders the why choose us page with logo, heading, 4 feature boxes, quote, and trust message
 */

import { PDFPage, rgb } from 'pdf-lib';
import { FontFamily } from '../font-loader';
import { LUXURY_COLORS } from '../../config/luxury-design-config';
import { drawWrappedText } from '../layout-primitives';

export interface WhyChooseUsSectionOptions {
  startX: number;
  startY: number;
  maxWidth: number;
  companyName: string;
}

/**
 * Render why choose us section with full page design
 * Returns the Y position after rendering
 */
export function renderWhyChooseUsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: WhyChooseUsSectionOptions
): number {
  const { startX, startY, maxWidth, companyName } = options;
  const { width } = page.getSize();

  let currentY = startY;

  // Main heading: "Why Choose The Luxe Trails"
  const mainHeading = `Why Choose ${companyName}`;
  const headingWidth = fonts.headingBold.widthOfTextAtSize(mainHeading, 24);
  page.drawText(mainHeading, {
    x: (width - headingWidth) / 2,
    y: currentY,
    size: 24,
    font: fonts.headingBold,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 35;

  // Subheading
  const subheading1 = 'Defining the Art of Bespoke Journeys.';
  const sub1Width = fonts.body.widthOfTextAtSize(subheading1, 10);
  page.drawText(subheading1, {
    x: (width - sub1Width) / 2,
    y: currentY,
    size: 10,
    font: fonts.body,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 15;

  const subheading2 = 'Why discerning travelers trust us to curate their world.';
  const sub2Width = fonts.body.widthOfTextAtSize(subheading2, 10);
  page.drawText(subheading2, {
    x: (width - sub2Width) / 2,
    y: currentY,
    size: 10,
    font: fonts.body,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 50;

  // Four feature boxes
  const boxWidth = 120;
  const boxSpacing = 10;
  const totalBoxesWidth = (boxWidth * 4) + (boxSpacing * 3);
  const boxStartX = (width - totalBoxesWidth) / 2;

  const features = [
    {
      icon: '',
      title: 'BEYOND THE',
      title2: 'ITINERARY:',
      title3: 'A NARRATIVE.',
      description: 'Every element of this journey is carefully curated to match your pace and purpose. This is your story, ghostwritten by us.'
    },
    {
      icon: '',
      title: 'UNPARALLELED',
      title2: 'ACCESS.',
      title3: '',
      description: 'We leverage global connections to unlock exclusive experiences, from after-hours private tours to "untouchable" dining.'
    },
    {
      icon: '',
      title: 'THE LUXURY OF',
      title2: 'EFFORTLESSNESS.',
      title3: '',
      description: 'We obsessively manage logistics behind the scenes, the friction of travel. Your only responsibility is being present.'
    },
    {
      icon: '',
      title: '24/7 GLOBAL',
      title2: 'CONCIERGE.',
      title3: '',
      description: 'Our dedicated team continually monitors your journey, ready to facilitate seamless adjustments at a moment\'s notice.'
    }
  ];

  features.forEach((feature, index) => {
    const boxX = boxStartX + (index * (boxWidth + boxSpacing));

    // Draw icon circle
    const iconY = currentY - 20;
    page.drawCircle({
      x: boxX + boxWidth / 2,
      y: iconY,
      size: 20,
      borderColor: LUXURY_COLORS.gold,
      borderWidth: 1
    });

    // Draw title lines
    let titleY = currentY - 55;
    const titleSize = 8;

    const title1Width = fonts.bodyBold.widthOfTextAtSize(feature.title, titleSize);
    page.drawText(feature.title, {
      x: boxX + (boxWidth - title1Width) / 2,
      y: titleY,
      size: titleSize,
      font: fonts.bodyBold,
      color: LUXURY_COLORS.textDark
    });

    if (feature.title2) {
      titleY -= 10;
      const title2Width = fonts.bodyBold.widthOfTextAtSize(feature.title2, titleSize);
      page.drawText(feature.title2, {
        x: boxX + (boxWidth - title2Width) / 2,
        y: titleY,
        size: titleSize,
        font: fonts.bodyBold,
        color: LUXURY_COLORS.textDark
      });
    }

    if (feature.title3) {
      titleY -= 10;
      const title3Width = fonts.bodyBold.widthOfTextAtSize(feature.title3, titleSize);
      page.drawText(feature.title3, {
        x: boxX + (boxWidth - title3Width) / 2,
        y: titleY,
        size: titleSize,
        font: fonts.bodyBold,
        color: LUXURY_COLORS.textDark
      });
    }

    // Draw description text (wrapped)
    drawWrappedText(
      page,
      feature.description,
      boxX + 5,
      currentY - 90,
      boxWidth - 10,
      fonts.body,
      7,
      {
        color: LUXURY_COLORS.textDark,
        lineHeight: 1.4,
        align: 'center'
      }
    );
  });

  currentY -= 200;

  // Quote
  const quote = '"Luxury is attention to detail, originality, exclusivity,';
  const quote2 = 'and above all, quality."';

  const quoteWidth = fonts.body.widthOfTextAtSize(quote, 10);
  page.drawText(quote, {
    x: (width - quoteWidth) / 2,
    y: currentY,
    size: 10,
    font: fonts.body,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 15;

  const quote2Width = fonts.body.widthOfTextAtSize(quote2, 10);
  page.drawText(quote2, {
    x: (width - quote2Width) / 2,
    y: currentY,
    size: 10,
    font: fonts.body,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 40;

  // Trust message
  const trustMsg = 'YOUR JOURNEY BEGINS WITH TRUST. WE LOOK';
  const trustMsg2 = 'FORWARD TO EXCEEDING YOUR EXPECTATIONS.';

  const trust1Width = fonts.bodyBold.widthOfTextAtSize(trustMsg, 11);
  page.drawText(trustMsg, {
    x: (width - trust1Width) / 2,
    y: currentY,
    size: 11,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 15;

  const trust2Width = fonts.bodyBold.widthOfTextAtSize(trustMsg2, 11);
  page.drawText(trustMsg2, {
    x: (width - trust2Width) / 2,
    y: currentY,
    size: 11,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.textDark
  });

  currentY -= 30;

  return currentY;
}
