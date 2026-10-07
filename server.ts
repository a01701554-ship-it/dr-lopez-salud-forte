import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  createSupabaseServerUserClient,
  createSupabaseServerAdminClient,
  getServerSupabaseConfig,
  isSupabaseConfigured,
} from './lib/supabase';
import { academyDb } from './lib/academy/db';
import {
  verifyShopifyWebhookHmac,
  verifyShopifyAppProxySignature,
} from './lib/academy/security';
import { Course, Entitlement, ProcessedWebhook, UserProfile, VideoTestimonial } from './lib/academy/types';
import {
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
} from './lib/academy/auth-service';

const PORT = 3000;
const adminSupabase = createSupabaseServerAdminClient();
const AUTHORIZED_ADMIN_EMAILS = new Set(
  (process.env.ACADEMY_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

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

type LessonAccessFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

type LessonAccessSuccess = {
  ok: true;
  user: AuthenticatedUser;
  requestSupabase: ReturnType<typeof createSupabaseServerUserClient>;
  course: any;
  modules: any[];
  lessons: any[];
  lesson: any;
  module: any | null;
  entitlementStatus: 'active' | 'free_access' | 'preview' | 'admin_override';
};

type LessonAccessResult = LessonAccessFailure | LessonAccessSuccess;

function getBearerToken(req: Request): string {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

function entitlementIsCurrent(entitlement: any): boolean {
  if (!entitlement || entitlement.status !== 'active' || entitlement.revoked_at) {
    return false;
  }

  if (!entitlement.expires_at) return true;
  const expiresAt = new Date(entitlement.expires_at).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1) return 'Tamaño no disponible';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapAttachmentForBrowser(attachment: any) {
  const mimeType = attachment.mime_type || 'application/octet-stream';
  const format = mimeType === 'application/pdf'
    ? 'PDF'
    : (attachment.storage_path?.split('.').pop() || 'Archivo').toUpperCase();

  return {
    id: attachment.id,
    title: attachment.title,
    mimeType,
    format,
    fileSizeLabel: formatFileSize(attachment.file_size_bytes),
    position: attachment.position || 0,
  };
}

function mapLessonForBrowser(lesson: any, attachments: any[] = []) {
  return {
    id: lesson.id,
    moduleId: lesson.module_id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary || lesson.description || '',
    description: lesson.description || '',
    position: lesson.position || 0,
    durationSeconds: lesson.duration_seconds || 0,
    isPreview: Boolean(lesson.is_preview),
    transcript: lesson.transcript || '',
    status: lesson.status,
    attachments: attachments.map(mapAttachmentForBrowser),
  };
}

async function loadAuthorizedSupabaseLesson(
  req: Request,
  slug: string,
  lessonSlug: string,
): Promise<LessonAccessResult> {
  const authResult = await getAuthenticatedUserResult(req);
  if (!authResult.user) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHENTICATED',
      error: 'Esta lección requiere una sesión válida. Inicia sesión e inténtalo nuevamente.',
    };
  }

  const token = getBearerToken(req);
  const requestSupabase = createSupabaseServerUserClient(token);

  const { data: course, error: courseError } = await requestSupabase
    .from('masterclasses')
    .select('id, slug, title, subtitle, short_description, lesson_count, status, access_type')
    .eq('slug', slug)
    .maybeSingle();

  if (courseError) {
    return {
      ok: false,
      status: 503,
      code: 'ACADEMY_DATABASE_ERROR',
      error: 'No fue posible consultar la masterclass en este momento.',
    };
  }

  if (!course) {
    return {
      ok: false,
      status: 404,
      code: 'COURSE_NOT_FOUND',
      error: 'Masterclass no encontrada.',
    };
  }

  const isStaff = authResult.user.role === 'ADMIN' || authResult.user.role === 'INSTRUCTOR';
  const isFreeCourse = course.access_type === 'free';
  let entitlementStatus: LessonAccessSuccess['entitlementStatus'] = 'admin_override';

  if (!isStaff && isFreeCourse) {
    entitlementStatus = 'free_access';
  } else if (!isStaff) {
    const { data: entitlement, error: entitlementError } = await requestSupabase
      .from('entitlements')
      .select('id, status, expires_at, revoked_at')
      .eq('user_id', authResult.user.id)
      .eq('masterclass_id', course.id)
      .maybeSingle();

    if (entitlement && entitlementIsCurrent(entitlement)) {
      entitlementStatus = 'active';
    } else {
      // Fallback a adminSupabase en caso de políticas restrictivas de RLS
      if (adminSupabase) {
        try {
          const { data: adminEnt } = await adminSupabase
            .from('entitlements')
            .select('id, status, expires_at, revoked_at')
            .eq('user_id', authResult.user.id)
            .eq('masterclass_id', course.id)
            .maybeSingle();
          if (adminEnt && entitlementIsCurrent(adminEnt)) {
            entitlementStatus = 'active';
          }
        } catch {
          // Ignorar
        }
      }

      // Fallback a academyDb en memoria
      if (entitlementStatus !== 'active') {
        const memHasAccess = Boolean(
          academyDb.getActiveEntitlement(
            authResult.user.customerGid,
            course.id,
            authResult.user.email
          )
        );
        if (memHasAccess) {
          entitlementStatus = 'active';
        }
      }

      if (entitlementStatus !== 'active') {
        entitlementStatus = 'preview';
      }
    }
  }

  const { data: lessons, error: lessonsError } = await requestSupabase
    .from('lessons')
    .select('id, masterclass_id, module_id, slug, title, summary, description, position, duration_seconds, video_provider, video_asset_id, video_external_id, is_preview, transcript, status')
    .eq('masterclass_id', course.id)
    .eq('status', 'published')
    .order('position', { ascending: true });

  if (lessonsError) {
    return {
      ok: false,
      status: 503,
      code: 'LESSON_QUERY_FAILED',
      error: 'No fue posible consultar las lecciones de esta masterclass.',
    };
  }

  const targetLesson = (lessons || []).find(
    (item: any) => item.slug === lessonSlug || item.id === lessonSlug,
  );

  if (!targetLesson) {
    if (!isStaff && entitlementStatus !== 'active' && entitlementStatus !== 'free_access') {
      return {
        ok: false,
        status: 403,
        code: 'ENTITLEMENT_REQUIRED',
        error: 'No cuentas con una compra o inscripción activa para esta masterclass.',
      };
    }

    return {
      ok: false,
      status: 404,
      code: 'LESSON_NOT_FOUND',
      error: 'Lección no encontrada.',
    };
  }

  if (
    !isStaff
    && entitlementStatus !== 'active'
    && entitlementStatus !== 'free_access'
    && !targetLesson.is_preview
  ) {
    return {
      ok: false,
      status: 403,
      code: 'ENTITLEMENT_REQUIRED',
      error: 'No cuentas con una compra o inscripción activa para esta masterclass.',
    };
  }

  if (
    targetLesson.is_preview
    && entitlementStatus !== 'active'
    && entitlementStatus !== 'free_access'
    && !isStaff
  ) {
    entitlementStatus = 'preview';
  }

  const { data: modules, error: modulesError } = await requestSupabase
    .from('modules')
    .select('id, masterclass_id, title, description, position, status')
    .eq('masterclass_id', course.id)
    .eq('status', 'published')
    .order('position', { ascending: true });

  if (modulesError) {
    return {
      ok: false,
      status: 503,
      code: 'MODULE_QUERY_FAILED',
      error: 'No fue posible consultar el temario de esta masterclass.',
    };
  }

  return {
    ok: true,
    user: authResult.user,
    requestSupabase,
    course,
    modules: modules || [],
    lessons: lessons || [],
    lesson: targetLesson,
    module: (modules || []).find((item: any) => item.id === targetLesson.module_id) || null,
    entitlementStatus,
  };
}

async function createCloudflareSignedPlaybackUrl(videoId: string) {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const apiToken = (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim();
  const customerSubdomain = (process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN || '').trim();

  if (!accountId || !apiToken || !customerSubdomain) {
    throw new Error('CLOUDFLARE_CREDENTIALS_MISSING');
  }

  if (!videoId || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new Error('INVALID_VIDEO_ID');
  }

  const cleanSubdomain = customerSubdomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (
    !cleanSubdomain ||
    cleanSubdomain.includes('xxxxxxxx') ||
    !/^customer-[a-zA-Z0-9_-]+\.cloudflarestream\.com$/.test(cleanSubdomain)
  ) {
    throw new Error('INVALID_CUSTOMER_SUBDOMAIN');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/stream/${encodeURIComponent(videoId)}/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`CLOUDFLARE_API_ERROR_${response.status}`);
  }

  const payload: any = await response.json();
  const signedToken =
    typeof payload?.result === 'string' ? payload.result : payload?.result?.token;

  if (!payload?.success || !signedToken) {
    throw new Error('CLOUDFLARE_INVALID_RESPONSE');
  }

  const expiresIn =
    typeof payload?.result === 'object' && Number.isFinite(payload.result?.expiresIn)
      ? Number(payload.result.expiresIn)
      : 3600;

  return {
    playbackUrl: `https://${cleanSubdomain}/${signedToken}/iframe`,
    expiresIn,
  };
}

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

  // Parse raw body for Lesson Attachments upload & replace (PDFs up to 35MB)
  app.use(
    [
      '/api/admin/academy/lessons/:lessonId/attachments/upload',
      '/api/admin/academy/lessons/:lessonId/attachments/:attachmentId/replace',
    ],
    express.raw({ type: ['application/pdf', 'application/octet-stream', '*/*'], limit: '35mb' })
  );

  // JSON parser for all other routes
  app.use(express.json({ limit: '35mb' }));

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
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Commerce Webhook] SHOPIFY_WEBHOOK_SECRET is not configured.');
      return res.status(503).json({ error: 'Webhook no configurado.' });
    }

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
      const totalAmount = parseFloat(payload.total_price || '0');

      const grantedEntitlements: Entitlement[] = [];

      // 1. Check if user exists in Supabase profiles by email
      let userId: string | null = null;
      if (adminSupabase && email) {
        try {
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id, email')
            .ilike('email', email)
            .maybeSingle();

          if (profile) {
            userId = profile.id;
          }

          // Record or update order in public.orders
          await adminSupabase.from('orders').upsert(
            {
              provider_order_id: orderNumber,
              user_id: userId,
              payment_status: 'paid',
              fulfillment_status: payload.fulfillment_status || 'fulfilled',
              total: totalAmount,
              currency: payload.currency || 'MXN',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_order_id' }
          );
        } catch (orderDbErr) {
          console.warn('[Shopify Webhook] Note on orders table upsert:', orderDbErr);
        }
      }

      for (const lineItem of payload.line_items || []) {
        const variantGid = `gid://shopify/ProductVariant/${lineItem.variant_id}`;
        const productGid = `gid://shopify/Product/${lineItem.product_id}`;

        const course = academyDb.getCourseByVariantGid(variantGid);

        if (course) {
          // Grant in academyDb
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

          // If user exists in Supabase, also write to public.entitlements
          if (adminSupabase && userId) {
            try {
              // Find matching masterclass in Supabase by slug or id
              let mcId: string | null = null;
              const { data: mc } = await adminSupabase
                .from('masterclasses')
                .select('id')
                .or(`slug.eq.${course.slug},id.eq.${course.id}`)
                .maybeSingle();

              if (mc) {
                mcId = mc.id;
              }

              if (mcId) {
                await adminSupabase.from('entitlements').upsert(
                  {
                    user_id: userId,
                    masterclass_id: mcId,
                    source: 'purchase',
                    order_id: orderNumber,
                    status: 'active',
                    granted_at: new Date().toISOString(),
                    revoked_at: null,
                    expires_at: null,
                  },
                  { onConflict: 'user_id, masterclass_id' }
                );
              }
            } catch (entDbErr) {
              console.warn('[Shopify Webhook] Note on Supabase entitlement upsert:', entDbErr);
            }
          }
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
    const courses = academyDb
      .getCourses({ category })
      .filter((c) => c.slug !== 'prueba-cloudflare-stream' && !c.title.toLowerCase().includes('prueba de cloudflare'));

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
    if (slug === 'prueba-cloudflare-stream') {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    const course = academyDb.getCourseBySlug(slug);

    if (!course || course.title.toLowerCase().includes('prueba de cloudflare')) {
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
  // SECURE ENROLLMENT ENDPOINT FOR FREE MASTERCLASSES
  // ============================================================================

  app.post('/api/academia/courses/:slug/enroll', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, private');

    const authResult = await getAuthenticatedUserResult(req);
    if (!authResult.user) {
      return res.status(401).json({
        ok: false,
        error: 'Inicia sesión para inscribirte en esta masterclass.',
        code: 'UNAUTHENTICATED',
      });
    }

    const { slug } = req.params;
    if (slug === 'prueba-cloudflare-stream') {
      return res.status(404).json({
        ok: false,
        error: 'Masterclass no encontrada.',
        code: 'NOT_FOUND',
      });
    }

    const token = getBearerToken(req);
    const requestSupabase = createSupabaseServerUserClient(token);
    const adminSupabase = createSupabaseServerAdminClient();

    // 1. Fetch course details from Supabase (or fallback to academyDb)
    let courseId: string | null = null;
    let courseTitle: string = '';
    let accessType: string = 'paid';
    let firstLessonSlug: string = 'bienvenida-introduccion';

    const dbLookup = adminSupabase || requestSupabase;
    const { data: dbCourse } = await dbLookup
      .from('masterclasses')
      .select('id, slug, title, access_type, status')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (dbCourse && !dbCourse.title?.toLowerCase().includes('prueba de cloudflare')) {
      courseId = dbCourse.id;
      courseTitle = dbCourse.title;
      accessType = dbCourse.access_type || 'paid';
    } else {
      const localCourse = academyDb.getCourseBySlug(slug) || academyDb.getCourseById(slug);
      if (localCourse && !localCourse.title?.toLowerCase().includes('prueba de cloudflare')) {
        courseTitle = localCourse.title;
        accessType = localCourse.accessType || 'paid';

        // Auto-provision masterclass in Supabase if missing
        if (adminSupabase) {
          try {
            const { data: insertedMc } = await adminSupabase
              .from('masterclasses')
              .upsert(
                {
                  slug: localCourse.slug,
                  title: localCourse.title,
                  subtitle: localCourse.subtitle,
                  short_description: localCourse.shortDescription,
                  full_description: localCourse.description,
                  category: localCourse.category || 'bienestar',
                  access_type: localCourse.accessType || 'free',
                  status: 'published',
                },
                { onConflict: 'slug' }
              )
              .select('id, slug, title, access_type')
              .single();

            if (insertedMc) {
              courseId = insertedMc.id;
            }
          } catch (insertErr) {
            console.warn('[Enrollment] Note on auto-provisioning masterclass row:', insertErr);
          }
        }
        if (!courseId) {
          courseId = localCourse.id;
        }
      }
    }

    if (!courseId) {
      return res.status(404).json({
        ok: false,
        error: 'Masterclass no encontrada.',
        code: 'NOT_FOUND',
      });
    }

    // 2. Validate course is free (or user is staff)
    const isFree = accessType === 'free';
    const isStaff = authResult.user.role === 'ADMIN' || authResult.user.role === 'INSTRUCTOR';
    if (!isFree && !isStaff) {
      return res.status(403).json({
        ok: false,
        error: 'Esta masterclass requiere inscripción de pago o compra previa.',
        code: 'PAYMENT_REQUIRED',
      });
    }

    // 3. Find first lesson for immediate continuation
    try {
      const { data: lessons } = await requestSupabase
        .from('lessons')
        .select('slug, position')
        .eq('masterclass_id', courseId)
        .order('position', { ascending: true })
        .limit(1);

      if (lessons && lessons.length > 0 && lessons[0].slug) {
        firstLessonSlug = lessons[0].slug;
      } else {
        const localCourse = academyDb.getCourseBySlug(slug);
        const localLesson = localCourse?.modules?.[0]?.lessons?.[0];
        if (localLesson?.slug) {
          firstLessonSlug = localLesson.slug;
        }
      }
    } catch {
      // Keep default
    }

    // 4. Check for existing active entitlement (idempotency)
    const dbClient = adminSupabase || requestSupabase;
    let existingEntitlement: any = null;

    try {
      const { data: existing } = await dbClient
        .from('entitlements')
        .select('id, user_id, masterclass_id, status, source, granted_at')
        .eq('user_id', authResult.user.id)
        .eq('masterclass_id', courseId)
        .maybeSingle();

      existingEntitlement = existing;
    } catch (checkErr) {
      console.warn('[Enrollment] Note on existing entitlement lookup:', checkErr);
    }

    if (existingEntitlement && existingEntitlement.status === 'active') {
      const localCourseForEnroll = academyDb.getCourseBySlug(slug);
      const memoryCourseId = localCourseForEnroll ? localCourseForEnroll.id : courseId;

      academyDb.grantEntitlement({
        shop: 'salud-forte',
        customerGid: authResult.user.customerGid,
        customerEmail: authResult.user.email,
        customerName: authResult.user.name,
        courseId: memoryCourseId,
        status: 'active',
        source: existingEntitlement.source || 'free_enrollment',
      });

      return res.status(200).json({
        ok: true,
        enrolled: true,
        alreadyEnrolled: true,
        message: 'Ya estás inscrito en esta masterclass.',
        course: {
          id: courseId,
          slug,
          title: courseTitle,
        },
        firstLessonUrl: `/academia/${slug}/leccion/${firstLessonSlug}`,
      });
    }

    // 5. Insert or update entitlement in Supabase
    let entitlementRecord: any = null;
    try {
      if (existingEntitlement) {
        const { data: updated, error: updateErr } = await dbClient
          .from('entitlements')
          .update({
            status: 'active',
            source: 'free_enrollment',
            granted_at: new Date().toISOString(),
            revoked_at: null,
            expires_at: null,
          })
          .eq('id', existingEntitlement.id)
          .select()
          .single();

        if (!updateErr && updated) {
          entitlementRecord = updated;
        }
      } else {
        const { data: inserted, error: insertErr } = await dbClient
          .from('entitlements')
          .insert({
            user_id: authResult.user.id,
            masterclass_id: courseId,
            status: 'active',
            source: 'free_enrollment',
            granted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!insertErr && inserted) {
          entitlementRecord = inserted;
        }
      }
    } catch (dbErr: any) {
      console.warn('[Enrollment] Supabase direct entitlement operation note:', dbErr?.message || dbErr);
    }

    // 6. Ensure enrollment in memory db as well
    const localCourseForEnroll = academyDb.getCourseBySlug(slug);
    const memoryCourseId = localCourseForEnroll ? localCourseForEnroll.id : courseId;

    academyDb.grantEntitlement({
      shop: 'salud-forte',
      customerGid: authResult.user.customerGid,
      customerEmail: authResult.user.email,
      customerName: authResult.user.name,
      courseId: memoryCourseId,
      status: 'active',
      source: 'free_enrollment',
    });

    return res.status(200).json({
      ok: true,
      enrolled: true,
      alreadyEnrolled: false,
      message: 'Te has inscrito exitosamente a la masterclass.',
      course: {
        id: courseId,
        slug,
        title: courseTitle,
      },
      entitlement: entitlementRecord,
      firstLessonUrl: `/academia/${slug}/leccion/${firstLessonSlug}`,
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
    const allCourses = academyDb
      .getCourses()
      .filter((c) => c.slug !== 'prueba-cloudflare-stream' && !c.title.toLowerCase().includes('prueba de cloudflare'));

    // Sincronizar entitlements persistidos en Supabase hacia la sesión activa
    const token = getBearerToken(req);
    const dbClient = adminSupabase || (token ? createSupabaseServerUserClient(token) : null);
    if (dbClient) {
      try {
        const { data: supaEntitlements } = await dbClient
          .from('entitlements')
          .select('id, user_id, masterclass_id, status, source, granted_at, expires_at, revoked_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .is('revoked_at', null);

        if (supaEntitlements && Array.isArray(supaEntitlements)) {
          // Extraer UUIDs únicos
          const masterclassIds = Array.from(new Set(supaEntitlements.map(se => se.masterclass_id)));
          
          // Buscar los slugs correspondientes en la DB
          const { data: masterclasses } = await dbClient
            .from('masterclasses')
            .select('id, slug')
            .in('id', masterclassIds);
            
          const idToSlugMap = new Map<string, string>();
          if (masterclasses) {
            for (const mc of masterclasses) {
              idToSlugMap.set(mc.id, mc.slug);
            }
          }

          for (const se of supaEntitlements) {
            const slug = idToSlugMap.get(se.masterclass_id) || se.masterclass_id;
            let matchedCourse = academyDb.getCourseById(se.masterclass_id);
            if (!matchedCourse) {
              matchedCourse = academyDb.getCourses().find(
                (c) => c.id === se.masterclass_id || c.slug === se.masterclass_id || c.slug === slug
              );
            }
            if (matchedCourse) {
              academyDb.grantEntitlement({
                shop: 'salud-forte',
                customerGid: user.customerGid,
                customerEmail: user.email,
                customerName: user.name,
                courseId: matchedCourse.id,
                status: 'active',
                source: se.source || 'supabase_sync',
              });
            }
          }
        }
      } catch (syncErr) {
        console.warn('[MyLibrary] Supabase entitlements sync note:', syncErr);
      }
    }

    let entitlements = academyDb
      .getEntitlementsForCustomer(user.customerGid, user.email)
      .filter((e) => {
        const c = academyDb.getCourseById(e.courseId);
        return c && c.slug !== 'prueba-cloudflare-stream' && !c.title.toLowerCase().includes('prueba de cloudflare');
      });

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

    // Traer progreso de Supabase para reflejar con precisión el avance en el dashboard
    const supaProgressByLesson: Record<string, { completed: boolean; position_seconds: number; progress_percent: number; last_watched_at: string }> = {};
    if (dbClient) {
      try {
        const { data: supaProg } = await dbClient
          .from('lesson_progress')
          .select('lesson_id, masterclass_id, position_seconds, progress_percent, completed, last_watched_at')
          .eq('user_id', user.id);

        const { data: supaLessons } = await dbClient
          .from('lessons')
          .select('id, slug, masterclass_id');

        const lessonIdToSlugMap = new Map<string, string>();
        if (supaLessons && Array.isArray(supaLessons)) {
          for (const sl of supaLessons) {
            lessonIdToSlugMap.set(sl.id, sl.slug);
          }
        }

        if (supaProg && Array.isArray(supaProg)) {
          for (const sp of supaProg) {
            supaProgressByLesson[sp.lesson_id] = sp;
            const slug = lessonIdToSlugMap.get(sp.lesson_id);
            if (slug) {
              supaProgressByLesson[slug] = sp;
            }
          }
        }
      } catch (progErr) {
        console.warn('[MyLibrary] Supabase progress query note:', progErr);
      }
    }

    const libraryItems = entitlements.map((ent) => {
      const course = academyDb.getCourseById(ent.courseId) || academyDb.getCourseBySlug(ent.courseId);
      const memProgressList = academyDb.getStudentProgress(user.customerGid, ent.courseId, user.email);

      // Calcular lecciones completadas considerando tanto Supabase como academyDb
      let completedLessons = 0;
      let lastProgressLessonId: string | null = null;
      let lastProgressTime = 0;

      if (course && course.modules) {
        for (const m of course.modules) {
          for (const l of m.lessons) {
            const sp = supaProgressByLesson[l.id] || supaProgressByLesson[l.slug];
            const mp = memProgressList.find((p) => p.lessonId === l.id || p.lessonId === l.slug);
            const isCompleted = sp?.completed || sp?.progress_percent === 100 || mp?.status === 'completed';
            if (isCompleted) {
              completedLessons++;
            }
            const time = sp?.last_watched_at ? new Date(sp.last_watched_at).getTime() : mp?.updatedAt ? new Date(mp.updatedAt).getTime() : 0;
            if (time > lastProgressTime) {
              lastProgressTime = time;
              lastProgressLessonId = l.id;
            }
          }
        }
      } else {
        completedLessons = memProgressList.filter((p) => p.status === 'completed').length;
      }

      const totalLessons = course?.lessonCount || 1;
      const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

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
          lastLessonId: lastProgressLessonId || null,
        },
      };
    }).filter((item) => item.course !== null);

    res.json({
      student: {
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      library: libraryItems,
      courses: libraryItems, // Soporte dual para library y courses
    });
  });

  // ============================================================================
  // PROTECTED LESSON PLAYER & VIDEO PLAYBACK
  // ============================================================================

  async function resolveLessonPlaybackPayload(lessonRow: any, courseSlug: string, targetLessonSlug: string) {
    const provider = String(
      lessonRow?.video_provider ??
      lessonRow?.videoProvider ??
      ''
    ).trim().toLowerCase();

    const videoAssetId = String(
      lessonRow?.video_asset_id ??
      lessonRow?.videoAssetId ??
      ''
    ).trim();

    const videoExternalId = String(
      lessonRow?.video_external_id ??
      lessonRow?.videoExternalId ??
      ''
    ).trim();

    const directUrl = String(
      lessonRow?.video_url ??
      lessonRow?.videoUrl ??
      ''
    ).trim();

    if (directUrl || (videoAssetId && (videoAssetId.startsWith('http://') || videoAssetId.startsWith('https://') || videoAssetId.endsWith('.mp4')))) {
      return {
        type: 'video',
        videoUrl: directUrl || videoAssetId,
      };
    }

    if (provider === 'youtube' && videoExternalId) {
      const videoId = extractYouTubeVideoId(videoExternalId);
      if (!videoId) {
        return {
          error: 'El video de esta lección no está configurado correctamente.',
          code: 'VIDEO_NOT_CONFIGURED',
        };
      }

      const embedUrl = buildYouTubeEmbedUrl(videoId, {
        origin: process.env.PUBLIC_APP_URL || 'https://saludforte.com',
      });

      return {
        type: 'youtube',
        videoId,
        embedUrl,
      };
    }

    if (
      (provider === 'cloudflare' || provider === 'cloudflare_stream') &&
      videoAssetId
    ) {
      try {
        const signedPlayback =
          await createCloudflareSignedPlaybackUrl(videoAssetId);

        return {
          type: 'cloudflare',
          playbackUrl: signedPlayback.playbackUrl,
          expiresIn: signedPlayback.expiresIn,
        };
      } catch (error) {
        console.error('stream_authorization_failed', {
          courseSlug,
          lessonSlug: targetLessonSlug,
          reason:
            error instanceof Error ? error.message : 'UNKNOWN_ERROR',
        });

        return {
          error: 'No fue posible autorizar la reproducción segura.',
          code: 'STREAM_AUTHORIZATION_FAILED',
        };
      }
    }

    return {
      error: 'Esta lección todavía no tiene un video publicado.',
      code: 'VIDEO_NOT_CONFIGURED',
    };
  }

  app.get('/api/academia/courses/:slug/lessons/:lessonSlug', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const access = await loadAuthorizedSupabaseLesson(req, slug, lessonSlug);

    if (access.ok === false) {
      return res.status(access.status).json({ error: access.error, code: access.code });
    }

    const lessonIds = access.lessons.map((lessonRow: any) => lessonRow.id);
    let attachmentRows: any[] = [];

    if (lessonIds.length > 0) {
      const { data, error: attachmentsError } = await access.requestSupabase
        .from('lesson_attachments')
        .select('id, lesson_id, title, storage_path, mime_type, file_size_bytes, position, status')
        .in('lesson_id', lessonIds)
        .eq('status', 'published')
        .order('position', { ascending: true });

      if (attachmentsError) {
        return res.status(503).json({
          error: 'No fue posible consultar los materiales descargables de esta lección.',
          code: 'ATTACHMENTS_QUERY_FAILED',
        });
      }

      attachmentRows = data || [];
    }

    const attachmentsForLesson = (lessonId: string) =>
      attachmentRows.filter((attachment: any) => attachment.lesson_id === lessonId);

    const modulePayload = access.modules.map((moduleRow: any) => ({
      id: moduleRow.id,
      title: moduleRow.title,
      description: moduleRow.description || '',
      position: moduleRow.position || 0,
      lessons: access.lessons
        .filter((lessonRow: any) => lessonRow.module_id === moduleRow.id)
        .map((lessonRow: any) => mapLessonForBrowser(lessonRow, attachmentsForLesson(lessonRow.id))),
    }));

    const ungroupedLessons = access.lessons.filter((lessonRow: any) => !lessonRow.module_id);
    if (ungroupedLessons.length > 0) {
      modulePayload.push({
        id: 'general',
        title: 'Contenido principal',
        description: '',
        position: modulePayload.length + 1,
        lessons: ungroupedLessons.map((lessonRow: any) =>
          mapLessonForBrowser(lessonRow, attachmentsForLesson(lessonRow.id))),
      });
    }

    const progressDb = adminSupabase || access.requestSupabase;
    const progressMap = new Map<string, any>();

    // 1. Progress from memory DB
    try {
      const memProgressList = academyDb.getStudentProgress(access.user.customerGid, access.course.id, access.user.email);
      for (const row of memProgressList) {
        const isMemDone = row.status === 'completed';
        progressMap.set(row.lessonId, {
          lessonId: row.lessonId,
          status: row.status,
          completed: isMemDone,
          positionSeconds: row.lastPositionSeconds || 0,
          progressPercent: isMemDone ? 100 : 0,
          lastWatchedAt: row.updatedAt || row.startedAt,
          updatedAt: row.updatedAt || row.startedAt,
          completedAt: row.completedAt || (isMemDone ? row.updatedAt : null),
        });
      }
    } catch (memErr) {
      console.warn('[GET Lesson] Memory progress read note:', memErr);
    }

    // 2. Progress from Supabase
    if (progressDb) {
      try {
        const { data: progressRows } = await progressDb
          .from('lesson_progress')
          .select('lesson_id, position_seconds, progress_percent, completed, last_watched_at, updated_at, completed_at')
          .eq('user_id', access.user.id)
          .eq('masterclass_id', access.course.id);

        if (progressRows && progressRows.length > 0) {
          for (const row of progressRows) {
            const isRowDone = Boolean(row.completed);
            progressMap.set(row.lesson_id, {
              lessonId: row.lesson_id,
              status: isRowDone ? 'completed' : (row.progress_percent > 0 ? 'in_progress' : 'not_started'),
              completed: isRowDone,
              positionSeconds: row.position_seconds || 0,
              progressPercent: isRowDone ? 100 : (row.progress_percent || 0),
              lastWatchedAt: row.last_watched_at || row.updated_at,
              updatedAt: row.updated_at || row.last_watched_at,
              completedAt: row.completed_at || (isRowDone ? row.updated_at : null),
            });
          }
        }
      } catch (dbErr) {
        console.warn('[GET Lesson] Supabase progress read note:', dbErr);
      }
    }

    const progress = Array.from(progressMap.values());

    const playback = await resolveLessonPlaybackPayload(access.lesson, slug, lessonSlug);

    return res.json({
      course: {
        id: access.course.id,
        slug: access.course.slug,
        title: access.course.title,
        subtitle: access.course.subtitle,
        lessonCount: access.course.lesson_count || access.lessons.length,
        disclaimerShort: 'Material educativo bajo licencia individual. Prohibida su difusión o descarga no autorizada.',
        modules: modulePayload,
      },
      module: access.module
        ? { id: access.module.id, title: access.module.title }
        : { id: 'general', title: 'Contenido principal' },
      lesson: mapLessonForBrowser(access.lesson, attachmentsForLesson(access.lesson.id)),
      progress,
      playback,
      entitlementStatus: access.entitlementStatus,
    });
  });

  // Short-lived Cloudflare Stream / YouTube playback endpoint.
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/token', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const access = await loadAuthorizedSupabaseLesson(req, slug, lessonSlug);

    if (access.ok === false) {
      return res.status(access.status).json({ error: access.error, code: access.code });
    }

    const { data: playbackLesson, error: playbackLessonError } =
      await access.requestSupabase
        .from('lessons')
        .select('id, slug, status, video_provider, video_asset_id, video_external_id, video_url')
        .eq('id', access.lesson.id)
        .maybeSingle();

    if (playbackLessonError) {
      return res.status(503).json({
        error: 'No fue posible consultar la configuración de video de la lección.',
        code: 'LESSON_VIDEO_QUERY_FAILED',
      });
    }

    const lessonRow = (playbackLesson ?? access.lesson) as any;
    const playback: any = await resolveLessonPlaybackPayload(lessonRow, slug, lessonSlug);

    if (playback?.error) {
      return res.status(playback.code === 'STREAM_AUTHORIZATION_FAILED' ? 502 : 409).json(playback);
    }

    return res.json(playback);
  });

  // Track lesson progress in Supabase and memory after entitlement validation.
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/progress', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const { status, positionSeconds, durationSeconds } = req.body;
    const access = await loadAuthorizedSupabaseLesson(req, slug, lessonSlug);

    if (access.ok === false) {
      return res.status(access.status).json({ error: access.error, code: access.code });
    }

    const requestedCompleted = status === 'completed';
    const safePosition = Math.max(0, Number.parseInt(String(positionSeconds || 0), 10) || 0);
    const duration = Math.max(0, Number(durationSeconds || access.lesson.duration_seconds || 0));
    const now = new Date().toISOString();

    // 1. Check existing state in Supabase or memory first to ensure complete idempotence
    const progressDb = adminSupabase || access.requestSupabase;
    let isAlreadyCompleted = false;
    let existingCompletedAt: string | null = null;
    let existingPosition = 0;

    if (progressDb) {
      try {
        const { data: existingProgress } = await progressDb
          .from('lesson_progress')
          .select('completed, completed_at, position_seconds')
          .eq('user_id', access.user.id)
          .eq('lesson_id', access.lesson.id)
          .maybeSingle();

        if (existingProgress?.completed) {
          isAlreadyCompleted = true;
          existingCompletedAt = existingProgress.completed_at || null;
          existingPosition = existingProgress.position_seconds || 0;
        }
      } catch (checkErr) {
        console.warn('[Progress] Supabase read check note:', checkErr);
      }
    }

    const isFinalCompleted = requestedCompleted || isAlreadyCompleted;
    const finalCompletedAt = isFinalCompleted ? (existingCompletedAt || now) : null;
    const finalPosition = isFinalCompleted && safePosition === 0 && existingPosition > 0
      ? existingPosition
      : safePosition;
    const progressPercent = isFinalCompleted
      ? 100
      : duration > 0
        ? Math.min(99, Math.round((finalPosition / duration) * 100))
        : 0;

    // 2. Guardar en memoria siempre
    try {
      academyDb.saveLessonProgress(
        access.user.customerGid,
        access.course.id,
        access.lesson.id,
        isFinalCompleted ? 'completed' : 'in_progress',
        finalPosition,
        access.user.email
      );
    } catch (memErr) {
      console.warn('[Progress] Note on memory progress save:', memErr);
    }

    // 3. Guardar en Supabase utilizando adminSupabase para bypass de RLS restrictivo
    let savedProgress: any = null;

    if (progressDb) {
      try {
        const { data, error: progressError } = await progressDb
          .from('lesson_progress')
          .upsert(
            {
              user_id: access.user.id,
              lesson_id: access.lesson.id,
              masterclass_id: access.course.id,
              position_seconds: finalPosition,
              duration_seconds: duration,
              progress_percent: progressPercent,
              completed: isFinalCompleted,
              completed_at: finalCompletedAt,
              last_watched_at: now,
              updated_at: now,
            },
            { onConflict: 'user_id,lesson_id' },
          )
          .select('lesson_id, position_seconds, progress_percent, completed, completed_at, last_watched_at, updated_at')
          .single();

        if (!progressError && data) {
          savedProgress = data;
        } else if (progressError) {
          console.warn('[Progress] Supabase progress upsert note:', progressError.message);
        }
      } catch (dbErr: any) {
        console.warn('[Progress] Supabase exception note:', dbErr?.message || dbErr);
      }
    }

    const isDone = savedProgress ? Boolean(savedProgress.completed) : isFinalCompleted;
    return res.json({
      success: true,
      progress: [
        {
          lessonId: savedProgress?.lesson_id || access.lesson.id,
          status: isDone ? 'completed' : 'in_progress',
          completed: isDone,
          positionSeconds: savedProgress?.position_seconds ?? finalPosition,
          progressPercent: isDone ? 100 : (savedProgress?.progress_percent ?? progressPercent),
          lastWatchedAt: savedProgress?.last_watched_at || now,
          updatedAt: savedProgress?.updated_at || now,
          completedAt: savedProgress?.completed_at || (isDone ? now : null),
        },
      ],
    });
  });

  // Create a short-lived download URL for an authorized lesson attachment.
  app.get('/api/academia/courses/:slug/lessons/:lessonSlug/attachment/:attachmentId', async (req: Request, res: Response) => {
    const { slug, lessonSlug, attachmentId } = req.params;
    const access = await loadAuthorizedSupabaseLesson(req, slug, lessonSlug);

    if (access.ok === false) {
      return res.status(access.status).json({ error: access.error, code: access.code });
    }

    const { data: attachment, error: attachmentError } = await access.requestSupabase
      .from('lesson_attachments')
      .select('id, lesson_id, title, storage_path, mime_type, status')
      .eq('id', attachmentId)
      .eq('lesson_id', access.lesson.id)
      .eq('status', 'published')
      .maybeSingle();

    if (attachmentError) {
      return res.status(503).json({
        error: 'No fue posible consultar este material descargable.',
        code: 'ATTACHMENT_QUERY_FAILED',
      });
    }

    if (!attachment) {
      return res.status(404).json({
        error: 'El material solicitado no existe o no pertenece a esta lección.',
        code: 'ATTACHMENT_NOT_FOUND',
      });
    }

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: 'salud-forte',
      customerGid: access.user.customerGid,
      courseId: access.course.id,
      lessonId: access.lesson.id,
      action: 'attachment_download',
      result: 'granted',
      reason: `Descarga de adjunto ID: ${attachmentId}`,
      createdAt: new Date().toISOString(),
    });

    const downloadStorage = adminSupabase || access.requestSupabase;
    const { data: signedDownload, error: signedDownloadError } =
      await downloadStorage.storage
        .from('academy-materials')
        .createSignedUrl(attachment.storage_path, 60, { download: attachment.title });

    if (signedDownloadError || !signedDownload?.signedUrl) {
      return res.status(503).json({
        error: 'No fue posible preparar la descarga segura. Inténtalo nuevamente.',
        code: 'ATTACHMENT_SIGNING_FAILED',
      });
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.json({
      downloadUrl: signedDownload.signedUrl,
      filename: attachment.title,
      expiresIn: 60,
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

  const getRequestSupabase = (req: Request) => {
    const token = getBearerToken(req);
    if (!token) throw new Error('Falta el token de acceso.');
    return createSupabaseServerUserClient(token);
  };

  const getCloudflareStreamConfig = () => ({
    accountId: (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
    apiToken: (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim(),
  });

  async function cloudflareStreamRequest(endpoint: string, init: RequestInit = {}) {
    const { accountId, apiToken } = getCloudflareStreamConfig();
    if (!accountId || !apiToken) {
      throw new Error('Cloudflare Stream no está configurado en el servidor.');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/stream${endpoint}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      },
    );
    const payload = await response.json().catch(() => null) as any;
    if (!response.ok || !payload?.success) {
      const message = payload?.errors?.[0]?.message || `Cloudflare respondió con estado ${response.status}.`;
      throw new Error(message);
    }
    return payload;
  }

  // Real Supabase academy catalog used by the video-assignment panel.
  app.get('/api/admin/academy/catalog', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;

    try {
      const requestSupabase = getRequestSupabase(req);
      const [coursesResult, modulesResult, lessonsResult, attachmentsResult] = await Promise.all([
        requestSupabase
          .from('masterclasses')
          .select('id, slug, title, subtitle, category, duration_minutes, lesson_count, status')
          .order('created_at', { ascending: true }),
        requestSupabase
          .from('modules')
          .select('id, masterclass_id, title, description, position, status')
          .order('position', { ascending: true }),
        requestSupabase
          .from('lessons')
          .select('id, masterclass_id, module_id, slug, title, summary, duration_seconds, is_preview, video_provider, video_asset_id, video_external_id, status')
          .order('position', { ascending: true }),
        (adminSupabase || requestSupabase)
          .from('lesson_attachments')
          .select('id, lesson_id, title, storage_path, file_size_bytes, position, status')
          .order('position', { ascending: true }),
      ]);

      const databaseError = coursesResult.error || modulesResult.error || lessonsResult.error;
      if (databaseError) throw databaseError;

      const modules = modulesResult.data || [];
      const lessons = lessonsResult.data || [];
      const allAttachments = attachmentsResult.data || [];
      const courses = (coursesResult.data || [])
        .filter(
          (course: any) =>
            course.slug !== 'prueba-cloudflare-stream' &&
            !course.title?.toLowerCase().includes('prueba de cloudflare')
        )
        .map((course: any) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle || '',
        categoryLabel: course.category || 'Salud Médica',
        durationMinutes: course.duration_minutes || 0,
        lessonCount: course.lesson_count || 0,
        status: course.status,
        modules: modules
          .filter((module: any) => module.masterclass_id === course.id)
          .map((module: any) => ({
            id: module.id,
            title: module.title,
            description: module.description || '',
            position: module.position || 0,
            status: module.status,
            lessons: lessons
              .filter((lesson: any) => lesson.module_id === module.id)
              .map((lesson: any) => {
                const lessonAtts = allAttachments.filter((a: any) => a.lesson_id === lesson.id);
                return {
                  id: lesson.id,
                  slug: lesson.slug,
                  title: lesson.title,
                  summary: lesson.summary || '',
                  durationSeconds: lesson.duration_seconds || 0,
                  isPreview: Boolean(lesson.is_preview),
                  videoProvider: lesson.video_provider || 'none',
                  videoAssetId: lesson.video_asset_id || '',
                  videoExternalId: lesson.video_external_id || '',
                  status: lesson.status,
                  attachmentsCount: lessonAtts.length,
                  attachments: lessonAtts.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    fileSizeLabel: formatFileSize(a.file_size_bytes),
                    position: a.position,
                    status: a.status,
                  })),
                };
              }),
          })),
      }));

      res.setHeader('Cache-Control', 'private, no-store');
      return res.json({ courses });
    } catch (error: any) {
      console.error('Unable to load academy video catalog:', error);
      return res.status(500).json({ error: error?.message || 'No fue posible cargar las lecciones.' });
    }
  });

  // Safe Cloudflare Stream library: never exposes the API token.
  app.get('/api/admin/cloudflare/videos', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;

    try {
      const payload = await cloudflareStreamRequest('?limit=1000&asc=false');
      const videos = (payload.result || []).map((video: any) => ({
        uid: video.uid,
        name: video.meta?.name || video.uid,
        durationSeconds: Math.round(Number(video.duration) || 0),
        createdAt: video.created || null,
        readyToStream: Boolean(video.readyToStream),
        status: video.status?.state || (video.readyToStream ? 'ready' : 'processing'),
        thumbnail: video.thumbnail || null,
      }));
      res.setHeader('Cache-Control', 'private, no-store');
      return res.json({ videos });
    } catch (error: any) {
      console.error('Unable to list Cloudflare Stream videos:', error);
      return res.status(502).json({ error: error?.message || 'No fue posible consultar Cloudflare Stream.' });
    }
  });

  // Assign or remove a video on an existing Supabase lesson.
  app.patch('/api/admin/academy/lessons/:lessonId/video', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;

    const provider = String(req.body?.provider || '').trim().toLowerCase();
    const assetId = String(req.body?.videoAssetId || '').trim();
    if (!['cloudflare', 'youtube', 'none'].includes(provider)) {
      return res.status(400).json({ error: 'Proveedor de video no válido.' });
    }
    if (provider !== 'none' && !assetId) {
      return res.status(400).json({ error: 'Selecciona o escribe el identificador del video.' });
    }
    if (provider === 'cloudflare' && !/^[a-zA-Z0-9_-]{20,64}$/.test(assetId)) {
      return res.status(400).json({ error: 'El ID de Cloudflare Stream no tiene un formato válido.' });
    }

    try {
      let cloudflareDurationSeconds: number | null = null;
      if (provider === 'cloudflare') {
        const streamPayload = await cloudflareStreamRequest(`/${encodeURIComponent(assetId)}`, {
          method: 'POST',
          body: JSON.stringify({
            // Google AI Studio can serve the public app through more than one
            // internal origin. Keep playback portable while signed URLs remain
            // mandatory, short-lived, and issued only after academy access is
            // verified by the server.
            allowedOrigins: [],
            requireSignedURLs: true,
          }),
        });
        const detectedDuration = Math.round(Number(streamPayload?.result?.duration) || 0);
        cloudflareDurationSeconds = detectedDuration > 0 ? detectedDuration : null;
      }

      const requestSupabase = getRequestSupabase(req);
      const update = provider === 'none'
        ? { video_provider: 'none', video_asset_id: null, video_external_id: null, updated_at: new Date().toISOString() }
        : provider === 'youtube'
          ? { video_provider: 'youtube', video_asset_id: null, video_external_id: assetId, status: 'published', updated_at: new Date().toISOString() }
          : {
              video_provider: 'cloudflare',
              video_asset_id: assetId,
              video_external_id: null,
              status: 'published',
              ...(cloudflareDurationSeconds ? { duration_seconds: cloudflareDurationSeconds } : {}),
              updated_at: new Date().toISOString(),
            };

      const { data: lesson, error } = await requestSupabase
        .from('lessons')
        .update(update)
        .eq('id', req.params.lessonId)
        .select('id, slug, title, video_provider, video_asset_id, video_external_id')
        .single();

      if (error) throw error;
      return res.json({ success: true, lesson });
    } catch (error: any) {
      console.error('Unable to assign lesson video:', error);
      return res.status(502).json({ error: error?.message || 'No fue posible guardar el video en la lección.' });
    }
  });

  // ============================================================================
  // LESSON ATTACHMENTS (PDF) MANAGEMENT API FOR INSTRUCTORS
  // ============================================================================

  const ensureAcademyMaterialsBucket = async () => {
    if (!adminSupabase) return;
    try {
      const { data: bucket } = await adminSupabase.storage.getBucket('academy-materials');
      if (!bucket) {
        await adminSupabase.storage.createBucket('academy-materials', {
          public: false,
          fileSizeLimit: 52428800,
          allowedMimeTypes: ['application/pdf'],
        });
      }
    } catch {
      // Bucket check/create silently handled
    }
  };

  // Helper to extract Buffer from raw body or base64 JSON
  const extractPdfBuffer = (req: Request): Buffer | null => {
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      return req.body;
    }
    if (req.body?.fileBase64 && typeof req.body.fileBase64 === 'string') {
      const cleanBase64 = req.body.fileBase64.replace(/^data:application\/pdf;base64,/, '');
      return Buffer.from(cleanBase64, 'base64');
    }
    return null;
  };

  // Helper to validate PDF magic bytes (%PDF-)
  const isValidPdfBuffer = (buffer: Buffer): boolean => {
    if (!buffer || buffer.length < 5) return false;
    const header = buffer.subarray(0, 5).toString('ascii');
    if (header === '%PDF-') return true;
    return buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'));
  };

  // 1. Get all attachments for a specific lesson
  app.get('/api/admin/academy/lessons/:lessonId/attachments', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId } = req.params;

    try {
      const dbClient = adminSupabase || getRequestSupabase(req);
      const { data, error } = await dbClient
        .from('lesson_attachments')
        .select('id, lesson_id, title, storage_path, mime_type, file_size_bytes, position, status, created_at, updated_at')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const attachments = (data || []).map((att: any) => ({
        ...att,
        fileSizeLabel: formatFileSize(att.file_size_bytes),
      }));

      res.setHeader('Cache-Control', 'private, no-store');
      return res.json({ attachments });
    } catch (err: any) {
      console.error('[Attachments] Error fetching lesson attachments:', err);
      return res.status(500).json({ error: err?.message || 'No fue posible cargar los materiales de la lección.' });
    }
  });

  // 2. Upload and associate a new PDF to a lesson
  app.post('/api/admin/academy/lessons/:lessonId/attachments/upload', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId } = req.params;
    const dbClient = adminSupabase || getRequestSupabase(req);

    try {
      await ensureAcademyMaterialsBucket();

      const buffer = extractPdfBuffer(req);
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'No se recibió ningún archivo PDF para subir.' });
      }

      // Check max size: 25 MB
      const MAX_SIZE = 25 * 1024 * 1024;
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({ error: 'El archivo supera el tamaño máximo permitido de 25 MB.' });
      }

      // Check PDF magic bytes (%PDF-)
      if (!isValidPdfBuffer(buffer)) {
        return res.status(400).json({ error: 'Selecciona un archivo PDF válido.' });
      }

      // Resolve lesson and masterclass id
      const { data: lesson } = await dbClient
        .from('lessons')
        .select('id, masterclass_id, title')
        .eq('id', lessonId)
        .maybeSingle();

      let masterclassId = lesson?.masterclass_id;
      if (!masterclassId) {
        // Fallback lookup in memory db
        for (const c of academyDb.getCourses()) {
          for (const m of c.modules || []) {
            if (m.lessons?.some((l) => l.id === lessonId)) {
              masterclassId = c.id;
              break;
            }
          }
        }
      }
      if (!masterclassId) masterclassId = 'general';

      // Title extraction and sanitization
      const queryTitle = typeof req.query.title === 'string' ? req.query.title : '';
      const headerFilename = typeof req.headers['x-filename'] === 'string' ? decodeURIComponent(req.headers['x-filename']) : '';
      const bodyTitle = typeof req.body?.title === 'string' ? req.body.title : '';
      let rawTitle = (queryTitle || headerFilename || bodyTitle || 'Documento PDF')
        .replace(/\.[^/.]+$/, '')
        .trim();
      if (!rawTitle) rawTitle = 'Documento PDF';
      if (rawTitle.length > 180) rawTitle = rawTitle.slice(0, 180);

      // Safe unique storage path
      const attachmentId = crypto.randomUUID();
      const storagePath = `courses/${masterclassId}/lessons/${lessonId}/resources/${attachmentId}.pdf`;

      // Storage upload
      const storageClient = adminSupabase || getRequestSupabase(req);
      const { error: uploadError } = await storageClient.storage
        .from('academy-materials')
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('[Attachments] Supabase storage upload failed:', uploadError);
        return res.status(500).json({ error: 'No fue posible subir el PDF. Revisa el archivo e inténtalo nuevamente.' });
      }

      // Calculate next position
      const { data: existing } = await dbClient
        .from('lesson_attachments')
        .select('position')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (existing?.[0]?.position ?? 0) + 1;

      // Insert record
      const { data: inserted, error: insertError } = await dbClient
        .from('lesson_attachments')
        .insert({
          id: attachmentId,
          lesson_id: lessonId,
          title: rawTitle,
          storage_path: storagePath,
          mime_type: 'application/pdf',
          file_size_bytes: buffer.length,
          position: nextPosition,
          status: 'published',
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Attachments] DB insert error, rolling back storage upload:', insertError);
        await storageClient.storage.from('academy-materials').remove([storagePath]);
        return res.status(500).json({ error: 'No fue posible registrar el PDF en la base de datos.' });
      }

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: masterclassId,
        lessonId,
        action: 'attachment_uploaded',
        result: 'granted',
        reason: `Subida de PDF: ${rawTitle} (${formatFileSize(buffer.length)})`,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        attachment: {
          ...inserted,
          fileSizeLabel: formatFileSize(inserted.file_size_bytes),
        },
      });
    } catch (err: any) {
      console.error('[Attachments] Unexpected error uploading attachment:', err);
      return res.status(500).json({ error: err?.message || 'Error inesperado al subir el PDF.' });
    }
  });

  // 3. Rename an existing attachment (visible title only, without moving the file)
  app.patch('/api/admin/academy/lessons/:lessonId/attachments/:attachmentId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId, attachmentId } = req.params;
    const rawTitle = String(req.body?.title || '').trim();

    if (!rawTitle || rawTitle.length > 180) {
      return res.status(400).json({ error: 'El nombre visible debe tener entre 1 y 180 caracteres.' });
    }

    try {
      const dbClient = adminSupabase || getRequestSupabase(req);
      const { data: updated, error } = await dbClient
        .from('lesson_attachments')
        .update({ title: rawTitle, updated_at: new Date().toISOString() })
        .eq('id', attachmentId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (error || !updated) {
        throw error || new Error('Material no encontrado');
      }

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: 'none',
        lessonId,
        action: 'attachment_renamed',
        result: 'granted',
        reason: `PDF renombrado a: ${rawTitle}`,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        attachment: {
          ...updated,
          fileSizeLabel: formatFileSize(updated.file_size_bytes),
        },
      });
    } catch (err: any) {
      console.error('[Attachments] Error renaming attachment:', err);
      return res.status(500).json({ error: err?.message || 'No fue posible renombrar el PDF.' });
    }
  });

  // 4. Reorder attachments for a lesson
  app.patch('/api/admin/academy/lessons/:lessonId/attachments/reorder', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId } = req.params;
    const { attachmentIds } = req.body;

    if (!Array.isArray(attachmentIds)) {
      return res.status(400).json({ error: 'La lista de identificadores es requerida.' });
    }

    try {
      const dbClient = adminSupabase || getRequestSupabase(req);
      await Promise.all(
        attachmentIds.map((id: string, index: number) =>
          dbClient
            .from('lesson_attachments')
            .update({ position: index + 1, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('lesson_id', lessonId)
        )
      );

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: 'none',
        lessonId,
        action: 'attachment_reordered',
        result: 'granted',
        reason: `Reordenados ${attachmentIds.length} materiales en la lección`,
        createdAt: new Date().toISOString(),
      });

      return res.json({ success: true });
    } catch (err: any) {
      console.error('[Attachments] Error reordering attachments:', err);
      return res.status(500).json({ error: err?.message || 'No fue posible reordenar los materiales.' });
    }
  });

  // 5. Replace the underlying PDF of an attachment
  app.post('/api/admin/academy/lessons/:lessonId/attachments/:attachmentId/replace', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId, attachmentId } = req.params;
    const dbClient = adminSupabase || getRequestSupabase(req);
    const storageClient = adminSupabase || getRequestSupabase(req);

    try {
      const buffer = extractPdfBuffer(req);
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'El archivo está vacío o no fue recibido.' });
      }

      const MAX_SIZE = 25 * 1024 * 1024;
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({ error: 'El archivo supera el tamaño máximo permitido de 25 MB.' });
      }

      if (!isValidPdfBuffer(buffer)) {
        return res.status(400).json({ error: 'Selecciona un archivo PDF válido.' });
      }

      const { data: current, error: fetchErr } = await dbClient
        .from('lesson_attachments')
        .select('id, lesson_id, title, storage_path')
        .eq('id', attachmentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (fetchErr || !current) {
        return res.status(404).json({ error: 'El material a reemplazar no existe.' });
      }

      const { data: lesson } = await dbClient
        .from('lessons')
        .select('id, masterclass_id')
        .eq('id', lessonId)
        .maybeSingle();

      const masterclassId = lesson?.masterclass_id || 'general';
      const newStoragePath = `courses/${masterclassId}/lessons/${lessonId}/resources/${crypto.randomUUID()}.pdf`;

      // 1. Upload new file first
      const { error: uploadError } = await storageClient.storage
        .from('academy-materials')
        .upload(newStoragePath, buffer, { contentType: 'application/pdf', upsert: false });

      if (uploadError) {
        console.error('[Attachments] Error uploading replacement file:', uploadError);
        return res.status(500).json({ error: 'No fue posible subir el nuevo PDF. Inténtalo nuevamente.' });
      }

      // 2. Update DB record
      const { data: updated, error: updateError } = await dbClient
        .from('lesson_attachments')
        .update({
          storage_path: newStoragePath,
          file_size_bytes: buffer.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', attachmentId)
        .select()
        .single();

      if (updateError) {
        console.error('[Attachments] DB update error during replace, rolling back:', updateError);
        await storageClient.storage.from('academy-materials').remove([newStoragePath]);
        return res.status(500).json({ error: 'No fue posible actualizar el registro del PDF.' });
      }

      // 3. Delete previous file from storage safely
      try {
        await storageClient.storage.from('academy-materials').remove([current.storage_path]);
      } catch (cleanErr) {
        console.warn('[Attachments] Note cleaning old file during replace:', cleanErr);
      }

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: masterclassId,
        lessonId,
        action: 'attachment_replaced',
        result: 'granted',
        reason: `PDF reemplazado en lección: ${current.title}`,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        attachment: {
          ...updated,
          fileSizeLabel: formatFileSize(updated.file_size_bytes),
        },
      });
    } catch (err: any) {
      console.error('[Attachments] Unexpected error replacing attachment:', err);
      return res.status(500).json({ error: err?.message || 'Error inesperado al reemplazar el PDF.' });
    }
  });

  // 6. Delete / remove an attachment
  app.delete('/api/admin/academy/lessons/:lessonId/attachments/:attachmentId', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId, attachmentId } = req.params;
    const dbClient = adminSupabase || getRequestSupabase(req);
    const storageClient = adminSupabase || getRequestSupabase(req);

    try {
      const { data: current, error: fetchErr } = await dbClient
        .from('lesson_attachments')
        .select('id, lesson_id, title, storage_path')
        .eq('id', attachmentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (fetchErr || !current) {
        return res.status(404).json({ error: 'El material a eliminar no existe.' });
      }

      // Delete from DB first
      const { error: deleteErr } = await dbClient
        .from('lesson_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteErr) {
        console.error('[Attachments] DB delete error:', deleteErr);
        return res.status(500).json({ error: 'No fue posible eliminar el registro del PDF.' });
      }

      // Remove from storage
      try {
        await storageClient.storage.from('academy-materials').remove([current.storage_path]);
      } catch (cleanErr) {
        console.warn('[Attachments] Note cleaning storage during delete:', cleanErr);
      }

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: 'none',
        lessonId,
        action: 'attachment_deleted',
        result: 'granted',
        reason: `PDF quitado de la lección: ${current.title}`,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'El PDF se quitó correctamente de esta lección.',
      });
    } catch (err: any) {
      console.error('[Attachments] Unexpected error deleting attachment:', err);
      return res.status(500).json({ error: err?.message || 'Error al quitar el PDF.' });
    }
  });

  // 7. Preview signed URL for instructor checking
  app.get('/api/admin/academy/lessons/:lessonId/attachments/:attachmentId/preview', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { lessonId, attachmentId } = req.params;
    const dbClient = adminSupabase || getRequestSupabase(req);
    const storageClient = adminSupabase || getRequestSupabase(req);

    try {
      const { data: attachment } = await dbClient
        .from('lesson_attachments')
        .select('id, title, storage_path')
        .eq('id', attachmentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (!attachment) {
        return res.status(404).json({ error: 'Material no encontrado.' });
      }

      const { data: signed, error: signErr } = await storageClient.storage
        .from('academy-materials')
        .createSignedUrl(attachment.storage_path, 120);

      if (signErr || !signed?.signedUrl) {
        return res.status(500).json({ error: 'No fue posible generar el enlace de comprobación.' });
      }

      return res.json({ downloadUrl: signed.signedUrl, title: attachment.title });
    } catch (err: any) {
      console.error('[Attachments] Error previewing attachment:', err);
      return res.status(500).json({ error: 'Error al generar el enlace de comprobación.' });
    }
  });

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

  // User synchronization route
  app.post('/api/auth/sync', async (req: Request, res: Response) => {
    try {
      const { profile, email_confirmed_at, last_sign_in_at } = req.body || {};
      if (!profile || !profile.email) {
        return res.status(400).json({ error: 'Perfil inválido' });
      }

      const existing = academyDb.getUserByEmail(profile.email);
      const userProfile: UserProfile = {
        id: profile.id || existing?.id || `usr_${Date.now()}`,
        email: profile.email.toLowerCase().trim(),
        normalized_email: profile.email.toLowerCase().trim(),
        full_name: profile.full_name || existing?.full_name || 'Usuario',
        first_name: profile.first_name || existing?.first_name,
        last_name: profile.last_name || existing?.last_name,
        phone: profile.phone || existing?.phone,
        role: profile.role || existing?.role || 'CUSTOMER',
        status: existing?.status || 'ACTIVE',
        email_verified: email_confirmed_at !== undefined ? !!email_confirmed_at : (profile.email_verified ?? existing?.email_verified ?? false),
        email_verified_at: email_confirmed_at || existing?.email_verified_at,
        marketing_consent: profile.marketing_consent !== undefined ? !!profile.marketing_consent : (existing?.marketing_consent ?? false),
        marketing_consent_at: profile.marketing_consent_at || existing?.marketing_consent_at,
        marketing_opted_out_at: profile.marketing_opted_out_at || existing?.marketing_opted_out_at,
        marketing_consent_source: profile.marketing_consent_source || existing?.marketing_consent_source,
        marketing_consent_version: profile.marketing_consent_version || existing?.marketing_consent_version,
        privacy_policy_version: profile.privacy_policy_version || existing?.privacy_policy_version,
        terms_accepted: true,
        terms_accepted_at: profile.terms_accepted_at || existing?.terms_accepted_at || new Date().toISOString(),
        created_at: existing?.created_at || profile.created_at || new Date().toISOString(),
        last_login_at: last_sign_in_at || existing?.last_login_at || new Date().toISOString(),
      };

      (academyDb as any).users.set(userProfile.id, userProfile);
      (academyDb as any).saveToDisk();

      return res.json({ success: true, user: userProfile });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Marketing preferences endpoint
  app.post('/api/account/marketing-preferences', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
      }
      const token = authHeader.substring(7).trim();
      let email: string | undefined;

      if (isSupabaseConfigured) {
        try {
          const client = createSupabaseServerUserClient(token);
          const { data: { user } } = await client.auth.getUser();
          email = user?.email;
        } catch (_) {}
      }

      const { marketing_consent, source } = req.body || {};
      const now = new Date().toISOString();

      if (email) {
        const user = academyDb.getUserByEmail(email);
        if (user) {
          user.marketing_consent = !!marketing_consent;
          if (marketing_consent) {
            user.marketing_consent_at = now;
            delete user.marketing_opted_out_at;
            user.marketing_consent_source = source || 'user_profile_preferences';
            user.marketing_consent_version = 'v1.0';
            user.privacy_policy_version = 'v1.0';
          } else {
            user.marketing_opted_out_at = now;
          }
          (academyDb as any).users.set(user.id, user);
          (academyDb as any).saveToDisk();
        }
      }

      return res.json({ success: true, marketing_consent: !!marketing_consent });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 12. Student directory from Supabase Authentication & Real Accounts
  app.get('/api/admin/students', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;

    const search = req.query.search as string | undefined;
    const userType = req.query.user_type as string | undefined;
    const marketingStatus = req.query.marketing_status as string | undefined;
    const emailVerified = req.query.email_verified as string | undefined;
    const courseId = req.query.course_id as string | undefined;
    const marketingOnly = req.query.marketing_only === 'true';
    const exportMarketing = req.query.export_marketing === 'true';

    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

      if (isSupabaseConfigured) {
        try {
          // A) If adminSupabase (Service Role Client) is available, fetch real users directly from auth.users
          if (adminSupabase) {
            const { data: authUsersData, error: authUsersErr } = await adminSupabase.auth.admin.listUsers();
            if (!authUsersErr && authUsersData?.users) {
              const { data: profilesData } = await adminSupabase.from('profiles').select('*');
              const profilesMap = new Map<string, any>();
              if (Array.isArray(profilesData)) {
                for (const p of profilesData) {
                  profilesMap.set(p.id, p);
                  if (p.email) profilesMap.set(p.email.toLowerCase().trim(), p);
                }
              }

              for (const au of authUsersData.users) {
                if (!au.email) continue;
                const normEmail = au.email.toLowerCase().trim();
                const profile = profilesMap.get(au.id) || profilesMap.get(normEmail);

                // Clean legacy placeholder keys for this email
                for (const [existingId, existingUser] of (academyDb as any).users.entries()) {
                  if (existingUser.normalized_email === normEmail && existingId !== au.id) {
                    (academyDb as any).users.delete(existingId);
                  }
                }

                let role = profile?.role || au.app_metadata?.role || 'CUSTOMER';
                if (AUTHORIZED_ADMIN_EMAILS.has(normEmail)) {
                  role = 'ADMIN';
                }

                const merged: UserProfile = {
                  id: au.id,
                  email: normEmail,
                  normalized_email: normEmail,
                  full_name: profile?.full_name || au.user_metadata?.full_name || `${au.user_metadata?.first_name || ''} ${au.user_metadata?.last_name || ''}`.trim() || 'Usuario Registrado',
                  first_name: profile?.first_name || au.user_metadata?.first_name,
                  last_name: profile?.last_name || au.user_metadata?.last_name,
                  phone: profile?.phone || au.user_metadata?.phone,
                  role: role as any,
                  status: 'ACTIVE',
                  email_verified: !!au.email_confirmed_at,
                  email_verified_at: au.email_confirmed_at,
                  marketing_consent: !!profile?.marketing_consent,
                  marketing_consent_at: profile?.marketing_consent_at,
                  marketing_opted_out_at: profile?.marketing_opted_out_at,
                  marketing_consent_source: profile?.marketing_consent_source,
                  marketing_consent_version: profile?.marketing_consent_version,
                  privacy_policy_version: profile?.privacy_policy_version,
                  terms_accepted: true,
                  terms_accepted_at: profile?.terms_accepted_at || au.created_at,
                  created_at: au.created_at,
                  last_login_at: au.last_sign_in_at,
                };

                (academyDb as any).users.set(merged.id, merged);
              }
              (academyDb as any).saveToDisk();
            }
          } else if (token) {
            // B) User authenticated call to get_admin_student_directory RPC or profiles table
            const requestSupabase = createSupabaseServerUserClient(token);
            const { data: rpcData, error: rpcError } = await requestSupabase.rpc('get_admin_student_directory');
            if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
              for (const su of rpcData) {
                if (!su.email) continue;
                const normEmail = su.email.toLowerCase().trim();

                for (const [existingId, existingUser] of (academyDb as any).users.entries()) {
                  if (existingUser.normalized_email === normEmail && existingId !== su.id) {
                    (academyDb as any).users.delete(existingId);
                  }
                }

                let role = su.role || 'CUSTOMER';
                if (AUTHORIZED_ADMIN_EMAILS.has(normEmail)) {
                  role = 'ADMIN';
                }

                const merged: UserProfile = {
                  id: su.id,
                  email: normEmail,
                  normalized_email: normEmail,
                  full_name: su.full_name || 'Usuario Registrado',
                  first_name: su.first_name,
                  last_name: su.last_name,
                  phone: su.phone,
                  role: role as any,
                  status: 'ACTIVE',
                  email_verified: !!su.email_confirmed_at,
                  email_verified_at: su.email_confirmed_at,
                  marketing_consent: !!su.marketing_consent,
                  marketing_consent_at: su.marketing_consent_at,
                  marketing_opted_out_at: su.marketing_opted_out_at,
                  marketing_consent_source: su.marketing_consent_source,
                  marketing_consent_version: su.marketing_consent_version,
                  privacy_policy_version: su.privacy_policy_version,
                  terms_accepted: true,
                  terms_accepted_at: su.terms_accepted_at,
                  created_at: su.created_at,
                  last_login_at: su.last_sign_in_at,
                };
                (academyDb as any).users.set(merged.id, merged);
              }
              (academyDb as any).saveToDisk();
            } else {
              const { data: dbProfiles, error: profError } = await requestSupabase.from('profiles').select('*');
              if (!profError && Array.isArray(dbProfiles) && dbProfiles.length > 0) {
                for (const su of dbProfiles) {
                  if (!su.email) continue;
                  const normEmail = su.email.toLowerCase().trim();

                  for (const [existingId, existingUser] of (academyDb as any).users.entries()) {
                    if (existingUser.normalized_email === normEmail && existingId !== su.id) {
                      (academyDb as any).users.delete(existingId);
                    }
                  }

                  let role = su.role || 'CUSTOMER';
                  if (AUTHORIZED_ADMIN_EMAILS.has(normEmail)) {
                    role = 'ADMIN';
                  }

                  const merged: UserProfile = {
                    id: su.id,
                    email: normEmail,
                    normalized_email: normEmail,
                    full_name: su.full_name || 'Usuario Registrado',
                    first_name: su.first_name,
                    last_name: su.last_name,
                    phone: su.phone,
                    role: role as any,
                    status: 'ACTIVE',
                    email_verified: false,
                    marketing_consent: !!su.marketing_consent,
                    marketing_consent_at: su.marketing_consent_at,
                    marketing_opted_out_at: su.marketing_opted_out_at,
                    marketing_consent_source: su.marketing_consent_source,
                    marketing_consent_version: su.marketing_consent_version,
                    privacy_policy_version: su.privacy_policy_version,
                    terms_accepted: true,
                    terms_accepted_at: su.terms_accepted_at,
                    created_at: su.created_at,
                  };
                  (academyDb as any).users.set(merged.id, merged);
                }
                (academyDb as any).saveToDisk();
              }
            }
          }
        } catch (syncErr) {
          console.warn('[Students API] Sync error with Supabase:', syncErr);
        }
      }

      // Query complete directory from academyDb
      const result = academyDb.getStudentsDirectory({
        search,
        userType,
        marketingStatus,
        emailVerified,
        courseId,
        marketingOnly,
      });

      // If export requested for marketing only
      if (exportMarketing) {
        const marketingSubscribers = result.students
          .filter((s) => s.marketing_consent && s.marketingStatus === 'accepted')
          .map((s) => ({
            id: s.id,
            full_name: s.full_name,
            first_name: s.first_name,
            last_name: s.last_name,
            email: s.email,
            phone: s.phone || '',
            consent_date: s.marketing_consent_at || s.created_at,
            consent_source: s.marketing_consent_source || 'registration_form',
            consent_version: s.marketing_consent_version || 'v1.0',
            user_type: s.userType,
            enrolled_courses: s.enrolledCourses.map((c) => c.courseTitle).join('; '),
          }));

        return res.json({
          success: true,
          count: marketingSubscribers.length,
          subscribers: marketingSubscribers,
        });
      }

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error al obtener alumnos.' });
    }
  });

  // 13. Grant masterclass to student manually (Requires real account)
  app.post('/api/admin/students/grant-course', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    const { customerEmail, courseId } = req.body;

    if (!customerEmail || !courseId) {
      return res.status(400).json({ error: 'El correo del usuario y la masterclass son requeridos.' });
    }

    const normalizedEmail = customerEmail.toLowerCase().trim();

    // 1. Search for real account in local memory
    let realUser = academyDb.getUserByEmail(normalizedEmail);

    // 2. If not found locally, query Supabase Auth / profiles directly
    if (!realUser && isSupabaseConfigured) {
      if (adminSupabase) {
        const { data: authUsersData } = await adminSupabase.auth.admin.listUsers();
        const foundAu = authUsersData?.users?.find((u: any) => u.email?.toLowerCase().trim() === normalizedEmail);
        if (foundAu) {
          const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', foundAu.id).single();
          realUser = {
            id: foundAu.id,
            email: normalizedEmail,
            normalized_email: normalizedEmail,
            full_name: profile?.full_name || foundAu.user_metadata?.full_name || 'Usuario Registrado',
            first_name: profile?.first_name || foundAu.user_metadata?.first_name,
            last_name: profile?.last_name || foundAu.user_metadata?.last_name,
            phone: profile?.phone || foundAu.user_metadata?.phone,
            role: (profile?.role || foundAu.app_metadata?.role || 'CUSTOMER') as any,
            status: 'ACTIVE',
            email_verified: !!foundAu.email_confirmed_at,
            created_at: foundAu.created_at,
          };
          (academyDb as any).users.set(realUser.id, realUser);
        }
      } else {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
        if (token) {
          const requestSupabase = createSupabaseServerUserClient(token);
          const { data: profile } = await requestSupabase.from('profiles').select('*').ilike('email', normalizedEmail).single();
          if (profile) {
            realUser = {
              id: profile.id,
              email: normalizedEmail,
              normalized_email: normalizedEmail,
              full_name: profile.full_name || 'Usuario Registrado',
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone,
              role: (profile.role || 'CUSTOMER') as any,
              status: 'ACTIVE',
              email_verified: false,
              created_at: profile.created_at || new Date().toISOString(),
            };
            (academyDb as any).users.set(realUser.id, realUser);
          }
        }
      }
    }

    if (!realUser) {
      return res.status(404).json({ error: 'No existe una cuenta registrada con este correo.' });
    }

    const course = academyDb.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada.' });
    }

    const entitlement = academyDb.grantEntitlement({
      shop: 'salud-forte',
      customerGid: `usr_${realUser.id}`,
      customerEmail: normalizedEmail,
      customerName: realUser.full_name,
      courseId: course.id,
      orderGid: `admin_manual_${Date.now()}`,
      orderNumber: '#DOCTOR-MANUAL',
      lineItemGid: `admin_line_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: `Acceso a "${course.title}" otorgado exitosamente a ${realUser.full_name} (${normalizedEmail}).`,
      user: realUser,
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

  // ============================================================================
  // VIDEO TESTIMONIALS (CONSULTA MÉDICA) - PUBLIC & ADMIN APIS
  // Strict patient consent verification, public safety, audit trail
  // ============================================================================

  // Public: Returns only authorized, published testimonials with active consent
  app.get('/api/testimonials', async (_req: Request, res: Response) => {
    try {
      const publicItems = academyDb.getPublicTestimonials().map((t) => ({
        id: t.id,
        videoProvider: t.videoProvider,
        videoId: t.videoId,
        videoUrl: t.videoUrl,
        posterUrl: t.posterUrl,
        displayName: t.displayName,
        publicLabel: t.publicLabel,
        shortDescription: t.shortDescription,
        sortOrder: t.sortOrder,
      }));

      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json({ testimonials: publicItems });
    } catch (err: any) {
      console.error('[Testimonials] Error fetching public testimonials:', err);
      return res.status(500).json({ error: 'No fue posible cargar los testimonios autorizados.' });
    }
  });

  // Admin: Get all testimonials (including drafts, pending consent, inactive)
  app.get('/api/admin/testimonials', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const testimonials = academyDb.getAllTestimonials();
      res.setHeader('Cache-Control', 'private, no-store');
      return res.json({ testimonials });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Error al listar testimonios.' });
    }
  });

  // Admin: Create new testimonial
  app.post('/api/admin/testimonials', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const {
        videoProvider,
        videoId,
        videoUrl,
        posterUrl,
        displayName,
        internalName,
        nameFormat,
        publicLabel,
        shortDescription,
        sortOrder,
        status,
        consentConfirmed,
        consentDate,
        consentExpiration,
        consentWithdrawnAt,
      } = req.body;

      if (!videoId && !videoUrl) {
        return res.status(400).json({ error: 'Debes proporcionar un ID de video o URL de video válida.' });
      }

      // Security check: cannot be published without confirmed consent
      const isPublished = status === 'published';
      if (isPublished && !consentConfirmed) {
        return res.status(400).json({
          error: 'No es posible publicar un testimonio sin consentimiento informado confirmado.',
        });
      }

      const created = academyDb.createTestimonial({
        videoProvider: videoProvider || 'cloudflare',
        videoId: String(videoId || '').trim(),
        videoUrl: videoUrl ? String(videoUrl).trim() : undefined,
        posterUrl: String(posterUrl || '').trim(),
        displayName: String(displayName || 'Paciente').trim(),
        internalName: internalName ? String(internalName).trim() : undefined,
        nameFormat: nameFormat || 'anonymous',
        publicLabel: String(publicLabel || '').trim(),
        shortDescription: String(shortDescription || '').trim(),
        sortOrder: Number(sortOrder) || 0,
        status: isPublished ? 'published' : (status || 'draft'),
        consentConfirmed: Boolean(consentConfirmed),
        consentDate: consentDate || new Date().toISOString(),
        consentExpiration: consentExpiration || null,
        consentWithdrawnAt: consentWithdrawnAt || null,
      });

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: 'consulta_testimonials',
        lessonId: created.id,
        action: 'attachment_uploaded',
        result: 'granted',
        reason: `Testimonio registrado: ${created.displayName} (Consentimiento: ${created.consentConfirmed})`,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ success: true, testimonial: created });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Error al crear testimonio.' });
    }
  });

  // Admin: Update testimonial
  app.put('/api/admin/testimonials/:id', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const { id } = req.params;
      const existing = academyDb.getTestimonialById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Testimonio no encontrado.' });
      }

      const {
        videoProvider,
        videoId,
        videoUrl,
        posterUrl,
        displayName,
        internalName,
        nameFormat,
        publicLabel,
        shortDescription,
        sortOrder,
        status,
        consentConfirmed,
        consentDate,
        consentExpiration,
        consentWithdrawnAt,
      } = req.body;

      const isPublished = (status ?? existing.status) === 'published';
      const hasConsent = consentConfirmed !== undefined ? Boolean(consentConfirmed) : existing.consentConfirmed;

      if (isPublished && !hasConsent) {
        return res.status(400).json({
          error: 'No es posible publicar un testimonio sin consentimiento informado confirmado.',
        });
      }

      const updated = academyDb.updateTestimonial(id, {
        ...(videoProvider !== undefined && { videoProvider }),
        ...(videoId !== undefined && { videoId: String(videoId).trim() }),
        ...(videoUrl !== undefined && { videoUrl: String(videoUrl).trim() }),
        ...(posterUrl !== undefined && { posterUrl: String(posterUrl).trim() }),
        ...(displayName !== undefined && { displayName: String(displayName).trim() }),
        ...(internalName !== undefined && { internalName: String(internalName).trim() }),
        ...(nameFormat !== undefined && { nameFormat }),
        ...(publicLabel !== undefined && { publicLabel: String(publicLabel).trim() }),
        ...(shortDescription !== undefined && { shortDescription: String(shortDescription).trim() }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(status !== undefined && { status }),
        ...(consentConfirmed !== undefined && { consentConfirmed: Boolean(consentConfirmed) }),
        ...(consentDate !== undefined && { consentDate }),
        ...(consentExpiration !== undefined && { consentExpiration }),
        ...(consentWithdrawnAt !== undefined && { consentWithdrawnAt }),
      });

      return res.json({ success: true, testimonial: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Error al actualizar testimonio.' });
    }
  });

  // Admin: Delete testimonial
  app.delete('/api/admin/testimonials/:id', async (req: Request, res: Response) => {
    if (!await requireAdmin(req, res)) return;
    try {
      const { id } = req.params;
      const deleted = academyDb.deleteTestimonial(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Testimonio no encontrado.' });
      }

      const authUser = await getAuthenticatedUser(req);
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: authUser?.customerGid || 'admin',
        courseId: 'consulta_testimonials',
        lessonId: id,
        action: 'attachment_deleted',
        result: 'granted',
        reason: `Testimonio eliminado: ID ${id}`,
        createdAt: new Date().toISOString(),
      });

      return res.json({ success: true, message: 'Testimonio eliminado correctamente.' });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Error al eliminar testimonio.' });
    }
  });

  // Static images serving
  app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

  // Ensure authorized doctor accounts have persistent ADMIN role in Supabase profiles
  if (adminSupabase) {
    try {
      const authorizedAdmins = Array.from(AUTHORIZED_ADMIN_EMAILS).map((email) => ({
        email,
        name: 'Administrador Salud Forte',
      }));

      for (const admin of authorizedAdmins) {
        const { data: prof } = await adminSupabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', admin.email)
          .maybeSingle();

        if (prof) {
          if (prof.role !== 'ADMIN') {
            await adminSupabase
              .from('profiles')
              .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
              .eq('id', prof.id);
            console.log(`[Supabase Auth] Rol ADMIN asegurado para ${admin.email} (ID: ${prof.id})`);
          }
        }
      }
    } catch (bootstrapErr) {
      console.warn('[Supabase Auth] Admin role verification notice:', bootstrapErr);
    }
  }

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
