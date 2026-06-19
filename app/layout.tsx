import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { config } from '@/lib/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'TalentDash — Tech Salary Transparency Platform',
    template: '%s | TalentDash',
  },
  description:
    'Explore verified tech salary data across top companies in India and globally. Compare compensation by role, level, and location.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-app-bg font-sans text-body text-body-text antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-border bg-surface py-6">
          <div className="mx-auto max-w-7xl px-4 text-center text-metadata text-muted-text sm:px-6 lg:px-8">
            © {new Date().getFullYear()} {config.siteName}. Salary data for
            informational purposes only.
          </div>
        </footer>
      </body>
    </html>
  );
}
