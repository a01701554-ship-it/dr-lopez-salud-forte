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

    if (entitlementError) {
      return {
        ok: false,
        status: 503,
        code: 'ENTITLEMENT_CHECK_FAILED',
        error: 'No fue posible verificar tu acceso a la masterclass.',
      };
    }

    entitlementStatus = entitlementIsCurrent(entitlement) ? 'active' : 'preview';
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

    const { data: progressRows } = await access.requestSupabase
      .from('lesson_progress')
      .select('lesson_id, position_seconds, progress_percent, completed, last_watched_at')
      .eq('user_id', access.user.id)
      .eq('masterclass_id', access.course.id);

    const progress = (progressRows || []).map((row: any) => ({
      lessonId: row.lesson_id,
      status: row.completed ? 'completed' : row.progress_percent > 0 ? 'in_progress' : 'not_started',
      positionSeconds: row.position_seconds || 0,
      progressPercent: row.progress_percent || 0,
      lastWatchedAt: row.last_watched_at,
    }));

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
        .select('id, slug, status, video_provider, video_asset_id, video_external_id')
        .eq('id', access.lesson.id)
        .maybeSingle();

    if (playbackLessonError) {
      return res.status(503).json({
        error: 'No fue posible consultar la configuración de video de la lección.',
        code: 'LESSON_VIDEO_QUERY_FAILED',
      });
    }

    const lessonRow = (playbackLesson ?? access.lesson) as any;

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

    console.info('stream_playback_config', {
      courseSlug: slug,
      lessonSlug,
      lessonFound: Boolean(playbackLesson),
      provider,
      hasVideoAssetId: Boolean(videoAssetId),
    });

    if (provider === 'youtube' && videoExternalId) {
      const videoId = extractYouTubeVideoId(videoExternalId);
      if (!videoId) {
        return res.status(409).json({
          error: 'El video de esta lección no está configurado correctamente.',
          code: 'VIDEO_NOT_CONFIGURED',
        });
      }

      const embedUrl = buildYouTubeEmbedUrl(videoId, {
        origin: process.env.PUBLIC_APP_URL || 'https://saludforte.com',
      });

      return res.json({
        type: 'youtube',
        videoId,
        embedUrl,
      });
    }

    if (
      (provider === 'cloudflare' || provider === 'cloudflare_stream') &&
      videoAssetId
    ) {
      try {
        const signedPlayback =
          await createCloudflareSignedPlaybackUrl(videoAssetId);

        return res.json({
          type: 'cloudflare',
          playbackUrl: signedPlayback.playbackUrl,
          expiresIn: signedPlayback.expiresIn,
        });
      } catch (error) {
        console.error('stream_authorization_failed', {
          courseSlug: slug,
          lessonSlug,
          reason:
            error instanceof Error ? error.message : 'UNKNOWN_ERROR',
        });

        return res.status(502).json({
          error: 'No fue posible autorizar la reproducción segura.',
          code: 'STREAM_AUTHORIZATION_FAILED',
        });
      }
    }

    return res.status(409).json({
      error: 'Esta lección todavía no tiene un video publicado.',
      code: 'VIDEO_NOT_CONFIGURED',
    });
  });

  // Track lesson progress in Supabase after the same entitlement validation.
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/progress', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const { status, positionSeconds } = req.body;
    const access = await loadAuthorizedSupabaseLesson(req, slug, lessonSlug);

    if (access.ok === false) {
      return res.status(access.status).json({ error: access.error, code: access.code });
    }

    const normalizedStatus = status === 'completed' ? 'completed' : 'in_progress';
    const safePosition = Math.max(0, Number.parseInt(String(positionSeconds || 0), 10) || 0);
    const duration = Math.max(0, Number(access.lesson.duration_seconds || 0));
    const progressPercent =
      normalizedStatus === 'completed'
        ? 100
        : duration > 0
          ? Math.min(99, Math.round((safePosition / duration) * 100))
          : 0;
    const now = new Date().toISOString();

    const { data: savedProgress, error: progressError } = await access.requestSupabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: access.user.id,
          lesson_id: access.lesson.id,
          masterclass_id: access.course.id,
          position_seconds: safePosition,
          progress_percent: progressPercent,
          completed: normalizedStatus === 'completed',
          last_watched_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id,lesson_id' },
      )
      .select('lesson_id, position_seconds, progress_percent, completed, last_watched_at')
      .single();

    if (progressError || !savedProgress) {
      return res.status(503).json({
        error: 'No fue posible guardar tu avance en este momento.',
        code: 'PROGRESS_SAVE_FAILED',
      });
    }

    return res.json({
      success: true,
      progress: [
        {
          lessonId: savedProgress.lesson_id,
          status: savedProgress.completed ? 'completed' : 'in_progress',
          positionSeconds: savedProgress.position_seconds || 0,
          progressPercent: savedProgress.progress_percent || 0,
          lastWatchedAt: savedProgress.last_watched_at,
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

    const { data: signedDownload, error: signedDownloadError } =
      await access.requestSupabase.storage
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
      const [coursesResult, modulesResult, lessonsResult] = await Promise.all([
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
      ]);

      const databaseError = coursesResult.error || modulesResult.error || lessonsResult.error;
      if (databaseError) throw databaseError;

      const modules = modulesResult.data || [];
      const lessons = lessonsResult.data || [];
      const courses = (coursesResult.data || []).map((course: any) => ({
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
              .map((lesson: any) => ({
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
              })),
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
      if (provider === 'cloudflare') {
        const requestHost = (req.get('host') || '').split(':')[0];
        const allowedOrigins = Array.from(new Set([
          'dr-lopez-salud-forte.ai.studio',
          '*.ai.studio',
          requestHost,
        ].filter(Boolean)));

        await cloudflareStreamRequest(`/${encodeURIComponent(assetId)}`, {
          method: 'POST',
          body: JSON.stringify({
            allowedOrigins,
            requireSignedURLs: true,
          }),
        });
      }

      const requestSupabase = getRequestSupabase(req);
      const update = provider === 'none'
        ? { video_provider: 'none', video_asset_id: null, video_external_id: null, updated_at: new Date().toISOString() }
        : provider === 'youtube'
          ? { video_provider: 'youtube', video_asset_id: null, video_external_id: assetId, updated_at: new Date().toISOString() }
          : { video_provider: 'cloudflare', video_asset_id: assetId, video_external_id: null, updated_at: new Date().toISOString() };

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
