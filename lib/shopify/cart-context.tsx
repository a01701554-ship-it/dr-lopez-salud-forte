'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Course } from '../academy/types';

export interface CartItem {
  id: string; // Line ID
  courseId?: string; // Si es una masterclass
  productId?: string; // Si es un suplemento físico
  variantGid: string;
  productGid: string;
  title: string;
  slug: string;
  categoryLabel: string;
  coverImage: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  quantity: number;
  isPhysical?: boolean;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  isOpen: boolean;
  announcement: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (course: Course) => void;
  addProductItem: (product: any, quantity?: number) => void;
  updateItemQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  checkoutUrl: string;
  isShopifyConnected: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'salud_forte_academy_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }, [items, isLoaded]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((course: Course) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.courseId === course.id);
      if (existing) {
        // Individual license limit: Masterclasses are 1 license per account
        setAnnouncement(`La masterclass "${course.title}" ya está en tu carrito.`);
        return prev;
      }

      const newItem: CartItem = {
        id: `line_${course.id}_${Date.now()}`,
        courseId: course.id,
        variantGid: course.shopifyVariantGid,
        productGid: course.shopifyProductGid,
        title: course.title,
        slug: course.slug,
        categoryLabel: course.categoryLabel,
        coverImage: course.image || course.coverImage,
        price: course.price,
        compareAtPrice: course.compareAtPrice,
        currency: course.currency || 'MXN',
        quantity: 1, // Strictly 1 for individual digital license
        isPhysical: false,
      };

      setAnnouncement(`"${course.title}" se agregó al carrito.`);
      return [...prev, newItem];
    });

    setIsOpen(true);
  }, []);

  const addProductItem = useCallback((product: any, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        // Update quantity for physical products
        const updatedQty = existing.quantity + quantity;
        if (product.inventoryTracked && updatedQty > product.inventoryQuantity) {
          setAnnouncement(`No hay suficiente inventario disponible de "${product.title}".`);
          return prev;
        }
        
        setAnnouncement(`Se actualizó la cantidad de "${product.title}" en el carrito.`);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: updatedQty } : item
        );
      }

      // Check stock
      if (product.inventoryTracked && quantity > product.inventoryQuantity) {
        setAnnouncement(`No hay suficiente inventario disponible de "${product.title}".`);
        return prev;
      }

      const newItem: CartItem = {
        id: `line_${product.id}_${Date.now()}`,
        productId: product.id,
        variantGid: product.shopifyVariantGid,
        productGid: product.shopifyProductGid,
        title: product.title,
        slug: product.slug,
        categoryLabel: product.category || 'Suplementos',
        coverImage: product.featuredImage,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: product.currency || 'MXN',
        quantity: quantity,
        isPhysical: true,
      };

      setAnnouncement(`"${product.title}" se agregó al carrito.`);
      return [...prev, newItem];
    });

    setIsOpen(true);
  }, []);

  const updateItemQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineId);
      return;
    }

    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === lineId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === lineId);
      if (target) {
        setAnnouncement(`"${target.title}" se eliminó del carrito.`);
      }
      return prev.filter((i) => i.id !== lineId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAnnouncement('El carrito ha sido vaciado.');
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currency = items[0]?.currency || 'MXN';

  // Build real Shopify checkout URL
  // Form: https://salud-forte.myshopify.com/cart/{variantId}:{qty},{variantId2}:{qty}
  const shopDomain = 'salud-forte.myshopify.com';
  const cartPermalinks = items
    .map((item) => {
      const numericVariantId = item.variantGid.split('/').pop();
      return `${numericVariantId}:${item.quantity}`;
    })
    .join(',');

  const checkoutUrl =
    items.length > 0
      ? `https://${shopDomain}/cart/${cartPermalinks}?checkout`
      : `https://${shopDomain}/cart`;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        currency,
        isOpen,
        announcement,
        openCart,
        closeCart,
        addItem,
        addProductItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        checkoutUrl,
        isShopifyConnected: false, // Indicates Storefront token pending
      }}
    >
      {children}
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
