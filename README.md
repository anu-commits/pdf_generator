# Travel Itinerary PDF Generator

A professional Next.js application for generating pixel-perfect travel itinerary PDFs with fixed layouts and multi-page support.

## Features

- **Fixed, Pixel-Perfect Layout**: PDF structure never changes - only content is injected at predefined coordinates
- **Multi-Page Support**: Automatically handles long itineraries by distributing content across multiple pages
- **Professional Template**: Travel agency-style design with standard PDF fonts
- **Character Limits**: Real-time character counting with visual warnings to protect layout
- **PDF Preview**: Client-side preview before download using browser's PDF viewer
- **Easy Configuration**: Centralized field coordinates for easy customization

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd pdf_generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Generating a PDF

1. Fill in the client information (name, destination, dates, booking reference)
2. Add itinerary days (click "Add Another Day" for more days)
3. Enter hotel details
4. Add inclusions and exclusions (one per line)
5. Set the total price
6. Add contact information
7. Click "Generate PDF"
8. Preview the PDF in the modal
9. Download using the "Download PDF" button

### Character Limits

Each field has a character limit to ensure text fits within the PDF layout:

- **Client Name**: 50 characters
- **Destination**: 50 characters
- **Travel Dates**: 40 characters each
- **Booking Reference**: 20 characters
- **Day Activities**: 400 characters per day
- **Hotel Name**: 50 characters
- **Hotel Address**: 150 characters
- **Inclusions/Exclusions**: 400 characters each
- **Contact Info**: 100 characters

Color-coded indicators show when you're approaching limits:
- Green: < 60% used
- Yellow: 60-80% used
- Orange: 80-100% used
- Red: At limit

## Architecture

### Project Structure

```
pdf_generator/
├── app/
│   ├── api/generate-pdf/
│   │   └── route.ts              # PDF generation API endpoint
│   ├── page.tsx                   # Main page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── TravelItineraryForm.tsx    # Main form component
│   ├── ItineraryDayInput.tsx      # Day entry component
│   ├── CharacterLimitInput.tsx    # Input with char counter
│   └── PDFPreview.tsx             # PDF preview modal
├── lib/
│   ├── pdf/
│   │   ├── template.ts            # PDF template builder
│   │   ├── field-mapper.ts        # Data to PDF mapping
│   │   ├── text-renderer.ts       # Text injection engine
│   │   └── multi-page-handler.ts  # Page distribution logic
│   ├── config/
│   │   ├── pdf-config.ts          # PDF dimensions & fonts
│   │   └── field-coordinates.ts   # Field positions (EDIT THIS!)
│   ├── types/
│   │   └── itinerary.ts           # TypeScript interfaces
│   └── utils/
│       ├── text-utils.ts          # Text measurement
│       └── validation.ts          # Input validation
└── public/
    └── logo-placeholder.svg       # Logo file
```

### Key Technologies

- **Next.js 14** - App Router, API routes
- **TypeScript** - Type safety
- **pdf-lib** - PDF generation library
- **Tailwind CSS** - Styling
- **React** - UI components

## Customization

### Modifying Field Positions

All field positions are defined in [lib/config/field-coordinates.ts](lib/config/field-coordinates.ts).

To move a field:

1. Open `lib/config/field-coordinates.ts`
2. Find the section and field you want to modify
3. Update the `x` and `y` coordinates
4. Save the file

Example:
```typescript
clientName: {
  x: 50,              // Change this to move horizontally
  y: 675,             // Change this to move vertically
  maxWidth: 250,      // Change this for text wrapping width
  fontSize: 12,       // Change this for font size
  fontName: 'Helvetica',
  characterLimit: 50  // Change this for form validation
}
```

**Coordinate System**:
- X: Distance from LEFT edge (0 = left, 612 = right)
- Y: Distance from BOTTOM edge (0 = bottom, 792 = top)
- pdf-lib uses bottom-left as origin (0,0)

### Adding New Fields

See [FIELD_GUIDE.md](FIELD_GUIDE.md) for detailed instructions on adding new fields to the PDF.

### Changing Page Dimensions

Edit [lib/config/pdf-config.ts](lib/config/pdf-config.ts#L18-L19):

```typescript
export const PDF_CONFIG = {
  pageWidth: 612,   // 8.5" × 72 DPI
  pageHeight: 792,  // 11" × 72 DPI
  // ...
}
```

## API Reference

### POST /api/generate-pdf

Generate a PDF from itinerary data.

**Request Body**:
```json
{
  "itineraryData": {
    "clientName": "string",
    "destination": "string",
    "travelDates": {
      "start": "2024-12-20",
      "end": "2024-12-27"
    },
    "bookingRef": "string",
    "days": [
      {
        "dayNumber": 1,
        "activities": "string"
      }
    ],
    "hotel": {
      "name": "string",
      "checkIn": "2024-12-20",
      "address": "string"
    },
    "inclusions": "string",
    "exclusions": "string",
    "totalPrice": 0,
    "contactInfo": "string"
  }
}
```

**Response**:
- Success: PDF file (application/pdf)
- Error: JSON with error details

## Development

### Running Tests

```bash
# Currently no tests implemented
# TODO: Add test suite
```

### Building for Production

```bash
npm run build
npm start
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Organized by feature (PDF generation logic separate from UI)

## Troubleshooting

### PDF generation fails

- Check browser console for errors
- Verify all required fields are filled
- Ensure character limits are not exceeded
- Check that dates are valid

### Text is cut off in PDF

- Reduce text content or increase `maxWidth` in field config
- Check character limits are appropriate
- Verify font size doesn't cause overflow

### Multi-page not working

- Check [lib/pdf/multi-page-handler.ts](lib/pdf/multi-page-handler.ts)
- Ensure day heights are calculated correctly
- Verify page capacity constants

## Contributing

This is a self-contained project. To contribute:

1. Make changes to the code
2. Test thoroughly with various itinerary sizes
3. Document any configuration changes
4. Update FIELD_GUIDE.md if adding new fields

## License

MIT License - feel free to use for commercial travel agencies.

## Support

For issues or questions:
- Check [FIELD_GUIDE.md](FIELD_GUIDE.md) for customization help
- Review comments in [lib/config/field-coordinates.ts](lib/config/field-coordinates.ts)
- Examine the source code - it's heavily commented

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [pdf-lib](https://pdf-lib.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Professional Travel Itinerary PDF Generator**
Built for travel agencies that need pixel-perfect PDFs every time.
