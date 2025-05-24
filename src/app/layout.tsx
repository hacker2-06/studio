
import type { Metadata } from 'next';
import { inter, poppins } from './fonts';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'; // Import the new component

export const metadata: Metadata = {
  title: 'Smartsheet - Custom Tests & Evaluation',
  description: 'Create, take, and evaluate custom tests with Smartsheet.',
  // PWA related metadata
  applicationName: 'Smartsheet',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
  appleWebAppTitle: 'Smartsheet',
  mobileWebAppCapable: 'yes',
  // themeColor is set in the <head> directly, and formatDetection is removed
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
        {/* Add other meta tags for PWA if needed, e.g., Apple-specific icons */}
        {/* <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" /> */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <SettingsProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegistration /> {/* Render the client component here */}
        </SettingsProvider>
      </body>
    </html>
  );
}
