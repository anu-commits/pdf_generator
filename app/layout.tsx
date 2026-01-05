import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Travel Itinerary PDF Generator',
  description: 'Professional travel itinerary PDF generator with fixed, pixel-perfect layouts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
