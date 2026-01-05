/**
 * Multi-Page Handler
 *
 * Handles distribution of content across multiple PDF pages.
 * Critical for long itineraries that don't fit on a single page.
 */

import { PDFFont } from 'pdf-lib';
import { ItineraryData, PageContent, PageSection, ItineraryDay } from '@/lib/types/itinerary';
import {
  PDF_CONFIG,
  SECTION_HEIGHTS,
  ITINERARY_CONFIG,
} from '@/lib/config/pdf-config';
import { FIELD_COORDINATES } from '@/lib/config/field-coordinates';
import { calculateRenderedTextHeight } from './text-renderer';

/**
 * Calculate the height needed for a single day entry
 *
 * @param day - Itinerary day data
 * @param font - Font used for activities text
 * @returns Height in points
 */
function calculateDayHeight(day: ItineraryDay, font: PDFFont): number {
  const activitiesConfig = FIELD_COORDINATES.itineraryDays.fields.activities;

  // Calculate height of activities text
  const textHeight = calculateRenderedTextHeight(
    day.activities,
    activitiesConfig,
    font
  );

  // Add padding
  const totalHeight = Math.max(
    ITINERARY_CONFIG.minDayHeight,
    textHeight + ITINERARY_CONFIG.dayPadding * 2
  );

  // Add spacing between days
  return totalHeight + ITINERARY_CONFIG.daySpacing;
}

/**
 * Distribute itinerary content across multiple pages
 *
 * @param data - Full itinerary data
 * @param font - Font used for activities text
 * @returns Array of page content definitions
 */
export function distributeContentAcrossPages(
  data: ItineraryData,
  font: PDFFont
): PageContent[] {
  const pages: PageContent[] = [];

  // Calculate heights for all day entries
  const dayHeights = data.days.map((day) => calculateDayHeight(day, font));

  // Page 1 setup
  const page1ItineraryStartY =
    PDF_CONFIG.pageHeight -
    PDF_CONFIG.marginTop -
    SECTION_HEIGHTS.header -
    SECTION_HEIGHTS.clientInfo -
    30; // Space for "DAY-BY-DAY ITINERARY" header

  const page1AvailableHeight =
    page1ItineraryStartY -
    (SECTION_HEIGHTS.hotel + SECTION_HEIGHTS.inclusions + SECTION_HEIGHTS.pricing + SECTION_HEIGHTS.footer) -
    PDF_CONFIG.marginBottom -
    20; // Safety margin

  // Start distributing days across pages
  let currentPageNum = 1;
  let currentPageSections: PageSection[] = [];
  let currentY = page1ItineraryStartY;
  let availableHeight = page1AvailableHeight;
  let dayIndex = 0;

  // Always add header and client info to page 1
  currentPageSections.push({
    type: 'header',
    data: {},
    yPosition: PDF_CONFIG.pageHeight - PDF_CONFIG.marginTop,
  });

  currentPageSections.push({
    type: 'clientInfo',
    data: {},
    yPosition: PDF_CONFIG.pageHeight - PDF_CONFIG.marginTop - SECTION_HEIGHTS.header,
  });

  // Distribute itinerary days
  while (dayIndex < data.days.length) {
    const dayHeight = dayHeights[dayIndex];

    // Check if day fits on current page
    if (dayHeight <= availableHeight) {
      // Day fits - add it to current page
      currentPageSections.push({
        type: 'itineraryDay',
        data: data.days[dayIndex],
        yPosition: currentY,
      });

      currentY -= dayHeight;
      availableHeight -= dayHeight;
      dayIndex++;
    } else {
      // Day doesn't fit - start new page

      // Save current page
      pages.push({
        pageNumber: currentPageNum,
        sections: currentPageSections,
      });

      // Start new page
      currentPageNum++;
      currentPageSections = [];

      // Add continuation header
      currentPageSections.push({
        type: 'continuationHeader',
        data: {},
        yPosition: PDF_CONFIG.pageHeight - PDF_CONFIG.marginTop,
      });

      // Reset Y position and available height for continuation page
      currentY = PDF_CONFIG.pageHeight - PDF_CONFIG.marginTop - SECTION_HEIGHTS.header - 20;
      availableHeight =
        PDF_CONFIG.pageHeight -
        PDF_CONFIG.marginTop -
        PDF_CONFIG.marginBottom -
        SECTION_HEIGHTS.header -
        SECTION_HEIGHTS.footer -
        40; // Safety margins
    }
  }

  // Add hotel, inclusions, pricing to the last page
  // Calculate Y position for these sections
  let finalSectionY = currentY - 20; // Small gap after last day

  currentPageSections.push({
    type: 'hotel',
    data: {},
    yPosition: finalSectionY,
  });
  finalSectionY -= SECTION_HEIGHTS.hotel;

  currentPageSections.push({
    type: 'inclusions',
    data: {},
    yPosition: finalSectionY,
  });
  finalSectionY -= SECTION_HEIGHTS.inclusions;

  currentPageSections.push({
    type: 'pricing',
    data: {},
    yPosition: finalSectionY,
  });

  // Add footer to last page
  currentPageSections.push({
    type: 'footer',
    data: {},
    yPosition: PDF_CONFIG.marginBottom + SECTION_HEIGHTS.footer,
  });

  // Save last page
  pages.push({
    pageNumber: currentPageNum,
    sections: currentPageSections,
  });

  return pages;
}

/**
 * Get itinerary days for a specific page
 *
 * @param pageContent - Page content definition
 * @returns Array of itinerary days on this page
 */
export function getPageItineraryDays(pageContent: PageContent): ItineraryDay[] {
  return pageContent.sections
    .filter((section) => section.type === 'itineraryDay')
    .map((section) => section.data as ItineraryDay);
}

/**
 * Check if a page has a specific section type
 *
 * @param pageContent - Page content definition
 * @param sectionType - Section type to check for
 * @returns True if page contains this section type
 */
export function pageHasSection(
  pageContent: PageContent,
  sectionType: PageSection['type']
): boolean {
  return pageContent.sections.some((section) => section.type === sectionType);
}

/**
 * Calculate total number of pages needed
 *
 * @param data - Itinerary data
 * @param font - Font for calculations
 * @returns Number of pages needed
 */
export function calculateTotalPages(data: ItineraryData, font: PDFFont): number {
  const pages = distributeContentAcrossPages(data, font);
  return pages.length;
}

/**
 * Get Y position for a specific section on a page
 *
 * @param pageContent - Page content definition
 * @param sectionType - Section type
 * @returns Y position or null if section not on page
 */
export function getSectionYPosition(
  pageContent: PageContent,
  sectionType: PageSection['type']
): number | null {
  const section = pageContent.sections.find((s) => s.type === sectionType);
  return section ? section.yPosition : null;
}
