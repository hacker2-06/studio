import type { ReactNode } from 'react';

// This layout ensures that the OTT page doesn't inherit the main app's header or tab bar,
// and provides a distinct full-screen styling context.
export default function OttLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden">
      {children}
    </div>
  );
}
