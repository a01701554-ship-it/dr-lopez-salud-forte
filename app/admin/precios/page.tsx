import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { Container } from '@/components/site/container';
import { usePricing } from '@/lib/pricing-store';
import { PricingConfig } from '@/config/pricing';

export default function AdminPreciosPage() {
  const { pricing, updatePricing, resetToDefaults } = usePricing();
  const [formData, setFormData] = useState<PricingConfig>(pricing);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updatePricing(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleReset = () => {
    if (window.confirm('¿Desea restablecer todos los precios y políticas a los valores originales de fábrica?')) {
      resetToDefaults();
      setFormData(pricing);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  return (
    <main id="contenido-principal" className="bg-ivory py-16 sm:py-24">
      <Container className="max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-obsidian/70 hover:text-obsidian">
            <ArrowLeft className="size-3.5" />
            <span>Volver al sitio principal</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone/60 px-3 py-1 text-[11px] font-semibold text-obsidian/80">
            <ShieldCheck className="size-3 text-sage" />
            Panel de Honorarios y Servicios
          </span>
        </div>

        <div className="rounded-2xl border border-stone/80 bg-white p-6 shadow-sm sm:p-10">
          <div className="border-b border-stone/60 pb-6">
            <h1 className="font-serif text-3xl text-obsidian sm:text-4xl">
              Configuración Centralizada de Honorarios
            </h1>
            <p className="mt-2 text-xs text-obsidian/65 sm:text-sm">
              Cualquier cambio guardado aquí se sincronizará automáticamente en tiempo real en la página de inicio, sección de preguntas frecuentes (FAQ), página de consulta, flujo de reservas y asistente de WhatsApp.
            </p>
          </div>

          {saved && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Honorarios y configuraciones guardados con éxito en la fuente única de verdad.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="rounded-xl border border-stone/60 bg-ivory/30 p-5">
              <h3 className="font-serif text-xl text-obsidian">Primera Consulta Médica</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Precio (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.firstVisit.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstVisit: { ...formData.firstVisit, price: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Duración texto
                  </label>
                  <input
                    type="text"
                    value={formData.firstVisit.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstVisit: { ...formData.firstVisit, duration: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Minutos asignados
                  </label>
                  <input
                    type="number"
                    value={formData.firstVisit.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstVisit: { ...formData.firstVisit, durationMinutes: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone/60 bg-ivory/30 p-5">
              <h3 className="font-serif text-xl text-obsidian">Consulta de Seguimiento</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Precio (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.followUp.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followUp: { ...formData.followUp, price: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Duración texto
                  </label>
                  <input
                    type="text"
                    value={formData.followUp.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followUp: { ...formData.followUp, duration: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Minutos asignados
                  </label>
                  <input
                    type="number"
                    value={formData.followUp.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followUp: { ...formData.followUp, durationMinutes: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone/60 bg-ivory/30 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-obsidian">Consulta en Línea (Telemedicina)</h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-obsidian">
                  <input
                    type="checkbox"
                    checked={formData.onlineConsultationEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, onlineConsultationEnabled: e.target.checked })
                    }
                    className="rounded border-stone text-navy focus:ring-champagne"
                  />
                  <span>Habilitada en el sitio y FAQ</span>
                </label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Precio (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.online.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        online: { ...formData.online, price: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={formData.online.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        online: { ...formData.online, duration: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone/60 bg-ivory/30 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-obsidian">Consulta a Domicilio</h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-obsidian">
                  <input
                    type="checkbox"
                    checked={formData.homeVisitEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, homeVisitEnabled: e.target.checked })
                    }
                    className="rounded border-stone text-navy focus:ring-champagne"
                  />
                  <span>Habilitada en el sitio y FAQ</span>
                </label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Precio Desde (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.homeVisit.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        homeVisit: { ...formData.homeVisit, price: Number(e.target.value) },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={formData.homeVisit.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        homeVisit: { ...formData.homeVisit, duration: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone/60 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="size-3.5" />
                <span>Restablecer valores predeterminados</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-[#0D2235] bg-[#0D2235] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian shadow-sm transition-colors"
              >
                <Save className="size-4 text-champagne" />
                <span>Guardar y sincronizar honorarios</span>
              </button>
            </div>
          </form>
        </div>
      </Container>
    </main>
  );
}
