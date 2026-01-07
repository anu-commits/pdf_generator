/**
 * PDF Generation API Route
 *
 * Handles POST requests to generate travel itinerary PDFs.
 * Validates input, generates PDF, and returns as downloadable file.
 */

import { NextRequest, NextResponse } from "next/server"
import { ItineraryData } from "@/lib/types/itinerary"
import {
  validateItineraryData,
  sanitizeItineraryData,
} from "@/lib/utils/validation"
import { generateItineraryPDF } from "@/lib/pdf/field-mapper"

/**
 * POST /api/generate-pdf
 *
 * Generate PDF from itinerary data with images
 *
 * @param request - Next.js request object
 * @returns PDF file or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body (increased limit for images)
    const body = await request.json()
    const itineraryData: ItineraryData = body.itineraryData || body
    const darkMode: boolean = body.darkMode ?? true // Default to dark mode

    if (!itineraryData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing itinerary data",
        },
        { status: 400 }
      )
    }

    // Validate data
    const validation = validateItineraryData(itineraryData)
    if (!validation.isValid) {
      console.error("Validation failed:", validation.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Sanitize all text inputs
    const sanitizedData = sanitizeItineraryData(itineraryData)

    // Generate PDF
    console.log(`Generating luxury PDF with ${darkMode ? 'dark' : 'light'} mode...`)
    const pdfBytes = await generateItineraryPDF(sanitizedData, darkMode)
    console.log(`PDF generated successfully: ${pdfBytes.length} bytes`)

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19)
    const clientName = sanitizedData.clientName
      .replace(/\s+/g, "-")
      .toLowerCase()
    const filename = `luxury-itinerary-${clientName}-${timestamp}.pdf`

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBytes.length.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: "PDF generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate-pdf
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    message: "Travel Itinerary PDF Generator API",
    version: "1.0.0",
    endpoints: {
      POST: {
        description: "Generate PDF from itinerary data",
        body: {
          itineraryData: {
            clientName: "string",
            destination: "string",
            travelDates: { start: "string", end: "string" },
            bookingRef: "string",
            days: [{ dayNumber: "number", activities: "string" }],
            hotel: {
              name: "string",
              checkIn: "string",
              address: "string",
            },
            inclusions: "string",
            exclusions: "string",
            totalPrice: "number",
            contactInfo: "string",
          },
        },
      },
    },
  })
}
