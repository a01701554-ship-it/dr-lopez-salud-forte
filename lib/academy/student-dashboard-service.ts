import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  revoked_at?: string | null;
  masterclass: MasterclassData | null;
}

export interface LessonData {
  id: string;
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
  if (!isSupabaseConfigured || !supabase || !userId) {
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

  // 1. Fetch entitlements for user
  const { data: entitlementRows, error: entitlementError } = await supabase
    .from('entitlements')
    .select(`
      id,
      user_id,
      masterclass_id,
      status,
      source,
      granted_at,
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
    console.error('Error fetching entitlements:', entitlementError.message);
    throw entitlementError;
  }

  // Process & deduplicate active entitlements
  const activeEntitlements: EntitlementData[] = [];
  const seenMasterclassIds = new Set<string>();

  if (entitlementRows && Array.isArray(entitlementRows)) {
    for (const row of entitlementRows) {
      if (row.status !== 'active' || row.revoked_at !== null) continue;
      const mcData = Array.isArray(row.masterclasses)
        ? row.masterclasses[0]
        : row.masterclasses;

      if (!mcData || !mcData.id) continue;
      if (seenMasterclassIds.has(row.masterclass_id)) continue;

      seenMasterclassIds.add(row.masterclass_id);
      activeEntitlements.push({
        id: row.id,
        user_id: row.user_id,
        masterclass_id: row.masterclass_id,
        status: row.status,
        source: row.source,
        granted_at: row.granted_at,
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

  // 2. Fetch orders
  const { data: orderRows, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, provider_order_id, payment_status, fulfillment_status, subtotal, shipping, tax, total, currency, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (orderError) {
    console.error('Error fetching orders:', orderError.message);
  }

  const orders: OrderData[] = orderRows || [];

  // If no active entitlements, return empty stats immediately
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

  // 3. Fetch lessons for active masterclasses
  const masterclassIds = activeEntitlements.map((e) => e.masterclass_id);
  const { data: lessonRows, error: lessonError } = await supabase
    .from('lessons')
    .select('id, masterclass_id, title, position, duration_seconds, is_preview, status')
    .in('masterclass_id', masterclassIds)
    .order('position', { ascending: true });

  if (lessonError) {
    console.error('Error fetching lessons:', lessonError.message);
  }

  const lessons: LessonData[] = lessonRows || [];

  // 4. Fetch lesson progress
  const { data: progressRows, error: progressError } = await supabase
    .from('lesson_progress')
    .select('user_id, lesson_id, position_seconds, progress_percent, completed, last_watched_at')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error fetching progress:', progressError.message);
  }

  const progress: LessonProgressData[] = progressRows || [];

  // 5. Calculate statistics in memory
  const activeMasterclassesCount = activeEntitlements.length;

  const totalLessons = lessons.length;
  const completedLessonIds = new Set(
    progress
      .filter((p) => p.completed || p.progress_percent === 100)
      .map((p) => p.lesson_id)
  );

  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const overallProgressPercent =
    totalLessons > 0
      ? Math.min(100, Math.max(0, Math.round((completedCount / totalLessons) * 100)))
      : 0;

  // Calculate programs in progress
  let programsInProgressCount = 0;
  for (const ent of activeEntitlements) {
    const mcLessons = lessons.filter((l) => l.masterclass_id === ent.masterclass_id);
    if (mcLessons.length === 0) continue;

    const mcProgress = progress.filter((p) =>
      mcLessons.some((l) => l.id === p.lesson_id)
    );

    const hasStarted = mcProgress.some((p) => p.progress_percent > 0 || p.completed);
    const mcCompletedCount = mcLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const isFullyCompleted = mcCompletedCount === mcLessons.length;

    if (hasStarted && !isFullyCompleted) {
      programsInProgressCount++;
    }
  }

  // Calculate "Continuar donde lo dejaste"
  let continueItem: ContinueItemData | null = null;
  if (progress.length > 0) {
    // Filter progress belonging to active masterclass lessons
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
            remainingSeconds = Math.max(
              0,
              lesson.duration_seconds - latestProgress.position_seconds
            );
          }

          continueItem = {
            masterclassTitle: ent.masterclass.title,
            masterclassSlug: ent.masterclass.slug,
            lessonTitle: lesson.title,
            lessonId: lesson.id,
            lessonPosition: lesson.position,
            progressPercent: latestProgress.progress_percent || 0,
            remainingSeconds,
            lastWatchedAt: latestProgress.last_watched_at,
          };
        }
      }
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
