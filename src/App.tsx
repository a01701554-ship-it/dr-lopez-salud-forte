import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { ContactTrigger } from '@/components/site/contact-trigger';
import FoundationRoute, { resolveConfig } from '@/app/[...slug]/page';
import { CartProvider } from '@/lib/shopify/cart-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { CartDrawer } from '@/components/shopify/cart-drawer';
import { STORE_ENABLED } from '@/config/site';

const Home = lazy(() => import('@/app/page'));
const AboutPage = lazy(() => import('@/app/sobre-mi/page'));
const PodcastPage = lazy(() => import('@/app/podcast/page'));
const BookingPage = lazy(() => import('@/app/agendar/page'));
const ConsultationPage = lazy(() => import('@/app/consulta/page'));
const PreguntasPage = lazy(() => import('@/app/preguntas/page'));
const AdminPreciosPage = lazy(() => import('@/app/admin/precios/page'));
const AcademiaPage = lazy(() => import('@/app/academia/page'));
const MasterclassDetailPage = lazy(() => import('@/app/academia/[slug]/page'));
const MisMasterclassesPage = lazy(() => import('@/app/academia/mis-masterclasses/page'));
const LessonPlayerPage = lazy(() => import('@/app/academia/[slug]/leccion/[lessonSlug]/page'));
const AdminAcademiaPage = lazy(() => import('@/app/admin/academia/page'));
const AdminAppointmentsPage = lazy(() => import('@/app/admin/citas/page'));
const TiendaPage = lazy(() => import('@/app/tienda/page'));
const ProductDetailPage = lazy(() => import('@/app/tienda/[slug]/page'));
const AdminProductosPage = lazy(() => import('@/app/admin/productos/page'));
const LoginPage = lazy(() => import('@/app/cuenta/iniciar-sesion/page'));
const RegisterPage = lazy(() => import('@/app/cuenta/registro/page'));
const RecoverPasswordPage = lazy(() => import('@/app/cuenta/recuperar-contrasena/page'));
const ResetPasswordPage = lazy(() => import('@/app/cuenta/reset-password/page'));
const VerifyEmailPage = lazy(() => import('@/app/cuenta/verificar-correo/page'));
const MyAccountPage = lazy(() => import('@/app/mi-cuenta/page'));
const MisPedidosPage = lazy(() => import('@/app/mi-cuenta/pedidos/page'));
const MiPerfilPage = lazy(() => import('@/app/mi-cuenta/perfil/page'));
const StudentMasterclassesPage = lazy(() => import('@/app/mi-cuenta/masterclasses/page'));
const InstructorAccountPage = lazy(() => import('@/app/mi-cuenta/instructor/page'));
const AuthCallbackPage = lazy(() => import('@/app/auth/callback/page'));

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

  // Controlled redirection when store is disabled
  useEffect(() => {
    if (!STORE_ENABLED) {
      const rawPath = pathname === '' ? '/' : pathname;
      const normalized = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
      if (normalized === '/tienda' || normalized.startsWith('/tienda/')) {
        window.history.replaceState({}, '', '/');
        setPathname('/');
      }
    }
  }, [pathname]);

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
    } else if (STORE_ENABLED && pathname === '/tienda') {
      pageTitle = `Tienda de Bienestar | Dr. Mauricio Galindo`;
    } else if (STORE_ENABLED && pathname.startsWith('/tienda/')) {
      pageTitle = `Suplemento | Dr. Mauricio Galindo`;
    } else if (pathname === '/admin/academia' || pathname === '/mi-cuenta/instructor') {
      pageTitle = `Panel del Instructor · Dr. Mauricio Galindo | Salud Forte`;
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
    const rawPath = pathname === '' ? '/' : pathname;
    const normalized = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

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

    if (normalized === '/admin/citas') {
      return <AdminAppointmentsPage />;
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
    if (normalized === '/auth/callback') {
      return <AuthCallbackPage />;
    }
    if (normalized === '/cuenta/reset-password') {
      return <ResetPasswordPage />;
    }
    if (normalized === '/mi-cuenta') {
      return <MyAccountPage />;
    }
    if (normalized === '/mi-cuenta/masterclasses') {
      return <StudentMasterclassesPage />;
    }
    const studentMasterclassMatch = normalized.match(/^\/mi-cuenta\/masterclasses\/([^/]+)$/);
    if (studentMasterclassMatch) {
      return <MasterclassDetailPage slugProp={studentMasterclassMatch[1]} />;
    }
    if (normalized === '/mi-cuenta/pedidos') {
      return <MisPedidosPage />;
    }
    if (normalized === '/mi-cuenta/perfil') {
      return <MiPerfilPage />;
    }
    if (normalized === '/mi-cuenta/instructor') {
      return <InstructorAccountPage />;
    }
    // Official Tienda Routes (Controlled by STORE_ENABLED)
    if (normalized === '/tienda' || normalized.startsWith('/tienda/')) {
      if (!STORE_ENABLED) {
        return <Home />;
      }
      if (normalized === '/tienda') {
        return <TiendaPage />;
      }
      const productDetailMatch = normalized.match(/^\/tienda\/([^/]+)$/);
      if (productDetailMatch) {
        return <ProductDetailPage params={{ slug: productDetailMatch[1] }} />;
      }
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

    // Pattern: /aprender/:slug/:lessonSlug
    const aprenderMatch = normalized.match(/^\/aprender\/([^/]+)\/([^/]+)/);
    if (aprenderMatch) {
      return <LessonPlayerPage slugProp={aprenderMatch[1]} lessonSlugProp={aprenderMatch[2]} />;
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
          <div className="flex-1 w-full">
            <Suspense
              fallback={
                <main id="contenido-principal" className="grid min-h-[60svh] place-items-center bg-ivory px-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-obsidian/55">
                    Cargando experiencia…
                  </p>
                </main>
              }
            >
              {renderContent()}
            </Suspense>
          </div>
          <ContactTrigger />
          <Footer />
          {STORE_ENABLED && <CartDrawer />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
