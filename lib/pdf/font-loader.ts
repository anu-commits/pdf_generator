/**
 * Font Loader for PDF Generation
 *
 * Loads custom fonts:
 * - Headings: Inter
 * - Body: Jost (Futura alternative)
 */

import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Font family with all weight variants
 */
export interface FontFamily {
  heading: PDFFont;
  headingBold: PDFFont;
  headingItalic: PDFFont;
  body: PDFFont;
  bodyBold: PDFFont;
  bodyItalic: PDFFont;
  mono: PDFFont;
}

/**
 * Load fonts for PDF generation
 * Loads Inter for headings, Jost for body text
 *
 * @param pdfDoc - The PDF document to embed fonts into
 * @returns Promise resolving to FontFamily with all font variants
 */
export async function loadFonts(pdfDoc: PDFDocument): Promise<FontFamily> {
  try {
    // Load custom fonts (Inter for headings, Jost for body)
    const fonts = await loadCustomFontsFromFiles(pdfDoc);
    return fonts;
  } catch (error) {
    console.error('Error loading custom fonts, falling back to standard fonts:', error);
    return await loadStandardFonts(pdfDoc);
  }
}

/**
 * Load custom fonts from files in public/fonts directory
 */
async function loadCustomFontsFromFiles(pdfDoc: PDFDocument): Promise<FontFamily> {
  // Register fontkit to enable custom font embedding
  pdfDoc.registerFontkit(fontkit);

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  // Load Inter fonts for headings and convert Buffer to Uint8Array
  const interRegular = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Inter-Regular.ttf')));
  const interBold = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Inter-Bold.ttf')));
  const interItalic = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Inter-Italic.ttf')));

  // Load Jost fonts for body (Futura alternative) and convert Buffer to Uint8Array
  const jostRegular = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Jost-Regular.ttf')));
  const jostBold = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Jost-Bold.ttf')));
  const jostItalic = new Uint8Array(fs.readFileSync(path.join(fontsDir, 'Jost-Italic.ttf')));

  // Embed fonts
  const [heading, headingBold, headingItalic, body, bodyBold, bodyItalic, mono] = await Promise.all([
    pdfDoc.embedFont(interRegular),
    pdfDoc.embedFont(interBold),
    pdfDoc.embedFont(interItalic),
    pdfDoc.embedFont(jostRegular),
    pdfDoc.embedFont(jostBold),
    pdfDoc.embedFont(jostItalic),
    pdfDoc.embedFont(StandardFonts.Courier), // Keep mono as Courier
  ]);

  return {
    heading,
    headingBold,
    headingItalic,
    body,
    bodyBold,
    bodyItalic,
    mono,
  };
}

/**
 * Load standard PDF fonts (always available)
 */
async function loadStandardFonts(pdfDoc: PDFDocument): Promise<FontFamily> {
  const [
    heading,
    headingBold,
    headingItalic,
    body,
    bodyBold,
    bodyItalic,
    mono
  ] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.TimesRoman),
    pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    pdfDoc.embedFont(StandardFonts.Courier)
  ]);

  return {
    heading,
    headingBold,
    headingItalic,
    body,
    bodyBold,
    bodyItalic,
    mono
  };
}

/**
 * Load custom fonts from URLs or file paths
 * This function can be extended to load custom TTF/OTF fonts
 *
 * Example usage:
 * const customFonts = await loadCustomFonts(pdfDoc, {
 *   headingUrl: '/fonts/PlayfairDisplay-Bold.ttf',
 *   bodyUrl: '/fonts/OpenSans-Regular.ttf'
 * });
 */
export async function loadCustomFonts(
  pdfDoc: PDFDocument,
  fontUrls: {
    headingUrl?: string;
    headingBoldUrl?: string;
    bodyUrl?: string;
    bodyBoldUrl?: string;
  }
): Promise<Partial<FontFamily>> {
  const customFonts: Partial<FontFamily> = {};

  try {
    // Load heading font if URL provided
    if (fontUrls.headingUrl) {
      const fontBytes = await fetch(fontUrls.headingUrl).then(res => res.arrayBuffer());
      customFonts.heading = await pdfDoc.embedFont(new Uint8Array(fontBytes));
    }

    // Load heading bold if URL provided
    if (fontUrls.headingBoldUrl) {
      const fontBytes = await fetch(fontUrls.headingBoldUrl).then(res => res.arrayBuffer());
      customFonts.headingBold = await pdfDoc.embedFont(new Uint8Array(fontBytes));
    }

    // Load body font if URL provided
    if (fontUrls.bodyUrl) {
      const fontBytes = await fetch(fontUrls.bodyUrl).then(res => res.arrayBuffer());
      customFonts.body = await pdfDoc.embedFont(new Uint8Array(fontBytes));
    }

    // Load body bold if URL provided
    if (fontUrls.bodyBoldUrl) {
      const fontBytes = await fetch(fontUrls.bodyBoldUrl).then(res => res.arrayBuffer());
      customFonts.bodyBold = await pdfDoc.embedFont(new Uint8Array(fontBytes));
    }
  } catch (error) {
    console.error('Error loading custom fonts:', error);
  }

  return customFonts;
}

/**
 * Get font for a specific purpose
 */
export function getFont(
  fonts: FontFamily,
  type: 'heading' | 'body' | 'mono',
  weight: 'regular' | 'bold' | 'italic' = 'regular'
): PDFFont {
  if (type === 'heading') {
    if (weight === 'bold') return fonts.headingBold;
    if (weight === 'italic') return fonts.headingItalic;
    return fonts.heading;
  }

  if (type === 'body') {
    if (weight === 'bold') return fonts.bodyBold;
    if (weight === 'italic') return fonts.bodyItalic;
    return fonts.body;
  }

  return fonts.mono;
}
