/**
 * Basic Details Section Renderer
 *
 * Hybrid approach: Uses a template image as background with dynamic text overlays
 * Place your template image at: public/images/basic-details-template.png
 */

import { PDFPage, PDFImage, rgb } from "pdf-lib"
import { FontFamily } from "../font-loader"
import { BasicDetails } from "../../types/itinerary"
import { LUXURY_LAYOUT, LUXURY_COLORS } from "../../config/luxury-design-config"

export interface BasicDetailsSectionOptions {
  startX: number
  startY: number
  maxWidth: number
  basicDetails: BasicDetails
  textColor?: any
  templateImage?: PDFImage // Background template image
  destinationImage?: PDFImage // Destination photo to overlay
}

/**
 * Text overlay positions (adjust these to match your template)
 * Coordinates are from bottom-left of the page
 */
const TEXT_POSITIONS = {
  // Row 1 boxes (from left to right)
  customerDetails: { x: 90, y: 640, maxWidth: 80 },
  totalPeople: { x: 250, y: 640, maxWidth: 80 },
  adults: { x: 420, y: 640, maxWidth: 80 },
  // Row 2 boxes (from left to right)
  children: { x: 90, y: 550, maxWidth: 80 },
  infants: { x: 250, y: 550, maxWidth: 80 },
  travelDates: { x: 440, y: 550, maxWidth: 80 },
  // Destination image area
  destinationImage: { x: 50, y: 90, width: 498, height: 388 },
}

/**
 * Render basic details page with template image and text overlays
 * Returns the Y position after rendering (0 since this is full-page)
 */
export function renderBasicDetailsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: BasicDetailsSectionOptions
): number {
  const {
    basicDetails,
    templateImage,
    destinationImage,
    textColor = LUXURY_COLORS.white,
  } = options

  const pageWidth = LUXURY_LAYOUT.page.width
  const pageHeight = LUXURY_LAYOUT.page.height

  // 1. Draw template image as full-page background (if provided)
  if (templateImage) {
    const imgDims = templateImage.scale(1)
    const scale = Math.max(
      pageWidth / imgDims.width,
      pageHeight / imgDims.height
    )

    const scaledWidth = imgDims.width * scale
    const scaledHeight = imgDims.height * scale

    // Center image on page
    const imageX = (pageWidth - scaledWidth) / 2
    const imageY = (pageHeight - scaledHeight) / 2

    page.drawImage(templateImage, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  // 2. Overlay dynamic text values on the boxes
  const fontSize = 11
  const font = fonts.body

  // Helper function to draw centered text in a box area
  const drawCenteredText = (
    text: string,
    pos: { x: number; y: number; maxWidth: number }
  ) => {
    const displayText = text || "-"
    const textWidth = font.widthOfTextAtSize(displayText, fontSize)
    const centeredX = pos.x + (pos.maxWidth - textWidth) / 2

    page.drawText(displayText, {
      x: centeredX,
      y: pos.y,
      size: fontSize,
      font: font,
      color: textColor,
    })
  }

  // Draw all the dynamic values
  drawCenteredText(
    basicDetails.customerDetails || "",
    TEXT_POSITIONS.customerDetails
  )
  drawCenteredText(basicDetails.totalPeople || "", TEXT_POSITIONS.totalPeople)
  drawCenteredText(basicDetails.adults || "", TEXT_POSITIONS.adults)
  drawCenteredText(basicDetails.children || "", TEXT_POSITIONS.children)
  drawCenteredText(basicDetails.infants || "", TEXT_POSITIONS.infants)
  drawCenteredText(basicDetails.travelDates || "", TEXT_POSITIONS.travelDates)

  // 3. Overlay destination image (if provided)
if (destinationImage) {
    const pos = TEXT_POSITIONS.destinationImage;
    
    // CHANGE: Removed aspect ratio scaling logic.
    // We now force the image to exactly match the defined box dimensions.
    
    page.drawImage(destinationImage, {
      x: pos.x,
      y: pos.y,
      width: pos.width,   // Forces width to 498
      height: pos.height, // Forces height to 388
    });
  }
  // Return 0 since this is a full-page design
  return 0
}
