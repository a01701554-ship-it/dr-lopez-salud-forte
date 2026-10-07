'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/site/container';
import { useAuth } from '@/lib/auth/auth-context';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Key,
  Plus,
  Edit2,
  Trash2,
  Video,
  ExternalLink,
  Calendar,
  MessageCircle,
  Mail,
  BarChart3,
  Search,
  Filter,
  Eye,
  Check,
  Clock,
  Sparkles,
  Lock,
  FileText,
  Download,
  UserCheck,
  UserX,
  Award,
  TrendingUp,
  UserPlus,
  Info,
  Copy,
  PlaySquare,
} from 'lucide-react';
import { ManageLessonAttachmentsModal } from '@/components/academy/ManageLessonAttachmentsModal';
import { TestimonialsAdminPanel } from '@/components/admin/testimonials-admin-panel';
import { AccountHeader } from '@/components/account/account-nav';

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  categoryLabel?: string;
  durationMinutes?: number;
  lessonCount?: number;
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      durationSeconds: number;
      isPreview?: boolean;
      videoProvider?: 'youtube' | 'cloudflare';
      videoAssetId?: string;
      videoExternalId?: string;
      videoUrl?: string;
      summary?: string;
      attachmentsCount?: number;
      attachments?: Array<{
        id: string;
        title: string;
        fileSizeLabel?: string;
        position: number;
        status: string;
      }>;
    }>;
  }>;
}

interface CloudflareVideo {
  uid: string;
  name: string;
  durationSeconds: number;
  createdAt: string | null;
  readyToStream: boolean;
  status: string;
  thumbnail: string | null;
}

interface Student {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  status?: string;
  email_verified: boolean;
  email_verified_at?: string;
  marketing_consent: boolean;
  marketing_consent_at?: string | null;
  marketing_opted_out_at?: string | null;
  marketing_consent_source?: string;
  marketing_consent_version?: string;
  privacy_policy_version?: string;
  terms_accepted_at?: string;
  created_at: string;
  last_login_at?: string | null;
  userType?: 'registered' | 'student' | 'active_student';
  courseProgressStatus?: 'not_started' | 'in_progress' | 'completed';
  overallProgressPercent?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  marketingStatus?: 'accepted' | 'not_granted' | 'revoked';
  activeEntitlementsCount?: number;
  enrolledCoursesCount: number;
  enrolledCourses: Array<{
    entitlementId?: string;
    courseId: string;
    courseTitle: string;
    status: string;
    grantedAt: string;
    completedLessons?: number;
    totalLessons?: number;
    progressPercent?: number;
  }>;
}

interface AdminAcademiaPageProps {
  embeddedInAccount?: boolean;
}

export default function AdminAcademiaPage({ embeddedInAccount = false }: AdminAcademiaPageProps) {
  const { user, profile, isInstructor, isAdmin, isLoading: authLoading, fetchWithAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'cursos' | 'alumnos' | 'metricas' | 'agenda' | 'webhooks' | 'testimonios'>('cursos');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cloudflareVideos, setCloudflareVideos] = useState<CloudflareVideo[]>([]);
  const [videoLibraryError, setVideoLibraryError] = useState('');
  const [configuringLesson, setConfiguringLesson] = useState<{
    courseSlug: string;
    id: string;
    slug: string;
    title: string;
    videoProvider?: 'youtube' | 'cloudflare';
    videoAssetId?: string;
    videoExternalId?: string;
  } | null>(null);
  const [selectedVideoProvider, setSelectedVideoProvider] = useState<'cloudflare' | 'youtube' | 'none'>('cloudflare');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);

  // Lesson PDF Attachments State
  const [attachmentsLesson, setAttachmentsLesson] = useState<{
    courseTitle: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonNumber?: number;
  } | null>(null);

  // Search, Filter & Directory Management State
  const [studentSearch, setStudentSearch] = useState('');
  const [marketingOnly, setMarketingOnly] = useState(false);
  const [selectedUserTypeFilter, setSelectedUserTypeFilter] = useState<string>('all');
  const [selectedMarketingFilter, setSelectedMarketingFilter] = useState<string>('all');
  const [selectedVerifiedFilter, setSelectedVerifiedFilter] = useState<string>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [directoryStats, setDirectoryStats] = useState<{
    totalCount: number;
    registeredOnlyCount: number;
    studentCount: number;
    activeStudentCount: number;
    inProgressCount: number;
    completedCount: number;
    marketingAcceptedCount: number;
    transactionalOnlyCount: number;
    revokedCount: number;
  } | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [copiedMarketing, setCopiedMarketing] = useState(false);

  // New Course Modal / State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Ginecología & Salud Femenina');

  // New Lesson / YouTube State
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<Course | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [youtubePreview, setYoutubePreview] = useState<any>(null);
  const [validatingYt, setValidatingYt] = useState(false);

  // Grant Course State
  const [grantEmail, setGrantEmail] = useState('');
  const [grantCourseId, setGrantCourseId] = useState('');

  // Webhook simulation state
  const [simEmail, setSimEmail] = useState('alumno.prueba@saludforte.com');
  const [simOrder, setSimOrder] = useState('#SHOP-5520');
  const [simVariant, setSimVariant] = useState('gid://shopify/ProductVariant/420011223344');
  const [meetingPlatform, setMeetingPlatform] = useState<'google-meet' | 'zoom'>('google-meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingCopied, setMeetingCopied] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappSending, setWhatsappSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch courses
      const cRes = await fetchWithAuth('/api/admin/academy/catalog');
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
        if (cData.courses?.length > 0 && !grantCourseId) {
          setGrantCourseId(cData.courses[0].id);
        }
      }

      const vRes = await fetchWithAuth('/api/admin/cloudflare/videos');
      if (vRes.ok) {
        const vData = await vRes.json();
        setCloudflareVideos(vData.videos || []);
        setVideoLibraryError('');
      } else {
        const vData = await vRes.json().catch(() => ({}));
        setVideoLibraryError(vData.error || 'No fue posible consultar la biblioteca de Cloudflare Stream.');
      }

      // 2. Fetch students
      const sRes = await fetchWithAuth('/api/admin/students');
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudents(sData.students || []);
        if (sData.totalCount !== undefined) {
          setDirectoryStats({
            totalCount: sData.totalCount,
            registeredOnlyCount: sData.registeredOnlyCount ?? 0,
            studentCount: sData.studentCount ?? 0,
            activeStudentCount: sData.activeStudentCount ?? 0,
            inProgressCount: sData.inProgressCount ?? 0,
            completedCount: sData.completedCount ?? 0,
            marketingAcceptedCount: sData.marketingAcceptedCount ?? 0,
            transactionalOnlyCount: sData.transactionalOnlyCount ?? 0,
            revokedCount: sData.revokedCount ?? 0,
          });
        }
      }

      // 3. Fetch metrics
      const mRes = await fetchWithAuth('/api/admin/metrics');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const openVideoConfiguration = (courseSlug: string, lesson: NonNullable<Course['modules']>[number]['lessons'][number]) => {
    setConfiguringLesson({ courseSlug, ...lesson });
    const provider = lesson.videoProvider === 'youtube' ? 'youtube' : 'cloudflare';
    setSelectedVideoProvider(provider);
    setSelectedVideoId(provider === 'youtube' ? (lesson.videoExternalId || '') : (lesson.videoAssetId || ''));
  };

  const handleSaveLessonVideo = async () => {
    if (!configuringLesson) return;
    if (selectedVideoProvider !== 'none' && !selectedVideoId.trim()) {
      setFeedback({ type: 'error', message: 'Selecciona un video antes de guardar.' });
      return;
    }

    setSavingVideo(true);
    try {
      const res = await fetchWithAuth(`/api/admin/academy/lessons/${configuringLesson.id}/video`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedVideoProvider,
          videoAssetId: selectedVideoProvider === 'none' ? '' : selectedVideoId.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No fue posible guardar el video.');

      setFeedback({
        type: 'success',
        message: selectedVideoProvider === 'none'
          ? `Se quitó el video de “${configuringLesson.title}”.`
          : `Video configurado correctamente en “${configuringLesson.title}”.`,
      });
      setConfiguringLesson(null);
      await fetchData();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message || 'No fue posible guardar el video.' });
    } finally {
      setSavingVideo(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  useEffect(() => {
    if (activeTab !== 'agenda' || authLoading) return;
    let cancelled = false;
    setMeetingLoading(true);
    fetchWithAuth('/api/admin/meeting-settings')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'No fue posible cargar la liga de telemedicina.');
        if (!cancelled) {
          setMeetingPlatform(data.settings?.platform === 'zoom' ? 'zoom' : 'google-meet');
          setMeetingUrl(data.settings?.url || '');
        }
      })
      .catch((error) => {
        if (!cancelled) setFeedback({ type: 'error', message: error?.message || 'No fue posible cargar la liga de telemedicina.' });
      })
      .finally(() => {
        if (!cancelled) setMeetingLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, authLoading]);

  const handleSaveMeeting = async () => {
    if (!meetingUrl.trim()) {
      setFeedback({ type: 'error', message: 'Ingresa la liga de Google Meet o Zoom.' });
      return;
    }
    setMeetingSaving(true);
    try {
      const res = await fetchWithAuth('/api/admin/meeting-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: meetingPlatform, url: meetingUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No fue posible guardar la liga.');
      setMeetingUrl(data.settings?.url || meetingUrl.trim());
      setFeedback({ type: 'success', message: 'Liga de telemedicina guardada correctamente.' });
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message || 'No fue posible guardar la liga.' });
    } finally {
      setMeetingSaving(false);
    }
  };

  const handleCopyMeeting = async () => {
    if (!meetingUrl.trim()) return;
    await navigator.clipboard.writeText(meetingUrl.trim());
    setMeetingCopied(true);
    window.setTimeout(() => setMeetingCopied(false), 1800);
  };

  const handleSendWhatsapp = async () => {
    if (!whatsappPhone.trim() || !whatsappMessage.trim()) {
      setFeedback({ type: 'error', message: 'Ingresa el teléfono y el mensaje que deseas enviar.' });
      return;
    }
    setWhatsappSending(true);
    try {
      const res = await fetchWithAuth('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: whatsappPhone.trim(), message: whatsappMessage.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No fue posible enviar el mensaje.');
      setWhatsappMessage('');
      setFeedback({ type: 'success', message: 'Mensaje enviado correctamente por WhatsApp Business.' });
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message || 'No fue posible enviar el mensaje.' });
    } finally {
      setWhatsappSending(false);
    }
  };

  // YouTube URL Validation & Parsing
  const handleValidateYouTube = async (url: string) => {
    setNewLessonUrl(url);
    if (!url.trim()) {
      setYoutubePreview(null);
      return;
    }

    setValidatingYt(true);
    try {
      const res = await fetchWithAuth('/api/admin/youtube/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setYoutubePreview(data);
      } else {
        setYoutubePreview({ error: data.error || 'URL no válida' });
      }
    } catch (e) {
      setYoutubePreview({ error: 'Error al verificar enlace' });
    } finally {
      setValidatingYt(false);
    }
  };

  // Create Course Action
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;

    const slug = newCourseSlug || newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const res = await fetchWithAuth('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          subtitle: newCourseSubtitle,
          slug,
          categoryLabel: newCourseCategory,
          shopifyProductGid: `gid://shopify/Product/manual_${Date.now()}`,
          shopifyVariantGid: `gid://shopify/ProductVariant/manual_${Date.now()}`,
        }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Masterclass "${newCourseTitle}" creada con éxito.` });
        setShowCourseModal(false);
        setNewCourseTitle('');
        setNewCourseSubtitle('');
        setNewCourseSlug('');
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Create Lesson Action
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLesson || !selectedModuleId || !newLessonTitle) return;

    try {
      const res = await fetchWithAuth(`/api/admin/courses/${selectedCourseForLesson.id}/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLessonTitle,
          videoUrl: newLessonUrl,
          durationSeconds: newLessonDuration * 60,
          isPreview: newLessonIsPreview,
          videoProvider: 'youtube',
          videoExternalId: youtubePreview?.videoId || '',
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `Lección "${newLessonTitle}" agregada con éxito.` });
        setShowLessonModal(false);
        setNewLessonTitle('');
        setNewLessonUrl('');
        setYoutubePreview(null);
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Grant Course Action
  const handleGrantCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail || !grantCourseId) return;

    try {
      const res = await fetchWithAuth('/api/admin/students/grant-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: grantEmail,
          courseId: grantCourseId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        setGrantEmail('');
        await fetchData();
      } else {
        setFeedback({ type: 'error', message: data.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Simulate Webhook Action
  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch('/api/admin/academia/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: 'orders/paid',
          orderNumber: simOrder,
          customerEmail: simEmail,
          courseVariantGid: simVariant,
        }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Webhook de compra simulado para ${simEmail}.` });
        await fetchData();
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleExportMarketingCSV = () => {
    // Strictly filter users who have explicit affirmative marketing consent
    const marketingSubscribers = students.filter(
      (s) => s.marketing_consent && (s.marketingStatus === 'accepted' || s.marketingStatus === undefined)
    );

    if (marketingSubscribers.length === 0) {
      setFeedback({
        type: 'error',
        message: 'No existen alumnos con consentimiento explícito de marketing para exportar.',
      });
      return;
    }

    const headers = [
      'ID',
      'Nombre Completo',
      'Correo Electrónico',
      'Teléfono',
      'Tipo de Usuario',
      'Correo Verificado',
      'Consentimiento Marketing',
      'Fecha Consentimiento',
      'Origen Consentimiento',
      'Versión Política',
      'Cursos Inscritos',
    ];

    const rows = marketingSubscribers.map((s) => [
      `"${s.id}"`,
      `"${(s.full_name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${s.userType === 'registered' ? 'Registrado' : s.userType === 'active_student' ? 'Alumno Activo' : 'Alumno'}"`,
      `"${s.email_verified ? 'SÍ' : 'NO'}"`,
      `"ACEPTADO"`,
      `"${s.marketing_consent_at || s.created_at || ''}"`,
      `"${s.marketing_consent_source || 'formulario_registro'}"`,
      `"${s.marketing_consent_version || 'v1.0'}"`,
      `"${(s.enrolledCourses || []).map((c) => c.courseTitle).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nowStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `suscriptores_marketing_saludforte_${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'success',
      message: `Se exportaron exitosamente ${marketingSubscribers.length} contactos con consentimiento verificado de marketing.`,
    });
  };

  const handleCopyMarketingEmails = () => {
    const emails = students
      .filter((s) => s.marketing_consent && (s.marketingStatus === 'accepted' || s.marketingStatus === undefined))
      .map((s) => s.email)
      .filter(Boolean);

    if (emails.length === 0) {
      setFeedback({ type: 'error', message: 'No hay correos con consentimiento de marketing.' });
      return;
    }

    navigator.clipboard.writeText(emails.join(', '));
    setCopiedMarketing(true);
    setTimeout(() => setCopiedMarketing(false), 3000);
    setFeedback({
      type: 'success',
      message: `Se copiaron ${emails.length} correos autorizados al portapapeles.`,
    });
  };

  const filteredStudents = students.filter((s) => {
    // 1. Search Query (name, email, phone)
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = (s.full_name || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      const matchPhone = (s.phone || '').includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    // 2. User Type Filter
    if (selectedUserTypeFilter !== 'all') {
      if (selectedUserTypeFilter === 'registered') {
        if (s.enrolledCoursesCount > 0) return false;
      } else if (selectedUserTypeFilter === 'student') {
        if (s.enrolledCoursesCount === 0) return false;
      } else if (selectedUserTypeFilter === 'active_student') {
        if (s.userType !== 'active_student' && (s.activeEntitlementsCount || 0) === 0) return false;
      } else if (selectedUserTypeFilter === 'in_progress') {
        if (s.courseProgressStatus !== 'in_progress') return false;
      } else if (selectedUserTypeFilter === 'completed') {
        if (s.courseProgressStatus !== 'completed') return false;
      }
    }

    // 3. Marketing Status Filter
    if (selectedMarketingFilter !== 'all') {
      if (selectedMarketingFilter === 'accepted') {
        if (!s.marketing_consent) return false;
      } else if (selectedMarketingFilter === 'not_granted') {
        if (s.marketing_consent || s.marketingStatus === 'revoked') return false;
      } else if (selectedMarketingFilter === 'revoked') {
        if (s.marketingStatus !== 'revoked') return false;
      }
    } else if (marketingOnly) {
      if (!s.marketing_consent) return false;
    }

    // 4. Email Verified Filter
    if (selectedVerifiedFilter !== 'all') {
      const isVer = selectedVerifiedFilter === 'true';
      if (s.email_verified !== isVer) return false;
    }

    // 5. Course Filter
    if (selectedCourseFilter !== 'all') {
      if (!s.enrolledCourses?.some((c) => c.courseId === selectedCourseFilter)) return false;
    }

    return true;
  });

  const isAuthorized = Boolean(
    isInstructor ||
    isAdmin ||
    profile?.role === 'INSTRUCTOR' ||
    profile?.role === 'ADMIN'
  );

  if (!authLoading && !isAuthorized) {
    return (
      <div className="bg-[#F9F7F2] min-h-screen text-obsidian pb-20">
        <AccountHeader currentTab="resumen" />
        <Container className="max-w-[800px] mx-auto px-5 sm:px-8 mt-12">
          <div className="bg-white rounded-3xl p-8 border border-red-200 text-center shadow-xs">
            <div className="size-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="size-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-obsidian mb-2">
              Acceso Restringido
            </h2>
            <p className="text-sm text-obsidian/75 max-w-md mx-auto mb-6">
              El Panel del Instructor está reservado exclusivamente para cuentas docentes y administrativas autorizadas (Dr. Mauricio Galindo).
            </p>
            <a
              href="/mi-cuenta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-all shadow-xs"
            >
              Volver a Mi Cuenta
            </a>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F7F2] min-h-screen text-obsidian pb-20">
      {/* Account Navigation Header */}
      <AccountHeader currentTab="instructor" />

      {/* Instructor Sub-Header / Control Toolbar */}
      <section className="py-6 border-b border-[#B39A6A]/20 bg-white">
        <Container className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian text-champagne text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                <ShieldCheck className="size-3.5 text-champagne" />
                <span>Panel Oficial del Instructor · Dr. Mauricio Benjamín Galindo López</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-obsidian font-bold tracking-tight">
                Centro de Mando Académico & Gestión
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-obsidian/70">
                Control de masterclasses, videos, directorio médico de alumnos, consentimientos y métricas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-obsidian/20 text-xs font-semibold hover:bg-obsidian hover:text-white transition-all bg-white shadow-xs cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`mt-4 p-4 rounded-xl text-xs flex items-center justify-between ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs font-semibold opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-[#B39A6A]/20 pb-0 no-scrollbar">
            {[
              { id: 'cursos', label: 'Cursos & Videos', icon: Video },
              { id: 'alumnos', label: 'Directorio de Alumnos & Consentimiento', icon: Users },
              { id: 'metricas', label: 'Métricas & Auditoría', icon: BarChart3 },
              { id: 'agenda', label: 'Agenda Google & WhatsApp', icon: Calendar },
              { id: 'webhooks', label: 'Simulador de Webhooks', icon: Key },
              { id: 'testimonios', label: 'Testimonios en Video', icon: PlaySquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-champagne text-obsidian font-bold'
                      : 'border-transparent text-obsidian/60 hover:text-obsidian'
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-champagne' : 'text-obsidian/40'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <Container className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-8">
        {/* ==================================================================== */}
        {/* TAB 1: CURSOS & LECCIONES YOUTUBE                                    */}
        {/* ==================================================================== */}
        {activeTab === 'cursos' && (
          <div className="space-y-8">
            {/* Header with Create Course Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
              <div>
                <h2 className="text-lg font-serif font-bold text-obsidian">Catálogo de Masterclasses Publicadas</h2>
                <p className="text-xs text-obsidian/65 mt-0.5">
                  Asigna videos privados de Cloudflare Stream a las lecciones existentes y verifica su reproductor.
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-all shadow-xs"
              >
                <Plus className="size-4 text-champagne" />
                <span>Nueva Masterclass</span>
              </button>
            </div>

            {/* Courses List */}
            <div className="space-y-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#B39A6A]/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#B39A6A]/15 text-[#8A7347] text-[10px] font-bold uppercase tracking-wider">
                          {c.categoryLabel || 'Salud Médica'}
                        </span>
                        <span className="text-[11px] text-obsidian/50 font-mono">slug: {c.slug}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-obsidian mt-1">{c.title}</h3>
                      <p className="text-xs text-obsidian/70">{c.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourseForLesson(c);
                          setSelectedModuleId(c.modules?.[0]?.id || '');
                          setShowLessonModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-champagne text-obsidian text-xs font-semibold hover:brightness-105 transition-all shadow-xs"
                      >
                        <Plus className="size-3.5" />
                        <span>Añadir Lección YouTube</span>
                      </button>
                      <a
                        href={`/academia/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-obsidian/20 text-obsidian/60 hover:text-obsidian hover:bg-obsidian/5"
                        title="Ver página pública del curso"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>

                  {/* Modules & Lessons */}
                  <div className="mt-5 space-y-4">
                    {c.modules?.map((mod, mIdx) => (
                      <div key={mod.id} className="bg-[#F9F7F2] rounded-xl p-4 border border-[#B39A6A]/15">
                        <div className="text-xs font-bold text-obsidian mb-3 flex items-center justify-between">
                          <span className="uppercase tracking-wider">
                            Módulo {mIdx + 1}: {mod.title}
                          </span>
                          <span className="text-[11px] text-obsidian/50 font-mono">
                            {mod.lessons.length} clases
                          </span>
                        </div>

                        <div className="space-y-2">
                          {mod.lessons.map((les, lIdx) => (
                            <div
                              key={les.id}
                              className="bg-white p-3 rounded-lg border border-[#B39A6A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 border ${les.videoAssetId || les.videoExternalId ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  <Play className="size-3.5" />
                                </div>
                                <div>
                                  <div className="font-semibold text-obsidian flex items-center gap-2">
                                    <span>{les.title}</span>
                                    {les.isPreview && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                                        Vista Previa Libre
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-obsidian/50 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                                    <span>Duración: {Math.round(les.durationSeconds / 60)} min</span>
                                    {les.videoAssetId ? (
                                      <span className="text-emerald-700 font-medium">Cloudflare configurado</span>
                                    ) : les.videoExternalId ? (
                                      <span className="text-red-600 font-medium">YouTube configurado</span>
                                    ) : (
                                      <span className="text-amber-700 font-medium">Sin video</span>
                                    )}
                                    {Boolean(les.attachmentsCount && les.attachmentsCount > 0) && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 text-[#8A7347] font-semibold border border-[#B39A6A]/30 text-[10px]">
                                        <FileText className="size-2.5" />
                                        <span>{les.attachmentsCount} {les.attachmentsCount === 1 ? 'PDF' : 'PDFs'}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  id={`manage-attachments-btn-${les.id}`}
                                  onClick={() => setAttachmentsLesson({
                                    courseTitle: c.title,
                                    moduleTitle: mod.title,
                                    lessonId: les.id,
                                    lessonTitle: les.title,
                                    lessonNumber: lIdx + 1,
                                  })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B39A6A]/40 bg-white text-obsidian text-[11px] font-semibold hover:bg-[#F4EFE5] transition-colors cursor-pointer"
                                  title="Subir, administrar y quitar PDFs para esta lección"
                                >
                                  <FileText className="size-3 text-[#8A7347]" />
                                  <span>Gestionar PDFs{les.attachmentsCount ? ` (${les.attachmentsCount})` : ''}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openVideoConfiguration(c.slug, les)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#B39A6A]/40 bg-white text-obsidian text-[11px] font-semibold hover:bg-[#F4EFE5] transition-colors cursor-pointer"
                                >
                                  <Video className="size-3 text-[#8A7347]" />
                                  <span>{les.videoAssetId || les.videoExternalId ? 'Cambiar video' : 'Poner video'}</span>
                                </button>
                                <a
                                  href={`/academia/${c.slug}/leccion/${les.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D1B2A] text-white text-[11px] font-medium hover:bg-black transition-colors"
                                >
                                  <Eye className="size-3 text-champagne" />
                                  <span>Probar Reproductor</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DIRECTORIO DE ALUMNOS & CONSENTIMIENTO                        */}
        {/* ==================================================================== */}
        {activeTab === 'alumnos' && (
          <div className="space-y-6">
            {/* KPI Metric Summary for Directory */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>Total Cuentas</span>
                  <Users className="size-3 text-obsidian/40" />
                </div>
                <div className="text-xl font-serif font-bold text-obsidian mt-1">
                  {directoryStats?.totalCount ?? students.length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">En la plataforma</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>Solo Registrados</span>
                  <UserPlus className="size-3 text-amber-600" />
                </div>
                <div className="text-xl font-serif font-bold text-amber-700 mt-1">
                  {directoryStats?.registeredOnlyCount ?? students.filter((s) => s.enrolledCoursesCount === 0).length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">Sin compras aún</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>Alumnos Activos</span>
                  <GraduationCap className="size-3 text-emerald-600" />
                </div>
                <div className="text-xl font-serif font-bold text-emerald-700 mt-1">
                  {directoryStats?.activeStudentCount ?? students.filter((s) => s.userType === 'active_student' || s.enrolledCoursesCount > 0).length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">Licencia vigente</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>En Progreso</span>
                  <TrendingUp className="size-3 text-blue-600" />
                </div>
                <div className="text-xl font-serif font-bold text-blue-700 mt-1">
                  {directoryStats?.inProgressCount ?? students.filter((s) => s.courseProgressStatus === 'in_progress').length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">Viendo lecciones</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>Completados</span>
                  <Award className="size-3 text-purple-600" />
                </div>
                <div className="text-xl font-serif font-bold text-purple-700 mt-1">
                  {directoryStats?.completedCount ?? students.filter((s) => s.courseProgressStatus === 'completed').length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">100% de lecciones</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-xs bg-indigo-50/20">
                <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-900 font-semibold flex items-center justify-between">
                  <span>Marketing Opt-in</span>
                  <UserCheck className="size-3 text-indigo-600" />
                </div>
                <div className="text-xl font-serif font-bold text-indigo-700 mt-1">
                  {directoryStats?.marketingAcceptedCount ?? students.filter((s) => s.marketing_consent).length}
                </div>
                <div className="text-[10px] text-indigo-800/60 mt-0.5">Consentimiento activo</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold flex items-center justify-between">
                  <span>Transaccional</span>
                  <Mail className="size-3 text-zinc-500" />
                </div>
                <div className="text-xl font-serif font-bold text-zinc-700 mt-1">
                  {directoryStats?.transactionalOnlyCount ?? students.filter((s) => !s.marketing_consent).length}
                </div>
                <div className="text-[10px] text-obsidian/50 mt-0.5">Avisos de cuenta</div>
              </div>
            </div>

            {/* Filter Toolbar & Actions */}
            <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-obsidian">Directorio Médico de Alumnos</h2>
                  <p className="text-xs text-obsidian/65 mt-0.5">
                    Fuente de verdad de cuentas registradas, progreso académico y estatus de comunicaciones según consentimiento.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportMarketingCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 transition-colors shadow-xs"
                    title="Exporta exclusivamente a usuarios con consentimiento explícito de marketing"
                  >
                    <Download className="size-3.5" />
                    <span>Exportar Lista Marketing (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMarketingEmails}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#B39A6A]/30 text-obsidian text-xs font-semibold hover:bg-[#F9F7F2] transition-colors shadow-xs"
                    title="Copia al portapapeles solo los correos con consentimiento activo"
                  >
                    <Copy className="size-3.5 text-indigo-700" />
                    <span>{copiedMarketing ? '¡Copiados!' : 'Copiar Correos Opt-in'}</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[#B39A6A]/15">
                {/* Search */}
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-2.5 text-obsidian/40" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o teléfono..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7]"
                  />
                </div>

                {/* Filter User Type */}
                <div>
                  <select
                    value={selectedUserTypeFilter}
                    onChange={(e) => setSelectedUserTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7] text-obsidian"
                  >
                    <option value="all">Todas las clasificaciones</option>
                    <option value="registered">Solo Registrados (sin cursos)</option>
                    <option value="student">Alumnos (con cursos)</option>
                    <option value="active_student">Alumnos Activos</option>
                    <option value="in_progress">Cursos en Progreso</option>
                    <option value="completed">Cursos Completados (100%)</option>
                  </select>
                </div>

                {/* Filter Marketing Consent */}
                <div>
                  <select
                    value={selectedMarketingFilter}
                    onChange={(e) => setSelectedMarketingFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7] text-obsidian"
                  >
                    <option value="all">Todo consentimiento de marketing</option>
                    <option value="accepted">Marketing Aceptado (Opt-in)</option>
                    <option value="not_granted">Solo Transaccional (No opt-in)</option>
                    <option value="revoked">Consentimiento Revocado</option>
                  </select>
                </div>

                {/* Filter Verification */}
                <div>
                  <select
                    value={selectedVerifiedFilter}
                    onChange={(e) => setSelectedVerifiedFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7] text-obsidian"
                  >
                    <option value="all">Todo estado de correo</option>
                    <option value="true">Correo Verificado</option>
                    <option value="false">Verificación Pendiente</option>
                  </select>
                </div>

                {/* Filter Masterclass */}
                <div>
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7] text-obsidian"
                  >
                    <option value="all">Todas las Masterclasses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status bar */}
              <div className="pt-2 flex items-center justify-between text-xs text-obsidian/60 border-t border-[#B39A6A]/10">
                <span>
                  Mostrando <strong className="text-obsidian">{filteredStudents.length}</strong> de {students.length} cuentas registradas
                </span>
                <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Comunicaciones comerciales restringidas estrictamente a opt-in explícito
                </span>
              </div>
            </div>

            {/* Students Table & Quick Grant Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Students Table (3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-[#B39A6A]/20 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#B39A6A]/15 bg-[#F9F7F2] text-obsidian/75 font-semibold">
                        <th className="py-3 px-4">Alumno / Usuario</th>
                        <th className="py-3 px-4">Clasificación</th>
                        <th className="py-3 px-4">Progreso Académico</th>
                        <th className="py-3 px-4">Comunicaciones</th>
                        <th className="py-3 px-4">Verificación</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#B39A6A]/15">
                      {filteredStudents.map((st) => {
                        const isRegisteredOnly = st.enrolledCoursesCount === 0;
                        const hasActive = st.userType === 'active_student' || (st.activeEntitlementsCount || 0) > 0;
                        const isCompleted = st.courseProgressStatus === 'completed';
                        const isInProgress = st.courseProgressStatus === 'in_progress';

                        return (
                          <tr key={st.id} className="hover:bg-[#FDFBF7] transition-colors">
                            {/* Alumno Info */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-obsidian flex items-center gap-1.5">
                                <span>{st.full_name || 'Sin nombre registrado'}</span>
                                {st.role === 'ADMIN' && (
                                  <span className="px-1.5 py-0.2 rounded-sm bg-obsidian text-champagne text-[9px] font-mono">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-obsidian/60 font-mono">{st.email}</div>
                              {st.phone && (
                                <div className="text-[10px] text-obsidian/45 font-mono">Tel: {st.phone}</div>
                              )}
                            </td>

                            {/* Clasificación */}
                            <td className="py-3.5 px-4">
                              {isRegisteredOnly ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                                  Registrado
                                </span>
                              ) : hasActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                  <CheckCircle2 className="size-2.5" /> Alumno Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
                                  Alumno
                                </span>
                              )}
                              <div className="text-[10px] text-obsidian/50 mt-1">
                                {isRegisteredOnly
                                  ? 'Sin cursos inscritos'
                                  : `${st.enrolledCoursesCount} ${st.enrolledCoursesCount === 1 ? 'masterclass' : 'masterclasses'}`}
                              </div>
                            </td>

                            {/* Progreso Académico */}
                            <td className="py-3.5 px-4 min-w-[170px]">
                              {isRegisteredOnly ? (
                                <span className="text-[11px] text-obsidian/40 italic">Sin avances</span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-obsidian">
                                      {st.overallProgressPercent ?? 0}% completado
                                    </span>
                                    <span className="text-obsidian/60">
                                      {st.completedLessonsCount ?? 0}/{st.totalLessonsCount ?? 0} lecciones
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-obsidian/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isCompleted
                                          ? 'bg-purple-600'
                                          : isInProgress
                                          ? 'bg-emerald-600'
                                          : 'bg-obsidian/30'
                                      }`}
                                      style={{ width: `${st.overallProgressPercent ?? 0}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 pt-0.5">
                                    {isCompleted ? (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-purple-700">
                                        <Award className="size-2.5" /> Completado
                                      </span>
                                    ) : isInProgress ? (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700">
                                        <TrendingUp className="size-2.5" /> En Progreso
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-obsidian/45">No iniciado</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Comunicaciones & Consentimiento */}
                            <td className="py-3.5 px-4">
                              {st.marketing_consent ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
                                    <Check className="size-3" /> Marketing Aceptado
                                  </span>
                                  <div className="text-[10px] text-obsidian/50 mt-1">
                                    {st.marketing_consent_at
                                      ? `Opt-in: ${new Date(st.marketing_consent_at).toLocaleDateString()}`
                                      : 'Consentimiento explícito'}
                                  </div>
                                </div>
                              ) : st.marketingStatus === 'revoked' ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
                                    <XCircle className="size-3" /> Revocado
                                  </span>
                                  <div className="text-[10px] text-obsidian/50 mt-1">Solo transaccional</div>
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px]">
                                    Solo Transaccional
                                  </span>
                                  <div className="text-[10px] text-obsidian/50 mt-1">Sin opt-in comercial</div>
                                </div>
                              )}
                            </td>

                            {/* Verificación & Fecha */}
                            <td className="py-3.5 px-4">
                              {st.email_verified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                                  <CheckCircle2 className="size-2.5" /> Verificado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                                  <Clock className="size-2.5" /> Pendiente
                                </span>
                              )}
                              <div className="text-[10px] text-obsidian/50 mt-1">
                                Reg: {new Date(st.created_at).toLocaleDateString()}
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setViewingStudent(st)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F9F7F2] text-obsidian text-[11px] font-medium hover:bg-champagne/20 transition-colors border border-obsidian/10"
                                title="Ver ficha médica de auditoría del alumno"
                              >
                                <Eye className="size-3 text-obsidian/60" />
                                <span>Ver Ficha</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-obsidian/50">
                            No se encontraron registros con los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Quick Grant & Policy Info (1 col) */}
              <div className="space-y-6">
                {/* Quick Grant Masterclass */}
                <div className="bg-[#0B1724] text-white p-6 rounded-2xl border border-white/10 shadow-xs">
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-champagne" />
                    <span>Otorgar Acceso Manual</span>
                  </h3>
                  <p className="text-[11px] text-white/70 mt-1">
                    Inscribe a un alumno directamente a una masterclass por correo.
                  </p>

                  <form onSubmit={handleGrantCourse} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                        Correo del Alumno
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alumno@ejemplo.com"
                        value={grantEmail}
                        onChange={(e) => setGrantEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-champagne"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                        Masterclass
                      </label>
                      <select
                        value={grantCourseId}
                        onChange={(e) => setGrantCourseId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0D2235] border border-white/20 text-xs text-white focus:outline-hidden focus:border-champagne"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-xs hover:brightness-105 transition-all shadow-xs"
                    >
                      Otorgar Licencia
                    </button>
                  </form>
                </div>

                {/* Legal & Privacy Compliance Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs text-xs space-y-3">
                  <div className="font-serif font-bold text-obsidian flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-700" />
                    <span>Cumplimiento Legal & Privacidad</span>
                  </div>
                  <p className="text-[11px] text-obsidian/70 leading-relaxed">
                    Las comunicaciones se dividen formalmente en:
                  </p>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                      <strong className="text-obsidian block">1. Transaccionales (Obligatorias)</strong>
                      <span className="text-obsidian/70">
                        Confirmación de cuenta, recibos de compra, restablecimiento de contraseña y accesos a cursos.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                      <strong className="text-indigo-900 block">2. Marketing (Opt-in Explícito)</strong>
                      <span className="text-indigo-950/70">
                        Novedades médicas, promociones y boletines de salud. Requiere consentimiento no premarcado.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal: Ficha Detallada de Auditoría del Alumno */}
            {viewingStudent && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#B39A6A]/20 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between pb-4 border-b border-[#B39A6A]/15">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian text-champagne text-[10px] font-mono font-semibold uppercase">
                        Ficha Médica de Alumno · Auditoría Legal
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-obsidian mt-2">
                        {viewingStudent.full_name || 'Sin nombre registrado'}
                      </h3>
                      <p className="text-xs text-obsidian/60 font-mono mt-0.5">{viewingStudent.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingStudent(null)}
                      className="p-1.5 rounded-xl text-obsidian/40 hover:text-obsidian hover:bg-[#F9F7F2] transition-colors"
                    >
                      <XCircle className="size-6" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="mt-6 space-y-6">
                    {/* General Identification */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">ID Usuario</span>
                        <span className="font-mono text-[11px] text-obsidian font-semibold truncate block mt-0.5">
                          {viewingStudent.id}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">Teléfono</span>
                        <span className="text-obsidian font-semibold block mt-0.5">
                          {viewingStudent.phone || 'No registrado'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">Estado Correo</span>
                        <span className="text-obsidian font-semibold block mt-0.5">
                          {viewingStudent.email_verified ? 'Verificado' : 'Pendiente'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">Fecha Registro</span>
                        <span className="text-obsidian font-semibold block mt-0.5">
                          {new Date(viewingStudent.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">Último Acceso</span>
                        <span className="text-obsidian font-semibold block mt-0.5">
                          {viewingStudent.last_login_at
                            ? new Date(viewingStudent.last_login_at).toLocaleString()
                            : 'Sin registro'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-obsidian/50 block">Rol</span>
                        <span className="text-obsidian font-semibold block mt-0.5">
                          {viewingStudent.role || 'CUSTOMER'}
                        </span>
                      </div>
                    </div>

                    {/* Marketing Consent Audit Details */}
                    <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-indigo-700" />
                          <span>Auditoría de Consentimiento de Marketing</span>
                        </h4>
                        {viewingStudent.marketing_consent ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
                            Opt-in Aceptado
                          </span>
                        ) : viewingStudent.marketingStatus === 'revoked' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
                            Consentimiento Revocado
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px]">
                            Solo Transaccional
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-obsidian/60 block text-[11px]">Fecha de Consentimiento:</span>
                          <span className="font-semibold text-obsidian">
                            {viewingStudent.marketing_consent_at
                              ? new Date(viewingStudent.marketing_consent_at).toLocaleString()
                              : 'No otorgado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-obsidian/60 block text-[11px]">Origen de Consentimiento:</span>
                          <span className="font-mono text-[11px] text-obsidian">
                            {viewingStudent.marketing_consent_source || 'No aplica'}
                          </span>
                        </div>
                        <div>
                          <span className="text-obsidian/60 block text-[11px]">Versión Consentimiento:</span>
                          <span className="font-mono text-[11px] text-obsidian">
                            {viewingStudent.marketing_consent_version || 'v1.0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-obsidian/60 block text-[11px]">Aceptación de Términos:</span>
                          <span className="font-semibold text-obsidian">
                            {viewingStudent.terms_accepted_at
                              ? new Date(viewingStudent.terms_accepted_at).toLocaleString()
                              : 'Registrado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Courses & Progress Breakdown */}
                    <div>
                      <h4 className="font-serif font-bold text-obsidian text-sm mb-3">
                        Masterclasses Inscritas & Progreso ({viewingStudent.enrolledCoursesCount})
                      </h4>

                      {viewingStudent.enrolledCourses.length > 0 ? (
                        <div className="space-y-2.5">
                          {viewingStudent.enrolledCourses.map((c) => (
                            <div
                              key={c.courseId}
                              className="p-3.5 rounded-xl border border-[#B39A6A]/15 bg-[#F9F7F2] flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-obsidian">{c.courseTitle}</div>
                                <div className="text-[10px] text-obsidian/50 mt-0.5">
                                  Licencia: <span className="font-medium text-emerald-700">{c.status}</span> · Otorgado:{' '}
                                  {new Date(c.grantedAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-semibold text-obsidian">
                                  {c.progressPercent ?? 0}%
                                </div>
                                <div className="text-[10px] text-obsidian/50">
                                  {c.completedLessons ?? 0}/{c.totalLessons ?? 0} lecciones
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/10 text-center text-xs text-obsidian/50">
                          Este usuario no tiene masterclasses inscritas en este momento.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#B39A6A]/15 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setViewingStudent(null)}
                      className="px-5 py-2.5 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-black transition-colors"
                    >
                      Cerrar Ficha
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MÉTRICAS & AUDITORÍA                                          */}
        {/* ==================================================================== */}
        {activeTab === 'metricas' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Alumnos Registrados
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalRegisteredUsers || students.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Alumnos Verificados
                </div>
                <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                  {metrics?.verifiedUsersCount || students.filter((s) => s.email_verified).length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Suscritos Marketing
                </div>
                <div className="text-2xl font-serif font-bold text-indigo-700 mt-1">
                  {metrics?.marketingSubscribersCount || students.filter((s) => s.marketing_consent).length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Masterclasses Activas
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalCourses || courses.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Lecciones en Video
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalLessons || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Licencias Otorgadas
                </div>
                <div className="text-2xl font-serif font-bold text-champagne mt-1">
                  {metrics?.activeEntitlementsCount || 0}
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-obsidian mb-2">
                Auditoría de Accesos & Reproducciones de Video
              </h3>
              <p className="text-xs text-obsidian/60 mb-4">
                Registro inmutable de validaciones de licencias y solicitudes de tokens educativos.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#B39A6A]/15 text-obsidian/60 font-semibold">
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Alumno</th>
                      <th className="py-2.5 px-3">Acción</th>
                      <th className="py-2.5 px-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B39A6A]/10 font-mono text-[11px]">
                    {metrics?.recentAudits?.map((a: any) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 text-obsidian/60">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">{a.customerGid}</td>
                        <td className="py-2.5 px-3">{a.action}</td>
                        <td className="py-2.5 px-3">
                          {a.result === 'granted' ? (
                            <span className="text-emerald-700 font-semibold">Autorizado</span>
                          ) : (
                            <span className="text-red-700 font-semibold">Denegado ({a.reason || 'Sin licencia'})</span>
                          )}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-obsidian/50">
                          Sin eventos de auditoría registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: AGENDA GOOGLE & WHATSAPP                                      */}
        {/* ==================================================================== */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Google Calendar */}
              <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-[#B39A6A]" />
              <div>
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-200">
                  <Calendar className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-obsidian">Agenda Médica con Google Calendar</h3>
                <p className="text-xs text-obsidian/70 mt-2 leading-relaxed">
                  Configura y sincroniza las consultas clínicas privadas del Dr. Mauricio Benjamín Galindo López con Google Calendar. Los pacientes y alumnos podrán agendar valoraciones médicas funcionales sin fricciones.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/15 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Especialista:</span>
                    <span className="font-semibold text-obsidian">Dr. Mauricio Benjamín Galindo López</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Duración por consulta:</span>
                    <span className="font-semibold text-obsidian">45 a 60 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Formato:</span>
                    <span className="font-semibold text-obsidian">Google Meet / Presencial</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#B39A6A]/15">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Abrir Google Calendar del Dr. Galindo</span>
                </a>
              </div>
            </div>

              {/* Telemedicine meeting room */}
              <div className="bg-[#0c2538] p-6 rounded-2xl border border-[#B39A6A]/35 shadow-lg text-white overflow-hidden relative">
                <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[#B39A6A]/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="size-12 rounded-2xl bg-white/10 text-[#dcc48e] flex items-center justify-center border border-white/15">
                      <Video className="size-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-300/25 text-emerald-200 text-[10px] font-bold uppercase tracking-[0.16em]">
                      Acceso privado
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mt-4">Sala de telemedicina</h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    Guarda aquí tu sala oficial de Google Meet o Zoom para copiarla y compartirla con tus pacientes de consulta en línea.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/20 border border-white/10">
                    {(['google-meet', 'zoom'] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setMeetingPlatform(platform)}
                        className={`rounded-lg py-2.5 text-xs font-bold transition-all ${meetingPlatform === platform ? 'bg-white text-[#0c2538] shadow-sm' : 'text-white/65 hover:text-white'}`}
                      >
                        {platform === 'google-meet' ? 'Google Meet' : 'Zoom'}
                      </button>
                    ))}
                  </div>

                  <label className="block mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#dcc48e]">Liga permanente de consulta</label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(event) => setMeetingUrl(event.target.value)}
                    disabled={meetingLoading}
                    placeholder={meetingPlatform === 'google-meet' ? 'https://meet.google.com/xxx-xxxx-xxx' : 'https://zoom.us/j/0000000000'}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#dcc48e] focus:ring-2 focus:ring-[#dcc48e]/20"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleSaveMeeting}
                      disabled={meetingSaving || meetingLoading}
                      className="rounded-xl bg-[#B39A6A] px-4 py-3 text-xs font-bold text-[#0c2538] hover:bg-[#cbb47f] disabled:opacity-50 transition-colors"
                    >
                      {meetingSaving ? 'Guardando…' : 'Guardar liga'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMeeting}
                      disabled={!meetingUrl.trim()}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
                    >
                      {meetingCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {meetingCopied ? 'Copiada' : 'Copiar liga'}
                    </button>
                  </div>

                  {meetingUrl.trim() && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <a href={meetingUrl.trim()} target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-center hover:bg-white/10 transition-colors">
                        Abrir sala ↗
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent('Liga para tu consulta de telemedicina')}&body=${encodeURIComponent(`Hola, te comparto la liga para tu consulta de telemedicina con el Dr. Mauricio Galindo López:\n\n${meetingUrl.trim()}`)}`}
                        className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-center hover:bg-white/10 transition-colors"
                      >
                        Compartir por correo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WhatsApp Business composer */}
            <div className="bg-white rounded-2xl border border-[#B39A6A]/20 shadow-xs overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#B39A6A]/15 bg-gradient-to-r from-emerald-50/80 via-white to-[#F9F7F2]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 shrink-0 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <MessageCircle className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Canal clínico directo</p>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-obsidian">Mensajería WhatsApp Business</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 self-start">
                    <ShieldCheck className="size-3.5" /> Cuenta oficial protegida
                  </span>
                </div>
                <p className="text-xs text-obsidian/70 mt-2 leading-relaxed">
                  Escribe el teléfono del paciente y redacta el mensaje que deseas enviar desde el mismo número oficial usado para las confirmaciones de citas.
                </p>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-obsidian/60">Número de WhatsApp</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700 font-bold text-sm">+</span>
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(event) => setWhatsappPhone(event.target.value)}
                      placeholder="52 442 123 4567"
                      className="w-full rounded-xl border border-[#B39A6A]/25 bg-[#FBFAF7] pl-8 pr-4 py-3.5 text-sm text-obsidian outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                    <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-amber-950/80">
                      Meta permite texto libre cuando el paciente escribió a tu cuenta durante las últimas 24 horas. Fuera de ese periodo se necesita una plantilla aprobada.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-obsidian/60">Mensaje personalizado</label>
                    <span className={`text-[10px] ${whatsappMessage.length > 900 ? 'text-amber-700 font-bold' : 'text-obsidian/40'}`}>{whatsappMessage.length}/1000</span>
                  </div>
                  <textarea
                    value={whatsappMessage}
                    onChange={(event) => setWhatsappMessage(event.target.value.slice(0, 1000))}
                    rows={7}
                    placeholder="Escribe aquí el mensaje para tu paciente…"
                    className="mt-2 w-full resize-y rounded-xl border border-[#B39A6A]/25 bg-[#FBFAF7] px-4 py-3.5 text-sm leading-relaxed text-obsidian outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={handleSendWhatsapp}
                    disabled={whatsappSending || !whatsappPhone.trim() || !whatsappMessage.trim()}
                    className="mt-3 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    {whatsappSending ? 'Enviando de forma segura…' : 'Enviar mensaje por WhatsApp'}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-obsidian/45">
                    Confirma el número y el contenido antes de enviar. El mensaje no podrá retirarse después.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: SIMULADOR SHOPIFY & WEBHOOKS                                  */}
        {/* ==================================================================== */}
        {activeTab === 'webhooks' && (
          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs max-w-2xl">
            <h3 className="font-serif text-xl font-bold text-obsidian">Simulador de Webhooks de Compra Shopify</h3>
            <p className="text-xs text-obsidian/70 mt-1 leading-relaxed">
              Prueba la concesión instantánea de licencias sin realizar cobros reales en Shopify.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Correo del Comprador</label>
                <input
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Número de Pedido Simulado</label>
                <input
                  type="text"
                  value={simOrder}
                  onChange={(e) => setSimOrder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <button
                onClick={handleSimulateWebhook}
                className="w-full py-3 px-4 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors shadow-xs"
              >
                Disparar Webhook orders/paid
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: TESTIMONIOS EN VIDEO & CONSENTIMIENTO                         */}
        {/* ==================================================================== */}
        {activeTab === 'testimonios' && (
          <TestimonialsAdminPanel fetchWithAuth={fetchWithAuth} />
        )}
      </Container>

      {/* ==================================================================== */}
      {/* MODAL: ASIGNAR VIDEO A UNA LECCIÓN EXISTENTE                         */}
      {/* ==================================================================== */}
      {configuringLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#B39A6A]/30 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#B39A6A]/20">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-[#8A7347]">
                  <Video className="size-3.5" /> Video de la lección
                </div>
                <h3 className="font-serif text-xl font-bold text-obsidian mt-1">{configuringLesson.title}</h3>
                <p className="text-[11px] text-obsidian/55 mt-0.5">El video quedará protegido y solo se reproducirá dentro de la academia.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfiguringLesson(null)}
                className="text-obsidian/50 hover:text-obsidian text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-2">Origen del video</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cloudflare', label: 'Cloudflare Stream' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'none', label: 'Sin video' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedVideoProvider(option.value as 'cloudflare' | 'youtube' | 'none');
                        setSelectedVideoId('');
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                        selectedVideoProvider === option.value
                          ? 'bg-obsidian text-white border-obsidian'
                          : 'bg-white text-obsidian border-obsidian/20 hover:bg-[#F9F7F2]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedVideoProvider === 'cloudflare' && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-xs font-semibold text-obsidian">Biblioteca de Cloudflare Stream</label>
                    <a
                      href="https://dash.cloudflare.com/?to=/:account/stream"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#80683D] hover:underline"
                    >
                      Subir un video nuevo <ExternalLink className="size-3" />
                    </a>
                  </div>

                  {videoLibraryError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                      {videoLibraryError}
                    </div>
                  ) : cloudflareVideos.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      No hay videos en la biblioteca. Usa “Subir un video nuevo”, espera a que termine de procesarse y pulsa “Actualizar Datos”.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {cloudflareVideos.map((video) => (
                        <label
                          key={video.uid}
                          className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                            selectedVideoId === video.uid
                              ? 'border-[#B39A6A] bg-[#F9F4E9]'
                              : 'border-obsidian/15 bg-white hover:bg-[#F9F7F2]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cloudflare-video"
                            value={video.uid}
                            checked={selectedVideoId === video.uid}
                            onChange={() => setSelectedVideoId(video.uid)}
                            disabled={!video.readyToStream}
                            className="accent-[#B39A6A]"
                          />
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt="" className="w-24 h-14 rounded-lg object-cover bg-black" />
                          ) : (
                            <div className="w-24 h-14 rounded-lg bg-obsidian flex items-center justify-center"><Play className="size-5 text-white" /></div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-obsidian truncate">{video.name}</div>
                            <div className="text-[10px] text-obsidian/55 mt-0.5">
                              {Math.max(1, Math.round(video.durationSeconds / 60))} min · {video.readyToStream ? 'Listo para usar' : `Procesando (${video.status})`}
                            </div>
                          </div>
                          {video.readyToStream ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Clock className="size-4 text-amber-600" />}
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-obsidian/70 mb-1">O pega directamente el ID del video</label>
                    <input
                      type="text"
                      value={selectedVideoId}
                      onChange={(event) => setSelectedVideoId(event.target.value)}
                      placeholder="Ej. 4b6dfdadb3317265a9ae6ce4fdb32e9c"
                      className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs font-mono focus:outline-hidden focus:border-champagne"
                    />
                  </div>
                </div>
              )}

              {selectedVideoProvider === 'youtube' && (
                <div>
                  <label className="block text-xs font-semibold text-obsidian mb-1">ID del video de YouTube</label>
                  <input
                    type="text"
                    value={selectedVideoId}
                    onChange={(event) => setSelectedVideoId(event.target.value)}
                    placeholder="Ej. dQw4w9WgXcQ"
                    className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs font-mono focus:outline-hidden focus:border-champagne"
                  />
                </div>
              )}

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] leading-relaxed text-emerald-900">
                Al guardar un video de Cloudflare, el sistema activa la reproducción protegida mediante enlaces firmados y temporales.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfiguringLesson(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLessonVideo}
                  disabled={savingVideo || (selectedVideoProvider !== 'none' && !selectedVideoId.trim())}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingVideo && <RefreshCw className="size-3.5 animate-spin" />}
                  {savingVideo ? 'Guardando…' : 'Guardar video en esta lección'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: NUEVA MASTERCLASS                                             */}
      {/* ==================================================================== */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#B39A6A]/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
              <h3 className="font-serif text-xl font-bold text-obsidian">Crear Nueva Masterclass</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-obsidian/50 hover:text-obsidian text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Título de la Masterclass</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Salud Hormonal en la Perimenopausia"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Subtítulo Descriptivo</label>
                <input
                  type="text"
                  placeholder="Guía clínica y protocolo práctico para el bienestar femenino"
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Categoría Médica</label>
                <select
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                >
                  <option value="Ginecología & Salud Femenina">Ginecología & Salud Femenina</option>
                  <option value="Medicina Funcional & Longevidad">Medicina Funcional & Longevidad</option>
                  <option value="Nutrición Celular & Metabolismo">Nutrición Celular & Metabolismo</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors"
                >
                  Publicar Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: AÑADIR LECCIÓN EN VIDEO YOUTUBE                               */}
      {/* ==================================================================== */}
      {showLessonModal && selectedCourseForLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#B39A6A]/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
              <div>
                <h3 className="font-serif text-xl font-bold text-obsidian">Añadir Lección en Video</h3>
                <p className="text-[11px] text-obsidian/60 mt-0.5">{selectedCourseForLesson.title}</p>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-obsidian/50 hover:text-obsidian text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Módulo Destino</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                >
                  {selectedCourseForLesson.modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Título de la Lección</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fisiopatología de la transición menopáusica"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">
                  Enlace de YouTube (No listado / Unlisted)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newLessonUrl}
                    onChange={(e) => handleValidateYouTube(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne pr-10"
                  />
                  {validatingYt && (
                    <RefreshCw className="size-4 animate-spin absolute right-3 top-3 text-obsidian/40" />
                  )}
                </div>
                {youtubePreview && youtubePreview.valid && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                    <img
                      src={youtubePreview.thumbnailUrl}
                      alt="Miniatura"
                      className="size-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Enlace de YouTube Verificado</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono">ID: {youtubePreview.videoId}</div>
                    </div>
                  </div>
                )}
                {youtubePreview && youtubePreview.error && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="size-3.5" />
                    <span>{youtubePreview.error}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-obsidian mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-medium text-obsidian pb-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newLessonIsPreview}
                      onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                      className="size-4 rounded-md accent-champagne"
                    />
                    <span>Acceso libre (Preview)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors"
                >
                  Guardar Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson PDF Attachments Management Modal */}
      {attachmentsLesson && (
        <ManageLessonAttachmentsModal
          isOpen={!!attachmentsLesson}
          onClose={(hasChanged) => {
            setAttachmentsLesson(null);
            if (hasChanged) {
              fetchData();
            }
          }}
          courseTitle={attachmentsLesson.courseTitle}
          moduleTitle={attachmentsLesson.moduleTitle}
          lessonId={attachmentsLesson.lessonId}
          lessonTitle={attachmentsLesson.lessonTitle}
          lessonNumber={attachmentsLesson.lessonNumber}
          fetchWithAuth={fetchWithAuth}
        />
      )}
    </div>
  );
}
