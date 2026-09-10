'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import { X } from 'lucide-react';
import { navigation } from '@/config/site';
import { Portal } from './portal';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Detect scroll to dynamically adjust the top position of the menu card below the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle events on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      window.dispatchEvent(new Event('mobile-menu-opened'));
      window.addEventListener('keydown', handleKeyDown);
      
      // Prevent background scrolling
      const originalOverflow = document.body.style.overflow;
      const originalHeight = document.body.style.height;
      document.body.style.overflow = 'hidden';
      
      return () => {
        window.dispatchEvent(new Event('mobile-menu-closed'));
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
        document.body.style.height = originalHeight;
      };
    } else {
      window.dispatchEvent(new Event('mobile-menu-closed'));
    }
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open for instant accessibility
    const focusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(menuRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Motion Variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.18 }
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 10,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        duration: 0.15,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.025,
        delayChildren: 0.05,
      },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 6 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.18,
        ease: 'easeOut'
      }
    },
  };

  return (
    <div className="lg:hidden">
      {/* Animated Hamburger / X Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        className="relative flex size-11 sm:size-12 cursor-pointer items-center justify-center rounded-[14px] border border-[#B39A6A]/30 bg-[#FAF8F5] text-[#0D2235] shadow-xs transition-all duration-200 hover:border-champagne hover:bg-white active:scale-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#0D2235]/75 focus-visible:outline-offset-2 z-[150]"
      >
        <span className="sr-only">{isOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
        <div className="relative flex size-5 flex-col justify-center items-center">
          {/* Top Line */}
          <span
            className={`block h-[2px] w-[18px] bg-[#0D2235] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? 'translate-y-[2px] rotate-45' : '-translate-y-1.5'
            }`}
          />
          {/* Middle Line */}
          <span
            className={`block h-[2px] w-[18px] bg-[#0D2235] rounded-full transition-all duration-200 ease-in-out ${
              isOpen ? 'opacity-0 scale-0' : 'opacity-100'
            }`}
          />
          {/* Bottom Line */}
          <span
            className={`block h-[2px] w-[18px] bg-[#0D2235] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? '-translate-y-[2px] -rotate-45' : 'translate-y-1.5'
            }`}
          />
        </div>
      </button>

      {/* Portal for Mobile Menu Panel */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[120] flex justify-end">
              {/* Soft dark navy backdrop with subtle blur */}
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-[#07182A]/35 backdrop-blur-[4px] cursor-pointer"
                aria-hidden="true"
              />

              {/* Floating Compact Card Menu */}
              <motion.div
                id="mobile-navigation-menu"
                ref={menuRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-title"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`fixed right-4 left-4 sm:left-auto sm:right-6 w-[calc(100vw-32px)] sm:w-[360px] max-w-[400px] rounded-[22px] border border-[#B39A6A]/25 bg-[#FAF8F5] shadow-[0_16px_40px_rgba(13,34,53,0.14)] z-[140] overflow-hidden flex flex-col transition-all duration-300 ${
                  isScrolled 
                    ? 'top-[78px] sm:top-[82px] max-h-[calc(100dvh-94px-env(safe-area-inset-top,0px))]' 
                    : 'top-[86px] sm:top-[92px] max-h-[calc(100dvh-108px-env(safe-area-inset-top,0px))]'
                }`}
              >
                {/* Internal Card Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-5 sm:pt-5 border-b border-[#B39A6A]/10 shrink-0">
                  <span id="mobile-nav-title" className="font-sans text-[11px] font-bold tracking-[0.15em] text-[#0D2235]/60 uppercase">
                    Navegación
                  </span>
                  <div className="h-[1px] bg-[#B39A6A]/20 flex-1 mx-3" aria-hidden="true" />
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar menú"
                    className="flex size-11 cursor-pointer items-center justify-center rounded-full text-[#0D2235]/60 hover:text-[#0D2235] hover:bg-[#B39A6A]/10 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Navigation content with internal scroll if necessary */}
                <nav aria-label="Navegación móvil" className="w-full overflow-y-auto px-4 py-2 sm:px-5">
                  <ul className="flex flex-col gap-1.5 py-2">
                    {navigation.map((item) => {
                      const itemHref = item.href as string;
                      const isActive = pathname === itemHref || (itemHref !== '/' && pathname.startsWith(itemHref));

                      return (
                        <motion.li key={item.href} variants={rowVariants}>
                          <Link
                            href={item.href}
                            prefetch={false}
                            onClick={() => setIsOpen(false)}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex h-[54px] items-center justify-between rounded-xl px-4 font-sans text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-champagne active:scale-[0.98] ${
                              isActive
                                ? 'bg-[#B39A6A]/8 text-[#0D2235]'
                                : 'text-[#0D2235]/85 hover:bg-[#B39A6A]/4 hover:text-[#0D2235]'
                            }`}
                          >
                            {/* Subtle left gold indicator for the active route */}
                            {isActive && (
                              <span 
                                className="absolute left-0 top-[30%] bottom-[30%] w-[3px] bg-[#B39A6A] rounded-r-full" 
                                aria-hidden="true" 
                              />
                            )}
                            <span>{item.label}</span>
                            <span
                              aria-hidden="true"
                              className={`text-[13px] font-semibold transition-transform duration-200 group-hover:translate-x-1 group-focus:translate-x-1 ${
                                isActive ? 'text-[#C5A462]' : 'text-[#B39A6A]/70'
                              }`}
                            >
                              →
                            </span>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
