'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_PRICING_CONFIG, PricingConfig } from '@/config/pricing';

const STORAGE_KEY = 'dr_mauricio_pricing_config_v1';
const PRICING_CHANGE_EVENT = 'dr_mauricio_pricing_updated';

export function getPricingConfig(): PricingConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_PRICING_CONFIG;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PRICING_CONFIG,
        ...parsed,
        firstVisit: { ...DEFAULT_PRICING_CONFIG.firstVisit, ...(parsed.firstVisit || {}) },
        followUp: { ...DEFAULT_PRICING_CONFIG.followUp, ...(parsed.followUp || {}) },
        online: { ...DEFAULT_PRICING_CONFIG.online, ...(parsed.online || {}) },
        homeVisit: { ...DEFAULT_PRICING_CONFIG.homeVisit, ...(parsed.homeVisit || {}) },
      };
    }
  } catch (err) {
    console.warn('Error reading pricing config from storage:', err);
  }

  return DEFAULT_PRICING_CONFIG;
}

export function savePricingConfig(config: PricingConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(PRICING_CHANGE_EVENT, { detail: config }));
  } catch (err) {
    console.error('Failed to save pricing config:', err);
  }
}

export function resetPricingConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PRICING_CHANGE_EVENT, { detail: DEFAULT_PRICING_CONFIG }));
  } catch (err) {
    console.error('Failed to reset pricing config:', err);
  }
}

/**
 * React hook to access live pricing configuration with reactivity
 */
export function usePricing(): {
  pricing: PricingConfig;
  updatePricing: (newConfig: PricingConfig) => void;
  resetToDefaults: () => void;
} {
  const [pricing, setPricing] = useState<PricingConfig>(getPricingConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setPricing(getPricingConfig());
    };

    window.addEventListener(PRICING_CHANGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PRICING_CHANGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    pricing,
    updatePricing: (newConfig: PricingConfig) => {
      savePricingConfig(newConfig);
      setPricing(newConfig);
    },
    resetToDefaults: () => {
      resetPricingConfig();
      setPricing(DEFAULT_PRICING_CONFIG);
    },
  };
}
