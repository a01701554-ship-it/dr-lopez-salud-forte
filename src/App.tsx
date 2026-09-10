import { useEffect, useState } from 'react';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { ContactTrigger } from '@/components/site/contact-trigger';
import Home from '@/app/page';
import AboutPage from '@/app/sobre-mi/page';
import PodcastPage from '@/app/podcast/page';
import BookingPage from '@/app/agendar/page';
import ConsultationPage from '@/app/consulta/page';
import PreguntasPage from '@/app/preguntas/page';
import AdminPreciosPage from '@/app/admin/precios/page';
import AcademiaPage from '@/app/academia/page';
import MasterclassDetailPage from '@/app/academia/[slug]/page';
import MisMasterclassesPage from '@/app/academia/mis-masterclasses/page';
import LessonPlayerPage from '@/app/academia/[slug]/leccion/[lessonSlug]/page';
import AdminAcademiaPage from '@/app/admin/academia/page';
import TiendaPage from '@/app/tienda/page';
import ProductDetailPage from '@/app/tienda/[slug]/page';
import AdminProductosPage from '@/app/admin/productos/page';
import FoundationRoute, { resolveConfig } from '@/app/[...slug]/page';
import { CartProvider } from '@/lib/shopify/cart-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { CartDrawer } from '@/components/shopify/cart-drawer';

import LoginPage from '@/app/cuenta/iniciar-sesion/page';
import RegisterPage from '@/app/cuenta/registro/page';
import RecoverPasswordPage from '@/app/cuenta/recuperar-contrasena/page';
import ResetPasswordPage from '@/app/cuenta/reset-password/page';
import VerifyEmailPage from '@/app/cuenta/verificar-correo/page';
import MyAccountPage from '@/app/mi-cuenta/page';
import MisPedidosPage from '@/app/mi-cuenta/pedidos/page';
import MiPerfilPage from '@/app/mi-cuenta/perfil/page';

function getInitialPath(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname || '/';
  }
  return '/';
}

export default function App() {
  const [pathname, setPathname] = useState<string>(getInitialPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Update document title dynamically
  useEffect(() => {
    let pageTitle = `Dr. Mauricio Galindo | Médico Cirujano · Salud Forte`;
    if (pathname === '/sobre-mi') {
      pageTitle = `Sobre mí | Dr. Mauricio Galindo`;
    } else if (pathname === '/podcast') {
      pageTitle = `Salud Forte Podcast | Dr. Mauricio Galindo`;
    } else if (pathname === '/agendar') {
      pageTitle = `Agendar Consulta | Dr. Mauricio Galindo`;
    } else if (pathname === '/consulta') {
      pageTitle = `Consulta Médica | Dr. Mauricio Galindo`;
    } else if (pathname === '/preguntas') {
      pageTitle = `Preguntas Frecuentes | Dr. Mauricio Galindo`;
    } else if (pathname === '/academia') {
      pageTitle = `Academia Salud Forte | Masterclasses Médicas con Evidencia`;
    } else if (pathname === '/academia/mis-masterclasses' || pathname === '/apps/academia') {
      pageTitle = `Mis Masterclasses | Academia Salud Forte`;
    } else if (pathname.startsWith('/academia/')) {
      pageTitle = `Masterclass | Academia Salud Forte`;
    } else if (pathname === '/tienda') {
      pageTitle = `Tienda de Bienestar | Dr. Mauricio Galindo`;
    } else if (pathname.startsWith('/tienda/')) {
      pageTitle = `Suplemento | Dr. Mauricio Galindo`;
    } else if (pathname === '/admin/academia') {
      pageTitle = `Panel Academia & Shopify | Salud Forte`;
    } else if (pathname === '/admin/productos') {
      pageTitle = `Puerta de Publicación de Suplementos | Panel Administrativo`;
    } else if (pathname !== '/') {
      const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
      const slug = cleanPath.split('/');
      const config = resolveConfig(slug);
      if (config) {
        pageTitle = `${config.eyebrow} | Dr. Mauricio Galindo`;
      }
    }
    document.title = pageTitle;
  }, [pathname]);

  const renderContent = () => {
    const normalized = pathname === '' ? '/' : pathname;

    if (normalized === '/') {
      return <Home />;
    }

    if (normalized === '/sobre-mi') {
      return <AboutPage />;
    }

    if (normalized === '/podcast') {
      return <PodcastPage />;
    }

    if (normalized === '/agendar') {
      return <BookingPage />;
    }

    if (normalized === '/consulta') {
      return <ConsultationPage />;
    }

    if (normalized === '/preguntas') {
      return <PreguntasPage />;
    }

    if (normalized === '/admin/precios' || normalized === '/admin') {
      return <AdminPreciosPage />;
    }

    if (normalized === '/admin/academia') {
      return <AdminAcademiaPage />;
    }

    if (normalized === '/admin/productos') {
      return <AdminProductosPage />;
    }

    // Account Routes
    if (normalized === '/cuenta/iniciar-sesion' || normalized === '/cuenta/ingresar') {
      return <LoginPage />;
    }
    if (normalized === '/cuenta/registro') {
      return <RegisterPage />;
    }
    if (normalized === '/cuenta/verificar-correo') {
      return <VerifyEmailPage />;
    }
    if (normalized === '/cuenta/recuperar-contrasena') {
      return <RecoverPasswordPage />;
    }
    if (normalized === '/cuenta/reset-password') {
      return <ResetPasswordPage />;
    }
    if (normalized === '/mi-cuenta') {
      return <MyAccountPage />;
    }
    if (normalized === '/mi-cuenta/pedidos') {
      return <MisPedidosPage />;
    }
    if (normalized === '/mi-cuenta/perfil') {
      return <MiPerfilPage />;
    }

    // Official Tienda Routes
    if (normalized === '/tienda') {
      return <TiendaPage />;
    }

    const productDetailMatch = normalized.match(/^\/tienda\/([^/]+)$/);
    if (productDetailMatch) {
      return <ProductDetailPage params={{ slug: productDetailMatch[1] }} />;
    }

    // Official Academy Routes
    if (normalized === '/academia') {
      return <AcademiaPage />;
    }

    if (normalized === '/academia/mis-masterclasses' || normalized === '/apps/academia') {
      return <MisMasterclassesPage />;
    }

    // App Proxy & Player routes:
    // Pattern: /apps/academia/cursos/:slug/lecciones/:lessonSlug
    const appProxyMatch = normalized.match(/^\/apps\/academia\/cursos\/([^/]+)\/lecciones\/([^/]+)/);
    if (appProxyMatch) {
      return <LessonPlayerPage slugProp={appProxyMatch[1]} lessonSlugProp={appProxyMatch[2]} />;
    }

    // Pattern: /academia/:slug/leccion/:lessonSlug
    const playerMatch = normalized.match(/^\/academia\/([^/]+)\/leccion\/([^/]+)/);
    if (playerMatch) {
      return <LessonPlayerPage slugProp={playerMatch[1]} lessonSlugProp={playerMatch[2]} />;
    }

    // Pattern: /academia/:slug
    const courseDetailMatch = normalized.match(/^\/academia\/([^/]+)$/);
    if (courseDetailMatch) {
      return <MasterclassDetailPage slugProp={courseDetailMatch[1]} />;
    }

    const cleanPath = normalized.replace(/^\/+|\/+$/g, '');
    const slug = cleanPath ? cleanPath.split('/') : [''];
    return <FoundationRoute slug={slug} />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-ivory text-obsidian flex flex-col font-sans selection:bg-champagne selection:text-obsidian">
          <a className="skip-link" href="#contenido-principal">
            Saltar al contenido
          </a>
          <Header />
          <div className="flex-1 w-full">{renderContent()}</div>
          <ContactTrigger />
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
