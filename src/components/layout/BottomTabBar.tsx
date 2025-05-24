
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, FilePlus2, History, SettingsIcon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react'; // Import React for createRef

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

  // Create refs for each tab item to get their positions for the animated highlight
  const itemRefs = React.useMemo(() => 
    navItems.map(() => React.createRef<HTMLAnchorElement>()), 
    []
  );

  const activeItemIndex = navItems.findIndex(item => {
    const isActive = pathname === item.href;
    // For nested routes, also consider the parent active (e.g., /results/xyz should keep History tab active)
    const isPartiallyActive = item.href !== '/' && pathname.startsWith(item.href);
    return item.href === '/' ? isActive : (isActive || isPartiallyActive);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card shadow-sm">
      <AnimatePresence>
        {activeItemIndex !== -1 && itemRefs[activeItemIndex]?.current && (
          <motion.div
            layoutId="activeTabHighlight"
            className="active-tab-highlight"
            initial={false}
            animate={{ 
              width: itemRefs[activeItemIndex].current?.offsetWidth ? itemRefs[activeItemIndex].current!.offsetWidth * 0.6 : 0, // 60% of tab width
              x: itemRefs[activeItemIndex].current?.offsetLeft ? itemRefs[activeItemIndex].current!.offsetLeft + (itemRefs[activeItemIndex].current!.offsetWidth * 0.2) : 0, // Center highlight
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
              ref={itemRefs[index]}
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
