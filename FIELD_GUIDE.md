# Field Coordinate Guide

This guide explains how to customize field positions, add new fields, and modify the PDF layout without breaking the fixed-layout system.

## Table of Contents

1. [Understanding Coordinates](#understanding-coordinates)
2. [Visual Field Map](#visual-field-map)
3. [Modifying Existing Fields](#modifying-existing-fields)
4. [Adding New Fields](#adding-new-fields)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

## Understanding Coordinates

### Coordinate System

PDF-lib uses a **bottom-left origin** coordinate system:

```
┌─────────────────────────────────────┐ ← Y: 792 (top of page)
│                                     │
│         Your content here           │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘ ← Y: 0 (bottom of page)
↑                                     ↑
X: 0                             X: 612
(left)                           (right)
```

### Field Configuration Properties

Each field has these properties:

```typescript
{
  x: 50,              // Pixels from LEFT edge (0-612)
  y: 680,             // Pixels from BOTTOM edge (0-792)
  maxWidth: 250,      // Maximum text width before wrapping
  fontSize: 12,       // Font size in points
  fontName: 'Helvetica',  // Font family
  characterLimit: 50, // Max characters (frontend validation)
  alignment: 'left',  // Text alignment (optional)
  maxLines: 4,        // Max lines for multi-line fields (optional)
  lineHeight: 1.2     // Line height multiplier (optional)
}
```

### Standard Fonts Available

- `Helvetica` - Regular text
- `Helvetica-Bold` - Bold text
- `Times-Roman` - Serif font
- `Courier` - Monospace font

## Visual Field Map

```
Page Layout (8.5" × 11" = 612 × 792 points):

┌──────────────────────────────────────────────────────┐ Y: 792
│  [LOGO (50,730)]    TRAVEL ITINERARY (306,745)      │
├──────────────────────────────────────────────────────┤ Y: 712
│  CLIENT INFORMATION                                  │
│  Name: (50,675)        Destination: (320,675)       │
│  Dates: (50,635)       Booking Ref: (320,635)       │
├──────────────────────────────────────────────────────┤ Y: 592
│  DAY-BY-DAY ITINERARY (50,560)                      │
│  ┌────┬──────────────────────────────────────────┐  │
│  │Day │ Activities...                            │  │
│  │ 1  │ (110, dynamic Y position)                │  │
│  ├────┼──────────────────────────────────────────┤  │
│  │Day │ Activities...                            │  │
│  │ 2  │                                          │  │
│  └────┴──────────────────────────────────────────┘  │
│                    [Variable Height]                 │
├──────────────────────────────────────────────────────┤
│  HOTEL DETAILS (50,290)                             │
│  Name: (50,260)        Check-in: (320,260)         │
│  Address: (50,225)                                  │
├──────────────────────────────────────────────────────┤
│  INCLUSIONS & EXCLUSIONS (50,210)                   │
│  Included: (50,180)    Not Included: (320,180)     │
├──────────────────────────────────────────────────────┤
│              Total Price: (480,70)                   │
├──────────────────────────────────────────────────────┤
│        Contact: (306,25)                 Page 1 of 1 │
└──────────────────────────────────────────────────────┘ Y: 0
↑                                                      ↑
X: 0                                              X: 612
```

## Modifying Existing Fields

### Example 1: Move Client Name Field

**Goal**: Move the client name 20 pixels to the right and 10 pixels down.

1. Open `lib/config/field-coordinates.ts`
2. Find the `clientInfo` section
3. Locate the `clientName` field
4. Modify coordinates:

```typescript
// Before
clientName: {
  x: 50,
  y: 675,
  // ...
}

// After
clientName: {
  x: 70,    // Moved 20px right
  y: 665,   // Moved 10px down (lower Y = down)
  // ...
}
```

### Example 2: Increase Character Limit

**Goal**: Allow 100 characters for client name instead of 50.

```typescript
clientName: {
  x: 50,
  y: 675,
  maxWidth: 250,
  fontSize: 12,
  fontName: 'Helvetica',
  characterLimit: 100,  // Changed from 50
}
```

### Example 3: Change Font Size

**Goal**: Make destination text larger.

```typescript
destination: {
  x: 320,
  y: 675,
  maxWidth: 250,
  fontSize: 14,  // Changed from 12
  fontName: 'Helvetica',
  characterLimit: 50,
}
```

### Example 4: Adjust Text Wrapping Width

**Goal**: Make hotel address field wider.

```typescript
address: {
  x: 50,
  y: 225,
  maxWidth: 520,  // Changed from 520 (full width available)
  fontSize: 11,
  fontName: 'Helvetica',
  maxLines: 2,
  characterLimit: 150,
  lineHeight: 1.3,
}
```

## Adding New Fields

### Step-by-Step Guide

Let's add an "Emergency Contact" field to the client information section.

#### Step 1: Add to TypeScript Interface

Open `lib/types/itinerary.ts` and update the `ItineraryData` interface:

```typescript
export interface ItineraryData {
  // ... existing fields
  emergencyContact?: string;  // Add this
}
```

#### Step 2: Add Field Coordinates

Open `lib/config/field-coordinates.ts` and add to the `clientInfo` section:

```typescript
export const FIELD_COORDINATES = {
  clientInfo: {
    name: 'Client Information',
    startY: 592,
    height: 120,
    fields: {
      // ... existing fields (clientName, destination, etc.)

      // Add new field
      emergencyContactLabel: {
        x: 50,
        y: 610,
        maxWidth: 150,
        fontSize: 10,
        fontName: 'Helvetica-Bold',
      },
      emergencyContact: {
        x: 50,
        y: 595,
        maxWidth: 250,
        fontSize: 12,
        fontName: 'Helvetica',
        characterLimit: 60,
      },
    },
  },
  // ... other sections
}
```

#### Step 3: Add to Field Mapper

Open `lib/pdf/field-mapper.ts` and add rendering logic in the `renderClientInfo` function:

```typescript
function renderClientInfo(
  page: PDFPage,
  data: ItineraryData,
  regularFont: PDFFont,
  boldFont: PDFFont
): void {
  const fields = FIELD_COORDINATES.clientInfo.fields;

  // ... existing rendering code

  // Add emergency contact rendering
  if (data.emergencyContact) {
    renderText(page, 'Emergency Contact:', fields.emergencyContactLabel, boldFont);
    renderText(page, data.emergencyContact, fields.emergencyContact, regularFont);
  }
}
```

#### Step 4: Add to Form Component

Open `components/TravelItineraryForm.tsx`:

1. Add to state:
```typescript
const [formData, setFormData] = useState<ItineraryData>({
  // ... existing fields
  emergencyContact: '',
});
```

2. Add handler:
```typescript
const handleEmergencyContactChange = (value: string) => {
  setFormData({ ...formData, emergencyContact: value });
};
```

3. Add input field in JSX (in the Client Information section):
```tsx
<CharacterLimitInput
  value={formData.emergencyContact}
  onChange={handleEmergencyContactChange}
  label="Emergency Contact"
  characterLimit={60}
  placeholder="e.g., John Doe: +1-555-0123"
/>
```

#### Step 5: Test

1. Run `npm run dev`
2. Fill in the emergency contact field
3. Generate a PDF
4. Verify the field appears in the correct position

## Common Tasks

### Task 1: Center a Text Field

Change the `alignment` property:

```typescript
title: {
  x: 306,           // X should be center of page (612 / 2)
  y: 745,
  maxWidth: 300,
  fontSize: 24,
  fontName: 'Helvetica-Bold',
  alignment: 'center',  // This centers the text
}
```

### Task 2: Make Multi-Line Text Field Larger

Increase `maxLines` and `characterLimit`:

```typescript
activities: {
  x: 110,
  y: 0,
  maxWidth: 450,
  fontSize: 11,
  fontName: 'Helvetica',
  maxLines: 12,  // Increased from 8
  characterLimit: 600,  // Increased from 400
  lineHeight: 1.3,
}
```

### Task 3: Change Section Order

This requires modifying `lib/pdf/field-mapper.ts` to change the rendering order. However, **this is not recommended** as it may break the multi-page logic.

### Task 4: Add Right-Aligned Field

```typescript
pageNumber: {
  x: 560,           // Right edge minus some margin
  y: 25,
  maxWidth: 50,
  fontSize: 9,
  fontName: 'Helvetica',
  alignment: 'right',  // Right-align the text
}
```

## Troubleshooting

### Problem: Text is Cut Off

**Cause**: `maxWidth` is too small for the content.

**Solution**: Increase `maxWidth` or reduce `fontSize`:

```typescript
clientName: {
  x: 50,
  y: 675,
  maxWidth: 300,  // Increased from 250
  fontSize: 11,   // Reduced from 12
  fontName: 'Helvetica',
  characterLimit: 50,
}
```

### Problem: Text Overlaps Other Fields

**Cause**: Fields are positioned too close together.

**Solution**: Adjust Y coordinates to add more spacing:

```typescript
// Move the second field down
destination: {
  x: 320,
  y: 655,  // Moved down from 675
  // ...
}
```

### Problem: Character Limit Too Restrictive

**Cause**: `characterLimit` is set too low.

**Solution**: Increase the limit (but ensure text still fits in PDF):

```typescript
clientName: {
  // ...
  maxWidth: 300,      // Ensure this is wide enough
  characterLimit: 75, // Increased from 50
}
```

### Problem: PDF Generation Fails

**Possible causes**:

1. Missing field in TypeScript interface
2. Missing rendering logic in field-mapper.ts
3. Invalid coordinate values (negative or beyond page bounds)
4. Typo in field name

**Solution**: Check browser console for errors and verify:
- Field exists in `lib/types/itinerary.ts`
- Field coordinates exist in `lib/config/field-coordinates.ts`
- Field is rendered in `lib/pdf/field-mapper.ts`
- Field name matches everywhere (case-sensitive!)

### Problem: Multi-Page Not Working

**Cause**: Section heights don't account for new fields.

**Solution**: Adjust section height in `lib/config/field-coordinates.ts`:

```typescript
clientInfo: {
  name: 'Client Information',
  startY: 592,
  height: 150,  // Increased from 120 to accommodate new field
  fields: {
    // ...
  }
}
```

## Best Practices

1. **Always test with maximum character limits** to ensure text doesn't overflow
2. **Use consistent spacing** between fields (multiples of 5 or 10 pixels)
3. **Document your changes** with comments in the code
4. **Keep character limits realistic** based on `maxWidth` and `fontSize`
5. **Test multi-page scenarios** after adding fields to ensure pages break correctly
6. **Use visual tools** to calculate coordinates (print rulers on test PDFs)
7. **Backup before major changes** to field-coordinates.ts

## Calculating Coordinates

### Formula for Even Spacing

If you want to evenly space N fields vertically:

```
spacing = (endY - startY) / (N + 1)

field1_y = startY + spacing
field2_y = startY + (spacing * 2)
field3_y = startY + (spacing * 3)
```

### Formula for Centering Horizontally

```
x = (pageWidth - textWidth) / 2
x = (612 - textWidth) / 2  // For centered text
```

For a field with maxWidth = 300:
```
x = (612 - 300) / 2 = 156
```

### Quick Reference: Common Coordinates

- **Left margin**: x = 50
- **Right margin**: x = 562 (612 - 50)
- **Horizontal center**: x = 306 (612 / 2)
- **Top of page**: y = 752 (792 - 40 margin)
- **Bottom of page**: y = 40
- **Vertical center**: y = 396 (792 / 2)

## Advanced: Creating New Sections

To add an entirely new section (e.g., "Payment Details"):

1. Add to `FIELD_COORDINATES` in `lib/config/field-coordinates.ts`
2. Calculate startY and height based on surrounding sections
3. Add drawing function to `lib/pdf/template.ts` (optional, for visual elements)
4. Add rendering function to `lib/pdf/field-mapper.ts`
5. Update multi-page handler if section should appear on every page

**This is an advanced task** - refer to existing sections as templates.

## Getting Help

- Review existing field configurations in `lib/config/field-coordinates.ts`
- Check the visual field map (above)
- Read inline code comments
- Test changes incrementally
- Use browser DevTools to debug API responses

---

**Remember**: The power of this system is that the PDF structure is fixed. Only modify coordinates and sizing - don't change the fundamental layout logic unless absolutely necessary.
