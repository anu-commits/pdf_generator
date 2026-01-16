import type { Metadata } from 'next';
import { Inter, Jost } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${jost.variable}`}>
      <body className="antialiased font-body">{children}</body>
    </html>
  );
}
