'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import {
  fetchStudentDashboardData,
  StudentDashboardData,
  OrderData,
} from '@/lib/academy/student-dashboard-service';
import Link from 'next/link';
import { Package, ShoppingBag, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { STORE_ENABLED } from '@/config/site';

export default function MisPedidosPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async (userId: string) => {
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchStudentDashboardData(userId);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error al cargar pedidos:', err?.message || err);
      setErrorMsg('No pudimos cargar tus pedidos en este momento.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!authLoading) {
      if (!user) {
        if (typeof window !== 'undefined') {
          window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta/pedidos';
        }
      } else if (user.id) {
        loadData(user.id);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, loadData]);

  if (authLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian font-medium">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  const orders = dashboardData?.orders || [];

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

        {errorMsg && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            {user?.id && (
              <button
                onClick={() => loadData(user.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold transition-colors"
              >
                <RefreshCw className="size-3.5" />
                <span>Intentar nuevamente</span>
              </button>
            )}
          </div>
        )}

        {orders.length === 0 ? (
          /* FASE 7 & 9: Premium Empty State */
          <div className="mt-8 bg-white rounded-2xl border border-[#B39A6A]/20 p-10 sm:p-14 text-center shadow-xs">
            <div className="size-16 rounded-full bg-[#B39A6A]/10 text-champagne flex items-center justify-center mx-auto mb-4">
              <Package className="size-8 text-[#8A7347]" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-obsidian mb-2">
              No tienes pedidos registrados
            </h3>
            <p className="text-obsidian/70 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Tus compras de suplementos o programas se mostrarán aquí con su estado de pago y envío.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
              {STORE_ENABLED && (
                <Link
                  href="/tienda"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[46px] px-7 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
                >
                  <ShoppingBag className="size-4" />
                  <span>Explorar Tienda</span>
                </Link>
              )}
              <Link
                href="/academia"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[46px] px-7 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  STORE_ENABLED
                    ? 'border border-obsidian/30 text-obsidian hover:bg-obsidian/5'
                    : 'bg-obsidian text-white hover:bg-[#07182A] shadow-xs'
                }`}
              >
                <span>Ver Masterclasses</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-obsidian text-sm">
                      #{ord.id.slice(0, 8)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                      {ord.payment_status}
                    </span>
                  </div>
                  <div className="text-xs text-obsidian/60 mt-1">
                    Fecha: {new Date(ord.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold text-lg text-obsidian">
                    ${ord.total} {ord.currency || 'MXN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

