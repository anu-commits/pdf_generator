import { PDFPage, PDFImage, rgb } from "pdf-lib"
import { FontFamily } from "../font-loader"
import { FlightDetails } from "../../types/itinerary"

// -- Light Mode Theme --
const theme = {
  tableBg: rgb(1, 1, 1), // White background
  headerBg: rgb(0.96, 0.96, 0.96), // Very light grey header
  border: rgb(0.85, 0.85, 0.85), // Soft grey border
  titleMain: rgb(0.6, 0.45, 0.2), // Gold/Brown for "Flights"
  titleSub: rgb(0.2, 0.2, 0.2), // Dark grey for "Departures..."
  headerText: rgb(0.2, 0.2, 0.2), // Dark grey headers
  primary: rgb(0.1, 0.1, 0.1), // Nearly black for main text
  secondary: rgb(0.5, 0.5, 0.5), // Grey for dates/times
  dotted: rgb(0.7, 0.7, 0.7), // Grey dotted line
  icon: rgb(0.2, 0.2, 0.2), // Dark grey icon
}

export interface FlightsSectionOptions {
  startX: number
  startY: number
  maxWidth: number
  flights: FlightDetails[]
  airlineLogos?: Map<number, PDFImage>
}

/* -------------------- Helpers -------------------- */

function formatFlightDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`
}

function formatFlightTime(time: string): string {
  return time || ""
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  options: {
    y: number
    containerX: number
    containerWidth: number
    font: any
    size: number
    color?: any
  }
) {
  const textWidth = options.font.widthOfTextAtSize(text, options.size)
  const x = options.containerX + (options.containerWidth - textWidth) / 2

  page.drawText(text, {
    x,
    y: options.y,
    size: options.size,
    font: options.font,
    color: options.color || theme.primary,
  })
}

function drawRightAlignedText(
  page: PDFPage,
  text: string,
  options: {
    y: number
    containerX: number
    containerWidth: number
    paddingRight: number
    font: any
    size: number
    color?: any
  }
) {
  const textWidth = options.font.widthOfTextAtSize(text, options.size)
  const x =
    options.containerX +
    options.containerWidth -
    options.paddingRight -
    textWidth

  page.drawText(text, {
    x,
    y: options.y,
    size: options.size,
    font: options.font,
    color: options.color || theme.primary,
  })
}

/* -------------------- Renderer -------------------- */

export function renderFlightsSection(
  page: PDFPage,
  fonts: FontFamily,
  options: FlightsSectionOptions
): number {
  const { startX, startY, maxWidth, flights, airlineLogos } = options
  let currentY = startY

  /* -------- Section Title -------- */
  page.drawText("Flights", {
    x: startX,
    y: currentY,
    size: 32,
    font: fonts.headingBold, // Inter Bold for headings
    color: theme.titleMain,
  })

  currentY -= 45

  if (!flights.length) {
    page.drawText("No flights added", {
      x: startX,
      y: currentY,
      size: 10,
      font: fonts.body,
      color: theme.secondary,
    })
    return currentY - 30
  }

  /* -------- Table Config -------- */
  const sidePadding = 40
  const colW = maxWidth * 0.25
  const columnWidths = [colW, colW, colW, colW]

  const titleRowHeight = 30
  const headerHeight = 24
  const rowHeight = 70

  const tableStartX = startX
  const tableStartY = currentY
  const tableHeight = titleRowHeight + headerHeight + flights.length * rowHeight

  /* -------- Backgrounds & Borders -------- */
  page.drawRectangle({
    x: tableStartX,
    y: tableStartY - tableHeight,
    width: maxWidth,
    height: tableHeight,
    color: theme.tableBg,
    borderColor: theme.border,
    borderWidth: 0.8,
  })

  page.drawRectangle({
    x: tableStartX,
    y: currentY - titleRowHeight - headerHeight,
    width: maxWidth,
    height: headerHeight,
    color: theme.headerBg,
  })

  /* -------- "Departures & Arrivals" -------- */
  page.drawText("Departures & Arrivals", {
    x: tableStartX + 10,
    y: currentY - 20,
    size: 11,
    font: fonts.bodyBold,
    color: theme.titleSub,
  })

  currentY -= titleRowHeight

  /* -------- Headers -------- */
  const headers = ["Flight", "Departure", "Duration", "Arrival"]
  let hx = tableStartX

  headers.forEach((h, i) => {
    const textY = currentY - 16
    if (i === 0) {
      page.drawText(h, {
        x: hx + sidePadding,
        y: textY,
        size: 9,
        font: fonts.bodyBold,
        color: theme.headerText,
      })
    } else if (i === 3) {
      drawRightAlignedText(page, h, {
        y: textY,
        containerX: hx,
        containerWidth: columnWidths[i],
        paddingRight: sidePadding,
        font: fonts.bodyBold,
        size: 9,
        color: theme.headerText,
      })
    } else {
      drawCenteredText(page, h, {
        y: textY,
        containerX: hx,
        containerWidth: columnWidths[i],
        font: fonts.bodyBold,
        size: 9,
        color: theme.headerText,
      })
    }
    hx += columnWidths[i]
  })

  currentY -= headerHeight

  /* -------- Data Rows -------- */
  flights.forEach((flight, index) => {
    const centerY = currentY - rowHeight / 2
    let colX = tableStartX

    // --- ALIGNMENT CONSTANTS ---
    // These ensure strict alignment across all columns
    const baselinePrimary = centerY - 5 // Main Text (City, Airline Name)
    const baselineSecondary = centerY - 18 // Secondary Text (Date, Flight #)

    /* ---- 1. Flight Column (Left) ---- */
    const logo = airlineLogos?.get(index)
    if (logo) {
      const h = 20
      const w = Math.min((logo.width / logo.height) * h, 40)

      // Logo sits slightly above the text block
      page.drawImage(logo, {
        x: colX + sidePadding,
        y: centerY + 8, // Moved UP to make room for text
        width: w,
        height: h,
      })

      page.drawText(flight.airlineName || "Airline", {
        x: colX + sidePadding,
        y: baselinePrimary, // ALIGNED
        size: 9,
        font: fonts.bodyBold,
        color: theme.primary,
      })

      page.drawText(`${flight.flightNumber} | ${flight.cabin}`, {
        x: colX + sidePadding,
        y: baselineSecondary, // ALIGNED
        size: 7,
        font: fonts.body,
        color: theme.secondary,
      })
    } else {
      // Fallback if no logo
      page.drawText(flight.airlineName || "Airline", {
        x: colX + sidePadding,
        y: centerY + 2,
        size: 9,
        font: fonts.bodyBold,
        color: theme.primary,
      })
    }
    colX += columnWidths[0]

    /* ---- 2. Departure Column (Center) ---- */
    drawCenteredText(page, flight.departure.city, {
      y: baselinePrimary, // Matches Airline Name
      containerX: colX,
      containerWidth: columnWidths[1],
      font: fonts.bodyBold,
      size: 9.5,
      color: theme.primary,
    })

    const depString = `${formatFlightDate(
      flight.departure.date
    )} (${formatFlightTime(flight.departure.time)})`
    drawCenteredText(page, depString, {
      y: baselineSecondary, // Matches Flight Details
      containerX: colX,
      containerWidth: columnWidths[1],
      font: fonts.body,
      size: 7.5,
      color: theme.secondary,
    })
    colX += columnWidths[1]

    /* ---- 3. Duration Column (Center) ---- */
    const durCenterX = colX + columnWidths[2] / 2
    const lineY = centerY - 5

    // Dotted Line
    page.drawLine({
      start: { x: colX + 10, y: lineY },
      end: { x: colX + columnWidths[2] - 10, y: lineY },
      thickness: 0.5,
      color: theme.dotted,
      dashArray: [1, 2],
    })

    // Plane Icon
    const planePath =
      "M2.5,19h19v2h-19V19z M22.07,9.64c-0.21-0.8-1.04-1.28-1.84-1.06L14.92,10l-6.9-6.43L6.09,4.08l4.14,7.17l-4.97,1.33l-1.97-1.54l-1.45,0.39l1.82,3.16l0.77,1.33l16.02-4.3C21.25,11.41,21.73,10.57,22.07,9.64z"
    page.drawSvgPath(planePath, {
      x: durCenterX - 9,
      y: lineY + 22, // Lowered slightly so it sits ON the line, not floating high
      scale: 0.8,
      color: theme.icon,
    })

    drawCenteredText(page, flight.duration || "--", {
      y: baselineSecondary + 4, // Slightly higher than dates to tuck under the line
      containerX: colX,
      containerWidth: columnWidths[2],
      font: fonts.body,
      size: 7,
      color: theme.secondary,
    })
    colX += columnWidths[2]

    /* ---- 4. Arrival Column (Right) ---- */
    drawRightAlignedText(page, flight.arrival.city, {
      y: baselinePrimary, // Matches Airline/Departure
      containerX: colX,
      containerWidth: columnWidths[3],
      paddingRight: sidePadding,
      font: fonts.bodyBold,
      size: 9.5,
      color: theme.primary,
    })

    const arrString = `${formatFlightDate(
      flight.arrival.date
    )} (${formatFlightTime(flight.arrival.time)})`
    drawRightAlignedText(page, arrString, {
      y: baselineSecondary, // Matches Flight Details/Departure Date
      containerX: colX,
      containerWidth: columnWidths[3],
      paddingRight: sidePadding,
      font: fonts.body,
      size: 7.5,
      color: theme.secondary,
    })

    currentY -= rowHeight
  })

  return currentY - 25
}
