import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import ToastProvider from '@/components/ToastProvider';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['700', '800', '900'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Kolhapuri Mess — Authentic Maharashtrian Meals | Belagavi',
  description: 'Kolhapuri Mess at Nath Pai Circle, Belagavi — Authentic homestyle Maharashtrian food. Veg & Non-Veg thalis, student mess plans, hostel delivery. Check your bill online.',
  keywords: 'Kolhapuri Mess, Belagavi mess, Belgaum mess, Maharashtrian food, student mess, hostel food',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#FFFDF9] text-slate-900 antialiased`}>
        <ToastProvider />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
