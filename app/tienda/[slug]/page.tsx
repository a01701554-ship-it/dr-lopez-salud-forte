'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/site/container';
import { productsDb, Product, validateProductForPublishing } from '@/lib/shopify/products-db';
import { useCart } from '@/lib/shopify/cart-context';
import { 
  ChevronLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Hash, 
  HelpCircle, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Bookmark,
  Share2
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedImageTab, setSelectedImageTab] = useState<'front' | 'label' | 'facts'>('front');
  const [openSection, setOpenSection] = useState<string>('composition');
  const [isCopied, setIsCopied] = useState(false);

  const { addProductItem } = useCart();

  useEffect(() => {
    if (params?.slug) {
      const found = productsDb.getProductBySlug(params.slug);
      setProduct(found);
    }
  }, [params?.slug]);

  if (!product) {
    return (
      <div className="bg-ivory min-h-screen pt-32 pb-20 text-center font-sans">
        <Container className="max-w-md mx-auto px-5">
          <AlertTriangle className="size-12 text-[#B39A6A] mx-auto mb-4 stroke-[1.2]" />
          <h1 className="font-serif text-2xl text-obsidian font-medium">Registro no encontrado</h1>
          <p className="text-sm text-obsidian/60 mt-2">
            El suplemento solicitado no existe en la base de datos de trazabilidad preliminar o ha sido archivado.
          </p>
          <a
            href="/tienda"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span>Volver a la tienda</span>
          </a>
        </Container>
      </div>
    );
  }

  const checklist = validateProductForPublishing(product);
  const isMelatonin = product.slug.includes('melatolina') || product.slug.includes('melatonin');

  // Alternar secciones del acordeón de información médica
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Copiar link al portapapeles
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-ivory min-h-screen text-obsidian font-sans pt-24 sm:pt-28 pb-16">
      {/* Botón de Retorno */}
      <div className="border-b border-[#B39A6A]/15 bg-white/70 backdrop-blur-xs py-3.5 sticky top-[64px] z-20">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8 flex items-center justify-between">
          <a
            href="/tienda"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-obsidian/75 hover:text-obsidian uppercase tracking-wider"
          >
            <ChevronLeft className="size-4 text-champagne" />
            <span>Volver al catálogo</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-[#B39A6A]/20 bg-white text-obsidian/70 hover:text-obsidian hover:bg-[#B39A6A]/10 transition-all text-xs flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Share2 className="size-3.5 text-champagne" />
              <span>{isCopied ? 'Copiado' : 'Compartir'}</span>
            </button>
          </div>
        </Container>
      </div>

      <Container className="max-w-[1180px] mx-auto px-5 sm:px-8 mt-8 sm:mt-12">
        {/* Alerta de Estado No Disponible / En Revisión */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-3 shadow-xs">
          <AlertTriangle className="size-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950 uppercase tracking-wide text-[10px] mb-1">
              REGISTRO EN REVISIÓN MÉDICA Y SANITARIA (PRE-VENTA BLOQUEADA)
            </p>
            <p>
              Este suplemento alimenticio se encuentra en estado de <strong>borrador (draft)</strong> bajo la puerta de publicación del Dr. Mauricio Galindo. La compra y añadir al carrito están inhabilitados hasta que el laboratorio nacional verifique su fórmula y COFEPRIS emita el dictamen respectivo.
            </p>
          </div>
        </div>

        {/* 
          ========================================================================
          DISTRIBUCIÓN EN 2 COLUMNAS (ESCRITORIO)
          ========================================================================
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* 1. COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES Y PESTAÑAS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#B39A6A]/22 p-6 flex flex-col items-center justify-center relative aspect-1/1 shadow-xs">
              
              {/* Badge de Marca */}
              <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-sm bg-ivory text-[9px] font-bold tracking-wider uppercase text-obsidian border border-[#B39A6A]/20">
                {product.brand}
              </span>

              {/* Contenedor Principal de la Imagen */}
              <div className="w-full h-full flex items-center justify-center p-4">
                {selectedImageTab === 'front' && (
                  product.featuredImage.includes('placeholder_d3') ? (
                    <div className="text-center p-6 flex flex-col items-center justify-center bg-ivory/50 rounded-xl border border-dashed border-[#B39A6A]/30 w-full h-full">
                      <ShieldAlert className="size-10 text-[#B39A6A]/40 mb-3" />
                      <p className="font-serif text-sm font-medium text-obsidian">Fotografía de empaque pendiente</p>
                      <p className="text-xs text-obsidian/50 mt-1 max-w-xs">No se dispone de imágenes digitales autorizadas por el fabricante.</p>
                    </div>
                  ) : (
                    <img
                      src={product.featuredImage}
                      alt={product.altText}
                      className="max-h-[320px] max-w-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23F9F7F2"/><circle cx="150" cy="150" r="80" fill="%23B39A6A" fill-opacity="0.1"/><text x="150" y="155" font-family="serif" font-size="14" fill="%238A7347" text-anchor="middle" font-weight="bold">${product.brand}</text></svg>`;
                      }}
                    />
                  )
                )}

                {selectedImageTab === 'label' && (
                  <div className="text-center p-6 flex flex-col items-center justify-center bg-ivory/50 rounded-xl border border-dashed border-[#B39A6A]/30 w-full h-full">
                    <FileText className="size-10 text-[#B39A6A]/40 mb-3" />
                    <p className="font-serif text-sm font-medium text-obsidian">Contraetiqueta e Instructivos</p>
                    <p className="text-xs text-obsidian/50 mt-1 max-w-xs">En revisión. El reverso físico del empaque con número de lote se encuentra custodiado en el almacén del distribuidor.</p>
                  </div>
                )}

                {selectedImageTab === 'facts' && (
                  <div className="w-full h-full overflow-y-auto bg-[#FDFDFD] border border-[#B39A6A]/20 rounded-xl p-5 text-xs font-sans text-obsidian shadow-inner flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-center border-b-4 border-obsidian pb-1 uppercase tracking-tight text-sm">Supplement Facts</h4>
                      <div className="flex justify-between py-1 font-semibold text-[10px]">
                        <span>Serving Size: {product.servingSize || 'Ver etiqueta'}</span>
                        <span>Servings: {product.servingsPerContainer || 'Ver etiqueta'}</span>
                      </div>
                      <hr className="border-t-2 border-obsidian my-1" />
                      <div className="space-y-1.5 my-2">
                        {product.nutritionFacts ? (
                          <p className="leading-relaxed whitespace-pre-line text-[11px] text-obsidian/80">
                            {product.nutritionFacts}
                          </p>
                        ) : (
                          <p className="text-obsidian/50 text-center py-4">Tabla nutricional no digitalizada. Consulte composición en la descripción técnica.</p>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-obsidian/30 pt-2 text-[9px] text-obsidian/60 italic leading-snug">
                      * El porcentaje de valor diario (DV) se basa en una dieta de 2,000 calorías. Sus valores diarios pueden variar.
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Estatus de Imagen */}
              <div className="mt-4 w-full flex items-center justify-between text-[10px] text-obsidian/50 bg-[#FDFDFD] p-2.5 rounded-lg border border-[#B39A6A]/10">
                <span>Fotografía: <strong>{product.imageApprovalStatus === 'approved' ? 'Aprobada' : 'No verificada'}</strong></span>
                <span>Derechos: <strong>{product.imageRightsStatus === 'approved' ? 'Cedidos' : 'En trámite'}</strong></span>
              </div>
            </div>

            {/* Selector de Pestañas de Imagen */}
            <div className="grid grid-cols-3 gap-2.5 font-sans">
              <button
                onClick={() => setSelectedImageTab('front')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                  selectedImageTab === 'front'
                    ? 'bg-obsidian text-white border-obsidian'
                    : 'bg-white text-obsidian/70 border border-[#B39A6A]/20 hover:bg-[#B39A6A]/5'
                }`}
              >
                Frente
              </button>
              <button
                onClick={() => setSelectedImageTab('label')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                  selectedImageTab === 'label'
                    ? 'bg-obsidian text-white border-obsidian'
                    : 'bg-white text-obsidian/70 border border-[#B39A6A]/20 hover:bg-[#B39A6A]/5'
                }`}
              >
                Reverso
              </button>
              <button
                onClick={() => setSelectedImageTab('facts')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                  selectedImageTab === 'facts'
                    ? 'bg-obsidian text-white border-obsidian'
                    : 'bg-white text-obsidian/70 border border-[#B39A6A]/20 hover:bg-[#B39A6A]/5'
                }`}
              >
                Tabla Facts
              </button>
            </div>
          </div>


          {/* 2. COLUMNA DERECHA: FICHA TÉCNICA DETALLADA Y CONTROLES */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              {/* Categoría y Fabricación */}
              <div className="text-xs uppercase font-semibold tracking-wider text-champagne flex items-center gap-2">
                <span>{product.category}</span>
                <span>•</span>
                <span>Origen: {product.countryOfOrigin || 'Por verificar'}</span>
              </div>

              {/* Título Principal */}
              <h1 className="font-serif text-3xl sm:text-4xl text-obsidian font-medium leading-tight mt-2.5">
                {product.title}
              </h1>

              {/* Subtítulo */}
              <p className="mt-2 text-base text-obsidian/70 leading-relaxed font-sans">
                {product.subtitle}
              </p>

              {/* Datos de Presentación Rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-white p-3 rounded-xl border border-[#B39A6A]/15 text-center">
                  <span className="text-[10px] uppercase font-bold text-obsidian/45 block">Forma</span>
                  <span className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5 block">{product.dosageForm}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#B39A6A]/15 text-center">
                  <span className="text-[10px] uppercase font-bold text-obsidian/45 block">Contenido</span>
                  <span className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5 block">{product.netContent}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#B39A6A]/15 text-center">
                  <span className="text-[10px] uppercase font-bold text-obsidian/45 block">Porciones</span>
                  <span className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5 block">{product.servingsPerContainer || 'TBD'}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#B39A6A]/15 text-center">
                  <span className="text-[10px] uppercase font-bold text-obsidian/45 block">Peso Neto</span>
                  <span className="text-xs sm:text-sm font-semibold text-obsidian mt-0.5 block">{product.weight > 0 ? `${product.weight * 1000} g` : 'TBD'}</span>
                </div>
              </div>
            </div>

            {/* Cuadro de compra (Deshabilitado de forma elegante) */}
            <div className="bg-[#FAFAFA] rounded-2xl border border-[#B39A6A]/30 p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian/45 font-bold">Precio sugerido</span>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-obsidian mt-1">
                    {product.price > 0 ? `$${product.price.toLocaleString('es-MX')} MXN` : 'Por dictaminar'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 text-[10px] font-bold tracking-wide uppercase border border-red-200/50">
                    <Lock className="size-3" />
                    No Disponible
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#B39A6A]/15 text-xs text-obsidian/70 leading-relaxed space-y-2">
                <p>
                  <strong>¿Por qué está inhabilitada la compra?</strong> Para asegurar la ética clínica, el Dr. Mauricio Galindo bloquea de manera absoluta la comercialización de todo suplemento que carezca de contraetiqueta traducida, factura formal de adquisición, pedimento legal y validación de laboratorio independiente en México.
                </p>
                <p className="text-[11px] text-[#8A7347]">
                  * No intente buscar u ordenar este producto en otras secciones del portal.
                </p>
              </div>

              {/* Botón de Venta Bloqueado */}
              <button
                disabled
                className="w-full h-[50px] rounded-full bg-obsidian/40 text-white/90 text-xs font-semibold uppercase tracking-widest mt-6 cursor-not-allowed flex items-center justify-center gap-2 border border-obsidian/5"
              >
                <Lock className="size-4" />
                <span>Compra Bloqueada - En Validación</span>
              </button>
            </div>

            {/* 
              ========================================================================
              ACORDEONES MÉDICOS INFORMATIVOS
              ========================================================================
            */}
            <div className="border border-[#B39A6A]/20 rounded-xl overflow-hidden divide-y divide-[#B39A6A]/15 bg-white font-sans text-sm">
              
              {/* Sección 1: Composición y Fórmula */}
              <div>
                <button
                  onClick={() => toggleSection('composition')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-serif font-medium text-base text-obsidian hover:bg-[#B39A6A]/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="size-4.5 text-champagne shrink-0" />
                    <span>Fórmula y Composición</span>
                  </span>
                  {openSection === 'composition' ? <ChevronUp className="size-4 text-champagne" /> : <ChevronDown className="size-4 text-champagne" />}
                </button>
                
                {openSection === 'composition' && (
                  <div className="px-5 pb-5 pt-1 space-y-4 text-xs sm:text-sm text-obsidian/85 leading-relaxed bg-[#FCFAF6]/50">
                    <div>
                      <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Ingredientes Declarados:</strong>
                      <p className="bg-white p-3 rounded-lg border border-[#B39A6A]/10 text-xs text-obsidian/80">
                        {product.ingredients || 'Falta declaración oficial de la lista completa de ingredientes.'}
                      </p>
                    </div>
                    {product.activeComponents && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Componentes Activos:</strong>
                        <p>{product.activeComponents}</p>
                      </div>
                    )}
                    {product.inactiveIngredients && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Ingredientes Inactivos / Aditivos:</strong>
                        <p className="text-obsidian/60 italic">{product.inactiveIngredients}</p>
                      </div>
                    )}
                    <div>
                      <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Alérgenos Declarados:</strong>
                      <p className="text-red-800 font-medium">
                        {product.allergens || 'Pendiente de verificar alérgenos.'}
                      </p>
                    </div>
                    {product.formulaSource && (
                      <div className="text-[10px] text-obsidian/45 pt-1 border-t border-[#B39A6A]/10">
                        Fuente de la fórmula: <strong>{product.formulaSource}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 2: Dosificación y Guía de Uso */}
              <div>
                <button
                  onClick={() => toggleSection('usage')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-serif font-medium text-base text-obsidian hover:bg-[#B39A6A]/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4.5 text-champagne shrink-0" />
                    <span>Dosificación y Guía de Uso</span>
                  </span>
                  {openSection === 'usage' ? <ChevronUp className="size-4 text-champagne" /> : <ChevronDown className="size-4 text-champagne" />}
                </button>
                
                {openSection === 'usage' && (
                  <div className="px-5 pb-5 pt-1 space-y-4 text-xs sm:text-sm text-obsidian/85 leading-relaxed bg-[#FCFAF6]/50">
                    <div>
                      <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Sugerencia de Uso (Instrucciones):</strong>
                      <p className="bg-white p-3 rounded-lg border border-[#B39A6A]/10 text-xs">
                        {product.manufacturerDirections || 'Instrucciones pendientes de traducción del frasco original.'}
                      </p>
                    </div>
                    {product.storageInstructions && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Instrucciones de Almacenamiento:</strong>
                        <p>{product.storageInstructions}</p>
                      </div>
                    )}
                    {product.tamperSealInformation && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Sello de Seguridad e Integridad:</strong>
                        <p className="text-xs text-obsidian/60">{product.tamperSealInformation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 3: Advertencias y Seguridad */}
              <div>
                <button
                  onClick={() => toggleSection('safety')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-serif font-medium text-base text-obsidian hover:bg-[#B39A6A]/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <AlertTriangle className="size-4.5 text-red-700 shrink-0" />
                    <span className="text-red-900">Advertencias y Contraindicaciones</span>
                  </span>
                  {openSection === 'safety' ? <ChevronUp className="size-4 text-champagne" /> : <ChevronDown className="size-4 text-champagne" />}
                </button>
                
                {openSection === 'safety' && (
                  <div className="px-5 pb-5 pt-1 space-y-4 text-xs sm:text-sm text-obsidian/85 leading-relaxed bg-red-50/20">
                    <div>
                      <strong className="text-red-950 block uppercase tracking-wider text-[10px] mb-1">Advertencias Generales:</strong>
                      <div className="bg-red-50/50 p-3 rounded-lg border border-red-200/40 text-xs text-red-900 leading-relaxed font-semibold">
                        {product.warnings || 'Advertencias pendientes de dictaminar.'}
                      </div>
                    </div>
                    {product.contraindications && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Contraindicaciones Clínicas:</strong>
                        <p>{product.contraindications}</p>
                      </div>
                    )}
                    {product.interactions && (
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-1">Interacciones con Fármacos / Nutrientes:</strong>
                        <p className="text-xs text-obsidian/70">{product.interactions}</p>
                      </div>
                    )}
                    {product.pregnancyWarning && (
                      <div>
                        <strong className="text-red-900 block uppercase tracking-wider text-[10px] mb-0.5">Embarazo y Lactancia:</strong>
                        <p className="font-semibold text-red-900 text-xs">{product.pregnancyWarning}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[9px] mb-0.5">Restricción de edad:</strong>
                        <p className="text-xs">{product.ageRestrictions || 'Por definir'}</p>
                      </div>
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[9px] mb-0.5">Enlace a farmacovigilancia:</strong>
                        <p className="text-xs text-obsidian/60 underline">{product.adverseEventContact}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 4: Cumplimiento y Trazabilidad */}
              <div>
                <button
                  onClick={() => toggleSection('compliance')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-serif font-medium text-base text-obsidian hover:bg-[#B39A6A]/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldAlert className="size-4.5 text-champagne shrink-0" />
                    <span>Trazabilidad y Regulación</span>
                  </span>
                  {openSection === 'compliance' ? <ChevronUp className="size-4 text-champagne" /> : <ChevronDown className="size-4 text-champagne" />}
                </button>
                
                {openSection === 'compliance' && (
                  <div className="px-5 pb-5 pt-1 space-y-4 text-xs sm:text-sm text-obsidian/85 leading-relaxed bg-[#FCFAF6]/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-0.5">Clasificación Regulatoria:</strong>
                        <p className="text-xs">{product.regulatoryClassification}</p>
                      </div>
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-0.5">Documentación de Importación:</strong>
                        <p className="text-xs text-obsidian/60">{product.importDocumentationStatus}</p>
                      </div>
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-0.5">Estatus de Etiqueta (Español):</strong>
                        <p className="text-xs">{product.spanishLabelStatus}</p>
                      </div>
                      <div>
                        <strong className="text-obsidian block uppercase tracking-wider text-[10px] mb-0.5">Acreditación de Proveedor:</strong>
                        <p className="text-xs">{product.supplierVerified ? 'Verificado de Origen' : 'Pendiente de Auditoría'}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#B39A6A]/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-[#B39A6A]/10">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-obsidian/45 block font-bold">Lote del Fabricante</span>
                        <span className="font-semibold">{product.lotNumber || 'Pendiente'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-obsidian/45 block font-bold">Fecha de Caducidad</span>
                        <span className="font-semibold">{product.expirationDate || 'Pendiente'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[9px] uppercase tracking-wider text-obsidian/45 block font-bold">SKU del Sistema</span>
                        <span className="font-mono text-[11px] font-semibold">{product.sku}</span>
                      </div>
                    </div>

                    {product.complianceNotes && (
                      <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30 text-xs text-amber-950">
                        <strong>Notas de cumplimiento:</strong> {product.complianceNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
