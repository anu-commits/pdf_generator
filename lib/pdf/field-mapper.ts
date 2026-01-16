/**
 * Field Mapper - Luxury PDF Layout
 *
 * Orchestrates the complete luxury PDF generation process:
 * Page 1: Hero Image (Full Page)
 * Page 2: Why Choose Us (Full Page)
 * Page 3: Basic Details (Separate Page)
 * Page 4: Tour Highlights (Separate Page)
 * Pages 5+: Itinerary (One day per page)
 * Next: Our Stays
 * Next: Flights (Separate Page)
 * Next: Inclusions + Exclusions (Combined)
 * Next: Terms & Conditions (Separate Page)
 * Final: Pricing + Bank Details
 */

import { PDFDocument, PDFPage, PDFImage, rgb } from "pdf-lib"

import * as fs from "fs"
import * as path from "path"

/**
 * Static page image file paths
 * Place your images in the public/images folder
 */
const WHY_CHOOSE_US_IMAGE_PATH = "public/images/why-choose-us.png"
const BASIC_DETAILS_TEMPLATE_PATH = "public/images/basic-details-template.png"

import { ItineraryData } from "../types/itinerary"
import {
  LUXURY_COLORS,
  LUXURY_LAYOUT,
  LUXURY_FONT_SIZES,
} from "../config/luxury-design-config"
import { loadFonts, FontFamily } from "./font-loader"
import { embedImageInPDF } from "../utils/image-utils"
import {
  drawPageBackground,
  PageManager,
  drawPaginatedBulletList,
} from "./layout-primitives"

// Section renderers
import { renderHeroSection } from "./sections/hero-section"
import { renderBasicDetailsSection } from "./sections/basic-details-section"
import { renderTourHighlightsSection } from "./sections/tour-highlights-section"
import { renderWhyChooseUsSection } from "./sections/why-choose-us-section"
import {
  renderPaginatedItineraryDay,
} from "./sections/itinerary-section"
import { renderFlightsSection } from "./sections/flights-section"
import { renderStaysSection } from "./sections/stays-section"
import { renderPricingSection } from "./sections/pricing-section"
import { renderBankDetailsSection } from "./sections/bank-details-section"
import { renderConsultantDetailsSection } from "./sections/consultant-details-section"

/**
 * Generate complete luxury PDF document from itinerary data
 *
 * @param data - Itinerary data with images
 * @param darkMode - Whether to use dark mode background (default: true)
 * @returns PDF document bytes
 */
export async function generateItineraryPDF(
  data: ItineraryData,
  darkMode: boolean = true
): Promise<Uint8Array> {
  try {
    // Initialize PDF document
    const pdfDoc = await PDFDocument.create()

    // Load fonts
    const fonts = await loadFonts(pdfDoc)

    // Embed all images (hero, why choose us, day images, hotel images, airline logos)
    const {
      heroImage,
      whyChooseUsImage,
      basicDetailsTemplate,
      destinationImage,
      dayImages,
      hotelImages,
      airlineLogos,
    } = await embedAllImages(pdfDoc, data)

    // Set background color based on dark mode
    const backgroundColor = darkMode
      ? LUXURY_COLORS.darkBackground
      : LUXURY_COLORS.white
    // Set text color based on dark mode
    const textColor = darkMode ? LUXURY_COLORS.white : LUXURY_COLORS.textDark

    const startX = LUXURY_LAYOUT.content.startX
    const maxWidth = LUXURY_LAYOUT.content.width
    let currentY: number

    // ====== PAGE 1: Full-Page Hero Image ======
    const page1 = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    // Draw background (will be covered by hero image if provided)
    drawPageBackground(page1, backgroundColor)

    // Render hero page with company name, hero image, and tour details overlay
    renderHeroSection(page1, fonts, {
      heroImage,
      companyName: data.companyName || "THE LUXE TRAILS",
      destination: data.destination || "Luxury Travel Experience",
      duration: data.basicDetails?.travelDates,
    })

    // ====== PAGE 2: Why Choose Us (Full Page) ======
    const page2 = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(page2, backgroundColor)

    // Render Why Choose Us full page with hardcoded image
    currentY = renderWhyChooseUsSection(page2, fonts, {
      whyChooseUsImage,
    })

    // ====== PAGE 3: Basic Details (Separate Page) ======
    const page3 = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(page3, backgroundColor)

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

    // Render Basic Details with template image and destination photo
    if (data.basicDetails) {
      currentY = renderBasicDetailsSection(page3, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        basicDetails: data.basicDetails,
        textColor,
        templateImage: basicDetailsTemplate,
        destinationImage: destinationImage,
      })
    }

    // ====== PAGE 4: Tour Highlights (Separate Page) ======
    if (data.tourHighlights && data.tourHighlights.length > 0) {
      const page4 = pdfDoc.addPage([
        LUXURY_LAYOUT.page.width,
        LUXURY_LAYOUT.page.height,
      ])
      drawPageBackground(page4, backgroundColor)

      currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

      currentY = renderTourHighlightsSection(page4, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        highlights: data.tourHighlights,
        textColor,
      })
    }

    // ====== PAGES 5+: Itinerary (with pagination using PageManager) ======
    // Create first itinerary page
    const itineraryPage = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(itineraryPage, backgroundColor)

    // Create page manager for itinerary with pagination
    const itineraryPageManager = new PageManager(pdfDoc, itineraryPage, {
      startY: LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop,
      backgroundColor,
      marginBottom: 60, // Space for footer
    })

    // Helper function to draw itinerary header
    const drawItineraryHeader = () => {
      itineraryPageManager.getPage().drawText("Itinerary", {
        x: startX,
        y: itineraryPageManager.getY(),
        size: 22,
        font: fonts.headingBold,
        color: LUXURY_COLORS.gold,
      })
      itineraryPageManager.moveDown(40)
    }

    // Draw initial header on first itinerary page
    drawItineraryHeader()

    // Render each day with proper pagination support
    // Each day gets its own page (one day per page)
    for (let i = 0; i < data.days.length; i++) {
      const day = data.days[i]
      const isFirstDay = i === 0
      const isLastDay = i === data.days.length - 1
      const dayImage = dayImages.get(day.dayNumber)

      // Use the paginated renderer that handles mid-day page breaks
      renderPaginatedItineraryDay(
        itineraryPageManager,
        fonts,
        day,
        dayImage,
        startX,
        maxWidth,
        textColor,
        isLastDay,
        drawItineraryHeader,
        isFirstDay // First day already has a page with header
      )
    }

    // ====== NEXT PAGE(S): Our Stays (with pagination) ======
    if (data.hotels && data.hotels.length > 0) {
      const staysPage = pdfDoc.addPage([
        LUXURY_LAYOUT.page.width,
        LUXURY_LAYOUT.page.height,
      ])
      drawPageBackground(staysPage, backgroundColor)

      currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

      currentY = renderStaysSection(staysPage, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        hotels: data.hotels,
        hotelImages,
        pdfDoc,
        backgroundColor,
      })
    }

    // ====== NEXT PAGE: Flights (Separate Page) ======
    const flightsPage = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(flightsPage, backgroundColor)

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

    // Render Flights
    if (data.flights && data.flights.length > 0) {
      currentY = renderFlightsSection(flightsPage, fonts, {
        startX,
        startY: currentY,
        maxWidth,
        flights: data.flights,
        airlineLogos,
      })
    }

    // ====== NEXT PAGE(S): Inclusions + Exclusions (with pagination) ======
    const inclusionsPage = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(inclusionsPage, backgroundColor)

    // Create page manager for inclusions/exclusions with pagination
    const inclusionsPageManager = new PageManager(pdfDoc, inclusionsPage, {
      startY: LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop,
      backgroundColor,
      marginBottom: 60,
    })

    // Render Inclusions with pagination
    if (data.inclusions && data.inclusions.length > 0) {
      // Draw header
      inclusionsPageManager.getPage().drawText("Inclusions", {
        x: startX,
        y: inclusionsPageManager.getY(),
        size: 36,
        font: fonts.heading,
        color: LUXURY_COLORS.gold,
      })
      inclusionsPageManager.moveDown(60)

      // Draw paginated bullet list
      drawPaginatedBulletList(
        inclusionsPageManager,
        data.inclusions,
        startX + 20,
        maxWidth - 40,
        fonts.body,
        11,
        {
          bulletColor: LUXURY_COLORS.gold,
          textColor,
          bulletSize: 6,
          bulletIndent: 15,
          lineHeight: 1.5,
          itemSpacing: 10,
          sectionTitle: "Inclusions",
          titleFont: fonts.heading,
          titleSize: 36,
          titleColor: LUXURY_COLORS.gold,
          titleSpacing: 60,
        }
      )
    }

    // Add spacing between Inclusions and Exclusions
    inclusionsPageManager.moveDown(40)

    // Render Exclusions with pagination
    if (data.exclusions && data.exclusions.length > 0) {
      // Check if we need a new page for exclusions header
      inclusionsPageManager.checkAndCreateNewPage(100)

      // Draw header
      inclusionsPageManager.getPage().drawText("Exclusions", {
        x: startX,
        y: inclusionsPageManager.getY(),
        size: 36,
        font: fonts.heading,
        color: LUXURY_COLORS.gold,
      })
      inclusionsPageManager.moveDown(60)

      // Draw paginated bullet list
      drawPaginatedBulletList(
        inclusionsPageManager,
        data.exclusions,
        startX + 20,
        maxWidth - 40,
        fonts.body,
        11,
        {
          bulletColor: LUXURY_COLORS.gold,
          textColor,
          bulletSize: 6,
          bulletIndent: 15,
          lineHeight: 1.5,
          itemSpacing: 10,
          sectionTitle: "Exclusions",
          titleFont: fonts.heading,
          titleSize: 36,
          titleColor: LUXURY_COLORS.gold,
          titleSpacing: 60,
        }
      )
    }

    // ====== NEXT PAGE(S): Terms & Conditions (with pagination) ======
    const termsPage = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(termsPage, backgroundColor)

    // Create page manager for terms with pagination
    const termsPageManager = new PageManager(pdfDoc, termsPage, {
      startY: LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop,
      backgroundColor,
      marginBottom: 60,
    })

    // Use termsList directly (new format) or fall back to legacy format
    const termsArray: string[] =
      data.termsList && data.termsList.length > 0 ? data.termsList : []

    // Render terms section with pagination
    if (termsArray.length > 0) {
      // Draw header
      termsPageManager.getPage().drawText("Terms and Conditions", {
        x: startX,
        y: termsPageManager.getY(),
        size: 36,
        font: fonts.heading,
        color: LUXURY_COLORS.gold,
      })
      termsPageManager.moveDown(70)

      // Draw paginated bullet list
      drawPaginatedBulletList(
        termsPageManager,
        termsArray,
        startX,
        maxWidth,
        fonts.body,
        12,
        {
          bulletColor: LUXURY_COLORS.gold,
          textColor,
          bulletSize: 8,
          bulletIndent: 30,
          lineHeight: 1.64,
          itemSpacing: 18,
          sectionTitle: "Terms and Conditions",
          titleFont: fonts.heading,
          titleSize: 36,
          titleColor: LUXURY_COLORS.gold,
          titleSpacing: 70,
        }
      )
    }

    // ====== FINAL PAGE: Pricing + Bank Details ======
    const pricingPage = pdfDoc.addPage([
      LUXURY_LAYOUT.page.width,
      LUXURY_LAYOUT.page.height,
    ])
    drawPageBackground(pricingPage, backgroundColor)

    currentY = LUXURY_LAYOUT.page.height - LUXURY_LAYOUT.pageMarginTop

    // Render Pricing
    currentY = renderPricingSection(pricingPage, fonts, {
      startX,
      startY: currentY,
      pricing: data.pricing,
      textColor,
    })

    currentY -= 40

    // Render Bank Details (if exists)
    const hasBankDetails =
      data.bankDetails?.accountName?.trim() ||
      data.bankDetails?.accountNumber?.trim() ||
      data.bankDetails?.bankName?.trim() ||
      data.bankDetails?.swiftCode?.trim()

    if (hasBankDetails) {
      currentY = renderBankDetailsSection(pricingPage, fonts, {
        startX,
        startY: currentY,
        bankDetails: data.bankDetails,
        textColor,
      })
    }

    // Render Consultant Details (if exists)
    const hasConsultantDetails =
      data.consultantDetails?.name?.trim() ||
      data.consultantDetails?.email?.trim() ||
      data.consultantDetails?.phone?.trim()

    if (hasConsultantDetails) {
      currentY = renderConsultantDetailsSection(pricingPage, fonts, {
        startX,
        startY: currentY,
        consultantDetails: data.consultantDetails!,
      })
    }

    // Add footer with company name and CTA
    renderFooterCTA(
      pricingPage,
      fonts,
      data.companyName || "THE LUXE TRAILS",
      80
    )

    // Add footer to all pages
    await addFooterToAllPages(pdfDoc, fonts, data.contactInfo, data.companyName)

    // Serialize and return
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Embed all images from the itinerary data
 */
async function embedAllImages(
  pdfDoc: PDFDocument,
  data: ItineraryData
): Promise<{
  heroImage?: PDFImage
  whyChooseUsImage?: PDFImage
  basicDetailsTemplate?: PDFImage
  destinationImage?: PDFImage
  dayImages: Map<number, PDFImage>
  hotelImages: Map<number, PDFImage[]>
  airlineLogos: Map<number, PDFImage>
}> {
  let heroImage: PDFImage | undefined = undefined
  let whyChooseUsImage: PDFImage | undefined = undefined
  let basicDetailsTemplate: PDFImage | undefined = undefined
  let destinationImage: PDFImage | undefined = undefined
  const dayImages = new Map<number, PDFImage>()
  const hotelImages = new Map<number, PDFImage[]>()
  const airlineLogos = new Map<number, PDFImage>()

  // Embed hero image
  if (data.heroImage) {
    try {
      heroImage = await embedImageInPDF(pdfDoc, data.heroImage)
    } catch (error) {
      console.error("Failed to embed hero image:", error)
    }
  }

  // Embed Why Choose Us image from file
  const whyChooseUsImagePath = path.join(
    process.cwd(),
    WHY_CHOOSE_US_IMAGE_PATH
  )
  if (fs.existsSync(whyChooseUsImagePath)) {
    try {
      const imageBuffer = fs.readFileSync(whyChooseUsImagePath)
      const base64Image = `data:image/png;base64,${imageBuffer.toString(
        "base64"
      )}`
      whyChooseUsImage = await embedImageInPDF(pdfDoc, base64Image)
    } catch (error) {
      console.error("Failed to embed Why Choose Us image:", error)
    }
  }

  // Embed Basic Details template image from file
  const basicDetailsTemplatePath = path.join(
    process.cwd(),
    BASIC_DETAILS_TEMPLATE_PATH
  )
  if (fs.existsSync(basicDetailsTemplatePath)) {
    try {
      const imageBuffer = fs.readFileSync(basicDetailsTemplatePath)
      const base64Image = `data:image/png;base64,${imageBuffer.toString(
        "base64"
      )}`
      basicDetailsTemplate = await embedImageInPDF(pdfDoc, base64Image)
    } catch (error) {
      console.error("Failed to embed Basic Details template:", error)
    }
  }

  // Embed destination image from basic details
  if (data.basicDetails?.destinationImage) {
    try {
      console.log(
        "Embedding destination image, data length:",
        data.basicDetails.destinationImage.length
      )
      destinationImage = await embedImageInPDF(
        pdfDoc,
        data.basicDetails.destinationImage
      )
      console.log(
        "Destination image embedded successfully:",
        !!destinationImage
      )
    } catch (error) {
      console.error("Failed to embed destination image:", error)
    }
  } else {
    console.log("No destination image in basicDetails")
  }

  // Embed day images
  for (const day of data.days) {
    if (day.image) {
      try {
        const pdfImage = await embedImageInPDF(pdfDoc, day.image)
        dayImages.set(day.dayNumber, pdfImage)
      } catch (error) {
        console.error(`Failed to embed image for day ${day.dayNumber}:`, error)
      }
    }
  }

  // Embed hotel images
  if (data.hotels) {
    for (let i = 0; i < data.hotels.length; i++) {
      const hotel = data.hotels[i]
      const embedImages: PDFImage[] = []

      for (const imageData of hotel.images) {
        try {
          const pdfImage = await embedImageInPDF(pdfDoc, imageData)
          embedImages.push(pdfImage)
        } catch (error) {
          console.error(`Failed to embed image for hotel ${i}:`, error)
        }
      }

      if (embedImages.length > 0) {
        hotelImages.set(i, embedImages)
      }
    }
  }

  // Embed airline logos
  if (data.flights) {
    for (let i = 0; i < data.flights.length; i++) {
      const flight = data.flights[i]
      if (flight.airlineLogo) {
        try {
          const pdfImage = await embedImageInPDF(pdfDoc, flight.airlineLogo)
          airlineLogos.set(i, pdfImage)
        } catch (error) {
          console.error(`Failed to embed airline logo for flight ${i}:`, error)
        }
      }
    }
  }

  return {
    heroImage,
    whyChooseUsImage,
    basicDetailsTemplate,
    destinationImage,
    dayImages,
    hotelImages,
    airlineLogos,
  }
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
  const { width } = page.getSize()

  // Draw company name/logo on left
  page.drawText(companyName, {
    x: LUXURY_LAYOUT.pageMargin,
    y: yPosition,
    size: 12,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.gold,
  })

  // Draw "Ready to get started?" in center
  const ctaText = "Ready to get started?"
  const ctaWidth = fonts.bodyBold.widthOfTextAtSize(ctaText, 12)
  page.drawText(ctaText, {
    x: (width - ctaWidth) / 2,
    y: yPosition,
    size: 12,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.gold,
  })

  // Draw button on right
  const buttonWidth = 100
  const buttonHeight = 28
  const buttonX = width - LUXURY_LAYOUT.pageMargin - buttonWidth

  page.drawRectangle({
    x: buttonX,
    y: yPosition - 8,
    width: buttonWidth,
    height: buttonHeight,
    color: LUXURY_COLORS.gold,
  })

  const buttonText = "Book with Us"
  const buttonTextWidth = fonts.bodyBold.widthOfTextAtSize(buttonText, 10)
  page.drawText(buttonText, {
    x: buttonX + (buttonWidth - buttonTextWidth) / 2,
    y: yPosition,
    size: 10,
    font: fonts.bodyBold,
    color: LUXURY_COLORS.white,
  })

  // Draw social media icons below (as circles with initials)
  const iconY = yPosition - 35
  const iconSize = 14
  const iconSpacing = 20
  const iconsStartX = width - LUXURY_LAYOUT.pageMargin - 4 * iconSpacing
  const socialIcons = ["f", "in", "P", "O"] // Facebook, LinkedIn, Pinterest, Instagram

  socialIcons.forEach((icon, index) => {
    const iconX = iconsStartX + index * iconSpacing

    // Draw circle outline
    page.drawCircle({
      x: iconX + iconSize / 2,
      y: iconY + iconSize / 2,
      size: iconSize / 2,
      borderColor: LUXURY_COLORS.gold,
      borderWidth: 1,
    })

    // Draw icon letter
    const letterWidth = fonts.body.widthOfTextAtSize(icon, 8)
    page.drawText(icon, {
      x: iconX + (iconSize - letterWidth) / 2,
      y: iconY + 4,
      size: 8,
      font: fonts.body,
      color: LUXURY_COLORS.gold,
    })
  })
}

/**
 * Add footer to all pages (except page 1 which is full-page hero)
 * Uses The Luxe Trails footer design with logo image and page number
 */
async function addFooterToAllPages(
  pdfDoc: PDFDocument,
  fonts: FontFamily,
  contactInfo: string,
  companyName?: string
): Promise<void> {
  const pages = pdfDoc.getPages()
  const footerTheme = {
    bg: rgb(0.07, 0.07, 0.07), // Almost Black
    gold: rgb(0.78, 0.58, 0.24), // Luxe Gold
    text: rgb(0.78, 0.58, 0.24), // Gold text
  }

  // Load and embed the logo image
  let logoImage: PDFImage | undefined = undefined
  const logoImagePath = path.join(
    process.cwd(),
    "public/images/TLT-Logo-goldwebsite 2.png"
  )

  if (fs.existsSync(logoImagePath)) {
    try {
      const imageBuffer = fs.readFileSync(logoImagePath)
      const base64Image = `data:image/png;base64,${imageBuffer.toString(
        "base64"
      )}`
      logoImage = await embedImageInPDF(pdfDoc, base64Image)
    } catch (error) {
      console.error("Failed to embed footer logo image:", error)
    }
  }

  pages.forEach((page, index) => {
    // Skip page 1 (hero page - index 0)
    if (index === 0) {
      return
    }

    const { width } = page.getSize()
    const marginBottom = LUXURY_LAYOUT.pageMarginBottom - 20
    const startX = LUXURY_LAYOUT.pageMargin

    // Position footer elements at the bottom of the page
    // Line positioned near the bottom margin
    const lineY = marginBottom
    const logoY = marginBottom + 7

    // 1. Draw Gold Horizontal Line
    page.drawLine({
      start: { x: startX, y: lineY },
      end: { x: width - LUXURY_LAYOUT.pageMargin, y: lineY },
      thickness: 1,
      color: footerTheme.gold,
    })

    // 2. Draw Logo Image (below the line)
    if (logoImage) {
      const logoHeight = 14 // Smaller logo height
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight // Maintain aspect ratio
      const logoX = startX

      page.drawImage(logoImage, {
        x: logoX,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      })
    }

    // 3. Page Number (right side, aligned with logo)
    const pageNumText = `${index + 1}`
    const numWidth = fonts.bodyBold.widthOfTextAtSize(pageNumText, 12)

    page.drawText(pageNumText, {
      x: width - LUXURY_LAYOUT.pageMargin - numWidth,
      y: logoY + 2,
      size: 12,
      font: fonts.bodyBold,
      color: footerTheme.text,
    })
  })
}
