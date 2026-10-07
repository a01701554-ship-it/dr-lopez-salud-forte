'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Eye,
  FileUp,
  ShieldCheck,
  Loader2,
  Info,
} from 'lucide-react';

export interface LessonAttachmentItem {
  id: string;
  lesson_id: string;
  title: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  fileSizeLabel?: string;
  position: number;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

interface ManageLessonAttachmentsModalProps {
  isOpen: boolean;
  onClose: (hasChanged: boolean) => void;
  courseTitle: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonNumber?: number;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1) return 'Tamaño desconocido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ManageLessonAttachmentsModal({
  isOpen,
  onClose,
  courseTitle,
  moduleTitle,
  lessonId,
  lessonTitle,
  lessonNumber,
  fetchWithAuth,
}: ManageLessonAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<LessonAttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanged, setHasChanged] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Replace state
  const [replacingAttachment, setReplacingAttachment] = useState<LessonAttachmentItem | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete state
  const [deletingAttachment, setDeletingAttachment] = useState<LessonAttachmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview / Download state
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/academy/lessons/${lessonId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setFeedback({
          type: 'error',
          message: errData.error || 'No fue posible cargar los materiales de la lección.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error de red al consultar los materiales.',
      });
    } finally {
      setLoading(false);
    }
  }, [lessonId, fetchWithAuth]);

  useEffect(() => {
    if (isOpen && lessonId) {
      setFeedback(null);
      setHasChanged(false);
      fetchAttachments();
    }
  }, [isOpen, lessonId, fetchAttachments]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (deletingAttachment) {
          setDeletingAttachment(null);
        } else if (replacingAttachment) {
          setReplacingAttachment(null);
        } else {
          onClose(hasChanged);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasChanged, onClose, deletingAttachment, replacingAttachment]);

  // Validate a PDF file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExt) {
      return { valid: false, error: 'Selecciona un archivo PDF válido.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'El archivo supera el tamaño máximo permitido de 25 MB.' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'El archivo está vacío.' };
    }

    return { valid: true };
  };

  // Upload one or multiple files
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setFeedback(null);

    // Validate all files first
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setFeedback({ type: 'error', message: validation.error || 'Selecciona un archivo PDF válido.' });
        return;
      }
    }

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgress(`Subiendo (${i + 1}/${fileList.length}): ${file.name}…`);

      try {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').trim() || 'Documento PDF';
        const res = await fetchWithAuth(
          `/api/admin/academy/lessons/${lessonId}/attachments/upload?title=${encodeURIComponent(cleanTitle)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/pdf',
              'X-Filename': encodeURIComponent(file.name),
            },
            body: file,
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'No fue posible subir el PDF. Revisa el archivo e inténtalo nuevamente.');
        }

        successCount++;
        setHasChanged(true);
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'No fue posible subir el PDF. Revisa el archivo e inténtalo nuevamente.',
        });
        setIsUploading(false);
        setUploadProgress(null);
        await fetchAttachments();
        return;
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    setFeedback({
      type: 'success',
      message:
        successCount === 1
          ? 'El PDF se subió y asoció exitosamente a esta lección.'
          : `Se subieron y asociaron exitosamente ${successCount} archivos PDF a esta lección.`,
    });
    await fetchAttachments();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Renaming
  const handleStartRename = (att: LessonAttachmentItem) => {
    setEditingId(att.id);
    setEditingTitle(att.title);
  };

  const handleSaveRename = async (attachmentId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'El nombre visible no puede estar vacío.' });
      return;
    }
    if (trimmed.length > 180) {
      setFeedback({ type: 'error', message: 'El nombre visible debe tener máximo 180 caracteres.' });
      return;
    }

    setIsRenaming(true);
    try {
      const res = await fetchWithAuth(
        `/api/admin/academy/lessons/${lessonId}/attachments/${attachmentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible renombrar el PDF.');
      }

      setFeedback({ type: 'success', message: 'Nombre visible actualizado correctamente.' });
      setEditingId(null);
      setHasChanged(true);
      await fetchAttachments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'No fue posible renombrar el PDF.' });
    } finally {
      setIsRenaming(false);
    }
  };

  // Reordering
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= attachments.length) return;

    const newItems = [...attachments];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Optimistic update
    setAttachments(newItems);

    try {
      const res = await fetchWithAuth(
        `/api/admin/academy/lessons/${lessonId}/attachments/reorder`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attachmentIds: newItems.map((item) => item.id) }),
        }
      );

      if (!res.ok) {
        throw new Error('No fue posible guardar el nuevo orden.');
      }
      setHasChanged(true);
    } catch {
      setFeedback({ type: 'error', message: 'No fue posible actualizar el orden de los materiales.' });
      await fetchAttachments();
    }
  };

  // Replace
  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingAttachment) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setFeedback({ type: 'error', message: validation.error || 'Selecciona un archivo PDF válido.' });
      return;
    }

    setIsReplacing(true);
    try {
      const res = await fetchWithAuth(
        `/api/admin/academy/lessons/${lessonId}/attachments/${replacingAttachment.id}/replace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': encodeURIComponent(file.name),
          },
          body: file,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible reemplazar el PDF.');
      }

      setFeedback({
        type: 'success',
        message: `El PDF “${replacingAttachment.title}” se reemplazó correctamente.`,
      });
      setReplacingAttachment(null);
      setHasChanged(true);
      await fetchAttachments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'No fue posible reemplazar el PDF.' });
    } finally {
      setIsReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingAttachment) return;
    setIsDeleting(true);

    try {
      const res = await fetchWithAuth(
        `/api/admin/academy/lessons/${lessonId}/attachments/${deletingAttachment.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible quitar el PDF de la lección.');
      }

      setFeedback({
        type: 'success',
        message: 'El PDF se quitó correctamente de esta lección.',
      });
      setDeletingAttachment(null);
      setHasChanged(true);
      await fetchAttachments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'No fue posible quitar el PDF.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Preview / Download
  const handlePreview = async (att: LessonAttachmentItem) => {
    setPreviewingId(att.id);
    try {
      const res = await fetchWithAuth(
        `/api/admin/academy/lessons/${lessonId}/attachments/${att.id}/preview`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'No fue posible generar el enlace de comprobación.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error al solicitar el enlace de comprobación del PDF.',
      });
    } finally {
      setPreviewingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="manage-lesson-attachments-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-attachments-title"
    >
      <div className="relative w-full max-w-2xl bg-[#F9F7F2] rounded-2xl shadow-2xl border border-[#B39A6A]/30 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-white border-b border-[#B39A6A]/20 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian text-champagne text-[10px] font-semibold uppercase tracking-wider">
              <FileText className="size-3 text-champagne" />
              <span>Materiales Descargables (PDF)</span>
            </div>
            <h3
              id="modal-attachments-title"
              className="mt-2 font-serif text-lg sm:text-xl font-bold text-obsidian tracking-tight"
            >
              Gestionar PDFs de la Lección
            </h3>
            <p className="mt-0.5 text-xs text-obsidian/70">
              <span className="font-semibold text-obsidian">{courseTitle}</span> ·{' '}
              <span className="text-obsidian/80">{moduleTitle}</span>
            </p>
            <p className="text-xs text-[#8A7347] font-medium mt-0.5">
              {lessonNumber !== undefined ? `Clase ${lessonNumber}: ` : ''}
              <span className="font-semibold text-obsidian">{lessonTitle}</span>
            </p>
          </div>

          <button
            type="button"
            id="close-manage-attachments-btn"
            onClick={() => onClose(hasChanged)}
            className="p-1.5 rounded-lg text-obsidian/60 hover:text-obsidian hover:bg-obsidian/5 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-obsidian text-xs sm:text-sm">
          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center justify-between transition-all ${
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
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs font-semibold opacity-60 hover:opacity-100 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Student Access Notice */}
          <div className="p-3 rounded-xl bg-white border border-[#B39A6A]/20 flex items-start gap-2.5 shadow-2xs">
            <ShieldCheck className="size-4 text-[#8A7347] shrink-0 mt-0.5" />
            <div className="text-[11px] text-obsidian/75 leading-relaxed">
              <strong className="text-obsidian font-semibold">Acceso seguro para alumnos:</strong>{' '}
              Los PDF que agregues aquí estarán asociados exclusivamente a esta lección y se mostrarán
              en la pestaña “Materiales descargables” únicamente a los alumnos con inscripción o acceso
              activo.
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all bg-white cursor-pointer ${
              isDragging
                ? 'border-[#8A7347] bg-[#F4EFE5]'
                : 'border-[#B39A6A]/40 hover:border-[#8A7347] hover:bg-[#FAF8F4]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="size-12 rounded-2xl bg-[#0D1B2A] text-champagne flex items-center justify-center shadow-xs">
                {isUploading ? (
                  <Loader2 className="size-6 animate-spin text-champagne" />
                ) : (
                  <UploadCloud className="size-6 text-champagne" />
                )}
              </div>

              <div>
                <p className="font-serif font-bold text-obsidian text-sm sm:text-base">
                  {isUploading ? 'Subiendo material a la lección…' : 'Arrastra aquí tus archivos PDF o selecciónalos'}
                </p>
                <p className="text-[11px] text-obsidian/60 mt-0.5">
                  Archivos PDF de hasta 25 MB por documento · Puedes subir varios a la vez
                </p>
              </div>

              {uploadProgress ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 text-[#8A7347] text-xs font-semibold">
                  <RefreshCw className="size-3 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              ) : (
                <button
                  type="button"
                  id="select-pdf-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs cursor-pointer"
                >
                  <FileUp className="size-3.5 text-champagne" />
                  <span>Seleccionar PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Associated PDFs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-bold text-obsidian text-sm sm:text-base flex items-center gap-2">
                <span>PDFs asociados a esta lección</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-white border border-[#B39A6A]/30 text-obsidian/70">
                  {attachments.length} {attachments.length === 1 ? 'archivo' : 'archivos'}
                </span>
              </h4>

              {attachments.length > 1 && (
                <span className="text-[11px] text-obsidian/50 italic hidden sm:inline">
                  Usa las flechas para ordenar los documentos
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#B39A6A]/20">
                <Loader2 className="size-6 animate-spin text-[#8A7347] mx-auto mb-2" />
                <p className="text-xs text-obsidian/60">Cargando materiales…</p>
              </div>
            ) : attachments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#B39A6A]/30 space-y-1">
                <FileText className="size-8 text-[#B39A6A]/50 mx-auto" />
                <p className="text-xs font-medium text-obsidian/70">
                  Esta lección no tiene materiales descargables asociados actualmente.
                </p>
                <p className="text-[11px] text-obsidian/50">
                  Sube guías clínicas, infografías o resúmenes en formato PDF para tus alumnos.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#B39A6A]/25 hover:border-[#8A7347]/50 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Document Info */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* PDF badge icon */}
                      <div className="size-9 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
                        <FileText className="size-4.5" />
                      </div>

                      {/* Title & metadata */}
                      <div className="min-w-0 flex-1">
                        {editingId === att.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              maxLength={180}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#8A7347] bg-white text-obsidian focus:outline-hidden focus:ring-1 focus:ring-[#8A7347]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(att.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(att.id)}
                              disabled={isRenaming}
                              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Guardar nombre"
                            >
                              <Check className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-md bg-obsidian/10 text-obsidian hover:bg-obsidian/20 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-obsidian text-xs sm:text-sm truncate">
                              {att.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartRename(att)}
                              className="p-1 text-obsidian/40 hover:text-obsidian rounded transition-colors cursor-pointer"
                              title="Cambiar nombre visible"
                            >
                              <Edit2 className="size-3" />
                            </button>
                          </div>
                        )}

                        <div className="text-[11px] text-obsidian/55 font-mono mt-0.5 flex items-center gap-2">
                          <span>{formatSize(att.file_size_bytes)}</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-medium">Visible para alumnos</span>
                          <span>·</span>
                          <span>Orden: {idx + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {/* Move Up / Down */}
                      {attachments.length > 1 && (
                        <div className="flex items-center bg-[#F4EFE5] rounded-lg p-0.5 mr-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0}
                            className={`p-1 rounded-md transition-colors ${
                              idx === 0
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-white text-obsidian cursor-pointer'
                            }`}
                            title="Subir posición"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === attachments.length - 1}
                            className={`p-1 rounded-md transition-colors ${
                              idx === attachments.length - 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-white text-obsidian cursor-pointer'
                            }`}
                            title="Bajar posición"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Preview / Check Download */}
                      <button
                        type="button"
                        onClick={() => handlePreview(att)}
                        disabled={previewingId === att.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#B39A6A]/40 bg-white text-obsidian text-[11px] font-semibold hover:bg-[#F4EFE5] transition-colors cursor-pointer"
                        title="Comprobar apertura del archivo"
                      >
                        {previewingId === att.id ? (
                          <Loader2 className="size-3 animate-spin text-[#8A7347]" />
                        ) : (
                          <Eye className="size-3 text-[#8A7347]" />
                        )}
                        <span className="hidden sm:inline">Comprobar</span>
                      </button>

                      {/* Replace */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingAttachment(att);
                          replaceInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#B39A6A]/40 bg-white text-obsidian text-[11px] font-semibold hover:bg-[#F4EFE5] transition-colors cursor-pointer"
                        title="Reemplazar archivo PDF"
                      >
                        <RefreshCw className="size-3 text-[#8A7347]" />
                        <span className="hidden sm:inline">Reemplazar</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeletingAttachment(att)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        title="Quitar PDF de la lección"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 bg-white border-t border-[#B39A6A]/20 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-obsidian/60 hidden sm:block">
            Los cambios se guardan de forma aislada y no afectan el video ni el progreso de los alumnos.
          </p>
          <button
            type="button"
            id="done-manage-attachments-btn"
            onClick={() => onClose(hasChanged)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs ml-auto"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>

      {/* Hidden input for replacing an attachment */}
      <input
        type="file"
        ref={replaceInputRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleReplaceFileSelected}
      />

      {/* Confirmation Dialog for Deleting a PDF */}
      {deletingAttachment && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xs"
          role="alertdialog"
          aria-labelledby="confirm-delete-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-red-200 text-obsidian space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h4 id="confirm-delete-title" className="font-serif font-bold text-base text-obsidian">
                  ¿Deseas quitar este PDF de la lección?
                </h4>
                <p className="text-xs text-obsidian/60">Esta acción no modifica el video ni la lección.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/20 text-xs">
              <span className="font-semibold text-obsidian">{deletingAttachment.title}</span>
              <div className="text-[11px] text-obsidian/60 mt-0.5 font-mono">
                {formatSize(deletingAttachment.file_size_bytes)}
              </div>
            </div>

            <p className="text-xs text-obsidian/75 leading-relaxed">
              El archivo se retirará inmediatamente de la vista de los alumnos inscritos. Podrás volver a
              subirlo en cualquier momento si lo necesitas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAttachment(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-obsidian/20 text-xs font-semibold text-obsidian hover:bg-obsidian/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-remove-pdf-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>{isDeleting ? 'Quitando…' : 'Quitar PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replacing in progress dialog */}
      {isReplacing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#B39A6A]/30 text-center space-y-3">
            <Loader2 className="size-8 animate-spin text-[#8A7347] mx-auto" />
            <h4 className="font-serif font-bold text-obsidian text-base">Reemplazando PDF…</h4>
            <p className="text-xs text-obsidian/60">
              Validando y subiendo el nuevo archivo sin alterar la lección.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
