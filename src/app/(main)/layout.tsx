
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        {/* Content wrapper with padding, ensuring space for bottom tab bar */}
        <div className="p-4 pb-20 md:p-6 md:pb-22 lg:p-8 lg:pb-24">
          {children}
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
