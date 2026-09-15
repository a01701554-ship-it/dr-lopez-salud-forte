import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  createSupabaseServerUserClient,
  getServerSupabaseConfig,
  isSupabaseConfigured,
} from './lib/supabase';
import { academyDb } from './lib/academy/db';
import {
  verifyShopifyWebhookHmac,
  verifyShopifyAppProxySignature,
  generateCloudflareStreamToken,
} from './lib/academy/security';
import { Course, Entitlement, ProcessedWebhook } from './lib/academy/types';
import {
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
} from './lib/academy/auth-service';

const PORT = Number(process.env.PORT) || 3000;

export interface AuthenticatedUser {
  id: string;
  customerGid: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN';
  verified: boolean;
}

export type AuthFailureReason =
  | 'AUTH_HEADER_MISSING'
  | 'SESSION_COOKIE_MISSING'
  | 'SUPABASE_NOT_CONFIGURED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_PROJECT_MISMATCH'
  | 'TOKEN_REJECTED_BY_SUPABASE'
  | 'USER_NOT_FOUND';

export interface AuthResult {
  user: AuthenticatedUser | null;
  failureReason?: AuthFailureReason;
}

function parseJwtDiagnosticClaims(token: string): { iss?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonPayload);
    return {
      iss: typeof parsed.iss === 'string' ? parsed.iss : undefined,
      exp: typeof parsed.exp === 'number' ? parsed.exp : undefined,
    };
  } catch {
    return null;
  }
}

// Helper to extract and validate user identity from Supabase Auth Bearer JWT
const getAuthenticatedUserResult = async (req: Request): Promise<AuthResult> => {
  const { url: serverUrl, key: serverKey } = getServerSupabaseConfig();
  if (!serverUrl || !serverKey) {
    return { user: null, failureReason: 'SUPABASE_NOT_CONFIGURED' };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, failureReason: 'AUTH_HEADER_MISSING' };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return { user: null, failureReason: 'AUTH_HEADER_MISSING' };
  }

  // Diagnostic JWT inspection (without trusting for actual authorization)
  const claims = parseJwtDiagnosticClaims(token);
  if (claims) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < nowSeconds) {
      return { user: null, failureReason: 'TOKEN_EXPIRED' };
    }

    if (claims.iss && serverUrl) {
      try {
        const issHost = new URL(claims.iss).hostname.toLowerCase();
        const serverHost = new URL(serverUrl).hostname.toLowerCase();
        if (issHost !== serverHost) {
          return { user: null, failureReason: 'TOKEN_PROJECT_MISMATCH' };
        }
      } catch {
        // Continue to official Supabase validation
      }
    }
  }

  try {
    const requestSupabase = createSupabaseServerUserClient(token);
    const { data, error: userError } = await requestSupabase.auth.getUser(token);
    if (userError) {
      return { user: null, failureReason: 'TOKEN_REJECTED_BY_SUPABASE' };
    }
    const user = data?.user;
    if (!user) {
      return { user: null, failureReason: 'USER_NOT_FOUND' };
    }

    let role: 'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN' = 'CUSTOMER';

    try {
      const { data: profile } = await requestSupabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, email, phone, role, marketing_consent, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.role === 'ADMIN' || profile.role === 'admin') role = 'ADMIN';
        else if (profile.role === 'INSTRUCTOR' || profile.role === 'instructor') role = 'INSTRUCTOR';
        else role = 'CUSTOMER';
      } else {
        const metaRole = user.app_metadata?.role;
        if (metaRole === 'ADMIN' || metaRole === 'admin') role = 'ADMIN';
        else if (metaRole === 'INSTRUCTOR' || metaRole === 'instructor') role = 'INSTRUCTOR';
      }
    } catch {
      // Fallback default CUSTOMER
    }

    const meta = user.user_metadata || {};
    const fullName =
      meta.full_name ||
      `${meta.first_name || ''} ${meta.last_name || ''}`.trim() ||
      'Usuario Verificado';

    return {
      user: {
        id: user.id,
        customerGid: `usr_${user.id}`,
        email: user.email || '',
        name: fullName,
        role,
        verified: !!user.email_confirmed_at,
      },
    };
  } catch (err) {
    return { user: null, failureReason: 'TOKEN_REJECTED_BY_SUPABASE' };
  }
};

const getAuthenticatedUser = async (req: Request): Promise<AuthenticatedUser | null> => {
  const result = await getAuthenticatedUserResult(req);
  return result.user;
};

async function startServer() {
  const app = express();

  // Parse raw body for Webhooks before standard JSON parser
  app.use(
    '/api/webhooks/shopify',
    express.raw({ type: 'application/json' })
  );

  // Parse raw body for Hero Avatar video upload
  app.use(
    '/api/upload-hero-video',
    express.raw({ type: '*/*', limit: '150mb' })
  );

  // JSON parser for all other routes
  app.use(express.json());

  // ============================================================================
  // UPLOAD HERO VIDEO ENDPOINT
  // ============================================================================
  app.post('/api/upload-hero-video', async (req: Request, res: Response) => {
    try {
      const fs = await import('fs');
      const videosDir = path.join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      const body = req.body;
      if (!body || (Buffer.isBuffer(body) && body.length === 0)) {
        return res.status(400).json({ error: 'No video payload received' });
      }

      const targetPath1 = path.join(videosDir, 'kling_20260912_VIDEO_ANIMATE_1197_0.mp4');
      const targetPath2 = path.join(videosDir, 'avatar-doctor-interactivo.mp4');

      fs.writeFileSync(targetPath1, body);
      fs.writeFileSync(targetPath2, body);

      console.log(`[Upload Hero Video] Successfully saved video (${body.length} bytes) to public/videos/`);
      return res.json({
        success: true,
        bytes: body.length,
        paths: [
          '/videos/kling_20260912_VIDEO_ANIMATE_1197_0.mp4',
          '/videos/avatar-doctor-interactivo.mp4',
        ],
      });
    } catch (err: any) {
      console.error('[Upload Hero Video] Error saving video:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================================================
  // HEALTH & AUTH IDENTITY ENDPOINTS
  // ============================================================================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Salud Forte Medical & Academy Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const authResult = await getAuthenticatedUserResult(req);
    if (!authResult.user) {
      return res.status(401).json({
        authenticated: false,
        user: null,
        code: authResult.failureReason || 'AUTH_HEADER_MISSING',
      });
    }
    return res.json({ authenticated: true, user: authResult.user });
  });

  // ============================================================================
  // SHOPIFY WEBHOOKS & AUTOMATED ACCREDITATION
  // ============================================================================
  app.post('/api/webhooks/shopify', async (req: Request, res: Response) => {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const topicHeader = req.headers['x-shopify-topic'] as string;
    const shopHeader = req.headers['x-shopify-shop-domain'] as string || 'salud-forte.myshopify.com';
    const webhookIdHeader = req.headers['x-shopify-webhook-id'] as string || `wh_${Date.now()}`;

    const rawBody = req.body;
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || 'dev_secret_salud_forte';

    const isValid = verifyShopifyWebhookHmac(rawBody, hmacHeader, secret);
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.warn('[Shopify Webhook] Invalid HMAC signature rejected.');
      return res.status(401).json({ error: 'Firma HMAC inválida.' });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Payload JSON inválido.' });
    }

    if (topicHeader === 'orders/paid' || topicHeader === 'orders/fulfilled') {
      const email = (payload.email || payload.customer?.email || '').toLowerCase().trim();
      const customerGid = payload.customer?.admin_graphql_api_id || `gid://shopify/Customer/${payload.customer?.id || Date.now()}`;
      const customerName = `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Cliente Salud Forte';
      const orderGid = payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`;
      const orderNumber = payload.name || `#SHOP-${payload.order_number || Date.now()}`;

      const grantedEntitlements: Entitlement[] = [];

      for (const lineItem of payload.line_items || []) {
        const variantGid = `gid://shopify/ProductVariant/${lineItem.variant_id}`;
        const productGid = `gid://shopify/Product/${lineItem.product_id}`;

        const course = academyDb.getCourseByVariantGid(variantGid);

        if (course) {
          const entitlement = academyDb.grantEntitlement({
            shop: shopHeader,
            customerGid,
            customerEmail: email,
            customerName,
            courseId: course.id,
            orderGid,
            orderNumber,
            lineItemGid: `gid://shopify/LineItem/${lineItem.id}`,
          });
          grantedEntitlements.push(entitlement);
        }
      }

      academyDb.recordWebhook({
        id: `wh_log_${Date.now()}`,
        shop: shopHeader,
        webhookId: webhookIdHeader,
        topic: topicHeader,
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        status: 'success',
        payloadSummary: `Orden ${orderNumber}: ${grantedEntitlements.length} accesos a masterclasses concedidos a ${email}.`,
      });

      return res.json({
        status: 'processed',
        grantedCount: grantedEntitlements.length,
        entitlements: grantedEntitlements,
      });
    }

    res.json({ status: 'ignored', topic: topicHeader });
  });

  // ============================================================================
  // PUBLIC ACADEMY ENDPOINTS
  // ============================================================================

  // 1. Catalog of masterclasses
  app.get('/api/academia/courses', (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const courses = academyDb.getCourses({ category });

    const publicCatalog = courses.map((course) => {
      const { modules, ...courseSummary } = course;
      return {
        ...courseSummary,
        modulesCount: modules?.length || 0,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ courses: publicCatalog });
  });

  // 2. Course public sales detail
  app.get('/api/academia/courses/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    const sanitizedModules = (course.modules || []).map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((les) => ({
        id: les.id,
        moduleId: les.moduleId,
        slug: les.slug,
        title: les.title,
        summary: les.summary,
        position: les.position,
        durationSeconds: les.durationSeconds,
        isPreview: les.isPreview,
        privateVideoUid: les.isPreview ? les.privateVideoUid : undefined,
        attachmentsCount: les.attachments?.length || 0,
      })),
    }));

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      course: {
        ...course,
        modules: sanitizedModules,
      },
    });
  });

  // ============================================================================
  // PROTECTED ACADEMY LIBRARY ("MIS MASTERCLASSES")
  // ============================================================================

  app.get('/api/academia/my-library', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        error: 'Inicia sesión para acceder a tu biblioteca personal de masterclasses.',
        code: 'UNAUTHENTICATED',
      });
    }

    const isDoctor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
    const allCourses = academyDb.getCourses();

    let entitlements = academyDb.getEntitlementsForCustomer(user.customerGid, user.email);

    if (isDoctor) {
      const activeCourseIds = new Set(entitlements.map((e) => e.courseId));
      for (const c of allCourses) {
        if (!activeCourseIds.has(c.id)) {
          entitlements.push({
            id: `admin_ent_${c.id}`,
            shop: 'salud-forte',
            customerGid: user.customerGid,
            customerEmail: user.email,
            customerName: user.name,
            courseId: c.id,
            status: 'active',
            grantedAt: new Date().toISOString(),
          } as Entitlement);
        }
      }
    }

    const libraryItems = entitlements.map((ent) => {
      const course = academyDb.getCourseById(ent.courseId);
      const progressList = academyDb.getStudentProgress(user.customerGid, ent.courseId, user.email);

      const totalLessons = course?.lessonCount || 1;
      const completedLessons = progressList.filter((p) => p.status === 'completed').length;
      const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      const lastProgress = progressList.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      return {
        entitlementId: ent.id,
        status: ent.status,
        grantedAt: ent.grantedAt,
        revocationReason: ent.revocationReason,
        course: course
          ? {
              id: course.id,
              slug: course.slug,
              title: course.title,
              subtitle: course.subtitle,
              image: course.image,
              imageFallback: course.imageFallback,
              imageAlt: course.imageAlt,
              imageWidth: course.imageWidth,
              imageHeight: course.imageHeight,
              coverImage: course.coverImage,
              categoryLabel: course.categoryLabel,
              durationMinutes: course.durationMinutes,
              lessonCount: course.lessonCount,
              instructor: course.instructor,
            }
          : null,
        progress: {
          percent: progressPercent,
          completedCount: completedLessons,
          totalCount: totalLessons,
          lastLessonId: lastProgress?.lessonId || null,
        },
      };
    });

    res.json({
      student: {
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      library: libraryItems,
    });
  });

  // ============================================================================
  // PROTECTED LESSON PLAYER & VIDEO PLAYBACK
  // ============================================================================

  app.get('/api/academia/courses/:slug/lessons/:lessonSlug', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    let targetLesson: any = null;
    let targetModule: any = null;

    for (const mod of course.modules || []) {
      for (const les of mod.lessons) {
        if (les.slug === lessonSlug || les.id === lessonSlug) {
          targetLesson = les;
          targetModule = mod;
          break;
        }
      }
      if (targetLesson) break;
    }

    // Graceful fallback to first lesson if generic alias or not found
    if (!targetLesson && course.modules && course.modules.length > 0) {
      const firstMod = course.modules[0];
      if (firstMod.lessons && firstMod.lessons.length > 0) {
        targetLesson = firstMod.lessons[0];
        targetModule = firstMod;
      }
    }

    if (!targetLesson) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (targetLesson.isPreview) {
      return res.json({
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          instructor: course.instructor,
          modules: course.modules,
        },
        module: {
          id: targetModule.id,
          title: targetModule.title,
        },
        lesson: targetLesson,
        entitlementStatus: 'preview',
      });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        error: 'Esta lección requiere acceso activo. Por favor inicia sesión con tu cuenta.',
        code: 'UNAUTHENTICATED',
      });
    }

    const isDoctor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
    let entitlement: Entitlement | null = null;

    if (!isDoctor) {
      entitlement = academyDb.getActiveEntitlement(user.customerGid, course.id, user.email) || null;
      if (!entitlement || entitlement.status !== 'active') {
        return res.status(403).json({
          error: 'No cuentas con una suscripción o compra activa para esta masterclass.',
          code: 'ENTITLEMENT_REQUIRED',
        });
      }
    }

    const progressList = academyDb.getStudentProgress(user.customerGid, course.id, user.email);
    const userProgress = progressList.find((p) => p.lessonId === targetLesson.id) || null;

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: 'salud-forte',
      customerGid: user.customerGid,
      courseId: course.id,
      lessonId: targetLesson.id,
      action: 'lesson_access',
      result: 'granted',
      createdAt: new Date().toISOString(),
    });

    res.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        instructor: course.instructor,
        modules: course.modules,
      },
      module: {
        id: targetModule.id,
        title: targetModule.title,
      },
      lesson: targetLesson,
      progress: userProgress,
      entitlementStatus: isDoctor ? 'admin_override' : entitlement?.status,
    });
  });

  // Cloudflare Stream / YouTube signed token endpoint
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/token', async (req: Request, res: Response) => {
    const { slug, lessonSlug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    let targetLesson: any = null;
    for (const mod of course.modules || []) {
      const found = mod.lessons.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson && course.modules?.[0]?.lessons?.[0]) {
      targetLesson = course.modules[0].lessons[0];
    }

    if (!targetLesson) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (!targetLesson.isPreview) {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Autenticación requerida para reproducir el contenido.' });
      }

      const isDoctor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
      if (!isDoctor) {
        const ent = academyDb.getActiveEntitlement(user.customerGid, course.id, user.email);
        if (!ent || ent.status !== 'active') {
          return res.status(403).json({ error: 'Acceso denegado. Se requiere compra activa.' });
        }
      }
    }

    if (targetLesson.videoProvider === 'YOUTUBE' && targetLesson.videoExternalId) {
      const videoId = extractYouTubeVideoId(targetLesson.videoExternalId);
      if (!videoId) {
        return res.status(400).json({ error: 'Identificador de video de YouTube no válido.' });
      }

      const embedUrl = buildYouTubeEmbedUrl(videoId, {
        origin: process.env.PUBLIC_APP_URL || 'https://saludforte.com',
      });

      return res.json({
        provider: 'YOUTUBE',
        videoId,
        embedUrl,
      });
    }

    const signingKeyPem = process.env.CLOUDFLARE_STREAM_KEY_PEM;
    const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID;

    const streamToken = generateCloudflareStreamToken(
      targetLesson.privateVideoUid,
      'guest_customer',
      { keyId, privateKey: signingKeyPem, expirationMinutes: 60 }
    );

    res.json({
      provider: 'CLOUDFLARE_STREAM',
      ...streamToken,
    });
  });

  // ============================================================================
  // TEMPORARY CLOUDFLARE STREAM TEST TOKEN ENDPOINT
  // ============================================================================
  app.post('/api/academia/stream-test-token', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');

    // 1. Require Authorization: Bearer <Supabase access token> & validate user
    const authResult = await getAuthenticatedUserResult(req);
    if (!authResult.user) {
      return res.status(401).json({
        error: 'Autenticación requerida. Token no proporcionado o no válido.',
        code: authResult.failureReason || 'AUTH_HEADER_MISSING',
      });
    }
    const user = authResult.user;

    // 2. Read environment variables exclusively from process.env (server side)
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const videoId = process.env.CLOUDFLARE_STREAM_TEST_VIDEO_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const customerSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;

    if (!accountId || !videoId || !apiToken || !customerSubdomain) {
      return res.status(500).json({
        error: 'La configuración de Cloudflare Stream no se encuentra completa en el servidor.',
      });
    }

    try {
      // 3. Request signed token from Cloudflare Stream API
      const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/token`;
      const cfRes = await fetch(cfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!cfRes.ok) {
        return res.status(502).json({
          error: 'No fue posible obtener la autorización del servicio de streaming.',
        });
      }

      const cfData = await cfRes.json();
      if (!cfData.success || !cfData.result) {
        return res.status(502).json({
          error: 'El servicio de streaming no devolvió una respuesta válida.',
        });
      }

      const signedToken = typeof cfData.result === 'string' ? cfData.result : cfData.result.token;
      const expiresIn =
        (typeof cfData.result === 'object' && cfData.result?.expiresIn) || 3600;

      if (!signedToken) {
        return res.status(502).json({
          error: 'No se recibió el token de reproducción firmado.',
        });
      }

      // 4. Construct playback URL using customer subdomain
      const cleanSubdomain = customerSubdomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!/^customer-[a-zA-Z0-9_-]+\.cloudflarestream\.com$/.test(cleanSubdomain)) {
        return res.status(500).json({
          error: 'La configuración de streaming del servidor no tiene un formato válido.',
        });
      }

      const playbackUrl = `https://${cleanSubdomain}/${signedToken}/iframe`;

      // 5. Return only playbackUrl and expiresIn
      return res.json({
        playbackUrl,
        expiresIn,
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Error interno al comunicarse con el servidor de streaming.',
      });
    }
  });

  // Track lesson progress
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/progress', async (req: Request, res: Response) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    const { slug, lessonSlug } = req.params;
    const { status, positionSeconds } = req.body;

    const course = academyDb.getCourseBySlug(slug);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    let lessonId: string | null = null;
    for (const mod of course.modules || []) {
      const les = mod.lessons.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
      if (les) {
        lessonId = les.id;
        break;
      }
    }

    if (!lessonId) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    const updatedProgress = academyDb.saveLessonProgress(
      user.customerGid,
      course.id,
      lessonId,
      status || 'in_progress',
      Math.max(0, parseInt(positionSeconds, 10) || 0),
      user.email
    );

    res.json({ success: true, progress: updatedProgress });
  });

  // Download lesson attachment
  app.get('/api/academia/courses/:slug/lessons/:lessonSlug/attachment/:attachmentId', async (req: Request, res: Response) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Autenticación requerida para descargar adjuntos.' });
    }

    const { slug, lessonSlug, attachmentId } = req.params;
    const course = academyDb.getCourseBySlug(slug);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    const isDoctor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
    if (!isDoctor) {
      const ent = academyDb.getActiveEntitlement(user.customerGid, course.id, user.email);
      if (!ent || ent.status !== 'active') {
        return res.status(403).json({ error: 'Acceso no autorizado a este material descargable.' });
      }
    }

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: 'salud-forte',
      customerGid: user.customerGid,
      courseId: course.id,
      lessonId: lessonSlug,
      action: 'attachment_download',
      result: 'granted',
      reason: `Descarga de adjunto ID: ${attachmentId}`,
      createdAt: new Date().toISOString(),
    });

    res.json({
      downloadUrl: `/api/academia/download-mock/${attachmentId}`,
      filename: `Guia_Clinica_Salud_Forte_${attachmentId}.pdf`,
    });
  });

  // ============================================================================
  // DR. MAURICIO GALINDO - EXCLUSIVE ACADEMY & INSTRUCTOR CRUD API
  // ============================================================================

  const requireAdmin = async (req: Request, res: Response): Promise<boolean> => {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      res.status(403).json({ error: 'Acceso reservado exclusivamente para el Dr. Mauricio Galindo (Administrador).' });
      return false;
    }
    return true;
  };

  // 1. Get all courses with full details (Admin)
  app.get('/api/admin/courses', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const courses = academyDb.getCourses();
    return res.json({ courses });
  });

  // 2. Create new course
  app.post('/api/admin/courses', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const newCourse = academyDb.createCourse(req.body);
    return res.json({ success: true, course: newCourse });
  });

  // 3. Update course
  app.put('/api/admin/courses/:id', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const updated = academyDb.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Masterclass no encontrada' });
    return res.json({ success: true, course: updated });
  });

  // 4. Delete course
  app.delete('/api/admin/courses/:id', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const deleted = academyDb.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Masterclass no encontrada' });
    return res.json({ success: true });
  });

  // 5. Add module
  app.post('/api/admin/courses/:id/modules', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const newModule = academyDb.addModule(req.params.id, req.body);
    if (!newModule) return res.status(404).json({ error: 'Masterclass no encontrada' });
    return res.json({ success: true, module: newModule });
  });

  // 6. Update module
  app.put('/api/admin/courses/:id/modules/:moduleId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const updated = academyDb.updateModule(req.params.id, req.params.moduleId, req.body);
    if (!updated) return res.status(404).json({ error: 'Módulo no encontrado' });
    return res.json({ success: true, module: updated });
  });

  // 7. Delete module
  app.delete('/api/admin/courses/:id/modules/:moduleId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const deleted = academyDb.deleteModule(req.params.id, req.params.moduleId);
    if (!deleted) return res.status(404).json({ error: 'Módulo no encontrado' });
    return res.json({ success: true });
  });

  // 8. Add lesson
  app.post('/api/admin/courses/:id/modules/:moduleId/lessons', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const newLesson = academyDb.addLesson(req.params.id, req.params.moduleId, req.body);
    if (!newLesson) return res.status(404).json({ error: 'Módulo o masterclass no encontrada' });
    return res.json({ success: true, lesson: newLesson });
  });

  // 9. Update lesson
  app.put('/api/admin/courses/:id/modules/:moduleId/lessons/:lessonId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const updated = academyDb.updateLesson(req.params.id, req.params.moduleId, req.params.lessonId, req.body);
    if (!updated) return res.status(404).json({ error: 'Lección no encontrada' });
    return res.json({ success: true, lesson: updated });
  });

  // 10. Delete lesson
  app.delete('/api/admin/courses/:id/modules/:moduleId/lessons/:lessonId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const deleted = academyDb.deleteLesson(req.params.id, req.params.moduleId, req.params.lessonId);
    if (!deleted) return res.status(404).json({ error: 'Lección no encontrada' });
    return res.json({ success: true });
  });

  // 11. Parse YouTube Video URL or ID
  app.post('/api/admin/youtube/parse', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL o ID de YouTube requerido' });

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'No se pudo extraer un ID válido de YouTube. Ingresa un enlace tipo https://youtu.be/...' });
    }

    const embedUrl = buildYouTubeEmbedUrl(videoId);
    return res.json({
      success: true,
      videoId,
      embedUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  });

  // 12. Student directory from Supabase profiles
  app.get('/api/admin/students', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const marketingOnly = req.query.marketing_only === 'true';

    try {
      if (!isSupabaseConfigured) {
        return res.status(503).json({ error: 'Supabase no está configurado.' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Encabezado Authorization requerido.' });
      }

      const token = authHeader.substring(7).trim();
      if (!token) {
        return res.status(401).json({ error: 'Token de acceso no válido.' });
      }

      const requestSupabase = createSupabaseServerUserClient(token);
      let query = requestSupabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, email, phone, role, created_at, updated_at');

      if (marketingOnly) {
        query = query.eq('marketing_consent', true);
      }

      const { data: dbProfiles, error } = await query;
      if (error) {
        return res.status(403).json({ error: 'Acceso denegado por políticas de seguridad (RLS).' });
      }

      const entitlements = academyDb.getAllEntitlements();
      const courses = academyDb.getCourses();

      const students = (dbProfiles || []).map((u: any) => {
        const userEntitlements = entitlements.filter(
          (e) => e.customerEmail.toLowerCase() === u.email?.toLowerCase() || e.customerGid === `usr_${u.id}`
        );

        const enrolledCourses = userEntitlements.map((e) => {
          const c = courses.find((crs) => crs.id === e.courseId);
          return {
            entitlementId: e.id,
            courseId: e.courseId,
            courseTitle: c ? c.title : e.courseId,
            status: e.status,
            grantedAt: e.grantedAt,
          };
        });

        return {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          first_name: u.first_name,
          last_name: u.last_name,
          phone: u.phone,
          role: u.role || 'CUSTOMER',
          created_at: u.created_at,
          updated_at: u.updated_at,
          enrolledCourses,
          enrolledCoursesCount: enrolledCourses.filter((c) => c.status === 'active').length,
        };
      });

      return res.json({
        students,
        totalCount: students.length,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error al obtener alumnos.' });
    }
  });

  // 13. Grant masterclass to student manually
  app.post('/api/admin/students/grant-course', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { customerEmail, customerName, courseId } = req.body;

    if (!customerEmail || !courseId) {
      return res.status(400).json({ error: 'customerEmail y courseId son requeridos.' });
    }

    const normalizedEmail = customerEmail.toLowerCase().trim();
    const course = academyDb.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada.' });
    }

    const entitlement = academyDb.grantEntitlement({
      shop: 'salud-forte',
      customerGid: `usr_manual_${Date.now()}`,
      customerEmail: normalizedEmail,
      customerName: customerName || 'Alumno Autorizado',
      courseId: course.id,
      orderGid: `admin_manual_${Date.now()}`,
      orderNumber: '#DOCTOR-MANUAL',
      lineItemGid: `admin_line_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: `Acceso a "${course.title}" otorgado exitosamente a ${normalizedEmail}.`,
      entitlement,
    });
  });

  // 14. Revoke masterclass access
  app.post('/api/admin/students/revoke-course', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { entitlementId, reason } = req.body;

    if (!entitlementId) {
      return res.status(400).json({ error: 'entitlementId es requerido' });
    }

    const updated = academyDb.updateEntitlementStatus(entitlementId, 'revoked', reason || 'Revocado por el Dr. Mauricio Galindo');
    if (!updated) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }

    return res.json({
      success: true,
      message: 'Licencia revocada correctamente.',
      entitlement: updated,
    });
  });

  // 15. Comprehensive Academy & Student Metrics
  app.get('/api/admin/metrics', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const courses = academyDb.getCourses();
    const entitlements = academyDb.getAllEntitlements();
    const audits = academyDb.getAccessAudits();

    let totalLessons = 0;
    for (const c of courses) {
      for (const m of c.modules || []) {
        totalLessons += m.lessons?.length || 0;
      }
    }

    const metrics = {
      coursesCount: courses.length,
      publishedCoursesCount: courses.filter((c) => c.status === 'published').length,
      totalLessons,
      activeEntitlementsCount: entitlements.filter((e) => e.status === 'active').length,
      recentAuditsCount: audits.length,
    };

    return res.json({ metrics });
  });

  // Static images serving
  app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

  // Vite middleware for development vs static production fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Salud Forte Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
