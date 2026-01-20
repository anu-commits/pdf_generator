/**
 * Hero Section Renderer
 *
 * Renders hero page with elegant arched white frame design
 * Image displayed within arch, with destination and company name overlaid
 */

import { PDFPage, PDFImage, rgb } from "pdf-lib"
import { FontFamily } from "../font-loader"
import { LUXURY_LAYOUT, LUXURY_COLORS } from "../../config/luxury-design-config"

export interface HeroSectionOptions {
  heroImage?: PDFImage
  companyLogo?: PDFImage
  companyName?: string
  destination?: string
  duration?: string
  pricePerPerson?: string
}

/**
 * Render hero page with arched frame design
 * Returns the Y position after rendering (not used for full page)
 */
export function renderHeroSection(
  page: PDFPage,
  fonts: FontFamily,
  options: HeroSectionOptions
): number {
  const { heroImage, companyLogo, companyName, destination, duration } = options

  const pageWidth = LUXURY_LAYOUT.page.width
  const pageHeight = LUXURY_LAYOUT.page.height

  // ====== BACKGROUND IMAGE (Full Page) ======
  if (heroImage) {
    // Draw hero image filling entire page as background
    const imgDims = heroImage.scale(1)
    const scale = Math.max(
      pageWidth / imgDims.width,
      pageHeight / imgDims.height
    )

    const scaledWidth = imgDims.width * scale
    const scaledHeight = imgDims.height * scale

    // Center image on page
    const imageX = (pageWidth - scaledWidth) / 2
    const imageY = (pageHeight - scaledHeight) / 2

    page.drawImage(heroImage, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  // ====== WHITE RECTANGULAR FRAME ======
  const frameMargin = 40
  const frameWidth = pageWidth - frameMargin * 2
  const frameHeight = pageHeight - frameMargin * 2
  const frameX = frameMargin
  const frameY = frameMargin
  const frameThickness = 15

  // Draw white rectangular frame
  // Left side
  page.drawRectangle({
    x: frameX,
    y: frameY,
    width: frameThickness,
    height: frameHeight,
    color: LUXURY_COLORS.white,
  })

  // Right side
  page.drawRectangle({
    x: frameX + frameWidth - frameThickness,
    y: frameY,
    width: frameThickness,
    height: frameHeight,
    color: LUXURY_COLORS.white,
  })

  // Bottom
  page.drawRectangle({
    x: frameX,
    y: frameY,
    width: frameWidth,
    height: frameThickness,
    color: LUXURY_COLORS.white,
  })

  // Top
  page.drawRectangle({
    x: frameX,
    y: frameY + frameHeight - frameThickness,
    width: frameWidth,
    height: frameThickness,
    color: LUXURY_COLORS.white,
  })

  // ====== WHITE TEXT BOX AT BOTTOM ======
  const textBoxHeight = 100
  const textBoxY = frameY + frameThickness
  const textBoxWidth = frameWidth - frameThickness * 2
  const textBoxX = frameX + frameThickness

  // Draw white box for text
  page.drawRectangle({
    x: textBoxX,
    y: textBoxY,
    width: textBoxWidth,
    height: textBoxHeight,
    color: LUXURY_COLORS.white,
  })

  // ====== TEXT INSIDE WHITE BOX ======
  const textPaddingLeft = 5
  const textPaddingRight = 30

  // Destination name (large, bold, gold/orange)
  if (destination) {
    const destText = destination.toUpperCase()
    const destSize = 24

    page.drawText(destText, {
      x: textBoxX + textPaddingLeft,
      y: textBoxY + textBoxHeight - 35,
      size: destSize,
      font: fonts.headingBold,
      color: LUXURY_COLORS.gold,
    })
  }

  // Duration (smaller text below destination)
  if (duration) {
    page.drawText(duration, {
      x: textBoxX + textPaddingLeft,
      y: textBoxY + textBoxHeight - 65,
      size: 13,
      font: fonts.body,
      color: LUXURY_COLORS.gold,
    })
  }

  // Company logo or name (bottom right corner of white box)
  if (companyLogo) {
    // Draw logo image
    const logoHeight = 25
    const aspectRatio = companyLogo.width / companyLogo.height
    const logoWidth = logoHeight * aspectRatio

    page.drawImage(companyLogo, {
      x: textBoxX + textBoxWidth - logoWidth - textPaddingRight,
      y: textBoxY + 15,
      width: logoWidth,
      height: logoHeight,
    })
  } else if (companyName) {
    // Fallback to text if no logo
    const companyText = companyName.toUpperCase()
    const companySize = 11
    const companyWidth = fonts.bodyBold.widthOfTextAtSize(
      companyText,
      companySize
    )

    page.drawText(companyText, {
      x: textBoxX + textBoxWidth - companyWidth - textPaddingRight,
      y: textBoxY + 20,
      size: companySize,
      font: fonts.bodyBold,
      color: LUXURY_COLORS.gold,
    })
  }

  // Return 0 since this is a full-page design
  return 0
}
