import { Sora, Manrope } from 'next/font/google';
import { AppProvider } from '@/contexts/AppContext';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata = {
  title: 'J.M.A. Motor Service | Car Repair & Maintenance in Dublin',
  description:
    'Reliable car repair, diagnostics and maintenance service in Dublin city centre. Rated 5.0 on Google.',
  keywords: [
    'car repair Dublin',
    'mechanic Dublin city centre',
    'car diagnostics',
    'pre-NCT check',
    'oil change Dublin',
    'JMA Motor Service',
  ],
  authors: [{ name: 'J.M.A. Motor Service' }],
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    title: 'J.M.A. Motor Service | Car Repair & Maintenance in Dublin',
    description:
      'Reliable car repair, diagnostics and maintenance service in Dublin city centre. Rated 5.0 on Google.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050505',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: 'J.M.A. Motor Service',
  image:
    'https://images.pexels.com/photos/17245109/pexels-photo-17245109.jpeg',
  telephone: '+353 85 224 6411',
  email: 'info@jmamotorservice.ie',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Brunswick Pl',
    addressLocality: 'Dublin',
    addressRegion: 'City Centre',
    postalCode: 'D02 VK57',
    addressCountry: 'IE',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '8',
  },
  areaServed: 'Dublin',
  sameAs: ['https://www.tiktok.com/@j.m.a.motor.servi7'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="bg-ink-950 text-white antialiased font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
