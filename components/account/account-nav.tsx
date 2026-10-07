'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { LayoutDashboard, BookOpen, Package, User, LogOut, GraduationCap, ShieldCheck, CalendarDays } from 'lucide-react';

interface AccountNavProps {
  currentTab: 'resumen' | 'citas' | 'masterclasses' | 'pedidos' | 'perfil' | 'instructor';
}

export function AccountHeader({ currentTab }: AccountNavProps) {
  const { profile, signOut, isInstructor, isAdmin } = useAuth();

  const firstName = profile?.full_name?.split(' ')[0] || 'Alumno';

  const isAuthorized = Boolean(
    isInstructor ||
    isAdmin ||
    profile?.role === 'INSTRUCTOR' ||
    profile?.role === 'ADMIN'
  );

  const canViewAppointments = Boolean(isAdmin || profile?.role === 'ADMIN');

  const navItems = [
    { id: 'resumen', label: 'Resumen', href: '/mi-cuenta', icon: LayoutDashboard },
    ...(canViewAppointments
      ? [{ id: 'citas', label: 'Citas', href: '/admin/citas', icon: CalendarDays }]
      : []),
    { id: 'masterclasses', label: 'Mis Masterclasses', href: '/mi-cuenta/masterclasses', icon: BookOpen },
    { id: 'pedidos', label: 'Mis Pedidos', href: '/mi-cuenta/pedidos', icon: Package },
    { id: 'perfil', label: 'Mi Perfil', href: '/mi-cuenta/perfil', icon: User },
  ];

  if (isAuthorized) {
    navItems.push({
      id: 'instructor',
      label: 'Panel del Instructor',
      href: '/mi-cuenta/instructor',
      icon: ShieldCheck,
    });
  }

  return (
    <div className="border-b border-[#B39A6A]/20 bg-[#F9F7F2]">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-24 pb-8 sm:pt-32 sm:pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B39A6A]/15 text-[#8A7347] text-[11px] font-semibold uppercase tracking-[0.14em]">
              <GraduationCap className="size-3.5 text-champagne" />
              <span>Área Privada de Pacientes & Alumnos</span>
            </div>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl text-obsidian font-medium tracking-tight">
              Hola, {firstName}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-obsidian/70">
              Gestiona tus contenidos educativos, historial de compras y preferencias de cuenta.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#B39A6A]/25 shadow-xs">
            <div className="size-10 rounded-full bg-[#0D2235] text-white flex items-center justify-center font-serif text-lg font-medium shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-xs sm:text-sm text-obsidian truncate">
                {profile?.full_name || 'Cuenta Personal'}
              </div>
              <div className="text-[11px] text-obsidian/60 truncate max-w-[180px]">
                {user?.email}
              </div>
            </div>
            <button
              onClick={signOut}
              className="ml-2 p-2 rounded-xl text-obsidian/60 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <div className="mt-8 pt-4 border-t border-[#B39A6A]/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-obsidian text-white shadow-xs font-semibold'
                    : 'bg-white/80 text-obsidian/75 border border-[#B39A6A]/20 hover:border-[#B39A6A]/50 hover:bg-white hover:text-obsidian'
                }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-champagne' : 'text-obsidian/60'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
