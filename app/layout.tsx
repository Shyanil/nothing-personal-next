import type { Metadata, Viewport } from 'next';
import '@fontsource/chakra-petch/latin-500.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/cinzel/latin-900.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './globals.css';

// Public address of this page (a mmayara.com subdomain). Set SITE_URL in .env.local / your host.
const SITE_URL = process.env.SITE_URL || 'https://merch.mmayara.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: 'Nothing Personal — Drop 001',
  description: "Nothing Personal. I'm Just Correct. Oversized full-sleeve tee from the reels. From ₹1,200. Pre-order for ₹0 today.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Nothing Personal. I'm Just Correct.",
    description: 'The shirt from the reels. From ₹1,200. Pre-order for ₹0 today.',
    images: ['/assets/model.webp'],
  },
};

export const viewport: Viewport = { themeColor: '#0b0809', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
