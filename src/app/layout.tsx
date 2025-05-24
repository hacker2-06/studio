
import type { Metadata } from 'next';
import { inter, poppins } from './fonts';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'; // Import OnboardingFlow

export const metadata: Metadata = {
  title: 'NeetSheet - Custom OMR Tests & Evaluation for NEET Aspirants',
  description: 'Create, take, and evaluate custom OMR tests specifically designed for NEET (UG) aspirants. Track your progress and improve your scores.',
  icons: null, // Explicitly set to null to avoid favicon.ico.mjs build issues for now
  // Re-adding PWA related metadata as per user request.
  // formatDetection was removed as it was causing issues.
  applicationName: 'NeetSheet',
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
  appleWebAppTitle: 'NeetSheet',
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
        {/* Updated theme-color to match new logo's purple shades */}
        <meta name="theme-color" content="#EDE7F6" /> 
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <SettingsProvider>
          <OnboardingFlow>
            {children}
          </OnboardingFlow>
          <Toaster />
          <ServiceWorkerRegistration />
        </SettingsProvider>
      </body>
    </html>
  );
}
