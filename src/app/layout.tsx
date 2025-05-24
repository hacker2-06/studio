import type { Metadata } from 'next';
import { inter, poppins } from './fonts';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Smartsheet - Custom Tests & Evaluation',
  description: 'Create, take, and evaluate custom tests with Smartsheet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
