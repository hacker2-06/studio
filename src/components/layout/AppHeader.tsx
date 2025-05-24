"use client";
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, BookOpenCheck } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <span className="font-heading text-xl">Smartsheet</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {/* User avatar/menu can be added here later */}
      </div>
    </header>
  );
}
