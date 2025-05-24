
import type { Metadata } from 'next';
import { inter, poppins } from './fonts';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'NEET SHEET - Custom OMR Tests & Evaluation for NEET Aspirants',
  description: 'Create, take, and evaluate custom OMR tests specifically designed for NEET (UG) aspirants. Track your progress and improve your scores.',
  // Explicitly set icons to null to avoid favicon.ico.mjs build issues for now
  // The PWA icons will be primarily driven by manifest.json and direct head links
  icons: null,
  applicationName: 'NEET SHEET',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
  appleWebAppTitle: 'NEET SHEET',
  mobileWebAppCapable: 'yes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A73E8" />
        {/* Ensure you create this PNG (e.g., 180x180) from your logo.png and place it in public/icons/ */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <SettingsProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </SettingsProvider>
      </body>
    </html>
  );
}
