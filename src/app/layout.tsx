import type { Metadata } from 'next';
import {
  Fraunces,
  Newsreader,
  Public_Sans,
  IBM_Plex_Mono,
} from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getSectionCounts, getPublishedYears } from '@/lib/posts';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daalbaatichurma.vercel.app';

export const metadata: Metadata = {
  title: 'DaalBaatiChurma',
  description:
    'A personal editorial blog for book reviews and travel diaries by Pradyumn Singh Mephawat.',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    title: 'DaalBaatiChurma',
    description:
      'A personal editorial blog for book reviews and travel diaries by Pradyumn Singh Mephawat.',
    url: '/',
    siteName: 'DaalBaatiChurma',
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sectionCounts, archiveYears] = await Promise.all([
    getSectionCounts(),
    getPublishedYears(),
  ]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${publicSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-parchment text-ink">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header sectionCounts={sectionCounts} archiveYears={archiveYears} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
