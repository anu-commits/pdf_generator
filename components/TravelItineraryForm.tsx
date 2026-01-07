"use client"

/**
 * Travel Itinerary Form Component - Luxury Design Version
 *
 * Main form for entering luxury travel itinerary data and generating PDFs.
 * Includes all input fields for flights, hotels, pricing, bank details, and terms.
 */

import React, { useState } from "react"
import {
  ItineraryData,
  ItineraryDay,
  FlightDetails,
  HotelStay,
  BankDetails,
  PricingDetails,
  TermsConditions,
  BasicDetails,
} from "@/lib/types/itinerary"
import CharacterLimitInput from "./CharacterLimitInput"
import ItineraryDayInput from "./ItineraryDayInput"
import FlightInput from "./FlightInput"
import HotelStayInput from "./HotelStayInput"
import BankDetailsInput from "./BankDetailsInput"
import TermsInput from "./TermsInput"
import ListBuilder from "./ListBuilder"
import ImageUploadInput from "./ImageUploadInput"
import PDFPreview from "./PDFPreview"

export default function TravelItineraryForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true) // PDF dark mode toggle

  const [formData, setFormData] = useState<ItineraryData>({
    // Client Information
    clientName: "John Smith",
    destination: "Cairo, Egypt",
    travelDates: {
      start: "2024-03-15",
      end: "2024-03-22",
    },
    bookingRef: "LT-2024-001",

    // Day-by-day itinerary with images
    days: [
      {
        dayNumber: 1,
        title: "Arrive Cairo, Egypt",
        activities:
          "Arrive at Cairo International Airport. Meet and greet by our representative. Transfer to hotel. Evening visit to Khan El Khalili bazaar for shopping and dinner at traditional restaurant.",
        image: undefined,
        hotel: "FOUR SEASONS HOTEL CAIRO AT NILE PLAZA",
      },
      {
        dayNumber: 2,
        title: "Pyramids of Giza Tour",
        activities:
          "Full day tour of the Giza Pyramids, Sphinx, and Egyptian Museum. Enjoy a traditional Egyptian lunch. Camel ride at sunset near the pyramids. Return to hotel for dinner.",
        image: undefined,
        hotel: "FOUR SEASONS HOTEL CAIRO AT NILE PLAZA",
      },
      {
        dayNumber: 3,
        title: "Luxor Day Trip",
        activities:
          "Early morning flight to Luxor. Visit Valley of the Kings, Karnak Temple, and Temple of Hatshepsut. Lunch at Nile-side restaurant. Evening return flight to Cairo.",
        image: undefined,
        hotel: "FOUR SEASONS HOTEL CAIRO AT NILE PLAZA",
      },
    ],

    // Flights
    flights: [
      {
        flightNumber: "MS 960",
        departure: {
          airport: "Dubai",
          date: "2024-03-15",
          time: "07:30",
        },
        arrival: {
          airport: "Cairo",
          date: "2024-03-15",
          time: "10:45",
        },
        duration: "4h 15m",
        cabin: "Economy",
      },
      {
        flightNumber: "MS 961",
        departure: {
          airport: "Cairo",
          date: "2024-03-22",
          time: "18:30",
        },
        arrival: {
          airport: "Dubai",
          date: "2024-03-22",
          time: "23:45",
        },
        duration: "3h 15m",
        cabin: "Economy",
      },
    ],

    // Hotels
    hotels: [
      {
        name: "Four Seasons Hotel Cairo at Nile Plaza",
        checkIn: "2024-03-15",
        checkOut: "2024-03-22",
        numberOfRooms: "2",
        mealPlan: "Breakfast Included",
        roomCategory: "5-Star Luxury - Deluxe Nile View",
        images: [],
      },
    ],

    // Inclusions and exclusions (now arrays)
    inclusions: [
      "All activities shown in itinerary including Giza pyramids visit, Cairo seafood tour",
      "All activities shown in itinerary including Giza pyramids visit, Cairo seafood tour",
      "All activities shown in itinerary including Giza pyramids visit & pyramids Sphinx tour the life",
    ],
    exclusions: [
      "Personal expenses and gratuities",
      "Travel insurance",
      "Visa fees",
      "Optional activities not mentioned in itinerary",
    ],

    // Pricing
    pricing: {
      subtotal: 2500,
      taxes: 250,
      fees: 50,
      total: 2800,
      currency: "USD",
    },

    // Bank details
    bankDetails: {
      accountName: "The Luxe Trails LLC",
      accountNumber: "1234567890",
      bankName: "Emirates NBD Bank",
      swiftCode: "EBILAEAD",
      iban: "AE070331234567890123456",
    },

    // Terms
    terms: {
      cancellationPolicy:
        "Free cancellation up to 14 days before departure. 50% charge for cancellations 7-14 days before. No refund for cancellations within 7 days of departure.",
      paymentTerms:
        "50% deposit required at booking. Final payment due 30 days before departure. Payment accepted via bank transfer or credit card.",
      travelInsurance:
        "Travel insurance is strongly recommended and can be arranged through our partner providers. Coverage should include trip cancellation, medical emergencies, and baggage loss.",
      liabilityDisclaimer:
        "The company acts only as an agent for the hotels, airlines, and other service providers and is not liable for any loss, injury, or damage to person or property. Travelers are responsible for obtaining necessary travel documents and insurance.",
    },

    // Contact information
    contactInfo:
      "Email: info@theluxetrails.com | Phone: +971 4 123 4567 | Website: www.theluxetrails.com | Address: Dubai, UAE",

    // Branding
    companyName: "THE LUXE TRAILS",

    // New design fields
    heroImage: undefined,
    whyChooseUs: [
      "Expert local guides with 10+ years experience",
      "Luxury accommodations in prime locations",
      "24/7 customer support throughout your journey",
      "Carefully curated authentic experiences",
    ],
    basicDetails: {
      duration: "8 Days / 7 Nights",
      groupSize: "2-10 People",
      destinations: "Cairo, Luxor, Egypt",
      guide: "Professional Guide",
      accommodation: "5-Star Hotels",
      visaRequired: "Required",
    },
    tourHighlights: [
      "Visit the iconic Pyramids of Giza and the Great Sphinx",
      "Explore the ancient treasures at the Egyptian Museum",
      "Discover the Valley of the Kings in Luxor",
      "Experience authentic Egyptian cuisine and culture",
      "Shop at traditional bazaars and markets",
    ],
  })

  // Client Information Handlers
  const handleClientNameChange = (value: string) => {
    setFormData({ ...formData, clientName: value })
  }

  const handleDestinationChange = (value: string) => {
    setFormData({ ...formData, destination: value })
  }

  const handleTravelDateStartChange = (value: string) => {
    setFormData({
      ...formData,
      travelDates: { ...formData.travelDates, start: value },
    })
  }

  const handleTravelDateEndChange = (value: string) => {
    setFormData({
      ...formData,
      travelDates: { ...formData.travelDates, end: value },
    })
  }

  const handleBookingRefChange = (value: string) => {
    setFormData({ ...formData, bookingRef: value })
  }

  // New Design Fields Handlers
  const handleHeroImageChange = (base64Image: string | null) => {
    setFormData({ ...formData, heroImage: base64Image || undefined })
  }

  const handleWhyChooseUsChange = (whyChooseUs: string[]) => {
    setFormData({ ...formData, whyChooseUs })
  }

  const handleBasicDetailsChange = (
    field: keyof BasicDetails,
    value: string
  ) => {
    setFormData({
      ...formData,
      basicDetails: {
        ...formData.basicDetails,
        [field]: value,
      },
    })
  }

  const handleTourHighlightsChange = (tourHighlights: string[]) => {
    setFormData({ ...formData, tourHighlights })
  }

  // Day Handlers
  const handleDayChange = (index: number, day: ItineraryDay) => {
    const newDays = [...formData.days]
    newDays[index] = day
    setFormData({ ...formData, days: newDays })
  }

  const handleAddDay = () => {
    const newDayNumber = formData.days.length + 1
    setFormData({
      ...formData,
      days: [
        ...formData.days,
        {
          dayNumber: newDayNumber,
          title: "",
          activities: "",
          image: undefined,
        },
      ],
    })
  }

  const handleRemoveDay = (index: number) => {
    if (formData.days.length > 1) {
      const newDays = formData.days.filter((_, i) => i !== index)
      // Renumber days
      const renumberedDays = newDays.map((day, i) => ({
        ...day,
        dayNumber: i + 1,
      }))
      setFormData({ ...formData, days: renumberedDays })
    }
  }

  // Flight Handlers
  const handleFlightsChange = (flights: FlightDetails[]) => {
    setFormData({ ...formData, flights })
  }

  // Hotel Handlers
  const handleHotelsChange = (hotels: HotelStay[]) => {
    setFormData({ ...formData, hotels })
  }

  // Inclusions/Exclusions Handlers
  const handleInclusionsChange = (inclusions: string[]) => {
    setFormData({ ...formData, inclusions })
  }

  const handleExclusionsChange = (exclusions: string[]) => {
    setFormData({ ...formData, exclusions })
  }

  // Pricing Handlers
  const handlePricingChange = (
    field: keyof PricingDetails,
    value: string | number
  ) => {
    // Convert string values to numbers for numeric fields
    let processedValue: string | number = value
    if (
      field === "subtotal" ||
      field === "taxes" ||
      field === "fees" ||
      field === "total"
    ) {
      processedValue =
        typeof value === "string" ? parseFloat(value) || 0 : value
    }

    const updatedPricing = { ...formData.pricing, [field]: processedValue }

    // Auto-calculate total if subtotal, taxes, or fees change
    if (field === "subtotal" || field === "taxes" || field === "fees") {
      const subtotal =
        field === "subtotal"
          ? (processedValue as number)
          : formData.pricing.subtotal
      const taxes =
        field === "taxes" ? (processedValue as number) : formData.pricing.taxes
      const fees =
        field === "fees" ? (processedValue as number) : formData.pricing.fees
      updatedPricing.total = subtotal + taxes + fees
    }

    setFormData({ ...formData, pricing: updatedPricing })
  }

  // Bank Details Handlers
  const handleBankDetailsChange = (bankDetails: BankDetails) => {
    setFormData({ ...formData, bankDetails })
  }

  // Terms Handlers
  const handleTermsChange = (terms: TermsConditions) => {
    setFormData({ ...formData, terms })
  }

  // Contact Info Handler
  const handleContactInfoChange = (value: string) => {
    setFormData({ ...formData, contactInfo: value })
  }

  // Company Name Handler
  const handleCompanyNameChange = (value: string) => {
    setFormData({ ...formData, companyName: value })
  }

  // PDF Generation
  const handleGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setValidationErrors({})

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itineraryData: formData,
          darkMode: darkMode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // If validation errors, store them separately
        if (errorData.details && typeof errorData.details === "object") {
          setValidationErrors(errorData.details)
          setError("Please fix the validation errors below")
        } else {
          setError(errorData.error || "Failed to generate PDF")
        }
        return
      }

      // Create blob URL for preview
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClosePdfPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  return (
    <>
      <form
        onSubmit={handleGeneratePDF}
        className="max-w-6xl mx-auto p-6 space-y-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Travel Itinerary Generator
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Error:</strong> {error}
            {Object.keys(validationErrors).length > 0 && (
              <ul className="mt-2 ml-4 list-disc space-y-1">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span> {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Branding Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Company Information
          </h2>
          <CharacterLimitInput
            value={formData.companyName || ""}
            onChange={handleCompanyNameChange}
            label="Company Name"
            characterLimit={100}
            placeholder="e.g., THE LUXE TRAILS"
            required={false}
          />
        </section>

        {/* Hero Image Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Hero Image
          </h2>
          <ImageUploadInput
            label="Cover/Hero Image (Optional)"
            value={formData.heroImage}
            onChange={handleHeroImageChange}
            helperText="Upload a stunning hero image for the PDF cover (will be displayed on page 1)"
          />
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Why Choose Us
          </h2>
          <ListBuilder
            items={formData.whyChooseUs || []}
            onChange={handleWhyChooseUsChange}
            placeholder="Add a reason why customers should choose you"
            label="Reasons/Benefits"
            characterLimit={200}
          />
        </section>

        {/* Basic Details Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Basic Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CharacterLimitInput
              value={formData.basicDetails?.duration || ""}
              onChange={(value) => handleBasicDetailsChange("duration", value)}
              label="Duration"
              characterLimit={50}
              placeholder="e.g., 8 Days / 7 Nights"
              required={false}
            />
            <CharacterLimitInput
              value={formData.basicDetails?.groupSize || ""}
              onChange={(value) => handleBasicDetailsChange("groupSize", value)}
              label="Group Size"
              characterLimit={50}
              placeholder="e.g., 2-10 People"
              required={false}
            />
            <CharacterLimitInput
              value={formData.basicDetails?.destinations || ""}
              onChange={(value) =>
                handleBasicDetailsChange("destinations", value)
              }
              label="Destinations"
              characterLimit={100}
              placeholder="e.g., Cairo, Luxor, Egypt"
              required={false}
            />
            <CharacterLimitInput
              value={formData.basicDetails?.guide || ""}
              onChange={(value) => handleBasicDetailsChange("guide", value)}
              label="Guide"
              characterLimit={50}
              placeholder="e.g., Professional Guide"
              required={false}
            />
            <CharacterLimitInput
              value={formData.basicDetails?.accommodation || ""}
              onChange={(value) =>
                handleBasicDetailsChange("accommodation", value)
              }
              label="Accommodation"
              characterLimit={100}
              placeholder="e.g., 5-Star Hotels"
              required={false}
            />
            <CharacterLimitInput
              value={formData.basicDetails?.visaRequired || ""}
              onChange={(value) =>
                handleBasicDetailsChange("visaRequired", value)
              }
              label="Visa Required"
              characterLimit={50}
              placeholder="e.g., Required / Not Required"
              required={false}
            />
          </div>
        </section>

        {/* Tour Highlights Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Tour Highlights
          </h2>
          <ListBuilder
            items={formData.tourHighlights || []}
            onChange={handleTourHighlightsChange}
            placeholder="Add a tour highlight"
            label="Highlights"
            characterLimit={200}
          />
        </section>

        {/* Client Information Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CharacterLimitInput
              value={formData.clientName}
              onChange={handleClientNameChange}
              label="Client Name"
              characterLimit={50}
              placeholder="Enter client's full name"
              required={true}
            />

            <CharacterLimitInput
              value={formData.destination}
              onChange={handleDestinationChange}
              label="Destination"
              characterLimit={50}
              placeholder="e.g., Cairo, Egypt"
              required={true}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.travelDates.start}
                onChange={(e) => handleTravelDateStartChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.travelDates.end}
                onChange={(e) => handleTravelDateEndChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <CharacterLimitInput
              value={formData.bookingRef}
              onChange={handleBookingRefChange}
              label="Booking Reference"
              characterLimit={20}
              placeholder="e.g., BK-2024-001"
              required={true}
            />
          </div>
        </section>

        {/* Flights Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Flights
          </h2>
          <FlightInput
            flights={formData.flights}
            onChange={handleFlightsChange}
          />
        </section>

        {/* Day-by-Day Itinerary Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Day-by-Day Itinerary
          </h2>
          <div className="space-y-4">
            {formData.days.map((day, index) => (
              <ItineraryDayInput
                key={index}
                day={day}
                onChange={(updatedDay) => handleDayChange(index, updatedDay)}
                onRemove={() => handleRemoveDay(index)}
                canRemove={formData.days.length > 1}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddDay}
            className="mt-4 w-full py-3 border-2 border-dashed border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
          >
            + Add Another Day
          </button>
        </section>

        {/* Hotels Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Hotels / Accommodations
          </h2>
          <HotelStayInput
            hotels={formData.hotels}
            onChange={handleHotelsChange}
          />
        </section>

        {/* Inclusions Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Inclusions
          </h2>
          <ListBuilder
            label="What's Included"
            items={formData.inclusions}
            onChange={handleInclusionsChange}
            placeholder="Add inclusion (e.g., Giza pyramids visit, Cairo seafood tour)"
            helperText="Add items that are included in the package"
          />
        </section>

        {/* Exclusions Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Exclusions
          </h2>
          <ListBuilder
            label="What's Not Included"
            items={formData.exclusions}
            onChange={handleExclusionsChange}
            placeholder="Add exclusion (e.g., Personal expenses, Travel insurance)"
            helperText="Add items that are NOT included in the package"
          />
        </section>

        {/* Pricing Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Pricing Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricing.subtotal}
                onChange={(e) =>
                  handlePricingChange("subtotal", e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxes
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricing.taxes}
                onChange={(e) => handlePricingChange("taxes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fees
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricing.fees}
                onChange={(e) => handlePricingChange("fees", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.pricing.currency}
                onChange={(e) =>
                  handlePricingChange("currency", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="md:col-span-2 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-amber-700">
                  {formData.pricing.currency}{" "}
                  {formData.pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bank Details Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Payment Information
          </h2>
          <BankDetailsInput
            bankDetails={formData.bankDetails}
            onChange={handleBankDetailsChange}
          />
        </section>

        {/* Terms & Conditions Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Terms & Conditions
          </h2>
          <TermsInput terms={formData.terms} onChange={handleTermsChange} />
        </section>

        {/* Contact Information Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Contact Information
          </h2>
          <CharacterLimitInput
            value={formData.contactInfo}
            onChange={handleContactInfoChange}
            label="Contact Details"
            characterLimit={150}
            multiline={true}
            rows={3}
            placeholder="Phone, email, website, address, etc."
            required={true}
          />
        </section>

        {/* Dark Mode Toggle */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            PDF Theme
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-gray-700 font-medium">
                Dark Mode Background
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {darkMode ? "(Black background with white text)" : "(White background with dark text)"}
            </span>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isGenerating}
            className={`
              px-12 py-4 rounded-lg font-semibold text-lg transition-all
              ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 hover:shadow-lg transform hover:scale-105"
              }
              text-white
            `}
          >
            {isGenerating ? "Generating PDF..." : "Generate PDF"}
          </button>
        </div>
      </form>

      {/* PDF Preview Modal */}
      {pdfUrl && <PDFPreview pdfUrl={pdfUrl} onClose={handleClosePdfPreview} />}
    </>
  )
}
