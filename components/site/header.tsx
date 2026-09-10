import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MbglLogo } from '@/components/MbglLogo';
import { DesktopNavigation } from './desktop-navigation';
import { MobileNav } from './mobile-nav';
import { useCart } from '@/lib/shopify/cart-context';
import { ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, itemCount } = useCart();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'border-b border-[#B39A6A]/20 bg-[#FAF8F5]/96 backdrop-blur-md shadow-[0_4px_24px_rgba(13,34,53,0.04)]'
          : 'border-b border-[#B39A6A]/15 bg-[#FAF8F5]/98 backdrop-blur-sm'
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1728px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-14 transition-all duration-300 ${
          isScrolled
            ? 'h-[68px] sm:h-[72px] lg:h-[76px] xl:h-[80px]'
            : 'h-[76px] sm:h-[82px] lg:h-[88px] xl:h-[92px]'
        }`}
      >
        <div className="flex items-center">
          {/* Logotipo a la izquierda con tamaño proporcionado y animación fluida */}
          <div className="flex shrink-0 items-center justify-center">
            <Link
              href="/"
              prefetch={false}
              aria-label="Ir a la página de inicio — Dr. Mauricio Benjamín Galindo López"
              className="group flex shrink-0 items-center justify-center cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-[#0D2235]/70 focus-visible:outline-offset-[5px] focus-visible:rounded-lg"
            >
              <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] lg:w-[72px] lg:h-[72px] xl:w-[76px] xl:h-[76px] flex items-center justify-center shrink-0">
                <MbglLogo
                  size="100%"
                  className="w-full h-full"
                  embeddedInLink
                />
              </div>
              <span className="sr-only">
                Dr. Mauricio Benjamín Galindo López
              </span>
            </Link>
          </div>

          {/* Menú de navegación inmediatamente después del logotipo (alineado a la izquierda) */}
          <div className="hidden lg:flex items-center ml-8 sm:ml-10 lg:ml-12 xl:ml-14">
            <DesktopNavigation />
          </div>
        </div>

        {/* Acciones del lado derecho: Cuenta + Carrito de compras + Mobile Nav */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* User Account / Login */}
          <Link
            href={user ? "/mi-cuenta" : "/cuenta/iniciar-sesion"}
            aria-label={user ? "Ir a mi cuenta" : "Iniciar sesión"}
            className="relative hidden sm:flex items-center gap-2 p-2 sm:p-2.5 rounded-full text-obsidian/75 hover:text-obsidian hover:bg-[#B39A6A]/15 transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-champagne"
          >
            <UserRound className="size-5 sm:size-5.5 stroke-[1.4]" />
            {!isLoading && (
               <span className="hidden xl:inline text-sm font-medium tracking-wide">
                 {user ? "Mi Cuenta" : "Iniciar sesión"}
               </span>
            )}
          </Link>

          <button
            onClick={openCart}
            aria-label={`Abrir bolsa de compra (${itemCount} productos)`}
            className="relative p-2 sm:p-2.5 rounded-full text-obsidian/75 hover:text-obsidian hover:bg-[#B39A6A]/15 transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-champagne"
          >
            <ShoppingBag className="size-5 sm:size-5.5 stroke-[1.4]" />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 size-4.5 rounded-full bg-obsidian text-white text-[10px] font-bold flex items-center justify-center border border-white">
                {itemCount}
              </span>
            )}
          </button>

          {/* Disparador de navegación móvil alineado a la derecha en pantallas pequeñas */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
