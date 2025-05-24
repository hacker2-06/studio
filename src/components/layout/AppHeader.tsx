
"use client";
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        {/* Replace Lucide icon with SVG logo */}
        <Image src="/logo.svg" alt="Smartsheet Logo" width={32} height={32} className="h-8 w-8" />
        <span className="font-heading text-xl">Smartsheet</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {/* User avatar/menu can be added here later */}
      </div>
    </header>
  );
}
