'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/config/site';

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex items-center">
      <ul className="flex items-center gap-6 lg:gap-7 xl:gap-8 2xl:gap-9">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="relative flex items-center">
              <Link
                href={item.href}
                prefetch={false}
                className={`group relative inline-flex items-center py-1 text-[11px] lg:text-[11.5px] xl:text-[12px] font-sans uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#0D2235]/70 focus-visible:outline-offset-4 focus-visible:rounded-sm ${
                  isActive
                    ? 'font-semibold text-obsidian'
                    : 'font-medium text-obsidian/60 hover:text-obsidian'
                }`}
              >
                <span>{item.label}</span>

                {/* Línea inferior para estado activo */}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-obsidian"
                    aria-hidden="true"
                  />
                )}

                {/* Línea inferior fina para hover en enlaces no activos */}
                {!isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#B39A6A] origin-left scale-x-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
