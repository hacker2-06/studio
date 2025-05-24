
import type { Metadata } from 'next';
import { inter, poppins } from './fonts';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Smartsheet - Custom Tests & Evaluation',
  description: 'Create, take, and evaluate custom tests with Smartsheet.',
  // Explicitly set icons to null to avoid favicon.ico.mjs build issues for now
  // The PWA icons will be primarily driven by manifest.json
  icons: null, 
  applicationName: 'Smartsheet',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
  appleWebAppTitle: 'Smartsheet',
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
        {/* Update apple-touch-icon path; ensure you create this PNG from your SVG */}
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
