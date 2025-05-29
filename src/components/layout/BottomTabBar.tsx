
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, FilePlus2, History, SettingsIcon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react'; // Import React

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/create-test', label: 'Create Test', icon: FilePlus2 },
  { href: '/history', label: 'Test History', icon: History },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();

  // Updated ref management: Use useRef to hold an array of DOM elements
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  // Ensure the array is correctly sized (optional if navItems is truly static)
  if (itemRefs.current.length !== navItems.length) {
    itemRefs.current = Array(navItems.length).fill(null);
  }

  const activeItemIndex = navItems.findIndex(item => {
    const isActive = pathname === item.href;
    const isPartiallyActive = item.href !== '/' && pathname.startsWith(item.href);
    return item.href === '/' ? isActive : (isActive || isPartiallyActive);
  });

  // Accessing the DOM element for animation:
  const activeItemElement = activeItemIndex !== -1 ? itemRefs.current[activeItemIndex] : null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card shadow-sm">
      <AnimatePresence>
        {activeItemElement && ( // Check if activeItemElement exists
          <motion.div
            layoutId="activeTabHighlight"
            className="active-tab-highlight"
            initial={false}
            animate={{
              width: activeItemElement.offsetWidth ? activeItemElement.offsetWidth * 0.6 : 0,
              x: activeItemElement.offsetLeft !== undefined ? activeItemElement.offsetLeft + (activeItemElement.offsetWidth * 0.2) : 0,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        const isPartiallyActive = item.href !== '/' && pathname.startsWith(item.href);
        const effectiveIsActive = item.href === '/' ? isActive : (isActive || isPartiallyActive);

        return (
          <Link href={item.href} key={item.href} legacyBehavior passHref>
            <motion.a
              // Assign ref using callback
              ref={(el: HTMLAnchorElement | null) => { itemRefs.current[index] = el; }}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                effectiveIsActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={effectiveIsActive ? "page" : undefined}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ scale: effectiveIsActive ? 1.15 : 1, y: effectiveIsActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <item.icon className="h-6 w-6" />
              </motion.div>
              <AnimatePresence>
                {effectiveIsActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 8, height: 0 }}
                    transition={{ duration: 0.25, ease: "circOut", delay: 0.05 }}
                    className="mt-1 text-xs font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.a>
          </Link>
        );
      })}
    </nav>
  );
}
