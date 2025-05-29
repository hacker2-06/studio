import type { ReactNode } from 'react';

// This layout ensures that the OTT page doesn't inherit the main app's header or tab bar.
export default function OttLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-black"> {/* Ensure body takes full height and has a distinct background */}
        {children}
      </body>
    </html>
  );
}
