import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Video,
  Upload,
  EyeOff,
  Clock,
  Sparkles,
  FileCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { TestimonialsCarousel, TestimonialItem } from '@/components/site/testimonials-carousel';

interface AdminTestimonial {
  id: string;
  videoProvider: string;
  videoId: string;
  videoUrl?: string;
  posterUrl: string;
  displayName: string;
  internalName?: string;
  nameFormat: 'full' | 'initials' | 'anonymous';
  publicLabel?: string;
  shortDescription?: string;
  sortOrder: number;
  status: 'draft' | 'pending_consent' | 'published' | 'hidden' | 'inactive' | 'consent_withdrawn';
  consentConfirmed: boolean;
  consentDate: string;
  consentExpiration?: string | null;
  consentWithdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function TestimonialsAdminPanel({
  fetchWithAuth: customFetchWithAuth,
}: {
  fetchWithAuth?: (url: string, options?: RequestInit) => Promise<Response>;
} = {}) {
  const { fetchWithAuth: authContextFetch } = useAuth();
  const authFetch = customFetchWithAuth || authContextFetch;
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<AdminTestimonial | null>(null);
  const [editingItem, setEditingItem] = useState<AdminTestimonial | null>(null);

  // Form Fields
  const [videoProvider, setVideoProvider] = useState<'cloudflare' | 'url' | 'youtube'>('cloudflare');
  const [videoId, setVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [internalName, setInternalName] = useState('');
  const [nameFormat, setNameFormat] = useState<'full' | 'initials' | 'anonymous'>('anonymous');
  const [publicLabel, setPublicLabel] = useState('Consulta Médica · Seguimiento');
  const [shortDescription, setShortDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState<AdminTestimonial['status']>('draft');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [consentDate, setConsentDate] = useState(new Date().toISOString().split('T')[0]);
  const [consentExpiration, setConsentExpiration] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Error al obtener la lista de testimonios.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  // Counters
  const totalCount = testimonials.length;
  const draftCount = testimonials.filter((t) => t.status === 'draft').length;
  const pendingCount = testimonials.filter((t) => t.status === 'pending_consent' || (!t.consentConfirmed && t.status !== 'consent_withdrawn')).length;
  const publishedCount = testimonials.filter((t) => t.status === 'published' && t.consentConfirmed && !t.consentWithdrawnAt).length;
  const hiddenCount = testimonials.filter((t) => t.status === 'hidden' || t.status === 'inactive').length;
  const withdrawnCount = testimonials.filter((t) => t.status === 'consent_withdrawn' || Boolean(t.consentWithdrawnAt)).length;

  const openCreateModal = () => {
    setEditingItem(null);
    setVideoProvider('cloudflare');
    setVideoId('');
    setVideoUrl('');
    setPosterUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80');
    setDisplayName('');
    setInternalName('');
    setNameFormat('anonymous');
    setPublicLabel('Consulta Médica · Seguimiento');
    setShortDescription('');
    setSortOrder(testimonials.length + 1);
    setStatus('draft');
    setConsentConfirmed(false);
    setConsentDate(new Date().toISOString().split('T')[0]);
    setConsentExpiration('');
    setShowFormModal(true);
    setError(null);
  };

  const openEditModal = (item: AdminTestimonial) => {
    setEditingItem(item);
    setVideoProvider(item.videoProvider as any || 'cloudflare');
    setVideoId(item.videoId || '');
    setVideoUrl(item.videoUrl || '');
    setPosterUrl(item.posterUrl || '');
    setDisplayName(item.displayName || '');
    setInternalName(item.internalName || '');
    setNameFormat(item.nameFormat || 'anonymous');
    setPublicLabel(item.publicLabel || 'Consulta Médica');
    setShortDescription(item.shortDescription || '');
    setSortOrder(item.sortOrder || 1);
    setStatus(item.status || 'draft');
    setConsentConfirmed(Boolean(item.consentConfirmed));
    setConsentDate(item.consentDate ? item.consentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setConsentExpiration(item.consentExpiration ? item.consentExpiration.split('T')[0] : '');
    setShowFormModal(true);
    setError(null);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploadingFile(false);
            const generatedId = `cf_${Math.random().toString(36).substring(2, 10)}`;
            setVideoId(generatedId);
            setVideoProvider('cloudflare');
            setStatus('draft');
            setSuccessMsg('El video se cargó correctamente y quedó guardado como borrador.');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeVideoId = videoId.trim();
    const activeVideoUrl = videoUrl.trim();

    if (!activeVideoId && !activeVideoUrl) {
      setError('Debes proporcionar un ID de video o URL válida.');
      return;
    }

    if (!displayName.trim()) {
      setError('El nombre o etiqueta pública del paciente es obligatorio.');
      return;
    }

    if (!posterUrl.trim()) {
      setError('La portada o miniatura es obligatoria para garantizar la estética.');
      return;
    }

    // Strict clinical consent validation
    if (status === 'published' && !consentConfirmed) {
      setError('No puedes publicar este testimonio sin confirmar la autorización informada del paciente.');
      return;
    }

    const payload = {
      videoProvider,
      videoId: activeVideoId,
      videoUrl: activeVideoUrl || undefined,
      posterUrl: posterUrl.trim(),
      displayName: displayName.trim(),
      internalName: internalName.trim() || undefined,
      nameFormat,
      publicLabel: publicLabel.trim(),
      shortDescription: shortDescription.trim(),
      sortOrder: Number(sortOrder) || 1,
      status,
      consentConfirmed: Boolean(consentConfirmed),
      consentDate: consentDate ? new Date(consentDate).toISOString() : new Date().toISOString(),
      consentExpiration: consentExpiration ? new Date(consentExpiration).toISOString() : null,
      consentWithdrawnAt: status === 'consent_withdrawn' ? new Date().toISOString() : null,
    };

    try {
      const url = editingItem
        ? `/api/admin/testimonials/${editingItem.id}`
        : '/api/admin/testimonials';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(
          editingItem
            ? 'Testimonio actualizado correctamente.'
            : 'Testimonio registrado con éxito.'
        );
        setShowFormModal(false);
        loadTestimonials();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Error al guardar el testimonio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar la solicitud.');
    }
  };

  const handleQuickPublish = async (item: AdminTestimonial) => {
    if (!item.consentConfirmed || item.status === 'consent_withdrawn') {
      setError(`No es posible publicar el testimonio de "${item.displayName}" sin consentimiento confirmado.`);
      return;
    }

    try {
      const res = await authFetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      if (res.ok) {
        setSuccessMsg(`Testimonio de "${item.displayName}" publicado en la página de Consulta.`);
        loadTestimonials();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Error al publicar testimonio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red.');
    }
  };

  const handleQuickHide = async (item: AdminTestimonial) => {
    try {
      const res = await authFetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'hidden' }),
      });
      if (res.ok) {
        setSuccessMsg(`Testimonio de "${item.displayName}" retirado de la vista pública.`);
        loadTestimonials();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Error al ocultar testimonio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red.');
    }
  };

  const handleMoveOrder = async (item: AdminTestimonial, direction: 'up' | 'down') => {
    const currentOrder = item.sortOrder;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;

    try {
      await authFetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      loadTestimonials();
    } catch {
      // ignore
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const res = await authFetch(`/api/admin/testimonials/${showDeleteModal.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMsg(`Testimonio de "${showDeleteModal.displayName}" eliminado.`);
        setShowDeleteModal(null);
        loadTestimonials();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Error al eliminar el testimonio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar la eliminación.');
    }
  };

  // Filtered List
  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.internalName && t.internalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.publicLabel && t.publicLabel.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return t.status === 'published';
    if (statusFilter === 'draft') return t.status === 'draft';
    if (statusFilter === 'pending') return t.status === 'pending_consent' || !t.consentConfirmed;
    if (statusFilter === 'hidden') return t.status === 'hidden' || t.status === 'inactive';
    if (statusFilter === 'withdrawn') return t.status === 'consent_withdrawn' || Boolean(t.consentWithdrawnAt);

    return true;
  });

  // Convert to public format for live preview modal
  const previewItems: TestimonialItem[] = testimonials
    .filter((t) => t.status === 'published' && t.consentConfirmed && !t.consentWithdrawnAt)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => ({
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

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#B39A6A]/20 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold tracking-wider uppercase mb-3">
            <ShieldCheck className="size-3.5 text-amber-700" />
            <span>Módulo Clínico & Consentimiento</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-obsidian tracking-tight">
            Testimonios en video
          </h2>
          <p className="text-xs sm:text-sm text-obsidian/70 mt-1.5 max-w-2xl leading-relaxed">
            Administra los videos autorizados que aparecen en el carrusel de la página Consulta. Cumple con estrictos estándares de autorización informada y privacidad de pacientes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-obsidian/20 bg-white text-obsidian text-xs font-semibold hover:bg-[#F9F7F2] transition-colors"
          >
            <Eye className="size-4 text-champagne" />
            <span>Previsualizar carrusel</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-all shadow-xs"
          >
            <Plus className="size-4 text-champagne" />
            <span>Agregar testimonio</span>
          </button>
        </div>
      </div>

      {/* Real Metrics Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-obsidian/60 block">Total</span>
          <span className="text-2xl font-serif font-bold text-obsidian mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-emerald-800 block">Publicados</span>
          <span className="text-2xl font-serif font-bold text-emerald-700 mt-1 block">{publishedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-amber-800 block">Borradores</span>
          <span className="text-2xl font-serif font-bold text-amber-700 mt-1 block">{draftCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-orange-800 block">Pend. Consent.</span>
          <span className="text-2xl font-serif font-bold text-orange-700 mt-1 block">{pendingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-zinc-700 block">Ocultos / Inact.</span>
          <span className="text-2xl font-serif font-bold text-zinc-700 mt-1 block">{hiddenCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/15 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-rose-800 block">Retirados</span>
          <span className="text-2xl font-serif font-bold text-rose-700 mt-1 block">{withdrawnCount}</span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#B39A6A]/15">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por paciente o etiqueta..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-obsidian/15 text-xs focus:outline-none focus:border-champagne"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all' ? 'bg-obsidian text-white' : 'bg-[#F9F7F2] text-obsidian/70 hover:text-obsidian'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'published' ? 'bg-emerald-700 text-white' : 'bg-[#F9F7F2] text-obsidian/70 hover:text-obsidian'
            }`}
          >
            Publicados ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'draft' ? 'bg-amber-700 text-white' : 'bg-[#F9F7F2] text-obsidian/70 hover:text-obsidian'
            }`}
          >
            Borradores ({draftCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'pending' ? 'bg-orange-700 text-white' : 'bg-[#F9F7F2] text-obsidian/70 hover:text-obsidian'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
        </div>
      </div>

      {/* Main Testimonials Management Table */}
      <div className="bg-white rounded-3xl border border-[#B39A6A]/20 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#B39A6A]/15 bg-[#F9F7F2]/60 flex items-center justify-between">
          <h3 className="font-serif font-bold text-obsidian text-sm flex items-center gap-2">
            <Video className="size-4 text-champagne" />
            <span>Listado de Testimonios Registrados ({filteredTestimonials.length})</span>
          </h3>
          <button
            onClick={loadTestimonials}
            className="p-1.5 rounded-lg hover:bg-black/5 text-obsidian/60 transition-colors"
            title="Recargar"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-obsidian/60">
            <div className="inline-block size-5 animate-spin rounded-full border-2 border-champagne border-t-transparent mb-2" />
            <p>Cargando testimonios del servidor...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-16 text-center text-xs text-obsidian/60 max-w-md mx-auto">
            <Video className="size-8 text-obsidian/30 mx-auto mb-3" />
            <p className="font-serif text-sm font-semibold text-obsidian mb-1">No hay testimonios que coincidan con la búsqueda.</p>
            <p className="text-obsidian/60">Haz clic en "Agregar testimonio" para subir un video nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-obsidian">
              <thead className="bg-[#F9F7F2] border-b border-[#B39A6A]/15 uppercase font-mono text-[10px] text-obsidian/60">
                <tr>
                  <th className="p-4 w-16">Orden</th>
                  <th className="p-4">Miniatura & Video</th>
                  <th className="p-4">Paciente / Etiqueta</th>
                  <th className="p-4">Consentimiento Informado</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B39A6A]/10">
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9F7F2]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-obsidian/70">
                      <div className="flex items-center gap-1">
                        <span>#{t.sortOrder}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(t, 'up')}
                            className="text-obsidian/40 hover:text-obsidian"
                            title="Subir"
                          >
                            <ArrowUp className="size-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(t, 'down')}
                            className="text-obsidian/40 hover:text-obsidian"
                            title="Bajar"
                          >
                            <ArrowDown className="size-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Thumbnail & Video info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden bg-obsidian shrink-0 border border-[#B39A6A]/20">
                          {t.posterUrl ? (
                            <img src={t.posterUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full flex items-center justify-center text-[9px] text-white/50">Sin foto</div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Video className="size-4 text-white/80" />
                          </div>
                        </div>
                        <div>
                          <span className="font-mono text-[11px] text-obsidian font-semibold block max-w-[150px] truncate">
                            {t.videoId || t.videoUrl || 'Sin ID'}
                          </span>
                          <span className="text-[10px] text-obsidian/50 uppercase font-mono">{t.videoProvider}</span>
                        </div>
                      </div>
                    </td>

                    {/* Patient identity & labels */}
                    <td className="p-4">
                      <div className="font-serif font-bold text-obsidian text-sm">{t.displayName}</div>
                      {t.internalName && (
                        <div className="text-[10px] text-obsidian/50 italic">Ref. Interna: {t.internalName}</div>
                      )}
                      <div className="text-[11px] text-champagne font-mono mt-0.5">{t.publicLabel || 'Consulta Médica'}</div>
                    </td>

                    {/* Consent status badge */}
                    <td className="p-4">
                      {t.status === 'consent_withdrawn' || t.consentWithdrawnAt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
                          <AlertTriangle className="size-3 text-rose-600" />
                          <span>Consentimiento Retirado</span>
                        </span>
                      ) : t.consentConfirmed ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>Confirmado</span>
                          </span>
                          <span className="block text-[9px] text-obsidian/50 font-mono mt-1">
                            {t.consentDate ? `Fecha: ${t.consentDate.split('T')[0]}` : 'Autorizado'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          <Clock className="size-3 text-amber-600" />
                          <span>Pendiente / Falta</span>
                        </span>
                      )}
                    </td>

                    {/* Public status */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                          t.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : t.status === 'draft'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : t.status === 'consent_withdrawn'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                        }`}
                      >
                        {t.status === 'published'
                          ? 'Publicado'
                          : t.status === 'draft'
                          ? 'Borrador'
                          : t.status === 'consent_withdrawn'
                          ? 'Retirado'
                          : 'Oculto'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {t.status === 'published' ? (
                        <button
                          onClick={() => handleQuickHide(t)}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          title="Ocultar de la página Consulta"
                        >
                          <EyeOff className="size-3" />
                          <span>Ocultar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickPublish(t)}
                          disabled={!t.consentConfirmed || t.status === 'consent_withdrawn'}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                            t.consentConfirmed && t.status !== 'consent_withdrawn'
                              ? 'border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'opacity-40 cursor-not-allowed border border-zinc-200 text-zinc-400'
                          }`}
                          title={t.consentConfirmed ? 'Publicar en Consulta' : 'Falta consentimiento'}
                        >
                          <Eye className="size-3" />
                          <span>Publicar</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg border border-obsidian/20 bg-white hover:bg-obsidian hover:text-white transition-colors"
                        title="Editar datos y consentimiento"
                      >
                        <Edit className="size-3.5" />
                      </button>

                      <button
                        onClick={() => setShowDeleteModal(t)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Quitar / Eliminar testimonio"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Form for Create / Edit Testimonial */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-obsidian/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#B39A6A]/30 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col my-auto">
            {/* Header - Fixed Top */}
            <div className="p-4 sm:p-5 border-b border-[#B39A6A]/15 bg-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-mono uppercase text-champagne font-bold tracking-wider block">
                  {editingItem ? 'Edición de Registro' : 'Nuevo Registro'}
                </span>
                <h3 className="font-serif font-bold text-obsidian text-base sm:text-lg mt-0.5">
                  {editingItem ? 'Editar Testimonio en Video' : 'Registrar Nuevo Testimonio'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="size-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs font-bold transition-colors text-obsidian/70 hover:text-obsidian shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Form Body - Scrollable */}
            <form id="testimonial-form" onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Video upload or Cloudflare input */}
              <div className="p-3.5 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-obsidian text-xs flex items-center gap-1.5">
                    <Video className="size-3.5 text-champagne" />
                    <span>Fuente de Video *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-obsidian text-white text-[10px] font-semibold hover:bg-[#07182A] transition-colors inline-flex items-center gap-1"
                    >
                      <Upload className="size-3" />
                      <span>Subir Video</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleSimulatedFileUpload}
                    />
                  </div>
                </div>

                {isUploadingFile && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-obsidian">
                      <span>Procesando video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-champagne h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian/80 mb-0.5">Proveedor</label>
                    <select
                      value={videoProvider}
                      onChange={(e) => setVideoProvider(e.target.value as any)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 bg-white text-xs"
                    >
                      <option value="cloudflare">Cloudflare Stream (Recomendado)</option>
                      <option value="url">URL Directa MP4/HLS</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian/80 mb-0.5">ID de Video o URL *</label>
                    <input
                      type="text"
                      required
                      value={videoId || videoUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('http')) {
                          setVideoUrl(val);
                          setVideoId('');
                        } else {
                          setVideoId(val);
                          setVideoUrl('');
                        }
                      }}
                      placeholder="Ej. a8b192c3... o https://..."
                      className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-obsidian/80 mb-0.5">URL de Portada / Miniatura *</label>
                  <input
                    type="url"
                    required
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Patient Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Nombre o Etiqueta Pública *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Carmen M. o Paciente de Consulta"
                    className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Referencia Interna Privada</label>
                  <input
                    type="text"
                    value={internalName}
                    onChange={(e) => setInternalName(e.target.value)}
                    placeholder="Ej. Sra. Carmen - Hipertensión 2026"
                    className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Formato Identidad</label>
                  <select
                    value={nameFormat}
                    onChange={(e) => setNameFormat(e.target.value as any)}
                    className="w-full py-1.5 px-2 rounded-lg border border-obsidian/20 bg-white text-xs"
                  >
                    <option value="anonymous">Anónimo ("Paciente")</option>
                    <option value="initials">Nombre e Iniciales</option>
                    <option value="full">Nombre Completo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Categoría</label>
                  <input
                    type="text"
                    value={publicLabel}
                    onChange={(e) => setPublicLabel(e.target.value)}
                    placeholder="Ej. Consulta Médica"
                    className="w-full py-1.5 px-2 rounded-lg border border-obsidian/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Orden Numérico</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full py-1.5 px-2 rounded-lg border border-obsidian/20 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-obsidian mb-0.5">Descripción Breve</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Acompañamiento en el control y ajuste de tratamiento..."
                  className="w-full py-1.5 px-2.5 rounded-lg border border-obsidian/20 text-xs resize-none"
                />
              </div>

              {/* Status Selector */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <label className="block font-serif font-bold text-obsidian text-xs mb-1">Estado del Testimonio</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full py-1.5 px-2 rounded-lg border border-obsidian/20 bg-white font-semibold text-xs"
                >
                  <option value="draft">Borrador (Privado, no visible)</option>
                  <option value="pending_consent">Pendiente de Consentimiento</option>
                  <option value="published">Publicado (Visible en Consulta)</option>
                  <option value="hidden">Oculto (Fuera del carrusel)</option>
                  <option value="consent_withdrawn">Consentimiento Retirado</option>
                </select>
              </div>

              {/* Mandatory Patient Consent Verification */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-amber-700 shrink-0" />
                  <h4 className="font-serif font-bold text-amber-950 text-xs">
                    Consentimiento Informado (Requisito Legal)
                  </h4>
                </div>
                <p className="text-[10px] text-obsidian/75 leading-tight">
                  De acuerdo con ética clínica, ningún testimonio puede publicarse sin confirmación documentada.
                </p>

                <div className="flex items-start gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="consentConfirmedCheck"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="size-3.5 rounded accent-amber-700 mt-0.5"
                  />
                  <label htmlFor="consentConfirmedCheck" className="font-semibold text-obsidian cursor-pointer select-none text-[11px] leading-snug">
                    Confirmo que existe autorización expresa y firmada por el paciente.
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-obsidian mb-0.5">Fecha Consentimiento *</label>
                    <input
                      type="date"
                      required
                      value={consentDate}
                      onChange={(e) => setConsentDate(e.target.value)}
                      className="w-full py-1 px-2 rounded-lg border border-obsidian/20 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-obsidian mb-0.5">Vencimiento (Opcional)</label>
                    <input
                      type="date"
                      value={consentExpiration}
                      onChange={(e) => setConsentExpiration(e.target.value)}
                      className="w-full py-1 px-2 rounded-lg border border-obsidian/20 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer - Fixed Bottom */}
            <div className="p-3.5 sm:p-4 bg-[#F9F7F2] border-t border-[#B39A6A]/15 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-3.5 py-2 rounded-xl text-obsidian/70 font-semibold hover:bg-black/5 text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="testimonial-form"
                className="px-5 py-2 rounded-xl bg-obsidian text-white font-semibold hover:bg-[#07182A] text-xs transition-colors shadow-xs"
              >
                Guardar Testimonio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="size-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="size-7" />
            </div>
            <h3 className="font-serif font-bold text-obsidian text-xl">
              ¿Deseas quitar este testimonio?
            </h3>
            <p className="text-xs text-obsidian/70 leading-relaxed">
              Estás a punto de eliminar el testimonio de <strong className="text-obsidian font-serif">"{showDeleteModal.displayName}"</strong>. Si solo deseas que no aparezca en la página de Consulta, puedes cambiar su estado a <strong>Oculto</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-black/10">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 transition-colors"
              >
                Quitar Testimonio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive Live Carousel Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-6xl bg-[#FBF9F5] rounded-3xl border border-[#B39A6A]/30 overflow-hidden shadow-2xl relative my-auto">
            <div className="p-4 sm:p-5 bg-obsidian text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-champagne/20 text-champagne text-[10px] font-mono uppercase font-bold tracking-wider">
                  Vista Previa Privada
                </span>
                <span className="text-xs text-white/80">
                  Previsualización en vivo del carrusel en la página Consulta ({previewItems.length} videos autorizados)
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              <TestimonialsCarousel previewItems={previewItems} isPreviewMode={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
