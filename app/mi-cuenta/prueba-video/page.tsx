'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Video,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface StreamTestTokenResponse {
  playbackUrl?: string;
  expiresIn?: number;
  error?: string;
  code?: string;
}

export default function CloudflareStreamTestPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const fetchStreamToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase no está configurado.');
      }

      // 1. Check current session and expiration time (refresh if expiring within 60 seconds)
      let accessToken: string | null = null;
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = currentSession?.expires_at || 0;
      const isExpiringSoon = expiresAt > 0 && expiresAt - nowInSeconds <= 60;

      if (currentSession?.access_token && !isExpiringSoon) {
        accessToken = currentSession.access_token;
      } else {
        // Refresh session if token is missing or expiring within 60s
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token) {
          accessToken = refreshData.session.access_token;
        } else if (currentSession?.access_token && !refreshError) {
          accessToken = currentSession.access_token;
        }
      }

      if (!accessToken) {
        setError('Debes iniciar sesión con tu cuenta de alumno para realizar esta prueba técnica.');
        setErrorCode('AUTH_HEADER_MISSING');
        setLoading(false);
        return;
      }

      // 2. Validate same Bearer token with /api/auth/me first
      const meRes = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const meData = await meRes.json();
      if (!meRes.ok || !meData.authenticated || !meData.user) {
        setError('La identidad del usuario no pudo ser verificada por el servidor.');
        setErrorCode(meData.code || 'TOKEN_REJECTED_BY_SUPABASE');
        setLoading(false);
        return;
      }

      // 3. Only if /api/auth/me validates user, request /api/academia/stream-test-token
      const res = await fetch('/api/academia/stream-test-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data: StreamTestTokenResponse = await res.json();

      if (!res.ok) {
        setError(data.error || 'No fue posible autorizar la reproducción del video.');
        setErrorCode(data.code || 'TOKEN_REJECTED_BY_SUPABASE');
        setLoading(false);
        return;
      }

      if (!data.playbackUrl) {
        setError('El servidor no devolvió la URL de reproducción del stream.');
        setLoading(false);
        return;
      }

      // 4. Set URL in memory (never stored in localStorage)
      setPlaybackUrl(data.playbackUrl);
      if (data.expiresIn) {
        setExpiresIn(data.expiresIn);
      }
    } catch (err: any) {
      console.error('[StreamTest] Error fetching token:', err);
      setError(err?.message || 'Error de conexión al obtener la transmisión de prueba.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStreamToken();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError('Debes iniciar sesión para acceder a esta prueba técnica.');
    }
  }, [authLoading, user, fetchStreamToken]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-obsidian flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-[#B39A6A]/20 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/mi-cuenta"
            className="inline-flex items-center gap-2 text-xs font-semibold text-obsidian/75 hover:text-obsidian transition-colors"
          >
            <ArrowLeft className="size-4 text-[#8A7347]" />
            <span>Volver a Mi Cuenta</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D2235]/5 border border-[#0D2235]/10 text-[11px] font-semibold text-[#8A7347] uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Prueba Técnica Interna</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-10 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#B39A6A]/20 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#8A7347]/10 text-[#8A7347] text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Video className="size-3.5" />
                  Cloudflare Stream Test
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-bold tracking-tight">
                  Prueba de Reproducción Segura de Video
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-obsidian/70">
                  Validación técnica con Signed Token temporal y restricción de dominio de origen.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#091420] text-white text-xs shrink-0 border border-white/10">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span className="font-mono text-[11px]">Protección HLS / Signed JWT</span>
              </div>
            </div>
          </div>

          {/* Player Container / States */}
          <div className="bg-[#091420] rounded-2xl p-4 sm:p-8 border border-white/10 shadow-2xl text-white">
            {/* Loading State */}
            {loading && (
              <div className="aspect-video w-full bg-[#07101A] rounded-xl flex flex-col items-center justify-center p-6 border border-white/5">
                <div className="size-12 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-serif text-base text-white/90">Generando token de reproducción firmado...</p>
                <p className="text-xs text-white/50 mt-1">Conectando con el servidor seguro de Cloudflare Stream</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="aspect-video w-full bg-[#07101A] rounded-xl flex flex-col items-center justify-center p-6 border border-rose-500/20 text-center">
                <div className="size-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                  <AlertCircle className="size-7" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-white mb-2">
                  No se pudo cargar la reproducción
                </h3>
                <p className="text-sm text-white/70 max-w-md mb-3 leading-relaxed">
                  {error}
                </p>
                {errorCode && (
                  <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs">
                    <span className="text-rose-400/70">Código de diagnóstico:</span>
                    <span className="font-bold tracking-wider">{errorCode}</span>
                  </div>
                )}
                <button
                  onClick={fetchStreamToken}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-champagne text-obsidian font-semibold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-md"
                >
                  <RefreshCw className="size-4" />
                  <span>Intentar nuevamente</span>
                </button>
              </div>
            )}

            {/* Success State: Video iFrame */}
            {!loading && !error && playbackUrl && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    src={playbackUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                    title="Cloudflare Stream Test Video"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-white/60 pt-2 gap-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Token firmado correctamente recibido e inyectado en el reproductor.</span>
                  </div>
                  {expiresIn && (
                    <div className="font-mono text-[11px] text-white/40">
                      Vigencia del token: {Math.round(expiresIn / 60)} min
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Technical Details / Security Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#B39A6A]/20 text-xs text-obsidian/80 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-obsidian text-sm">
              <Info className="size-4 text-[#8A7347]" />
              <span>Detalles del Enclave de Seguridad</span>
            </div>
            <ul className="space-y-2 text-obsidian/75 pl-6 list-disc">
              <li>
                <strong>Verificación de Servidor:</strong> El token de API de Cloudflare se mantiene estrictamente en variables de entorno privadas del backend y nunca se expone en la respuesta HTTP ni en el bundle del cliente.
              </li>
              <li>
                <strong>Identidad Autenticada:</strong> El endpoint <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono text-[11px]">/api/academia/stream-test-token</code> exige un token Bearer válido verificado por Supabase Auth.
              </li>
              <li>
                <strong>Sin persistencia en cliente:</strong> La URL de iframe con el token firmado solo existe en memoria durante la sesión activa del componente.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
