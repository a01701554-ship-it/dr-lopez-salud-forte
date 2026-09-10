'use client';

import React, { useState } from 'react';
import { Container } from '@/components/site/container';
import { productsDb, Product, isProductPublishable } from '@/lib/shopify/products-db';
import { Search, SlidersHorizontal, Info, ShieldAlert, ArrowRight, Eye, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'Nutrición Funcional', label: 'Nutrición Funcional' },
  { id: 'Sueño & Descanso', label: 'Sueño & Descanso' },
  { id: 'Minerales', label: 'Minerales & Electrólitos' },
  { id: 'Vitaminas', label: 'Vitaminas' },
];

export default function TiendaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const products = productsDb.getProducts();

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-ivory min-h-screen text-obsidian font-sans">
      {/* 
        ========================================================================
        1. HERO PREMIUM EDITORIAL DE LA TIENDA
        ========================================================================
      */}
      <section className="pt-28 pb-14 sm:pt-36 sm:pb-20 border-b border-[#B39A6A]/20 bg-[#F9F7F2] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#B39A6A_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B39A6A]/15 text-[#8A7347] text-[11px] font-semibold uppercase tracking-[0.14em] mb-4">
              <Sparkles className="size-3 text-champagne animate-pulse" />
              <span>TIENDA DE BIENESTAR</span>
            </div>

            {/* Título */}
            <h1 className="font-serif text-[clamp(2.1rem,4.2vw,3.8rem)] leading-[1.05] tracking-[-0.03em] text-obsidian font-medium">
              Bienestar con información clara.
            </h1>

            {/* Descripción */}
            <p className="mt-4 text-base sm:text-lg text-obsidian/75 leading-[1.65] max-w-2xl">
              Consulta ingredientes, presentación, advertencias y condiciones de compra antes de elegir un producto. Enfoque ético y basado en evidencia para el cuidado de tu fisiología.
            </p>

            {/* Aviso Sanitario Destacado */}
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white border border-[#B39A6A]/25 text-xs text-obsidian/80 max-w-2xl shadow-xs">
              <Info className="size-4.5 text-champagne shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Aviso de seguridad y responsabilidad:</strong> Los productos mostrados no sustituyen una alimentación equilibrada, una valoración médica ni un tratamiento indicado por un profesional de la salud. Todos los suplementos se encuentran preliminarmente en revisión antes de su comercialización.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        2. BARRA DE HERRAMIENTAS Y BÚSQUEDA
        ========================================================================
      */}
      <section className="py-8 bg-white border-b border-[#B39A6A]/15 sticky top-[64px] z-30 shadow-xs/50 backdrop-blur-md bg-white/95">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Buscador */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-obsidian/45" />
              <input
                type="text"
                placeholder="Buscar suplementos por nombre o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 rounded-full border border-[#B39A6A]/30 bg-ivory/50 text-xs sm:text-sm text-obsidian placeholder:text-obsidian/40 focus:outline-hidden focus:ring-2 focus:ring-champagne focus:bg-white transition-all"
              />
            </div>

            {/* Filtros rápidos en escritorio */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center gap-2 h-[42px] px-4 rounded-full border border-[#B39A6A]/30 text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-[#B39A6A]/5"
              >
                <SlidersHorizontal className="size-4" />
                <span>Filtros</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-obsidian text-white'
                        : 'bg-ivory text-obsidian/70 border border-[#B39A6A]/25 hover:border-[#B39A6A]/55 hover:text-obsidian'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-obsidian/50 font-medium">
                {filteredProducts.length} registros preliminares
              </span>
            </div>
          </div>

          {/* Filtros móviles colapsables */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#B39A6A]/15 flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-obsidian text-white'
                      : 'bg-ivory text-obsidian/70 border border-[#B39A6A]/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 
        ========================================================================
        3. CUADRÍCULA DE SUPLEMENTOS EN BORRADOR / REVISIÓN
        ========================================================================
      */}
      <section className="py-12 sm:py-16">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <Search className="size-12 mx-auto stroke-[1.2] text-[#B39A6A]/40 mb-4" />
              <h3 className="font-serif text-xl font-medium text-obsidian">Sin coincidencias</h3>
              <p className="text-sm text-obsidian/60 mt-2">
                No se encontraron productos suplementarios que coincidan con los filtros o el término de búsqueda ingresado.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-6 px-5 py-2 rounded-full border border-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian hover:text-white transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredProducts.map((product) => {
                const isApproved = product.status === 'active' && product.complianceStatus === 'approved';
                const isPriorityReview = product.complianceStatus === 'high_priority_review';
                const publishable = isProductPublishable(product);

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col justify-between h-full bg-white rounded-2xl border border-[#B39A6A]/22 overflow-hidden shadow-xs hover:border-[#B39A6A]/55 hover:shadow-[0_12px_28px_rgba(17,24,32,0.06)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      {/* Imagen con cargado optimizado */}
                      <div className="relative aspect-1/1 w-full bg-[#FAFAFA] border-b border-[#B39A6A]/10 flex items-center justify-center p-6 sm:p-8 overflow-hidden select-none">
                        {product.featuredImage.includes('placeholder_d3') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-ivory rounded-xl border border-dashed border-[#B39A6A]/30 text-center p-4">
                            <ShieldAlert className="size-8 text-[#B39A6A]/50 mb-2" />
                            <span className="text-[10px] uppercase font-semibold text-champagne">Fotografía Pendiente</span>
                            <span className="text-[10px] text-obsidian/40 mt-1">Requiere tomas de frente, reverso y lote</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            {/* Placeholder estético detrás en lo que carga o para dar fondo */}
                            <div className="absolute inset-0 bg-[radial-gradient(#B39A6A_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-5 rounded-lg" />
                            <img
                              src={product.featuredImage}
                              alt={product.altText}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-102"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback a generador de placeholder SVG limpio si la imagen no existe físicamente en el disco
                                e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23F9F7F2"/><circle cx="150" cy="150" r="80" fill="%23B39A6A" fill-opacity="0.1"/><text x="150" y="155" font-family="serif" font-size="14" fill="%238A7347" text-anchor="middle" font-weight="bold">${product.brand}</text></svg>`;
                              }}
                            />
                          </div>
                        )}

                        {/* Badges de Estado */}
                        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 items-center justify-between">
                          <span className="px-2.5 py-1 rounded-sm bg-white/95 backdrop-blur-xs text-[9px] font-bold tracking-wider uppercase text-obsidian shadow-xs border border-[#B39A6A]/15">
                            {product.brand}
                          </span>
                          
                          {isPriorityReview ? (
                            <span className="px-2.5 py-1 rounded-sm bg-amber-50 text-amber-800 text-[9px] font-bold tracking-wider uppercase border border-amber-200/50 flex items-center gap-1 shadow-xs animate-pulse">
                              <ShieldAlert className="size-3" />
                              Revisión Crítica
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-sm bg-obsidian/5 text-obsidian/70 text-[9px] font-bold tracking-wider uppercase border border-obsidian/10 flex items-center gap-1 shadow-xs">
                              En revisión
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-6">
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-champagne mb-1.5">
                          {product.category} · {product.dosageForm}
                        </div>
                        <h3 className="font-serif text-lg text-obsidian font-medium leading-snug line-clamp-2">
                          <a href={`/tienda/${product.slug}`} className="hover:underline focus:outline-hidden focus:ring-1 focus:ring-champagne">
                            {product.title}
                          </a>
                        </h3>
                        <p className="mt-2 text-xs text-obsidian/60 leading-relaxed line-clamp-2">
                          {product.subtitle}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#B39A6A]/10 flex items-center justify-between text-[11px] text-obsidian/60">
                          <span>Contenido: <strong>{product.netContent}</strong></span>
                          <span>Porciones: <strong>{product.servingsPerContainer || 'Pendientes'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Footer de la Tarjeta */}
                    <div className="px-6 pb-6 pt-2">
                      <div className="flex items-center justify-between mb-4 bg-ivory/50 p-2.5 rounded-lg border border-[#B39A6A]/10">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-obsidian/50 font-bold">Inversión Estimada</div>
                          <div className="font-serif text-lg font-bold text-obsidian">
                            {product.price > 0 ? `$${product.price.toLocaleString('es-MX')} MXN` : 'Precio Pendiente'}
                          </div>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/30">
                          No disponible
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`/tienda/${product.slug}`}
                          className="flex-1 h-[42px] rounded-full border border-obsidian text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>Ver Ficha Técnica</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* 
        ========================================================================
        4. BLOQUE DE GARANTÍA Y TRANSPARENCIA REGULATORIA
        ========================================================================
      */}
      <section className="py-14 sm:py-20 bg-white border-t border-[#B39A6A]/20">
        <Container className="max-w-[800px] mx-auto px-5 sm:px-8 text-center">
          <div className="size-12 rounded-2xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center mx-auto text-champagne mb-4">
            <Info className="size-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight">
            Transparencia e integridad en suplementación
          </h2>
          <p className="mt-3 text-sm text-obsidian/75 leading-relaxed max-w-xl mx-auto">
            Queda estrictamente prohibido comercializar suplementos con leyendas de propiedades preventivas, terapéuticas o curativas. En esta sección nos apegamos rígidamente a la legislación y normatividad de COFEPRIS en México.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-ivory/50 border border-[#B39A6A]/20 text-xs text-obsidian/70 text-left space-y-2">
            <p><strong>Clasificación Sanitaria:</strong> Los suplementos alimenticios son productos destinados a complementar la dieta, no a tratar enfermedades. Su formulación, ingredientes y etiquetado en español deben verificarse rigurosamente frente a pedimentos y análisis de laboratorio.</p>
            <p><strong>Aviso Comercial:</strong> Este sitio puede recibir ingresos por la venta de productos mostrados. La disponibilidad comercial de un producto no sustituye de ninguna forma una recomendación médica individualizada.</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
