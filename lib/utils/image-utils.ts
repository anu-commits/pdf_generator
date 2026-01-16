/**
 * Image Upload and Processing Utilities
 *
 * Handles image upload, validation, base64 conversion, and PDF embedding
 */

import { PDFDocument, PDFImage, PDFPage, rgb } from 'pdf-lib';
import { ValidationResult } from '../types/itinerary';

/**
 * Maximum image file size (no practical limit)
 */
const MAX_IMAGE_SIZE = 500 * 1024 * 1024; // 500MB - essentially no limit

/**
 * Supported image formats (only PNG and JPEG - pdf-lib doesn't support AVIF, WebP, HEIC)
 */
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Unsupported formats that users commonly try to upload
 */
const UNSUPPORTED_FORMATS: Record<string, string> = {
  'image/avif': 'AVIF',
  'image/webp': 'WebP',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
};

/**
 * Convert a File object to base64 string
 *
 * @param file - The image file to convert
 * @returns Promise resolving to base64 encoded string (with data:image prefix)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file format and size
 *
 * @param file - The image file to validate
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validateImage(file: File): ValidationResult {
  const errors: Record<string, string> = {};

  // Check for specifically unsupported formats first
  if (UNSUPPORTED_FORMATS[file.type]) {
    errors.format = `${UNSUPPORTED_FORMATS[file.type]} images are not supported. Please convert to PNG or JPEG.`;
  }
  // Check file type
  else if (!SUPPORTED_FORMATS.includes(file.type)) {
    errors.format = `Invalid format. Only JPEG and PNG images are supported.`;
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
    errors.size = `File size (${sizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB).`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate multiple image files
 *
 * @param files - Array of image files to validate
 * @returns ValidationResult with combined errors
 */
export function validateImages(files: File[]): ValidationResult {
  const errors: Record<string, string> = {};

  files.forEach((file, index) => {
    const result = validateImage(file);
    if (!result.isValid) {
      Object.entries(result.errors).forEach(([key, value]) => {
        errors[`image_${index}_${key}`] = value;
      });
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Extract base64 data from data URL
 *
 * @param dataUrl - Data URL string (e.g., "data:image/png;base64,iVBORw0...")
 * @returns Object with format and base64 data
 */
export function parseBase64Image(dataUrl: string): { format: 'png' | 'jpg', data: string } {
  // Extract base64 data after the comma
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid base64 image format: no comma found');
  }

  const data = dataUrl.substring(commaIndex + 1);

  // Detect format from actual bytes instead of MIME type
  // PNG magic bytes: 0x89 0x50 0x4E 0x47 (base64 starts with "iVBORw")
  // JPEG magic bytes: 0xFF 0xD8 (base64 starts with "/9j/")
  const format = detectImageFormat(data);

  return { format, data };
}

/**
 * Detect image format from base64 data by examining magic bytes
 * Throws error for unsupported formats like AVIF, WebP, etc.
 */
function detectImageFormat(base64Data: string): 'png' | 'jpg' {
  // Clean the base64 data - remove any whitespace or line breaks
  const cleanData = base64Data.replace(/\s/g, '');

  // PNG files start with: 0x89 0x50 0x4E 0x47 which in base64 is "iVBORw"
  if (cleanData.startsWith('iVBORw')) {
    return 'png';
  }

  // JPEG files start with: 0xFF 0xD8 which in base64 is "/9j/"
  if (cleanData.startsWith('/9j/')) {
    return 'jpg';
  }

  // Try to decode first few bytes and check
  try {
    const binaryString = Buffer.from(cleanData.substring(0, 40), 'base64').toString('binary');
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check PNG signature: 137 80 78 71 (0x89 0x50 0x4E 0x47)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'png';
    }

    // Check JPEG signature: 255 216 (0xFF 0xD8)
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      return 'jpg';
    }

    // Check for AVIF/HEIC (ftyp box) - not supported
    const ftypString = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (ftypString === 'ftyp') {
      const brandString = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (brandString === 'avif' || brandString === 'avis') {
        throw new Error('AVIF images are not supported. Please convert to PNG or JPEG.');
      }
      if (brandString === 'heic' || brandString === 'heix' || brandString === 'mif1') {
        throw new Error('HEIC images are not supported. Please convert to PNG or JPEG.');
      }
    }

    // Check for WebP (RIFF....WEBP) - not supported
    const riffString = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (riffString === 'RIFF') {
      const webpString = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (webpString === 'WEBP') {
        throw new Error('WebP images are not supported. Please convert to PNG or JPEG.');
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('not supported')) {
      throw e;
    }
    console.error('Error decoding base64:', e);
  }

  // If we can't detect format, throw an error
  throw new Error('Unsupported image format. Please use PNG or JPEG images only.');
}

/**
 * Embed an image into a PDF document
 *
 * @param pdfDoc - The PDF document to embed the image into
 * @param base64Image - Base64 encoded image string (with data:image prefix)
 * @returns Promise resolving to PDFImage object
 */
export async function embedImageInPDF(
  pdfDoc: PDFDocument,
  base64Image: string
): Promise<PDFImage> {
  try {
    const { format, data } = parseBase64Image(base64Image);

    // Clean the base64 data
    const cleanData = data.replace(/\s/g, '');

    // Convert base64 to Uint8Array using Buffer (Node.js)
    const imageBytes = Buffer.from(cleanData, 'base64');

    console.log('Embedding image, format:', format, 'bytes:', imageBytes.length);

    // Embed image based on format
    if (format === 'png') {
      return await pdfDoc.embedPng(imageBytes);
    } else {
      return await pdfDoc.embedJpg(imageBytes);
    }
  } catch (error) {
    throw new Error(`Failed to embed image in PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Draw an image on a PDF page with positioning and sizing options
 *
 * @param page - The PDF page to draw on
 * @param image - The embedded PDF image
 * @param x - X coordinate (from left edge)
 * @param y - Y coordinate (from bottom edge)
 * @param width - Image width
 * @param height - Image height
 * @param options - Optional drawing options (opacity, border)
 */
export function drawImage(
  page: PDFPage,
  image: PDFImage,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    opacity?: number;
    border?: boolean;
    borderColor?: { r: number; g: number; b: number };
    borderWidth?: number;
  }
): void {
  // Draw image
  page.drawImage(image, {
    x,
    y,
    width,
    height,
    opacity: options?.opacity ?? 1.0
  });

  // Draw border if requested
  if (options?.border) {
    const borderColor = options.borderColor ?? { r: 0.5, g: 0.5, b: 0.5 };
    const borderWidth = options.borderWidth ?? 1;

    page.drawRectangle({
      x,
      y,
      width,
      height,
      borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
      borderWidth,
      opacity: options.opacity ?? 1.0
    });
  }
}

/**
 * Calculate image dimensions to fit within a container while maintaining aspect ratio
 *
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param maxWidth - Maximum container width
 * @param maxHeight - Maximum container height
 * @returns Calculated width and height
 */
export function calculateImageDimensions(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = maxWidth / maxHeight;

  let width: number;
  let height: number;

  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container - fit to width
    width = maxWidth;
    height = maxWidth / imageAspectRatio;
  } else {
    // Image is taller than container - fit to height
    height = maxHeight;
    width = maxHeight * imageAspectRatio;
  }

  return { width, height };
}

/**
 * Draw an image centered within a container
 *
 * @param page - The PDF page
 * @param image - The embedded PDF image
 * @param containerX - Container X coordinate
 * @param containerY - Container Y coordinate
 * @param containerWidth - Container width
 * @param containerHeight - Container height
 * @param options - Drawing options
 */
export function drawImageCentered(
  page: PDFPage,
  image: PDFImage,
  containerX: number,
  containerY: number,
  containerWidth: number,
  containerHeight: number,
  options?: {
    opacity?: number;
    border?: boolean;
    borderColor?: { r: number; g: number; b: number };
    borderWidth?: number;
  }
): void {
  const { width, height } = calculateImageDimensions(
    image.width,
    image.height,
    containerWidth,
    containerHeight
  );

  // Center image within container
  const x = containerX + (containerWidth - width) / 2;
  const y = containerY + (containerHeight - height) / 2;

  drawImage(page, image, x, y, width, height, options);
}

/**
 * Compress/resize image data (client-side)
 * This function can be used before converting to base64 to reduce file size
 *
 * @param file - The image file
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Promise resolving to compressed File
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions
        const { width, height } = calculateImageDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from base64 data
 *
 * @param base64Image - Base64 encoded image
 * @returns Promise resolving to image dimensions
 */
export async function getImageDimensions(base64Image: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64Image;
  });
}
