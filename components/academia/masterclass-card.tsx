'use client';

import React, { useState } from 'react';
import { Course } from '@/lib/academy/types';
import { Clock, BookOpen, User, CheckCircle2, ArrowRight, ShoppingBag, ShieldAlert, GraduationCap } from 'lucide-react';
import { useCart } from '@/lib/shopify/cart-context';

interface MasterclassCardProps {
  key?: string;
  course: Course;
  hasAccess?: boolean;
}

export function MasterclassCard({ course, hasAccess = false }: MasterclassCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const isComingSoon = course.launchStatus === 'coming_soon';
  const isFree = course.accessType === 'free' || course.price === 0;

  return (
    <article className="group flex flex-col justify-between h-full bg-white rounded-[20px] border border-[#B39A6A]/25 overflow-hidden shadow-xs hover:border-[#B39A6A]/55 hover:shadow-[0_16px_36px_rgba(17,24,32,0.08)] hover:-translate-y-1 transition-all duration-300 w-full max-w-[390px] md:max-w-none mx-auto">
      <div>
        {/* Cover image container with exact 8/5 aspect ratio */}
        <div data-image-id={course.imageId} className="relative aspect-[8/5] w-full overflow-hidden bg-[#0D2235]">
          {!imageError ? (
            <picture className="w-full h-full block">
              <source
                srcSet={course.image || course.coverImage}
                type="image/webp"
              />
              <img
                data-image-id={course.imageId}
                src={course.imageFallback || course.coverImage}
                alt={course.imageAlt || course.coverAlt || course.title}
                width={course.imageWidth || 1586}
                height={course.imageHeight || 992}
                loading={course.imagePriority ? 'eager' : 'lazy'}
                decoding={course.imagePriority ? 'sync' : 'async'}
                fetchPriority={course.imagePriority ? 'high' : 'auto'}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
              />
            </picture>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D2235] via-[#111820] to-[#0A1624] flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="absolute inset-3 border border-white/10 rounded-xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="size-2 rounded-full bg-[#B39A6A] mb-2.5" />
                <span className="font-serif text-base text-[#F5F3EE] font-medium leading-tight max-w-[85%] line-clamp-2">
                  {course.title}
                </span>
                <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B39A6A]">
                  Academia Salud Forte · Dr. Mauricio Galindo
                </span>
              </div>
            </div>
          )}

          {/* Top category badge */}
          <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase text-obsidian shadow-xs border border-white/40">
              {course.categoryLabel}
            </span>
          </div>

          {/* Level badge bottom left */}
          <div className="absolute bottom-3 left-3.5 flex items-center gap-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-[#0D2235]/75 backdrop-blur-md border border-white/20 text-white/95 text-[11px] font-medium shadow-xs">
              Nivel: {course.level}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4.5 sm:p-6">
          <div className="flex items-center gap-3 text-xs text-obsidian/65 mb-2.5">
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="size-3.5 text-champagne" />
              {course.durationMinutes} min
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <BookOpen className="size-3.5 text-champagne" />
              {course.lessonCount} lecciones
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium leading-snug tracking-tight group-hover:text-[#0D2235] transition-colors">
            <a href={`/academia/${course.slug}`} className="hover:underline focus:outline-hidden">
              {course.title}
            </a>
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-obsidian/75 leading-relaxed">
            {course.shortDescription}
          </p>

          <div className="mt-4 pt-4 border-t border-[#B39A6A]/15 flex items-center gap-2 text-xs text-obsidian/80">
            <User className="size-3.5 text-champagne shrink-0" />
            <span className="truncate">{course.instructor.name}</span>
          </div>
        </div>
      </div>

      {/* Card Footer with Price and Contextual CTA */}
      <div className="px-4.5 pb-4.5 pt-2 sm:px-6 sm:pb-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-obsidian/50 font-semibold">
              {isFree ? 'Acceso educativo' : 'Inversión única'}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              {isFree ? (
                <span className="font-serif text-2xl font-semibold text-emerald-800">
                  Gratis
                </span>
              ) : (
                <>
                  <span className="font-serif text-2xl font-semibold text-obsidian">
                    ${course.price.toLocaleString('es-MX')} {course.currency}
                  </span>
                  {Boolean(course.compareAtPrice && course.compareAtPrice > course.price) && (
                    <span className="text-xs line-through text-obsidian/45">
                      ${course.compareAtPrice?.toLocaleString('es-MX')}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              {isFree ? 'Inscripción abierta' : course.accessType === 'lifetime' ? 'Acceso vitalicio' : 'Acceso limitado'}
            </span>
          </div>
        </div>

        {/* CTA Buttons - min height 46px */}
        <div className="flex gap-2.5">
          {hasAccess ? (
            <a
              href={`/academia/${course.slug}/leccion/${course.modules?.[0]?.lessons?.[0]?.slug || 'inicio'}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <CheckCircle2 className="size-4" />
              <span>Continuar aprendiendo</span>
            </a>
          ) : isFree ? (
            <>
              <a
                href={`/academia/${course.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full border border-obsidian text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian hover:text-white transition-colors"
              >
                <span>Temario</span>
              </a>
              <a
                href={`/cuenta/registro?redirect=/academia/${course.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors shadow-xs"
              >
                <GraduationCap className="size-4" />
                <span>Inscribirme Gratis</span>
              </a>
            </>
          ) : isComingSoon ? (
            <>
              <a
                href={`/academia/${course.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
              >
                <span>Ver temario</span>
                <ArrowRight className="size-3.5" />
              </a>
              <button
                onClick={() => addItem(course)}
                className="px-4 h-[46px] rounded-full border border-obsidian/30 text-obsidian hover:bg-obsidian/5 transition-colors flex items-center justify-center"
                title="Añadir a la bolsa"
                aria-label={`Añadir ${course.title} a la bolsa`}
              >
                <ShoppingBag className="size-4" />
              </button>
            </>
          ) : (
            <>
              <a
                href={`/academia/${course.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full border border-obsidian text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian hover:text-white transition-colors"
              >
                <span>Temario</span>
              </a>
              <button
                onClick={() => addItem(course)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-[46px] rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
              >
                <ShoppingBag className="size-3.5" />
                <span>Comprar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
