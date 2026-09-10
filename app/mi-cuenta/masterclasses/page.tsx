'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import { INITIAL_COURSES } from '@/lib/academy/db';
import { MasterclassCard } from '@/components/academia/masterclass-card';

export default function MisMasterclassesPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta/masterclasses';
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian">Cargando tus masterclasses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="masterclasses" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
          <div>
            <h2 className="font-serif text-2xl text-obsidian font-medium">
              Biblioteca de Formación Médica
            </h2>
            <p className="text-xs sm:text-sm text-obsidian/70 mt-0.5">
              Acceso vitalicio a tus programas y temarios registrados.
            </p>
          </div>
          <span className="text-xs font-medium text-obsidian/60 bg-white px-3 py-1 rounded-full border border-[#B39A6A]/20">
            {INITIAL_COURSES.length} programas disponibles
          </span>
        </div>

        {/* Masterclasses Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {INITIAL_COURSES.map((course) => (
            <MasterclassCard
              key={course.id}
              course={course}
              hasAccess={course.launchStatus === 'available'}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
