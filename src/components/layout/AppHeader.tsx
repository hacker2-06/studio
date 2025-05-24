
"use client";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
// import { BookOpenCheck } from 'lucide-react'; // Replaced by image logo

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        {/* Use the new logo.png from the public directory */}
        {/* Make sure you've placed logo.png in the public folder */}
        <img src="/logo.png" alt="NEET SHEET Logo" className="h-8 w-8" />
        <span className="font-heading text-xl">NEET SHEET</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {/* User avatar/menu can be added here later */}
      </div>
    </header>
  );
}
