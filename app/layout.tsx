import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/providers/StoreProvider';
import { ToastContainer } from '@/components/shared/ToastContainer';
import {StorefrontTracker} from '@/components/shared/StorefrontTracker';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'J&CO. Jewellery — Everyday Luxury & Minimalist Demi-Fine Jewellery',
  description:
    'Shop curated 14K solid gold, gold filled, sterling silver, flatback piercings, huggie hoops, statement rings, and personalized jewellery crafted for everyday wear.',
  openGraph: {
    title: 'J&CO. Jewellery — Everyday Luxury & Minimalist Demi-Fine Jewellery',
    description:
      'Shop curated 14K solid gold, gold filled, sterling silver, flatback piercings, huggie hoops, statement rings, and personalized jewellery crafted for everyday wear.',
    type: 'website',
    siteName: 'J&CO. Jewellery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'J&CO. Jewellery — Everyday Luxury & Minimalist Demi-Fine Jewellery',
    description:
      'Shop curated 14K solid gold, gold filled, sterling silver, flatback piercings, huggie hoops, statement rings, and personalized jewellery crafted for everyday wear.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'J&CO. Jewellery (Demo Storefront)',
    description:
      'Luxury minimalist jewellery storefront prototype featuring 14K solid gold, gold filled, and sterling silver pieces.',
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${jakarta.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <StoreProvider>
          <StorefrontTracker />
          {children}
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
