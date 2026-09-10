'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/lib/shopify/cart-context';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, Plus, Minus, AlertTriangle, ShieldAlert } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateItemQuantity,
    subtotal,
    currency,
    itemCount,
    checkoutUrl,
    isShopifyConnected,
  } = useCart();
  
  const [showDemoAlert, setShowDemoAlert] = useState(false);

  const hasPhysicalItems = items.some(item => item.isPhysical);
  const hasDigitalItems = items.some(item => !item.isPhysical);

  // Reset alert state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowDemoAlert(false);
    }
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-ivory text-obsidian shadow-2xl flex flex-col h-full z-10 border-l border-[#B39A6A]/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#B39A6A]/15 bg-white/80 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-5 text-champagne" />
            <h2 id="cart-drawer-title" className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-obsidian">
              Bolsa de compra ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full text-obsidian/60 hover:text-obsidian hover:bg-[#B39A6A]/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-champagne"
            aria-label="Cerrar bolsa de compra"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Notices */}
        <div className="border-b border-[#B39A6A]/15 divide-y divide-[#B39A6A]/10">
          {hasDigitalItems && (
            <div className="px-6 py-2.5 bg-[#E9E6DF]/60 text-[11px] text-obsidian/80 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-champagne shrink-0" />
              <span>Acceso digital individual vinculado a tu correo tras el pago.</span>
            </div>
          )}
          {hasPhysicalItems && (
            <div className="px-6 py-2.5 bg-[#B39A6A]/10 text-[11px] text-obsidian/80 flex items-center gap-2">
              <Truck className="size-3.5 text-champagne shrink-0" />
              <span>Suplementos físicos requieren envío a domicilio (calculado en el checkout).</span>
            </div>
          )}
        </div>

        {/* Content list or Demo Alert Overlay */}
        <div className="flex-1 overflow-y-auto p-6">
          {showDemoAlert ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-6 animate-fade-in font-sans">
              <div className="size-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                <ShieldAlert className="size-8 text-amber-600" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-obsidian">
                  Checkout Desactivado Seguro
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold uppercase tracking-wider border border-amber-150 inline-block">
                  Entorno de Demostración
                </span>
                <p className="text-xs text-obsidian/75 leading-relaxed max-w-sm pt-2">
                  Esta plataforma de comercio y academia se encuentra en modo de **Demostración Informativa**.
                </p>
                <p className="text-xs text-obsidian/60 leading-relaxed max-w-sm">
                  Las compras en línea y la adquisición formal de licencias físicas y digitales estarán disponibles próximamente. Actualmente el catálogo se encuentra en modo de exhibición médica y pedagógica del Dr. Mauricio Galindo.
                </p>
              </div>

              <div className="w-full pt-4 space-y-3">
                <button
                  onClick={() => setShowDemoAlert(false)}
                  className="w-full h-[44px] rounded-full border border-obsidian/35 text-xs font-bold uppercase tracking-wider text-obsidian hover:bg-obsidian/5 transition-colors cursor-pointer"
                >
                  Regresar al carrito
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center text-obsidian/60 font-sans">
              <ShoppingBag className="size-12 stroke-[1.2] text-[#B39A6A]/50 mb-4" />
              <p className="font-serif text-lg text-obsidian font-medium">Tu bolsa está vacía</p>
              <p className="text-xs sm:text-sm text-obsidian/70 mt-1 max-w-xs">
                Explora el catálogo de suplementos o las masterclasses de la Academia.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2.5 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#07182A] transition-colors cursor-pointer"
              >
                Seguir explorando
              </button>
            </div>
          ) : (
            <ul className="space-y-4 divide-y divide-[#B39A6A]/15 font-sans">
              {items.map((item) => (
                <li key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                  <div data-image-id={(item as any).imageId} className="size-18 rounded-xl overflow-hidden bg-white shrink-0 border border-[#B39A6A]/20 flex items-center justify-center p-1">
                    <img
                      data-image-id={(item as any).imageId}
                      src={item.coverImage}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-champagne bg-[#B39A6A]/10 px-2 py-0.5 rounded-sm">
                      {item.isPhysical ? 'Suplemento Físico' : 'Academia · Licencia'}
                    </span>
                    <h3 className="font-serif text-sm sm:text-base text-obsidian font-medium leading-snug line-clamp-2 mt-1.5">
                      {item.title}
                    </h3>
                    
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {/* Quantity Selector for physical products */}
                      {item.isPhysical ? (
                        <div className="flex items-center border border-[#B39A6A]/30 rounded-full bg-white h-[32px] px-1">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="size-6 rounded-full flex items-center justify-center text-obsidian/60 hover:bg-[#B39A6A]/10 hover:text-obsidian transition-colors cursor-pointer"
                            aria-label={`Reducir cantidad de ${item.title}`}
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-obsidian">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="size-6 rounded-full flex items-center justify-center text-obsidian/60 hover:bg-[#B39A6A]/10 hover:text-obsidian transition-colors cursor-pointer"
                            aria-label={`Aumentar cantidad de ${item.title}`}
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-obsidian/50 font-medium bg-ivory border border-[#B39A6A]/15 px-2.5 py-1 rounded-full">
                          Cantidad: 1
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-semibold text-obsidian block">
                            ${(item.price * item.quantity).toLocaleString('es-MX')} {item.currency}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-obsidian/50 block">
                              (${item.price.toLocaleString('es-MX')} c/u)
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-obsidian/40 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Eliminar ${item.title} de la bolsa`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with subtotal and official checkout button */}
        {items.length > 0 && !showDemoAlert && (
          <div className="p-6 border-t border-[#B39A6A]/20 bg-white/95 font-sans">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm text-obsidian/70 font-medium">Subtotal</span>
              <span className="font-serif text-2xl font-semibold text-obsidian">
                ${subtotal.toLocaleString('es-MX')} {currency}
              </span>
            </div>
            <p className="text-[11px] text-obsidian/60 leading-normal mb-4">
              Impuestos y gastos de envío se calcularán durante el proceso de pago seguro.
            </p>

            {isShopifyConnected ? (
              <a
                href={checkoutUrl}
                className="flex items-center justify-center gap-2 w-full h-[50px] rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-[0.12em] shadow-md hover:bg-[#07182A] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>Continuar al Checkout</span>
                <ArrowRight className="size-4" />
              </a>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDemoAlert(true);
                }}
                className="flex items-center justify-center gap-2 w-full h-[50px] rounded-full bg-obsidian/85 hover:bg-obsidian text-white text-xs font-semibold uppercase tracking-[0.12em] shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>Compra disponible próximamente</span>
                <ArrowRight className="size-4" />
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-[#B39A6A]/15 flex items-center justify-center gap-2 text-[10px] text-obsidian/60">
              <ShieldCheck className="size-3.5 text-champagne" />
              <span>
                {isShopifyConnected
                  ? 'Garantía de procesamiento seguro y cifrado'
                  : 'Compra disponible próximamente'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
