import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_COURSES } from '@/lib/academy/db';

export interface MasterclassData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  short_description?: string | null;
  category?: string | null;
  access_type?: string | null;
  cover_image?: string | null;
  status?: string | null;
  published_at?: string | null;
}

export interface EntitlementData {
  id: string;
  user_id: string;
  masterclass_id: string;
  status: string;
  source?: string | null;
  granted_at: string;
  expires_at?: string | null;
  revoked_at?: string | null;
  masterclass: MasterclassData | null;
}

export interface LessonData {
  id: string;
  slug: string;
  masterclass_id: string;
  title: string;
  position: number;
  duration_seconds: number | null;
  is_preview?: boolean | null;
  status?: string | null;
}

export interface LessonProgressData {
  user_id: string;
  lesson_id: string;
  position_seconds: number;
  progress_percent: number;
  completed: boolean;
  last_watched_at: string;
}

export interface OrderData {
  id: string;
  user_id: string;
  provider_order_id?: string | null;
  payment_status: string;
  fulfillment_status?: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at?: string | null;
}

export interface ContinueItemData {
  masterclassTitle: string;
  masterclassSlug: string;
  lessonTitle: string;
  lessonId: string;
  lessonSlug: string;
  lessonPosition: number;
  progressPercent: number;
  remainingSeconds: number | null;
  lastWatchedAt: string;
}

export interface StudentDashboardData {
  activeMasterclassesCount: number;
  overallProgressPercent: number;
  programsInProgressCount: number;
  registeredOrdersCount: number;
  activeEntitlements: EntitlementData[];
  lessons: LessonData[];
  progress: LessonProgressData[];
  orders: OrderData[];
  continueItem: ContinueItemData | null;
}

export async function fetchStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  if (!userId) {
    return {
      activeMasterclassesCount: 0,
      overallProgressPercent: 0,
      programsInProgressCount: 0,
      registeredOrdersCount: 0,
      activeEntitlements: [],
      lessons: [],
      progress: [],
      orders: [],
      continueItem: null,
    };
  }

  const activeEntitlements: EntitlementData[] = [];
  const seenMasterclassIds = new Set<string>();
  const serverCourseProgressMap = new Map<string, { percent: number; completedCount: number; totalCount: number; lastLessonId: string | null }>();

  // 1. Intento primario: Consultar entitlements en Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: entitlementRows, error: entitlementError } = await supabase
        .from('entitlements')
        .select(`
          id,
          user_id,
          masterclass_id,
          status,
          source,
          granted_at,
          expires_at,
          revoked_at,
          masterclasses:masterclass_id (
            id,
            slug,
            title,
            subtitle,
            short_description,
            category,
            access_type,
            cover_image,
            status,
            published_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .is('revoked_at', null);

      if (entitlementError) {
        console.warn('[DashboardService] Supabase entitlements lookup note:', entitlementError.message);
      } else if (entitlementRows && Array.isArray(entitlementRows)) {
        // Collect missing masterclass IDs to fetch in bulk if join was empty
        const missingMcIds = entitlementRows
          .filter(r => !r.masterclasses || (Array.isArray(r.masterclasses) && r.masterclasses.length === 0))
          .map(r => r.masterclass_id);

        let directMasterclassesMap = new Map<string, any>();
        if (missingMcIds.length > 0) {
          try {
            const { data: directMcs } = await supabase
              .from('masterclasses')
              .select('id, slug, title, subtitle, short_description, category, access_type, cover_image, status, published_at')
              .in('id', missingMcIds);

            if (directMcs) {
              for (const dmc of directMcs) {
                directMasterclassesMap.set(dmc.id, dmc);
              }
            }
          } catch {
            // Non-blocking
          }
        }

        for (const row of entitlementRows) {
          const expirationTime = row.expires_at ? new Date(row.expires_at).getTime() : null;
          const isExpired = expirationTime !== null && (!Number.isFinite(expirationTime) || expirationTime <= Date.now());
          if (row.status !== 'active' || row.revoked_at !== null || isExpired) continue;

          let mcData = Array.isArray(row.masterclasses) ? row.masterclasses[0] : row.masterclasses;
          if (!mcData && directMasterclassesMap.has(row.masterclass_id)) {
            mcData = directMasterclassesMap.get(row.masterclass_id);
          }

          // Si masterclasses no vino en el join ni en el directo, buscar en INITIAL_COURSES por id o slug
          if (!mcData || !mcData.id) {
            const matchedLocal = INITIAL_COURSES.find((c) => c.id === row.masterclass_id || c.slug === row.masterclass_id);
            if (matchedLocal) {
              mcData = {
                id: matchedLocal.id,
                slug: matchedLocal.slug,
                title: matchedLocal.title,
                subtitle: matchedLocal.subtitle,
                short_description: matchedLocal.shortDescription,
                category: matchedLocal.categoryLabel,
                access_type: matchedLocal.accessType,
                cover_image: matchedLocal.coverImage || matchedLocal.image,
                status: 'published',
                published_at: new Date().toISOString(),
              };
            }
          }

          if (!mcData || !mcData.id) continue;

          // Filtrar curso de prueba técnica
          if (
            mcData.slug === 'prueba-cloudflare-stream' ||
            mcData.id === 'dceb181c-ab53-476b-8d50-ee5fabc9c265' ||
            mcData.title?.toLowerCase().includes('prueba de cloudflare')
          ) {
            continue;
          }

          if (seenMasterclassIds.has(row.masterclass_id) || (mcData.slug && seenMasterclassIds.has(mcData.slug))) continue;

          seenMasterclassIds.add(row.masterclass_id);
          if (mcData.slug) seenMasterclassIds.add(mcData.slug);

          activeEntitlements.push({
            id: row.id,
            user_id: row.user_id,
            masterclass_id: row.masterclass_id,
            status: row.status,
            source: row.source,
            granted_at: row.granted_at,
            expires_at: row.expires_at,
            revoked_at: row.revoked_at,
            masterclass: {
              id: mcData.id,
              slug: mcData.slug,
              title: mcData.title,
              subtitle: mcData.subtitle,
              short_description: mcData.short_description,
              category: mcData.category,
              access_type: mcData.access_type,
              cover_image: mcData.cover_image,
              status: mcData.status,
              published_at: mcData.published_at,
            },
          });
        }
      }
    } catch (e) {
      console.warn('[DashboardService] Supabase entitlement query exception:', e);
    }
  }

  // 2. Sincronizar SIEMPRE con el servidor /api/academia/my-library (maneja roles, sesiones, memoria y Supabase)
  try {
    let authHeader: Record<string, string> = {};
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader = { Authorization: `Bearer ${session.access_token}` };
      }
    }

    const res = await fetch('/api/academia/my-library', {
      headers: authHeader,
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      const items = json.library || json.courses || [];
      for (const item of items) {
        const c = item.course;
        if (!c || !c.id) continue;
        if (c.slug === 'prueba-cloudflare-stream' || c.title?.toLowerCase().includes('prueba de cloudflare')) continue;

        if (item.progress) {
          serverCourseProgressMap.set(c.id, item.progress);
        }

        if (!seenMasterclassIds.has(c.id)) {
          seenMasterclassIds.add(c.id);
          activeEntitlements.push({
            id: item.entitlementId || `ent_${c.id}`,
            user_id: userId,
            masterclass_id: c.id,
            status: 'active',
            source: 'free_enrollment',
            granted_at: item.grantedAt || new Date().toISOString(),
            expires_at: null,
            revoked_at: null,
            masterclass: {
              id: c.id,
              slug: c.slug,
              title: c.title,
              subtitle: c.subtitle || '',
              short_description: c.subtitle || '',
              category: c.categoryLabel || 'Educación Médica',
              access_type: 'free',
              cover_image: c.coverImage || c.image,
              status: 'published',
              published_at: new Date().toISOString(),
            },
          });
        }
      }
    }
  } catch (syncErr) {
    console.warn('[DashboardService] Library server endpoint sync error:', syncErr);
  }

  // 3. Consultar pedidos del usuario
  let orders: OrderData[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: orderRows, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, provider_order_id, payment_status, fulfillment_status, subtotal, shipping, tax, total, currency, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!orderError && orderRows) {
        orders = orderRows;
      }
    } catch {
      // Ignorar error no crítico
    }
  }

  // Si no hay cursos adquiridos/inscritos
  if (activeEntitlements.length === 0) {
    return {
      activeMasterclassesCount: 0,
      overallProgressPercent: 0,
      programsInProgressCount: 0,
      registeredOrdersCount: orders.length,
      activeEntitlements: [],
      lessons: [],
      progress: [],
      orders,
      continueItem: null,
    };
  }

  // 4. Obtener lecciones de las masterclasses activas (desde Supabase con fallback a INITIAL_COURSES)
  const masterclassIds = activeEntitlements.map((e) => e.masterclass_id);
  const lessons: LessonData[] = [];
  const supaLessonIdToLocalLessonMap = new Map<string, string>();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: lessonRows, error: lessonError } = await supabase
        .from('lessons')
        .select('id, slug, masterclass_id, title, position, duration_seconds, is_preview, status')
        .in('masterclass_id', masterclassIds)
        .order('position', { ascending: true });

      if (!lessonError && lessonRows && lessonRows.length > 0) {
        lessons.push(...lessonRows);
        for (const sl of lessonRows) {
          supaLessonIdToLocalLessonMap.set(sl.id, sl.slug || sl.id);
        }
      }
    } catch {
      // Fallback a INITIAL_COURSES
    }
  }

  // Completar lecciones desde INITIAL_COURSES para cualquier masterclass sin filas completas en Supabase
  for (const ent of activeEntitlements) {
    const hasLessons = lessons.some((l) => l.masterclass_id === ent.masterclass_id || (ent.masterclass?.id && l.masterclass_id === ent.masterclass.id));
    if (!hasLessons) {
      const localCourse = INITIAL_COURSES.find(
        (c) => c.id === ent.masterclass_id || c.slug === ent.masterclass?.slug || c.id === ent.masterclass?.id
      );
      if (localCourse?.modules) {
        let globalPos = 1;
        for (const mod of localCourse.modules) {
          for (const les of mod.lessons) {
            lessons.push({
              id: les.id,
              slug: les.slug,
              masterclass_id: ent.masterclass_id,
              title: les.title,
              position: les.position || globalPos++,
              duration_seconds: les.durationSeconds || null,
              is_preview: les.isPreview,
              status: 'published',
            });
          }
        }
      }
    }
  }

  // 5. Obtener progreso de lecciones (desde Supabase con soporte a memoria y localStorage)
  const progress: LessonProgressData[] = [];
  const progressMapByLesson = new Map<string, LessonProgressData>();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: progressRows, error: progressError } = await supabase
        .from('lesson_progress')
        .select('user_id, lesson_id, position_seconds, progress_percent, completed, last_watched_at')
        .eq('user_id', userId);

      if (!progressError && progressRows) {
        for (const p of progressRows) {
          const isDone = p.completed || p.progress_percent === 100;
          const mappedProg: LessonProgressData = {
            user_id: p.user_id,
            lesson_id: p.lesson_id,
            position_seconds: p.position_seconds || 0,
            progress_percent: isDone ? 100 : (p.progress_percent || 0),
            completed: isDone,
            last_watched_at: p.last_watched_at || new Date().toISOString(),
          };
          progressMapByLesson.set(p.lesson_id, mappedProg);

          // Mapear también por slug o ID local
          const mappedSlug = supaLessonIdToLocalLessonMap.get(p.lesson_id);
          if (mappedSlug) {
            progressMapByLesson.set(mappedSlug, mappedProg);
          }
        }
      }
    } catch {
      // Ignorar error de red
    }
  }

  // Complementar con progreso del servidor si alguna lección venía en el resumen de biblioteca
  for (const ent of activeEntitlements) {
    const serverProg = serverCourseProgressMap.get(ent.masterclass_id) || (ent.masterclass?.id ? serverCourseProgressMap.get(ent.masterclass.id) : undefined);
    if (serverProg && serverProg.completedCount > 0) {
      const mcLessons = lessons.filter((l) => l.masterclass_id === ent.masterclass_id || (ent.masterclass?.id && l.masterclass_id === ent.masterclass.id));
      for (let i = 0; i < Math.min(serverProg.completedCount, mcLessons.length); i++) {
        const les = mcLessons[i];
        if (!progressMapByLesson.has(les.id) && !progressMapByLesson.has(les.slug)) {
          const autoProg: LessonProgressData = {
            user_id: userId,
            lesson_id: les.id,
            position_seconds: les.duration_seconds || 0,
            progress_percent: 100,
            completed: true,
            last_watched_at: new Date().toISOString(),
          };
          progressMapByLesson.set(les.id, autoProg);
          progressMapByLesson.set(les.slug, autoProg);
        }
      }
    }
  }

  // Leer avances cacheados en localStorage del navegador
  if (typeof window !== 'undefined') {
    try {
      for (const les of lessons) {
        const keysToCheck = [
          `salud_forte_lesson_progress_${userId}_${les.id}`,
          `salud_forte_lesson_progress_${userId}_${les.slug}`,
          `salud_forte_lesson_completed_${les.id}`,
          `salud_forte_lesson_completed_${les.slug}`,
        ];

        for (const k of keysToCheck) {
          const localVal = localStorage.getItem(k);
          if (localVal) {
            try {
              const parsed = JSON.parse(localVal);
              const isDone = parsed.completed === true || parsed.progressPercent === 100 || parsed.status === 'completed' || localVal === 'true';
              if (isDone) {
                const lp: LessonProgressData = {
                  user_id: userId,
                  lesson_id: les.id,
                  position_seconds: parsed.positionSeconds || (les.duration_seconds || 0),
                  progress_percent: 100,
                  completed: true,
                  last_watched_at: parsed.lastWatchedAt || new Date().toISOString(),
                };
                progressMapByLesson.set(les.id, lp);
                progressMapByLesson.set(les.slug, lp);
                break;
              } else if (parsed.positionSeconds || parsed.progressPercent) {
                if (!progressMapByLesson.has(les.id) && !progressMapByLesson.has(les.slug)) {
                  const lp: LessonProgressData = {
                    user_id: userId,
                    lesson_id: les.id,
                    position_seconds: parsed.positionSeconds || 0,
                    progress_percent: parsed.progressPercent || 0,
                    completed: false,
                    last_watched_at: parsed.lastWatchedAt || new Date().toISOString(),
                  };
                  progressMapByLesson.set(les.id, lp);
                  progressMapByLesson.set(les.slug, lp);
                }
              }
            } catch {
              if (localVal === 'true' || localVal === 'completed') {
                const lp: LessonProgressData = {
                  user_id: userId,
                  lesson_id: les.id,
                  position_seconds: les.duration_seconds || 0,
                  progress_percent: 100,
                  completed: true,
                  last_watched_at: new Date().toISOString(),
                };
                progressMapByLesson.set(les.id, lp);
                progressMapByLesson.set(les.slug, lp);
              }
            }
          }
        }
      }
    } catch {
      // Non-blocking
    }
  }

  for (const prog of progressMapByLesson.values()) {
    progress.push(prog);
  }

  // 6. Cálculo de estadísticas consolidadas
  const activeMasterclassesCount = activeEntitlements.length;
  const totalLessons = lessons.length;
  
  const isLessonDone = (l: LessonData) => {
    const p1 = progressMapByLesson.get(l.id);
    const p2 = progressMapByLesson.get(l.slug);
    return (p1 && (p1.completed || p1.progress_percent === 100)) || (p2 && (p2.completed || p2.progress_percent === 100));
  };

  const completedCount = lessons.filter(isLessonDone).length;
  const overallProgressPercent =
    totalLessons > 0
      ? Math.min(100, Math.max(0, Math.round((completedCount / totalLessons) * 100)))
      : 0;

  // Programas en progreso
  let programsInProgressCount = 0;
  for (const ent of activeEntitlements) {
    const mcLessons = lessons.filter((l) => l.masterclass_id === ent.masterclass_id || (ent.masterclass?.id && l.masterclass_id === ent.masterclass.id));
    if (mcLessons.length === 0) continue;

    const mcCompletedCount = mcLessons.filter(isLessonDone).length;
    const hasStarted = mcLessons.some((l) => {
      const p = progressMapByLesson.get(l.id) || progressMapByLesson.get(l.slug);
      return p && (p.progress_percent > 0 || p.completed);
    });
    const isFullyCompleted = mcCompletedCount === mcLessons.length && mcLessons.length > 0;

    if (hasStarted && !isFullyCompleted) {
      programsInProgressCount++;
    }
  }

  // Calcular "Continuar donde lo dejaste"
  let continueItem: ContinueItemData | null = null;
  const validProgress = progress
    .filter((p) => {
      const lesson = lessons.find((l) => l.id === p.lesson_id);
      if (!lesson) return false;
      return activeEntitlements.some((e) => e.masterclass_id === lesson.masterclass_id);
    })
    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime());

  if (validProgress.length > 0) {
    const latestProgress = validProgress[0];
    const lesson = lessons.find((l) => l.id === latestProgress.lesson_id);
    if (lesson) {
      const ent = activeEntitlements.find((e) => e.masterclass_id === lesson.masterclass_id);
      if (ent && ent.masterclass) {
        let remainingSeconds: number | null = null;
        if (
          typeof lesson.duration_seconds === 'number' &&
          typeof latestProgress.position_seconds === 'number'
        ) {
          remainingSeconds = Math.max(0, lesson.duration_seconds - latestProgress.position_seconds);
        }

        continueItem = {
          masterclassTitle: ent.masterclass.title,
          masterclassSlug: ent.masterclass.slug,
          lessonTitle: lesson.title,
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          lessonPosition: lesson.position,
          progressPercent: latestProgress.progress_percent || 0,
          remainingSeconds,
          lastWatchedAt: latestProgress.last_watched_at,
        };
      }
    }
  } else if (activeEntitlements.length > 0 && lessons.length > 0) {
    // Si no ha empezado ninguna lección aún, sugerir la primera lección de su primera masterclass
    const firstEnt = activeEntitlements[0];
    const firstLesson = lessons.find((l) => l.masterclass_id === firstEnt.masterclass_id);
    if (firstEnt.masterclass && firstLesson) {
      continueItem = {
        masterclassTitle: firstEnt.masterclass.title,
        masterclassSlug: firstEnt.masterclass.slug,
        lessonTitle: firstLesson.title,
        lessonId: firstLesson.id,
        lessonSlug: firstLesson.slug,
        lessonPosition: firstLesson.position || 1,
        progressPercent: 0,
        remainingSeconds: firstLesson.duration_seconds || null,
        lastWatchedAt: new Date().toISOString(),
      };
    }
  }

  return {
    activeMasterclassesCount,
    overallProgressPercent,
    programsInProgressCount,
    registeredOrdersCount: orders.length,
    activeEntitlements,
    lessons,
    progress,
    orders,
    continueItem,
  };
}
