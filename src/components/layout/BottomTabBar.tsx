
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FilePlus2, History, SettingsIcon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/create-test', label: 'Create Test', icon: FilePlus2 },
  { href: '/history', label: 'Test History', icon: History },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card shadow-sm">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link href={item.href} key={item.href} legacyBehavior passHref>
            <a
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out h-full w-full",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <item.icon className="h-6 w-6" />
              </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 5, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="mt-1 text-xs font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
