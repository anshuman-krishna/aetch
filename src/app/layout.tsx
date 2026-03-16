import type { Metadata } from 'next';
import { Bebas_Neue, Sora } from 'next/font/google';
import { Providers } from '@/components/layouts/providers';
import { siteConfig } from '@/config/site';
import './globals.css';

const bebasNeue = Bebas_Neue({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: '400',
});

const sora = Sora({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${sora.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
