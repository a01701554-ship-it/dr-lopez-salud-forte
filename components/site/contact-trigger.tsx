'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { MedicalContactModal } from './medical-contact-modal';

export function ContactTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for global open events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-medical-contact', handleOpen);
    return () => window.removeEventListener('open-medical-contact', handleOpen);
  }, []);

  // Listen for mobile menu state to hide trigger
  useEffect(() => {
    const handleMenuOpen = () => setIsMobileMenuOpen(true);
    const handleMenuClose = () => setIsMobileMenuOpen(false);
    window.addEventListener('mobile-menu-opened', handleMenuOpen);
    window.addEventListener('mobile-menu-closed', handleMenuClose);
    return () => {
      window.removeEventListener('mobile-menu-opened', handleMenuOpen);
      window.removeEventListener('mobile-menu-closed', handleMenuClose);
    };
  }, []);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded && !isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded, isOpen]);

  // Auto-collapse timer
  useEffect(() => {
    if (isExpanded && !isOpen) {
      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    }
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [isExpanded, isOpen]);

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    collapseTimerRef.current = setTimeout(() => {
      if (!triggerRef.current?.matches(':focus-within')) {
        setIsExpanded(false);
      }
    }, 300);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setIsExpanded(true);
    } else {
      setIsOpen(true);
      setIsExpanded(false);
    }
  };

  const isHidden = isMobileMenuOpen || isOpen;

  return (
    <>
      <div 
        className={`fixed bottom-[max(12px,env(safe-area-inset-bottom,0px))] right-2 sm:bottom-5 sm:right-3 lg:bottom-6 lg:right-6 z-[90] pointer-events-none select-none transition-opacity duration-300 ${
          isHidden ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label="Abrir contacto médico"
          aria-expanded={isOpen}
          aria-controls="medical-contact-modal"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          disabled={isHidden}
          className={`pointer-events-auto flex items-center justify-start rounded-full border border-[#B39A6A]/22 bg-[#071B2A]/95 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-all duration-300 ease-out hover:border-[#B39A6A]/45 hover:bg-[#0A2236] hover:shadow-[0_14px_32px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne overflow-hidden cursor-pointer ${
            isExpanded 
              ? 'w-[175px] sm:w-[195px] lg:w-[200px] h-[44px] sm:h-[48px] lg:h-[48px] pr-4 sm:pr-5' 
              : 'w-[44px] sm:w-[48px] lg:w-[48px] h-[44px] sm:h-[48px] lg:h-[48px]'
          }`}
        >
          <div className="flex items-center justify-center w-[44px] sm:w-[48px] lg:w-[48px] h-full gap-1.5 sm:gap-2 shrink-0">
            {/* Green availability indicator */}
            <span className="relative flex size-1.5 sm:size-2 items-center justify-center shrink-0" aria-hidden="true">
              <span className="absolute inline-flex size-1.5 sm:size-2 rounded-full bg-[#00D6A3]/50 animate-ping duration-1000 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 sm:size-2 rounded-full bg-[#00D6A3]" />
            </span>

            {/* Conversation icon */}
            <MessageCircle
              aria-hidden="true"
              className="size-[18px] sm:size-[20px] lg:size-[21px] shrink-0 text-[#00D6A3]"
            />
          </div>

          {/* Text label */}
          <span 
            className={`font-sans font-semibold tracking-[0.05em] text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-[#F7F5F0] leading-none select-none whitespace-nowrap transition-opacity duration-300 ${
              isExpanded ? 'opacity-100 delay-100' : 'opacity-0'
            }`}
          >
            CONTACTO MÉDICO
          </span>
        </button>
      </div>

      <MedicalContactModal
        id="medical-contact-modal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
