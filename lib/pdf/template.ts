/**
 * PDF Template Builder
 *
 * Creates the fixed visual structure and layout for travel itinerary PDFs.
 * This includes borders, section dividers, boxes, and other visual elements.
 */

import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import {
  PDF_CONFIG,
  COLORS,
  STYLES,
  SECTION_HEIGHTS,
  ITINERARY_CONFIG,
} from '@/lib/config/pdf-config';

/**
 * Initialize a new PDF document with fonts
 *
 * @returns PDF document with embedded fonts
 */
export async function initializePDFDocument(): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();

  // Embed standard fonts (no external files needed)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  return pdfDoc;
}

/**
 * Create a new page with the base template structure
 *
 * @param pdfDoc - PDF document
 * @param pageNumber - Page number for display
 * @param totalPages - Total number of pages
 * @param isFirstPage - Whether this is the first page
 * @returns PDF page
 */
export function createTemplatePage(
  pdfDoc: PDFDocument,
  pageNumber: number,
  totalPages: number,
  isFirstPage: boolean = true
): PDFPage {
  const page = pdfDoc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight]);

  // Draw page border
  drawPageBorder(page);

  // Draw header section
  drawHeaderSection(page, isFirstPage);

  // For first page, draw all fixed sections
  if (isFirstPage) {
    // We'll draw other sections dynamically based on content
  } else {
    // For continuation pages, just draw a simple header
    drawContinuationHeader(page);
  }

  // Draw footer section
  drawFooterSection(page, pageNumber, totalPages);

  return page;
}

/**
 * Draw outer page border
 *
 * @param page - PDF page
 */
function drawPageBorder(page: PDFPage): void {
  const { pageWidth, pageHeight, marginLeft, marginRight, marginTop, marginBottom } =
    PDF_CONFIG;

  // Draw outer border rectangle
  page.drawRectangle({
    x: marginLeft,
    y: marginBottom,
    width: pageWidth - marginLeft - marginRight,
    height: pageHeight - marginTop - marginBottom,
    borderColor: rgb(COLORS.darkGray.r, COLORS.darkGray.g, COLORS.darkGray.b),
    borderWidth: STYLES.borderWidth,
  });
}

/**
 * Draw header section with title area
 *
 * @param page - PDF page
 * @param isFirstPage - Whether this is the first page
 */
function drawHeaderSection(page: PDFPage, isFirstPage: boolean): void {
  const { marginLeft, marginRight, pageHeight } = PDF_CONFIG;
  const headerTop = pageHeight - PDF_CONFIG.marginTop;
  const headerBottom = headerTop - SECTION_HEIGHTS.header;

  // Draw horizontal line below header
  page.drawLine({
    start: { x: marginLeft, y: headerBottom },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: headerBottom },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Logo placeholder box (only on first page)
  if (isFirstPage) {
    page.drawRectangle({
      x: marginLeft + 10,
      y: headerBottom + 15,
      width: 100,
      height: 50,
      borderColor: rgb(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b),
      borderWidth: STYLES.sectionBorderWidth,
    });
  }
}

/**
 * Draw continuation header for pages 2+
 *
 * @param page - PDF page
 */
function drawContinuationHeader(page: PDFPage): void {
  // Simple header for continuation pages
  // The "Itinerary (Continued)" text will be added by the renderer
}

/**
 * Draw client information section
 *
 * @param page - PDF page
 */
export function drawClientInfoSection(page: PDFPage): void {
  const { marginLeft, marginRight, pageHeight } = PDF_CONFIG;
  const sectionTop = pageHeight - PDF_CONFIG.marginTop - SECTION_HEIGHTS.header;
  const sectionBottom = sectionTop - SECTION_HEIGHTS.clientInfo;

  // Draw horizontal line below section
  page.drawLine({
    start: { x: marginLeft, y: sectionBottom },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: sectionBottom },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Background for client info section (light)
  page.drawRectangle({
    x: marginLeft + 1,
    y: sectionBottom + 1,
    width: PDF_CONFIG.pageWidth - marginLeft - marginRight - 2,
    height: SECTION_HEIGHTS.clientInfo - 2,
    color: rgb(0.98, 0.98, 0.98),
  });
}

/**
 * Draw itinerary section header
 *
 * @param page - PDF page
 * @param yPosition - Y position for the section
 */
export function drawItinerarySectionHeader(page: PDFPage, yPosition: number): void {
  const { marginLeft, marginRight } = PDF_CONFIG;

  // Draw horizontal line above itinerary section
  page.drawLine({
    start: { x: marginLeft, y: yPosition },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: yPosition },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });
}

/**
 * Draw a single day entry box in the itinerary
 *
 * @param page - PDF page
 * @param yPosition - Y position for the top of the day box
 * @param height - Height of the day box
 */
export function drawDayEntryBox(
  page: PDFPage,
  yPosition: number,
  height: number
): void {
  const { marginLeft } = PDF_CONFIG;

  // Draw light border around day entry
  page.drawRectangle({
    x: marginLeft + 10,
    y: yPosition - height,
    width: ITINERARY_CONFIG.dayNumberWidth + ITINERARY_CONFIG.activitiesWidth + 20,
    height: height,
    borderColor: rgb(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b),
    borderWidth: 0.5,
    color: rgb(0.99, 0.99, 0.99),
  });

  // Draw vertical line between day number and activities
  page.drawLine({
    start: {
      x: marginLeft + 10 + ITINERARY_CONFIG.dayNumberWidth,
      y: yPosition,
    },
    end: {
      x: marginLeft + 10 + ITINERARY_CONFIG.dayNumberWidth,
      y: yPosition - height,
    },
    thickness: 0.5,
    color: rgb(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b),
  });
}

/**
 * Draw hotel details section
 *
 * @param page - PDF page
 * @param yPosition - Y position for the section
 */
export function drawHotelSection(page: PDFPage, yPosition: number): void {
  const { marginLeft, marginRight } = PDF_CONFIG;

  // Draw horizontal line above hotel section
  page.drawLine({
    start: { x: marginLeft, y: yPosition },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: yPosition },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Draw horizontal line below hotel section
  const sectionBottom = yPosition - SECTION_HEIGHTS.hotel;
  page.drawLine({
    start: { x: marginLeft, y: sectionBottom },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: sectionBottom },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });
}

/**
 * Draw inclusions & exclusions section
 *
 * @param page - PDF page
 * @param yPosition - Y position for the section
 */
export function drawInclusionsSection(page: PDFPage, yPosition: number): void {
  const { marginLeft, marginRight } = PDF_CONFIG;

  // Draw horizontal line above section
  page.drawLine({
    start: { x: marginLeft, y: yPosition },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: yPosition },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Draw vertical line separating inclusions and exclusions
  const middleX = (marginLeft + PDF_CONFIG.pageWidth - marginRight) / 2;
  const sectionBottom = yPosition - SECTION_HEIGHTS.inclusions;

  page.drawLine({
    start: { x: middleX, y: yPosition - 20 },
    end: { x: middleX, y: sectionBottom + 10 },
    thickness: 0.5,
    color: rgb(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b),
  });

  // Draw horizontal line below section
  page.drawLine({
    start: { x: marginLeft, y: sectionBottom },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: sectionBottom },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });
}

/**
 * Draw pricing section
 *
 * @param page - PDF page
 * @param yPosition - Y position for the section
 */
export function drawPricingSection(page: PDFPage, yPosition: number): void {
  const { marginLeft, marginRight } = PDF_CONFIG;

  // Draw horizontal line above pricing
  page.drawLine({
    start: { x: marginLeft, y: yPosition },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: yPosition },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Background highlight for pricing
  const sectionBottom = yPosition - SECTION_HEIGHTS.pricing;
  page.drawRectangle({
    x: marginLeft + 1,
    y: sectionBottom + 1,
    width: PDF_CONFIG.pageWidth - marginLeft - marginRight - 2,
    height: SECTION_HEIGHTS.pricing - 2,
    color: rgb(0.95, 0.97, 1.0), // Light blue tint
  });

  // Draw horizontal line below pricing
  page.drawLine({
    start: { x: marginLeft, y: sectionBottom },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: sectionBottom },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });
}

/**
 * Draw footer section
 *
 * @param page - PDF page
 * @param pageNumber - Current page number
 * @param totalPages - Total number of pages
 */
function drawFooterSection(
  page: PDFPage,
  pageNumber: number,
  totalPages: number
): void {
  const { marginLeft, marginRight, marginBottom } = PDF_CONFIG;
  const footerTop = marginBottom + SECTION_HEIGHTS.footer;

  // Draw horizontal line above footer
  page.drawLine({
    start: { x: marginLeft, y: footerTop },
    end: { x: PDF_CONFIG.pageWidth - marginRight, y: footerTop },
    thickness: STYLES.sectionBorderWidth,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });

  // Light background for footer
  page.drawRectangle({
    x: marginLeft + 1,
    y: marginBottom + 1,
    width: PDF_CONFIG.pageWidth - marginLeft - marginRight - 2,
    height: SECTION_HEIGHTS.footer - 2,
    color: rgb(0.97, 0.97, 0.97),
  });
}

/**
 * Draw a decorative line
 *
 * @param page - PDF page
 * @param startX - Start X coordinate
 * @param startY - Start Y coordinate
 * @param endX - End X coordinate
 * @param endY - End Y coordinate
 * @param thickness - Line thickness
 */
export function drawLine(
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  thickness: number = STYLES.sectionBorderWidth
): void {
  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    thickness: thickness,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
  });
}
