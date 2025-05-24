
"use client";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        {/* Use the new logo.svg from the public directory */}
        <img src="/logo.svg" alt="NeetSheet Logo" className="h-10 w-10" /> {/* Increased size slightly for visibility */}
        <span className="font-heading text-xl">NeetSheet</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {/* User avatar/menu can be added here later */}
      </div>
    </header>
  );
}

