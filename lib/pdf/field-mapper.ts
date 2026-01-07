/**
 * Field Mapper - Redesigned for New 7-Page Layout
 *
 * Orchestrates the complete luxury PDF generation process matching the exact design:
 * Page 1: Hero + Why Choose Us
 * Page 2: Basic Details + Tour Highlights
 * Pages 3-4: Itinerary (2-column layout)
 * Page 5: Our Stays
 * Page 6: Flights + Inclusions
 * Page 7: Exclusions + Terms
 * Page 8: Pricing + Bank Details
 */

import { PDFDocument, PDFPage, PDFImage, rgb } from 'pdf-lib';
import { ItineraryData } from '../types/itinerary';
import { LUXURY_COLORS, LUXURY_LAYOUT, LUXURY_FONT_SIZES } from '../config/luxury-design-config';
import { loadFonts, FontFamily } from './font-loader';
import { embedImageInPDF } from '../utils/image-utils';
import { drawPageBackground } from './layout-primitives';

// Section renderers
import { renderHeroSection } from './sections/hero-section';
import { renderBasicDetailsSection } from './sections/basic-details-section';
import { renderTourHighlightsSection } from './sections/tour-highlights-section';
import { renderWhyChooseUsSection } from './sections/why-choose-us-section';
import { renderItinerarySection, renderItineraryDay } from './sections/itinerary-section';
import { renderFlightsSection } from './sections/flights-section';
import { renderStaysSection } from './sections/stays-section';
import { renderInclusionsSection } from './sections/inclusions-section';
import { renderExclusionsSection } from './sections/exclusions-section';
import { renderPricingSection } from './sections/pricing-section';
import { renderBankDetailsSection } from './sections/bank-details-section';
import { renderTermsSection } from './sections/terms-section';

/**
 * Generate complete luxury PDF document from itinerary data
 *
 * @param data - Itinerary data with images
 * @param darkMode - Whether to use dark mode background (default: true)
 * @returns PDF document bytes
 */
export async function generateItineraryPDF(data: ItineraryData, darkMode: boolean = true): Promise<Uint8Array> {
  try {
    // Initialize PDF document
    const pdfDoc = await PDFDocument.create();

    // Load fonts
    const fonts = await loadFonts(pdfDoc);

    // Embed all images (hero, day images, hotel images)
    const { heroImage, dayImages, hotelImages } = await embedAllImages(pdfDoc, data);

    // Set background color based on dark mode
    const backgroundColor = darkMode ? LUXURY_COLORS.darkBackground : LUXURY_COLORS.white;
    // Set text color based on dark mode
    const textColor = darkMode ? LUXURY_COLORS.white : LUXURY_COLORS.textDark;

    const startX = LUXURY_LAYOUT.content.startX;
    const maxWidth = LUXURY_LAYOUT.content.width;
    let currentY: number;

    // ====== PAGE 1: Full-Page Hero Image ======
    const page1 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    // Draw background (will be covered by hero image if provided)
    drawPageBackground(page1, backgroundColor);

    // Render full-page hero image
    renderHeroSection(page1, fonts, {
      heroImage
    });

    // ====== PAGE 2: Why Choose Us (Full Page) ======
    const page2 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(page2, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Render Why Choose Us full page design
    currentY = renderWhyChooseUsSection(page2, fonts, {
      startX,
      startY: currentY,
      maxWidth,
      companyName: data.companyName || 'The Luxe Trails'
    });

    // ====== PAGE 3: Basic Details + Tour Highlights ======
    const page3 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(page3, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Render Basic Details
    if (data.basicDetails) {
      currentY = renderBasicDetailsSection(page3, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        basicDetails: data.basicDetails,
        textColor
      });
    }

    // Render Tour Highlights
    if (data.tourHighlights && data.tourHighlights.length > 0) {
      currentY = renderTourHighlightsSection(page3, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        highlights: data.tourHighlights,
        textColor
      });
    }

    // ====== PAGES 4+: Itinerary (multiple days per page) ======
    let itineraryPage = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(itineraryPage, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Draw "Itinerary" heading on first itinerary page
    itineraryPage.drawText('Itinerary', {
      x: startX,
      y: currentY,
      size: 22,
      font: fonts.headingBold,
      color: LUXURY_COLORS.gold
    });

    currentY -= 40;

    // Track vertical line state across pages
    const verticalLineX = startX + 10; // X position of the vertical line (gold bar left edge)
    let firstGoldBarYOnPage: number | null = null;
    let pageStartY = currentY; // Track where content starts on each page
    let isFirstPage = true;

    // Render each day, creating new pages as needed
    for (let i = 0; i < data.days.length; i++) {
      const day = data.days[i];
      const isLastDay = i === data.days.length - 1;

      // Estimate space needed for this day (gold bar + title + description + image + hotel + spacing)
      const estimatedHeight = 300;

      // Check if we need a new page
      if (currentY - estimatedHeight < LUXURY_LAYOUT.pageMarginBottom) {
        // Draw vertical line to bottom of current page
        if (firstGoldBarYOnPage !== null) {
          itineraryPage.drawLine({
            start: { x: verticalLineX, y: firstGoldBarYOnPage },
            end: { x: verticalLineX, y: LUXURY_LAYOUT.pageMarginBottom },
            thickness: 1,
            color: LUXURY_COLORS.gold
          });
        }

        // Create new page
        itineraryPage = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
        drawPageBackground(itineraryPage, backgroundColor);
        currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

        // Draw "Itinerary" heading on new page
        itineraryPage.drawText('Itinerary', {
          x: startX,
          y: currentY,
          size: 22,
          font: fonts.headingBold,
          color: LUXURY_COLORS.gold
        });

        currentY -= 40;
        pageStartY = currentY;
        firstGoldBarYOnPage = null;
        isFirstPage = false;
      }

      // Render this day on current page
      const dayImage = dayImages.get(day.dayNumber);
      const result = renderItineraryDay(
        itineraryPage,
        fonts,
        day,
        dayImage,
        startX,
        currentY,
        maxWidth,
        false, // Don't draw individual vertical lines
        isLastDay,
        textColor
      );

      // Capture first gold bar position on this page
      if (firstGoldBarYOnPage === null) {
        firstGoldBarYOnPage = result.goldBarY;

        // If this is a continuation page, connect line from top to first gold bar
        if (!isFirstPage) {
          itineraryPage.drawLine({
            start: { x: verticalLineX, y: pageStartY },
            end: { x: verticalLineX, y: firstGoldBarYOnPage },
            thickness: 1,
            color: LUXURY_COLORS.gold
          });
        }
      }

      currentY = result.currentY;
    }

    // Draw final vertical line segment on last page
    if (firstGoldBarYOnPage !== null) {
      itineraryPage.drawLine({
        start: { x: verticalLineX, y: firstGoldBarYOnPage },
        end: { x: verticalLineX, y: currentY + 35 },
        thickness: 1,
        color: LUXURY_COLORS.gold
      });
    }

    // ====== PAGE 5: Our Stays ======
    if (data.hotels && data.hotels.length > 0) {
      const page5 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
      drawPageBackground(page5, backgroundColor);

      currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

      currentY = renderStaysSection(page5, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        hotels: data.hotels,
        hotelImages
      });
    }

    // ====== PAGE 6: Flights + Inclusions ======
    const page6 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(page6, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Render Flights (single column)
    if (data.flights && data.flights.length > 0) {
      currentY = renderFlightsSection(page6, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        flights: data.flights
      });
    }

    // Add spacing between Flights and Inclusions
    currentY -= 30;

    // Render Inclusions (single column)
    if (data.inclusions && data.inclusions.length > 0) {
      currentY = renderInclusionsSection(page6, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        inclusions: data.inclusions,
        textColor
      });
    }

    // ====== PAGE 7: Exclusions + Terms ======
    const page7 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(page7, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Render Exclusions (single column)
    if (data.exclusions && data.exclusions.length > 0) {
      currentY = renderExclusionsSection(page7, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        exclusions: data.exclusions,
        textColor
      });
    }

    // Add spacing between Exclusions and Terms
    currentY -= 30;

    // Convert TermsConditions object to array of strings for bullet list
    const termsArray: string[] = [];
    if (data.terms?.cancellationPolicy?.trim()) {
      termsArray.push(`Cancellation Policy: ${data.terms.cancellationPolicy.trim()}`);
    }
    if (data.terms?.paymentTerms?.trim()) {
      termsArray.push(`Payment Terms: ${data.terms.paymentTerms.trim()}`);
    }
    if (data.terms?.travelInsurance?.trim()) {
      termsArray.push(`Travel Insurance: ${data.terms.travelInsurance.trim()}`);
    }
    if (data.terms?.liabilityDisclaimer?.trim()) {
      termsArray.push(`Liability Disclaimer: ${data.terms.liabilityDisclaimer.trim()}`);
    }

    // Render terms section (will show "not specified" if array is empty)
    currentY = renderTermsSection(page7, fonts, {
      startX,
      startY: currentY,
      maxWidth,
      terms: termsArray,
      textColor
    });

    // ====== PAGE 8: Pricing + Bank Details ======
    const page8 = pdfDoc.addPage([LUXURY_LAYOUT.page.width, LUXURY_LAYOUT.page.height]);
    drawPageBackground(page8, backgroundColor);

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop;

    // Render Pricing
    currentY = renderPricingSection(page8, fonts, {
      startX,
      startY: currentY,
      pricing: data.pricing,
      textColor
    });

    currentY -= 40;

    // Render Bank Details (if exists)
    const hasBankDetails =
      data.bankDetails?.accountName?.trim() ||
      data.bankDetails?.accountNumber?.trim() ||
      data.bankDetails?.bankName?.trim() ||
      data.bankDetails?.swiftCode?.trim();

    if (hasBankDetails) {
      currentY = renderBankDetailsSection(page8, fonts, {
        startX,
        startY: currentY,
        bankDetails: data.bankDetails,
        textColor
      });
    }

    // Add footer with company name and CTA
    renderFooterCTA(page8, fonts, data.companyName || 'THE LUXE TRAILS', 80);

    // Add footer to all pages
    addFooterToAllPages(pdfDoc, fonts, data.contactInfo, data.companyName);

    // Serialize and return
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Embed all images from the itinerary data
 */
async function embedAllImages(
  pdfDoc: PDFDocument,
  data: ItineraryData
): Promise<{
  heroImage?: PDFImage;
  dayImages: Map<number, PDFImage>;
  hotelImages: Map<number, PDFImage[]>;
}> {
  let heroImage: PDFImage | undefined = undefined;
  const dayImages = new Map<number, PDFImage>();
  const hotelImages = new Map<number, PDFImage[]>();

  // Embed hero image
  if (data.heroImage) {
    try {
      heroImage = await embedImageInPDF(pdfDoc, data.heroImage);
    } catch (error) {
      console.error('Failed to embed hero image:', error);
    }
  }

  // Embed day images
  for (const day of data.days) {
    if (day.image) {
      try {
        const pdfImage = await embedImageInPDF(pdfDoc, day.image);
        dayImages.set(day.dayNumber, pdfImage);
      } catch (error) {
        console.error(`Failed to embed image for day ${day.dayNumber}:`, error);
      }
    }
  }

  // Embed hotel images
  if (data.hotels) {
    for (let i = 0; i < data.hotels.length; i++) {
      const hotel = data.hotels[i];
      const embedImages: PDFImage[] = [];

      for (const imageData of hotel.images) {
        try {
          const pdfImage = await embedImageInPDF(pdfDoc, imageData);
          embedImages.push(pdfImage);
        } catch (error) {
          console.error(`Failed to embed image for hotel ${i}:`, error);
        }
      }

      if (embedImages.length > 0) {
        hotelImages.set(i, embedImages);
      }
    }
  }

  return { heroImage, dayImages, hotelImages };
}

/**
 * Render footer CTA section on last page
 */
function renderFooterCTA(
  page: PDFPage,
  fonts: FontFamily,
  companyName: string,
  yPosition: number
): void {
  const { width } = page.getSize();

  // Draw company name/logo on left
  page.drawText(companyName, {
    x: LUXURY_LAYOUT.pageMargin,
    y: yPosition,
    size: 12,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.gold
  });

  // Draw "Ready to get started?" in center
  const ctaText = 'Ready to get started?';
  const ctaWidth = fonts.body.widthOfTextAtSize(ctaText, 11);
  page.drawText(ctaText, {
    x: (width - ctaWidth) / 2,
    y: yPosition,
    size: 11,
    font: fonts.body,
    color: LUXURY_COLORS.textDark
  });

  // Draw button on right
  const buttonWidth = 80;
  const buttonHeight = 25;
  const buttonX = width - LUXURY_LAYOUT.pageMargin - buttonWidth;

  page.drawRectangle({
    x: buttonX,
    y: yPosition - 8,
    width: buttonWidth,
    height: buttonHeight,
    color: LUXURY_COLORS.gold
  });

  const buttonText = 'Contact Us';
  const buttonTextWidth = fonts.bodyBold.widthOfTextAtSize(buttonText, 10);
  page.drawText(buttonText, {
    x: buttonX + (buttonWidth - buttonTextWidth) / 2,
    y: yPosition,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.white
  });
}

/**
 * Add footer to all pages (except page 1 which is full-page hero)
 */
function addFooterToAllPages(
  pdfDoc: PDFDocument,
  fonts: FontFamily,
  contactInfo: string,
  companyName?: string
): void {
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    // Skip page 1 (hero page - index 0)
    if (index === 0) {
      return;
    }

    const { width } = page.getSize();
    const footerY = 30;

    // Page number (right)
    const pageNumber = `Page ${index + 1} of ${pages.length}`;
    const pageNumWidth = fonts.body.widthOfTextAtSize(pageNumber, LUXURY_FONT_SIZES.footer);
    page.drawText(pageNumber, {
      x: width - LUXURY_LAYOUT.pageMargin - pageNumWidth,
      y: footerY,
      size: LUXURY_FONT_SIZES.footer,
      font: fonts.body,
      color: LUXURY_COLORS.textMuted
    });

    // Company name (center)
    if (companyName) {
      const companyWidth = fonts.bodyBold.widthOfTextAtSize(companyName, LUXURY_FONT_SIZES.footer);
      page.drawText(companyName, {
        x: (width - companyWidth) / 2,
        y: footerY,
        size: LUXURY_FONT_SIZES.footer,
        font: fonts.bodyBold,
        color: LUXURY_COLORS.gold
      });
    }
  });
}
