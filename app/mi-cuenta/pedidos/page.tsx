'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { Package, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function MisPedidosPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta/pedidos';
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="pedidos" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
          <div>
            <h2 className="font-serif text-2xl text-obsidian font-medium">
              Historial de Pedidos y Suplementos
            </h2>
            <p className="text-xs sm:text-sm text-obsidian/70 mt-0.5">
              Consulta el estado de tus compras físicas y digitales.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-[#B39A6A]/20 p-10 sm:p-14 text-center shadow-xs">
          <div className="size-16 rounded-full bg-[#B39A6A]/10 text-champagne flex items-center justify-center mx-auto mb-4">
            <Package className="size-8 text-[#8A7347]" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-obsidian mb-2">
            Aún no has realizado pedidos físicos
          </h3>
          <p className="text-obsidian/70 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Cuando adquieras suplementos de grado médico o productos de la tienda, podrás dar seguimiento a tu guía de envío e historial de facturación en esta sección.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <Link
              href="/tienda"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[46px] px-7 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
            >
              <ShoppingBag className="size-4" />
              <span>Explorar Tienda</span>
            </Link>
            <Link
              href="/academia"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[46px] px-6 rounded-full border border-obsidian/30 text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian/5 transition-colors"
            >
              <span>Ver Masterclasses</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-[#F9F7F2] border border-[#B39A6A]/20 flex items-start gap-4">
          <ShieldCheck className="size-5 text-champagne shrink-0 mt-0.5" />
          <div className="text-xs text-obsidian/75 leading-relaxed">
            <strong>Garantía de compra segura:</strong> Todos los pedidos se procesan a través de una pasarela segura y cifrada. Tus datos de pago nunca se almacenan en nuestros servidores locales.
          </div>
        </div>
      </Container>
    </div>
  );
}
