import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, Cinzel, Inter } from 'next/font/google';
import './globals.css';

const hud = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-hud', display: 'swap' });
const goth = Cinzel({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-goth', display: 'swap' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });

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
    <html lang="en" className={`${hud.variable} ${goth.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
