import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Lumière - Mỹ phẩm cao cấp',
  description: 'Hệ thống bán mỹ phẩm tích hợp AI tư vấn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body className="font-sans bg-brand-beige">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}